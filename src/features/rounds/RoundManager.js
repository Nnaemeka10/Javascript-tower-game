import { ROUND_CONFIG, getRoundContext, getRoundCompletionBonus } from './roundConfig.js';
import { getUpgradeCost } from '../towers/upgradeConfig.js';

class RoundManager {
  constructor(refs) {
    this.refs = refs;   // { gameState, waveManager, enemyManager, mapManager, towerManager, uiManager, gameEngine }
    this.currentRound = 1;
    this.isTransitioning = false;
    this.transitionTimeLeft = 0;
  }

  async initialize() { console.log('RoundManager initialized'); }

  /** Entry point from GameEngine.start() — round 1 setup (idempotent, also used after reset). */
  start() {
    this.applyRoundToSystems();
    this.refs.mapManager.loadMapForRound(1);
    this.refs.gameEngine.applyCurrentMap();
    this.refs.waveManager.startWave(this.refs.enemyManager, this.refs.gameState);
    this.showBanner(0);
    console.log(`➡ ROUND 1 — ${this.refs.mapManager.getCurrentMap().name}`);
  }

  isInIntermission() { return this.isTransitioning; }

  beginRoundTransition() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.transitionTimeLeft = ROUND_CONFIG.intermissionSeconds;
    this.showBanner(ROUND_CONFIG.intermissionSeconds);
  }

  /** Called from GameEngine.update — drives the intermission countdown. */
  update(deltaTime) {
    if (!this.isTransitioning) return;
    this.transitionTimeLeft -= deltaTime;
    if (this.transitionTimeLeft <= 0) {
      this.isTransitioning = false;
      this.advanceRound();
    }
  }

  advanceRound() {
    this.currentRound++;
    const r = this.currentRound;
    const gs = this.refs.gameState;

    // Economy: bonus gold + capped lives
    const gold = getRoundCompletionBonus(r);
    gs.addMoney(gold);
    const gain = Math.min(ROUND_CONFIG.maxLives, gs.getLives() + ROUND_CONFIG.bonusLivesPerRound) - gs.getLives();
    if (gain > 0) gs.increaseLives(gain);

    this.applyRoundToSystems();

    // New board + re-path enemies + refund towers the board invalidated
    this.refs.mapManager.loadMapForRound(r);
    this.refs.gameEngine.applyCurrentMap();
    this.relocateInvalidTowers();

    // Fresh wave cycle for this round
    this.refs.waveManager.reset();
    this.refs.waveManager.setRewardMultiplier(getRoundContext(r).rewardMult);
    this.refs.waveManager.startWave(this.refs.enemyManager, gs);

    this.refs.uiManager.showNotification(`Round ${r}: +${gold}g${gain > 0 ? `, +${gain} lives` : ''}`, 'success');
    console.log(`➡ ROUND ${r} — ${this.refs.mapManager.getCurrentMap().name}`);
  }

  applyRoundToSystems() {
    const ctx = this.currentRound === 1 ? null : getRoundContext(this.currentRound);
    this.refs.enemyManager.setRoundContext(ctx);
    this.refs.waveManager.setRewardMultiplier(ctx ? ctx.rewardMult : 1);
    this.refs.gameState.setCurrentRound(this.currentRound);
  }

  /** The new map moved lanes under existing towers → full refund, no punishment. */
  relocateInvalidTowers() {
    const { towerManager, mapManager, gameState, uiManager } = this.refs;
    const doomed = towerManager.getTowers().filter(t =>
      mapManager.isOnPath(t.gridX, t.gridY) || mapManager.isBlocked(t.gridX, t.gridY));

    for (const tower of doomed) {
      const refund = this.totalInvestedIn(tower);
      gameState.addMoney(refund);
      towerManager.removeTower(tower);
      uiManager.showNotification(`Board shifted — tower refunded ${refund}g`, 'info');
    }
    return doomed.length;
  }

  totalInvestedIn(tower) {
    let sum = tower.config.cost;
    for (let n = 0; n < tower.upgradeCount; n++) sum += getUpgradeCost(n);
    return sum;
  }

  showBanner(countdown) {
    const gs = this.refs.gameState;
    const nextRound = this.isTransitioning ? this.currentRound + 1 : this.currentRound;
    const livesGained = Math.min(ROUND_CONFIG.maxLives,
      gs.getLives() + ROUND_CONFIG.bonusLivesPerRound) - gs.getLives();
    this.refs.uiManager.showRoundBanner({
      round: nextRound,
      mapName: this.refs.mapManager.getMapNameForRound(nextRound),
      goldGained: nextRound === 1 ? 0 : getRoundCompletionBonus(nextRound),
      livesGained: nextRound === 1 ? 0 : livesGained,
      livesCap: ROUND_CONFIG.maxLives,
      seconds: countdown,
      duration: countdown + 5,
    });
  }

  reset() {
    this.currentRound = 1;
    this.isTransitioning = false;
    this.transitionTimeLeft = 0;
    this.applyRoundToSystems();
    this.refs.mapManager.loadMapForRound(1);
    this.refs.gameEngine.applyCurrentMap();
  }

  getCurrentRound() { return this.currentRound; }
  getSnapshot() { return { currentRound: this.currentRound, transitioning: this.isTransitioning }; }
}

export default RoundManager;