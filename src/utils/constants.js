/**
 * constants.js
 * Every other config lives with its feature
 * (towerConfig, enemyConfig, waveConfig, upgradeConfig, roundConfig).
 */
export const GRID_CONFIG = { cols: 20, rows: 15, tileSize: 40 };

export const CANVAS_CONFIG = {
  canvasId: 'gameCanvas',
  tileSize: GRID_CONFIG.tileSize,
};
CANVAS_CONFIG.width = GRID_CONFIG.cols * GRID_CONFIG.tileSize;        // 800
CANVAS_CONFIG.height = GRID_CONFIG.rows * GRID_CONFIG.tileSize + 80;  // 680 — grid + HUD band

export const GAME_CONFIG = {
  startingMoney: 500,
  startingLives: 20,
  backgroundColor: '#1a1a2e',
  showDebugGrid: false,
  showDebugInfo: false,
};