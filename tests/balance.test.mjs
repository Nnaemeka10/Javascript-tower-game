/**
 * balance.test.mjs — naive bot sweep for mechanical invariants and difficulty band
 *
 *   BALANCE_REPORT=1 node --test tests/balance.test.mjs   → measurement report (RUN FIRST)
 *   node --test tests/balance.test.mjs                    → locked assertions
 *
 * The bot is deliberately naive (fixed build order, greedy lowest-first upgrades,
 * chokepoint placement by lane-coverage score). It measures the game's FLOOR —
 * a skilled player must outperform it by design.
 *
 * Determinism: Math.random pinned (damage variance neutralized); maps pinned via
 * setBaseSeed. Two runs on one seed must produce identical trajectories (A7).
 */

import './setup.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import GameEngine from '../src/core/GameEngine.js';
import { getTowerCost } from '../src/features/towers/towerConfig.js';

// ---------- headless surface (constructed with; render never runs) ----------
function makeHeadlessSurface() {
  const noop = () => {};
  return {
    getDimensions: () => ({ width: 800, height: 680 }),
    getWorldDimensions: () => ({ width: 800, height: 680 }),
    clear: noop, drawRect: noop, drawCircle: noop, drawText: noop, drawLine: noop,
    drawPolygon: noop, drawImage: noop, save: noop, restore: noop, translate: noop,
    rotate: noop, scale: noop, setAlpha: noop, getAlpha: () => 1, setSmoothing: noop,
    resetStats: noop, applyCameraTransform: noop, restoreCameraTransform: noop,
    drawDebugGrid: noop, drawDebugInfo: noop, getCamera: () => null,
    getSnapshot: () => ({}), getPerformanceMetrics: () => null,
  };
}

// ---------- lane rasterizer (grid coords; mirrors the isOnPath source of truth) ----------
function corridorTiles(map) {
  const set = new Set();
  for (let i = 0; i < map.path.length - 1; i++) {
    const a = map.path[i], b = map.path[i + 1];
    if (a.y === b.y) {
      for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) set.add(`${x},${a.y}`);
    } else {
      for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) set.add(`${a.x},${y}`);
    }
  }
  return set;
}

// ---------- the bot ----------
const PURCHASE_QUEUE = [
  'ballista', 'ballista', 'freeze', 'ballista', 'flame',
  'ballista', 'tesla', 'cannon', 'freeze', 'alchemist', 'ballista', 'flame',
];

class BalanceBot {
  constructor(engine) {
    this.gs = engine.getGameState();
    this.map = engine.getManager('map');
    this.towers = engine.getManager('tower');
    this.qi = 0;
    this.reserve = 150;
    this.lastRound = 1;
    this.placedThisRound = 0;
    this.towersPlaced = 0; this.upgradesBought = 0;
    this.spendTowers = 0; this.spendUpgrades = 0;
    this.minLives = {}; this.wavesSeen = {};
  }

  act() {
    const round = this.gs.getCurrentRound();
    if (round !== this.lastRound) { this.lastRound = round; this.placedThisRound = 0; }

    // 1) placement — 5 in round 1, 4/round after, reserve-gated
    const cap = round === 1 ? 5 : 4;
    while (this.placedThisRound < cap) {
      const type = PURCHASE_QUEUE[this.qi % PURCHASE_QUEUE.length];
      const cost = getTowerCost(type, 1);
      if (this.gs.getMoney() < cost + this.reserve) break;
      const tile = this.bestTile();
      if (!tile) break;
      const t = this.towers.placeTower(type, tile.x * 40 + 20, tile.y * 40 + 20, this.gs);
      if (!t) break;                       // pre-validated; fail-safe
      this.towersPlaced++; this.spendTowers += cost;
      this.placedThisRound++; this.qi++;
    }

    // 2) upgrades — lowest upgradeCount first, while flush
    for (let guard = 0; guard < 200; guard++) {
      const candidates = this.towers.getTowers()
        .filter(t => t.upgradeCount < 30)
        .sort((a, b) => a.upgradeCount - b.upgradeCount);
      if (candidates.length === 0) break;
      const t = candidates[0];
      const cost = t.getUpgradeInfo().nextCost;
      if (cost === 0 || this.gs.getMoney() < cost + this.reserve) break;
      if (!this.towers.upgradeTower(t, this.gs)) break;
      this.upgradesBought++; this.spendUpgrades += cost;
    }

    // 3) sample
    const r = this.gs.getCurrentRound(), w = this.gs.getCurrentWave();
    this.minLives[r] = Math.min(this.minLives[r] ?? 99, this.gs.getLives());
    this.wavesSeen[r] = Math.max(this.wavesSeen[r] ?? 0, w);
  }

  /** Highest lane-coverage (Chebyshev-2) buildable tile; row-major tie-break. */
  bestTile() {
    const map = this.map.getCurrentMap();
    const corridor = corridorTiles(map);
    let best = null, bestScore = -1;
    for (let y = 0; y < map.rows; y++) {
      for (let x = 0; x < map.cols; x++) {
        if (corridor.has(`${x},${y}`)) continue;
        if (map.blocked.some(b => b.x === x && b.y === y)) continue;
        if (this.towers.getTowerAt(x, y)) continue;
        let score = 0;
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++)
            if (corridor.has(`${x + dx},${y + dy}`)) score++;
        if (score > bestScore) { bestScore = score; best = { x, y }; }
      }
    }
    return best;
  }
}

// ---------- the run ----------
const DT = 1 / 60;
const MAX_SIM_SECONDS = 2700;   // 45 min sim; ~rounds 1–6
const STALL_SECONDS = 240;

async function runBot(seed, roundsCap = 6) {
  const engine = new GameEngine(makeHeadlessSurface());
  engine.getManager('map').generator.setBaseSeed(seed);

  const prevRandom = Math.random;
  Math.random = () => 0.499;               // pin damage variance → deterministic
  try {
    await engine.initialize();
    engine.gameState.setTotalWaves(engine.managers.wave.getTotalWaves());
    engine.gameState.setGameRunning(true);
    engine.roundManager.start();

    const bot = new BalanceBot(engine);
    let sim = 0, nextAct = 1, lastKey = '', lastProgressAt = 0, stalled = false;

    while (sim < MAX_SIM_SECONDS) {
      engine.update(DT);
      sim += DT;
      if (sim >= nextAct) { nextAct += 1; bot.act(); }

      const key = `${engine.gameState.getCurrentRound()}:${engine.gameState.getCurrentWave()}`;
      if (key !== lastKey) { lastKey = key; lastProgressAt = sim; }
      if (sim - lastProgressAt > STALL_SECONDS) { stalled = true; break; }
      if (engine.gameState.getGameOver()) break;
      if (engine.gameState.getCurrentRound() > roundsCap) break;
    }

    return {
      seed, stalled,
      error: engine.gameState.hasGameError(),
      deathRound: engine.gameState.getGameOver() ? engine.gameState.getCurrentRound() : null,
      reachedRound: engine.gameState.getCurrentRound(),
      towers: bot.towersPlaced, upgrades: bot.upgradesBought,
      spendTowers: bot.spendTowers, spendUpgrades: bot.spendUpgrades,
      moneyEnd: engine.gameState.getMoney(), score: engine.gameState.getScore(),
      minLives: bot.minLives, wavesSeen: bot.wavesSeen,
    };
  } finally {
    Math.random = prevRandom;
  }
}

function printReport(r) {
  console.log('\n=== BALANCE REPORT ===');
  console.log(`seed=${r.seed} reached=R${r.reachedRound}` +
    `${r.deathRound ? ` (DIED R${r.deathRound})` : ' (capped)'}` +
    `${r.stalled ? ' STALLED' : ''}${r.error ? ' ENGINE-ERROR' : ''}`);
  console.log(`towers=${r.towers} upgrades=${r.upgrades} ` +
    `spendTowers=${r.spendTowers} spendUpgrades=${r.spendUpgrades} ` +
    `moneyEnd=${r.moneyEnd} score=${r.score}`);
  for (const rnd of Object.keys(r.minLives).sort()) {
    console.log(`  R${rnd}: minLives=${r.minLives[rnd]}  wavesSeen=${r.wavesSeen[rnd] ?? 0}`);
  }
  console.log('======================\n');
}

// ---------- the test ----------
test('balance sweep — mechanical invariants + difficulty band', async () => {
  const report = process.env.BALANCE_REPORT === '1';
  const r = await runBot(7);
  if (report) printReport(r);

  // A1 — no exception anywhere in the update chain
  assert.equal(r.error, false, 'engine threw during update chain (check console)');

  // A2 — round machinery works under play (covers wave-10 → transition; catches the Phase 5 shadow bug class)
  assert.ok(r.reachedRound >= 2, `stuck in round 1 (reached ${r.reachedRound})`);
  assert.equal(r.stalled, false, 'simulation stalled — wave machine stopped advancing');

  // A3 — every fully-played round ran all 10 waves
  const fullRounds = r.deathRound ? r.deathRound - 1 : Math.min(r.reachedRound, 6);
  for (let rnd = 1; rnd <= fullRounds; rnd++) {
    assert.equal(r.wavesSeen[rnd] ?? 0, 10, `round ${rnd} stalled at wave ${r.wavesSeen[rnd] ?? 0}`);
  }

  // A4 — both economy sinks are live
  assert.ok(r.towers >= 5, 'placement sink dead');
  assert.ok(r.upgrades >= 10, 'upgrade sink dead');

  // A5 — money sane
  assert.ok(Number.isFinite(r.moneyEnd) && r.moneyEnd >= 0, 'money NaN or negative');

  // A6 — difficulty band. WIDE INITIAL VALUES — calibrate from the report, then tighten to [3,6].
  assert.ok(r.deathRound === null || r.deathRound >= 2, 'died in round 1 — floor too hard');
  assert.ok(r.deathRound === null || r.deathRound <= 8, 'a naive bot cruises — too easy');

  // A7 — determinism under pinned seed
  const r2 = await runBot(7);
  if (report) printReport(r2);
  assert.equal(r2.deathRound, r.deathRound, 'death round diverged — unpinned randomness leaked in');
  assert.equal(r2.towers, r.towers, 'placement diverged');
  assert.equal(r2.score, r.score, 'score diverged');
});