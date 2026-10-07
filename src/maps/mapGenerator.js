/**
 * mapGenerator.js — Phase 6: seeded, constraint-gated procedural map generator.
 *
 * Families (chess archetypes):
 *   serpent    — long boustrophedon file; many build strips, huge exposure
 *   pinch      — "The Fork": tight hairpin, ONE strip row serves two lanes
 *   crossroads — shuffled-lane zigzag gated to contain >= 1 true lane crossing
 *   spiral     — "The Keep": rings into a central keep; pocket strips between arms
 *
 * Pipeline: pickFamily(round) -> candidate polyline -> evaluate() hard gates
 *           -> retry (bounded) -> decorate(blocked) -> emit. Authored fallback
 *           if all attempts fail — the generator NEVER returns a broken map.
 *
 * Determinism: seed = mix(baseSeed, round). Same session -> same boards;
 * new session -> new boards. setBaseSeed() reserved for daily challenges.
 */

import { GRID_CONFIG } from '../utils/constants.js';
import { MAP_CONFIGS } from './mapConfig.js';

// ---------------- seeded PRNG (mulberry32) ----------------
function makeRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),  // inclusive
    pick: (arr) => arr[Math.floor(next() * arr.length)],
  };
}

// ---------------- segment geometry ----------------
function segs(wps) {
  const out = [];
  for (let i = 0; i < wps.length - 1; i++) out.push({ a: wps[i], b: wps[i + 1] });
  return out;
}
function segAxis(s) { return s.a.y === s.b.y ? 'h' : 'v'; }
function segRange(s) {
  return s.a.y === s.b.y
    ? { fixed: s.a.y, lo: Math.min(s.a.x, s.b.x), hi: Math.max(s.a.x, s.b.x) }
    : { fixed: s.a.x, lo: Math.min(s.a.y, s.b.y), hi: Math.max(s.a.y, s.b.y) };
}
/** True crossing: strict interior of BOTH segments (shared endpoints are corners). */
function segmentsCross(s1, s2) {
  if (segAxis(s1) === segAxis(s2)) return false;
  const [h, v] = segAxis(s1) === 'h' ? [s1, s2] : [s2, s1];
  const H = segRange(h), V = segRange(v);
  return H.fixed > V.lo && H.fixed < V.hi && V.fixed > H.lo && V.fixed < H.hi;
}
/** Parallel segments closer than 2 tiles with overlapping span = merged corridors. Reject. */
function parallelTooClose(s1, s2) {
  if (segAxis(s1) !== segAxis(s2)) return false;
  const R1 = segRange(s1), R2 = segRange(s2);
  if (Math.abs(R1.fixed - R2.fixed) >= 2) return false;
  return (Math.min(R1.hi, R2.hi) - Math.max(R1.lo, R2.lo)) > 0;  // point-touch = continuation, allowed
}

// ---------------- evaluation gate ----------------
function evaluate(cols, rows, wps) {
  const S = segs(wps);
  for (const p of wps) {
    if (p.x < 0 || p.x > cols - 1 || p.y < 0 || p.y > rows - 1) return { ok: false, crossings: 0, length: 0 };
  }
  for (const s of S) {
    const r = segRange(s);
    if (r.hi - r.lo < 2) return { ok: false, crossings: 0, length: 0 };   // min segment 2 tiles
  }
  for (let i = 0; i < S.length - 1; i++) {
    if (segAxis(S[i]) === segAxis(S[i + 1])) return { ok: false, crossings: 0, length: 0 }; // collinear continuation
  }
  for (let i = 0; i < S.length; i++) {
    for (let j = i + 2; j < S.length; j++) {
      if (parallelTooClose(S[i], S[j])) return { ok: false, crossings: 0, length: 0 };
    }
  }
  let crossings = 0, length = 0;
  for (let i = 0; i < S.length; i++) {
    length += segRange(S[i]).hi - segRange(S[i]).lo;
    for (let j = i + 2; j < S.length; j++) if (segmentsCross(S[i], S[j])) crossings++;
  }
  return { ok: true, crossings, length };
}

// ---------------- family builders ----------------
function genSerpent(rng, cols, rows, round) {
  const gap = round <= 3 ? 3 : round <= 6 ? 2 : 1;               // strips tighten with rounds
  let lanes = Math.min(3 + Math.floor((round - 2) / 2), 5);
  while (lanes > 2 && (lanes - 1) * (gap + 1) + 1 > rows - 4) lanes--;
  const span = (lanes - 1) * (gap + 1);
  if (rows - 3 - span < 2) return null;
  const y0 = rng.int(2, rows - 3 - span);

  const xR = cols - 1 - rng.int(2, 3);                          // turn cols kept off the edge
  const xL = 1 + rng.int(2, 3);
  if (xR - xL < 10) return null;

  const wps = [{ x: 0, y: y0 }];
  let y = y0;
  for (let i = 0; i < lanes; i++) {
    const goingRight = i % 2 === 0;
    const toX = goingRight ? xR : xL;
    wps.push({ x: toX, y });
    if (i < lanes - 1) { wps.push({ x: toX, y: y + gap + 1 }); y += gap + 1; }
    else { wps.push({ x: goingRight ? cols - 1 : 0, y }); }     // exit stub to edge
  }
  return wps;
}

function genPinch(rng, cols, rows, round) {
  const gap = round <= 4 ? 2 : 1;                               // the Fork strip: 1 tile wide late
  const room = rows - 3 - (gap + 1) - 5;
  if (room < 2) return null;
  const yA = rng.int(2, room + 2);
  const yB = yA + gap + 1;
  const yC = rng.int(yB + 4, rows - 3);
  if (yC - yB < 4) return null;

  const xR = cols - 1 - rng.int(2, 3);
  const xL = 1 + rng.int(2, 3);
  if (xR - xL < 10) return null;

  return rng.next() < 0.5
    ? [ {x:0,y:yA},{x:xR,y:yA},{x:xR,y:yB},{x:xL,y:yB},{x:xL,y:yC},{x:cols-1,y:yC} ]
    : [ {x:cols-1,y:yA},{x:xL,y:yA},{x:xL,y:yB},{x:xR,y:yB},{x:xR,y:yC},{x:0,y:yC} ];
}

function genCrossroads(rng, cols, rows) {
  const y1 = 2, y3 = rows - 3;
  if (y3 - y1 < 6) return null;
  const y2 = rng.int(y1 + 3, y3 - 3);
  const lanes = [y1, y2, y3];

  const startIdx = rng.int(0, 2);
  const others = [0, 1, 2].filter(i => i !== startIdx);
  if (rng.next() < 0.5) others.reverse();
  const visit = [startIdx, ...others];

  const xP = rng.int(4, Math.floor(cols / 2) - 1);
  const xQ = rng.int(xP + 6, cols - 5);
  if (xQ - xP < 6) return null;

  const wps = [{ x: 0, y: lanes[visit[0]] }];
  let curLane = visit[0], side = 1;                             // 1 = turn right (xQ), -1 = left (xP)
  for (let k = 1; k < visit.length; k++) {
    const turnX = side === 1 ? xQ : xP;
    wps.push({ x: turnX, y: lanes[curLane] });
    wps.push({ x: turnX, y: lanes[visit[k]] });
    curLane = visit[k]; side = -side;
  }
  wps.push({ x: side === 1 ? cols - 1 : 0, y: lanes[curLane] }); // exit sprint
  return wps;
}

function genSpiral(rng, cols, rows) {
  const step = 2;                                               // arms 2 apart -> 1-tile pocket rings
  let xL = 1 + rng.int(0, 1), xR = cols - 2 - rng.int(0, 1);
  let yT = 2 + rng.int(0, 1), yB = rows - 3 - rng.int(0, 1);
  if (xR - xL < 13 || yB - yT < 9) return null;

  const wps = [{ x: 0, y: yT }];
  let rings = 0;
  while (xR - xL >= 6 && yB - yT >= 6 && rings < 3) {
    wps.push({ x: xR, y: yT });                                 // top row -> right wall
    wps.push({ x: xR, y: yB });                                 // right wall down
    wps.push({ x: xL, y: yB });                                 // bottom row -> left wall
    wps.push({ x: xL, y: yT + step });                          // up the left wall to next arm's row
    xL += step; xR -= step; yT += step; yB -= step;
    rings++;
  }
  // route into the final box; the keep is its top-middle tile
  const keepX = Math.round((xL + xR) / 2);
  wps.push({ x: xR, y: wps[wps.length - 1].y });                 // along final arm's top row
  wps.push({ x: xR, y: yB });                                   // down its right wall
  wps.push({ x: keepX, y: yB });                                // left along the bottom
  wps.push({ x: keepX, y: yT });                                // up into the keep
  return wps;
}

const FAMILY_BUILDERS = {
  serpent:    genSerpent,
  pinch:      genPinch,
  crossroads: genCrossroads,
  spiral:     genSpiral,
};

const FAMILY_GATE = {                                           // hard acceptance gates
  serpent:    { crossings: 0, length: 40 },
  pinch:      { crossings: 0, length: 40 },
  crossroads: { crossings: 1, length: 45 },                      // must contain a true crossing
  spiral:     { crossings: 0, length: 60 },
};

const POOLS = {                                                 // difficulty curve by round
  2: ['serpent', 'pinch'],
  3: ['serpent', 'crossroads', 'pinch'],
  4: ['crossroads', 'spiral', 'pinch'],
  5: ['serpent', 'crossroads', 'spiral'],
};

const FAMILY_THEMES = {
  serpent:    { label: 'Serpent',     bg: '#1c2333', grid: '#3a4658', blocked: '#5c3a3a' },
  pinch:      { label: 'The Fork',    bg: '#231c33', grid: '#463a5c', blocked: '#5c3a3a' },
  crossroads: { label: 'Crossroads',  bg: '#1c332a', grid: '#3a5c4a', blocked: '#5c3a3a' },
  spiral:     { label: 'The Keep',    bg: '#33291c', grid: '#5c4a3a', blocked: '#5c3a3a' },
};

// ---------------- decoration (blocked tiles) ----------------
function corridorMask(cols, rows, wps) {
  const mask = new Uint8Array(cols * rows);
  for (const s of segs(wps)) {
    const r = segRange(s);
    if (segAxis(s) === 'h') { for (let x = r.lo; x <= r.hi; x++) mask[r.fixed * cols + x] = 1; }
    else                    { for (let y = r.lo; y <= r.hi; y++) mask[y * cols + r.fixed] = 1; }
  }
  return mask;
}

function decorate(rng, cols, rows, wps, round) {
  const mask = corridorMask(cols, rows, wps);
  const spawn = wps[0], end = wps[wps.length - 1];
  const nearSE = (x, y) =>
    (Math.abs(x - spawn.x) <= 1 && Math.abs(y - spawn.y) <= 1) ||
    (Math.abs(x - end.x) <= 1 && Math.abs(y - end.y) <= 1);

  const want = Math.min(10, 4 + round);
  const placed = [];
  let tries = 0;
  while (placed.length < want && tries++ < 80) {
    const x = rng.int(1, cols - 2), y = rng.int(1, rows - 2);
    if (mask[y * cols + x]) continue;
    if (nearSE(x, y)) continue;
    if (placed.some(p => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1)) continue;
    placed.push({ x, y });
  }
  return placed;
}

function emit(family, round, wps, blocked) {
  const theme = FAMILY_THEMES[family];
  return {
    id: `gen_r${round}`,
    name: `${theme.label} ${round}`,
    cols: GRID_CONFIG.cols, rows: GRID_CONFIG.rows, tileSize: GRID_CONFIG.tileSize,
    spawn: { ...wps[0] }, end: { ...wps[wps.length - 1] },
    path: wps.map(p => ({ ...p })),
    blocked,                                  // satisfies legacy consumers (isTowerSpot / gridRenderer)
    background: theme.bg, gridColor: theme.grid,
    pathColor: '#00e58a', blockedColor: theme.blocked,
    landmark: family === 'spiral' ? 'keep' : null,
  };
}

// ---------------- generator ----------------
class MapGenerator {
  constructor() {
    this.baseSeed = 0;
    this.cache = new Map();                          // round -> map (cleared when baseSeed changes)
  }

  setBaseSeed(seed) {
    const s = seed >>> 0;
    if (s !== this.baseSeed) { this.baseSeed = s; this.cache.clear(); }
  }

  seedFor(round) {
    return (Math.imul(round, 2654435761) ^ this.baseSeed) >>> 0;
  }

  /** Deterministic per (baseSeed, round). Cached — preview and load return the SAME object. */
  generate(round) {
    if (this.cache.has(round)) return this.cache.get(round);
    const map = this.#build(round);
    this.cache.set(round, map);
    return map;
  }

  #build(round) {
    const cols = GRID_CONFIG.cols, rows = GRID_CONFIG.rows;
    for (let attempt = 0; attempt < 24; attempt++) {
      const rng = makeRng((this.seedFor(round) + attempt * 7919) >>> 0);
      const pool = POOLS[round] ?? ['serpent', 'pinch', 'crossroads', 'spiral'];
      const family = rng.pick(pool);
      const builder = FAMILY_BUILDERS[family];
      const wps = builder(rng, cols, rows, round);
      if (!wps) continue;

      const ev = evaluate(cols, rows, wps);
      const gate = FAMILY_GATE[family];
      if (!ev.ok || ev.crossings < gate.crossings || ev.length < gate.length) continue;

      return emit(family, round, wps, decorate(rng, cols, rows, wps, round));
    }
    // Authored fallback (Phase 5 pool) — the generator never breaks the game.
    const m = MAP_CONFIGS[(round - 1) % MAP_CONFIGS.length];
    return { ...m, path: m.path.map(p => ({ ...p })), blocked: m.blocked.map(b => ({ ...b })) };
  }
}

export { MapGenerator };