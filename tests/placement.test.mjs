// tests/placement.test.mjs — run with:  node --test
import './setup.mjs';

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CANVAS_CONFIG, GRID_CONFIG } from '../src/utils/constants.js';
import GameState from '../src/core/GameState.js';
import MapManager from '../src/maps/mapManager.js';
import TowerManager from '../src/features/towers/towerManager.js';
import TowerRenderer from '../src/features/towers/towerRenderer.js';
import WebSurface from '../src/rendering/WebSurface.js';
import { handleTowerPlacement, handleTowerTypeSelection } from '../src/features/ui/eventHandlers.js';

// ---------- helpers ----------
function makeFakeCanvas(cssWidth, cssHeight) {
  const ctx = new Proxy({}, {
    get: (t, p) => (p in t ? t[p] : () => {}),
    set: (t, p, v) => { t[p] = v; return true; },
  });
  return {
    width: 800, height: 600,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: cssWidth, height: cssHeight, left: 0, top: 0 }),
    addEventListener() {},
  };
}

function makeSurface(cssW, cssH) {
  return new WebSurface(makeFakeCanvas(cssW, cssH), {
    autoResize: false, useDevicePixelRatio: true, enableCamera: true,
    worldWidth: CANVAS_CONFIG.width, worldHeight: CANVAS_CONFIG.height,
  });
}

function makeRecordingSurface() {
  const calls = { circles: [], rects: [], texts: [] };
  const surface = {
    getWorldDimensions: () => ({ width: CANVAS_CONFIG.width, height: CANVAS_CONFIG.height }),
    save() {}, restore() {}, setAlpha() {}, translate() {},
    drawCircle: (x, y, r, color, opts) => calls.circles.push({ x, y, r, color, opts }),
    drawRect: (x, y, w, h, color, opts) => calls.rects.push({ x, y, w, h, color, opts }),
    drawText: (t, x, y, style) => calls.texts.push({ t, x, y, style }),
  };
  return { surface, calls };
}

async function makeGameBits() {
  const gameState = new GameState();
  const mapManager = new MapManager();
  const towerManager = new TowerManager();
  await towerManager.initialize(null, mapManager);
  return { gameState, mapManager, towerManager };
}

// ---------- LINK 0: configuration (this is the test that catches the HUD bug) ----------
test('LINK 0 — config: world is 800 × (grid 600 + HUD 80) = 800×680', () => {
  assert.equal(CANVAS_CONFIG.width, 800);
  assert.equal(GRID_CONFIG.rows * GRID_CONFIG.tileSize, 600);   // the grid itself
  assert.equal(CANVAS_CONFIG.height, 680);                      // grid + HUD band
});

// ---------- LINK 1: viewport / coordinate math (WebSurface) ----------
test('LINK 1a — fitViewport: camera centered on world, letterboxed zoom', () => {
  const surface = makeSurface(1000, 750);
  const cam = surface.getCamera();
  assert.equal(cam.x, 400);
  assert.equal(cam.y, 340);
  const expectedZoom = Math.min(1000 / 800, 750 / 680);
  assert.ok(Math.abs(cam.zoom - expectedZoom) < 1e-9);
});

test('LINK 1b — screenToWorld: canvas center → world center', () => {
  const { x, y } = makeSurface(1000, 750).screenToWorld(500, 375);
  assert.ok(Math.abs(x - 400) < 1e-6);
  assert.ok(Math.abs(y - 340) < 1e-6);
});

test('LINK 1c — screenToWorld ↔ worldToScreen round-trip', () => {
  const surface = makeSurface(1000, 750);
  for (const [sx, sy] of [[0, 0], [123, 456], [500, 375], [999, 749]]) {
    const w = surface.screenToWorld(sx, sy);
    const s = surface.worldToScreen(w.x, w.y);
    assert.ok(Math.abs(s.x - sx) < 1e-6 && Math.abs(s.y - sy) < 1e-6);
  }
});

test('LINK 1d — clicks in the HUD band map to grid row 15 (out of bounds)', () => {
  const { y } = makeSurface(1000, 750).screenToWorld(500, 700);
  assert.ok(y > 600 && y < 680, `world y ${y} should be inside the HUD band`);
  assert.equal(Math.floor(y / 40), 15);
});

// ---------- LINK 2: GameState UI state ----------
test('LINK 2a — tower type selection round-trip', () => {
  const gs = new GameState();
  assert.equal(gs.getSelectedTowerType(), null);
  gs.selectTowerType('archer');
  assert.equal(gs.getSelectedTowerType(), 'archer');
  gs.deselectTowerType();
  assert.equal(gs.getSelectedTowerType(), null);
});

test('LINK 2b — hovered grid cell set/clear', () => {
  const gs = new GameState();
  gs.setHoveredGridCell(3, 4);
  assert.deepEqual(gs.getHoveredGridCell(), { gridX: 3, gridY: 4 });
  gs.clearHoveredGridCell();
  assert.equal(gs.getHoveredGridCell(), null);
});

// ---------- LINK 3: MapManager queries ----------
test('LINK 3a — isInBounds: rows 0..14 buildable, row 15 (HUD band) is not', () => {
  const mm = new MapManager();
  assert.equal(mm.isInBounds(0, 0), true);
  assert.equal(mm.isInBounds(19, 14), true);
  assert.equal(mm.isInBounds(20, 7), false);
  assert.equal(mm.isInBounds(5, 15), false);
});

test('LINK 3b — isBlocked: obstacle tiles', () => {
  const mm = new MapManager();
  assert.equal(mm.isBlocked(8, 7), true);
  assert.equal(mm.isBlocked(3, 3), false);
});

test('LINK 3c — isOnPath: on-path, adjacent, clear tiles', () => {
  const mm = new MapManager();
  assert.equal(mm.isOnPath(2, 7), true);   // on the horizontal run
  assert.equal(mm.isOnPath(5, 6), true);   // on the vertical run
  assert.equal(mm.isOnPath(2, 8), false);  // one tile off the path
  assert.equal(mm.isOnPath(7, 5), false);  // between path legs
});

// ---------- LINK 4: TowerManager.placeTower validation ----------
test('LINK 4a — valid tile: places tower and charges gold', async () => {
  const { gameState, towerManager } = await makeGameBits();
  const before = gameState.getMoney();
  const tower = towerManager.placeTower('archer', 100, 100, gameState); // grid (2,2)
  assert.ok(tower, 'placement should succeed');
  assert.equal(tower.gridX, 2);
  assert.equal(tower.gridY, 2);
  assert.equal(gameState.getMoney(), before - 100);
});

test('LINK 4b — rejects: path / blocked / HUD-band / occupied / broke', async () => {
  const { gameState, towerManager } = await makeGameBits();
  assert.equal(towerManager.placeTower('archer', 100, 300, gameState), null); // (2,7) on path
  assert.equal(towerManager.placeTower('archer', 340, 300, gameState), null); // (8,7) blocked
  assert.equal(towerManager.placeTower('archer', 100, 640, gameState), null); // row 15 HUD band
  assert.ok(towerManager.placeTower('archer', 100, 100, gameState));          // (2,2) ok
  assert.equal(towerManager.placeTower('archer', 110, 105, gameState), null); // same tile
  gameState.spendMoney(gameState.getMoney());                                // go broke
  assert.equal(towerManager.placeTower('archer', 300, 100, gameState), null); // cannot afford
  assert.equal(towerManager.getTowers().length, 1);
});

// ---------- LINK 5: ghost preview rendering ----------
test('LINK 5a — no selection or no hover → nothing drawn', async () => {
  const { gameState, mapManager, towerManager } = await makeGameBits();
  const { surface, calls } = makeRecordingSurface();
  const renderer = new TowerRenderer(surface);
  await renderer.initialize();

  renderer.render([], gameState, mapManager, towerManager);
  assert.equal(calls.circles.length + calls.rects.length, 0);

  gameState.selectTowerType('archer');        // selected, still no hover
  renderer.render([], gameState, mapManager, towerManager);
  assert.equal(calls.circles.length + calls.rects.length, 0);
});

test('LINK 5b — selection + hover on clear tile → green ghost drawn', async () => {
  const { gameState, mapManager, towerManager } = await makeGameBits();
  const { surface, calls } = makeRecordingSurface();
  const renderer = new TowerRenderer(surface);
  await renderer.initialize();

  gameState.selectTowerType('archer');
  gameState.setHoveredGridCell(2, 2);
  renderer.render([], gameState, mapManager, towerManager);

  assert.ok(calls.circles.length >= 1, 'range circle drawn');
  assert.ok(calls.rects.length >= 1, 'ghost body drawn');
  assert.ok(calls.texts.some(t => t.t.includes('🏹')), 'emoji drawn');
  const green = [...calls.circles, ...calls.rects].some(c => String(c.color).includes('0, 255, 0'));
  assert.ok(green, 'valid tile → green');
});

test('LINK 5c — hover over path tile → red ghost', async () => {
  const { gameState, mapManager, towerManager } = await makeGameBits();
  const { surface, calls } = makeRecordingSurface();
  const renderer = new TowerRenderer(surface);
  await renderer.initialize();

  gameState.selectTowerType('archer');
  gameState.setHoveredGridCell(2, 7);         // on the path
  renderer.render([], gameState, mapManager, towerManager);
  const red = [...calls.circles, ...calls.rects].some(c => String(c.color).includes('255, 0, 0'));
  assert.ok(red, 'path tile → red');
});

// ---------- LINK 6: full click-to-place flow (eventHandlers) ----------
test('LINK 6a — handleTowerPlacement: places, charges, deselects', async () => {
  const bits = await makeGameBits();
  const engine = {
    getGameState: () => bits.gameState,
    getManager: (n) => (n === 'tower' ? bits.towerManager : n === 'map' ? bits.mapManager : null),
  };
  bits.gameState.selectTowerType('archer');
  handleTowerPlacement(100, 100, engine);
  assert.equal(bits.towerManager.getTowers().length, 1);
  assert.equal(bits.gameState.getSelectedTowerType(), null);   // exited placement mode
  assert.equal(bits.gameState.getMoney(), 500 - 100);
});

test('LINK 6b — handleTowerTypeSelection toggles', async () => {
  const bits = await makeGameBits();
  const engine = { getGameState: () => bits.gameState, getManager: () => null };
  handleTowerTypeSelection('archer', engine);
  assert.equal(bits.gameState.getSelectedTowerType(), 'archer');
  handleTowerTypeSelection('archer', engine);                  // same card again
  assert.equal(bits.gameState.getSelectedTowerType(), null);
});
