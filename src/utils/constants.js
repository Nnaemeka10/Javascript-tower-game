/**
 * Game Constants
 * Centralized configuration for all magic numbers in the game.
 * 
 * This file contains:
 * - Canvas and display settings
 * - Grid and tile configuration
 * - Game balance values
 * - Debug flags
 */

// ============================================
// CANVAS CONFIGURATION
// ============================================

export const CANVAS_CONFIG = {
  canvasId: 'gameCanvas',
  tileSize: 40,
  width: 800, // 20 tiles * 40px
  height: 600, // 15 tiles * 40px
};

// ============================================
// GRID AND MAP CONFIGURATION
// ============================================

export const GRID_CONFIG = {
  cols: 20,
  rows: 15,
  tileSize: CANVAS_CONFIG.tileSize,
};

// Calculate total width/height from grid
CANVAS_CONFIG.width = GRID_CONFIG.cols * GRID_CONFIG.tileSize;
CANVAS_CONFIG.height = GRID_CONFIG.rows * GRID_CONFIG.tileSize;

// ============================================
// GAME CONFIGURATION
// ============================================

export const GAME_CONFIG = {
  // Starting resources
  startingMoney: 500,
  startingLives: 20,

  // Game rules
  maxTowers: 100,
  maxEnemies: 500,
  maxProjectiles: 500,
  maxNotifications: 5,

  // Visual settings
  backgroundColor: '#1a1a2e',
  gridColor: 'rgba(255, 255, 255, 0.1)',
  pathColor: 'rgba(100, 150, 255, 0.3)',
  showDebugGrid: false,
  showDebugInfo: false,

  // Performance
  targetFPS: 60,
  maxDeltaTime: 0.1, // Cap delta time to prevent spiral of death
};

// ============================================
// TOWER CONFIGURATION
// ============================================

export const TOWER_BALANCE = {
  maxLevel: 10,
  baseCost: 100,
  upgradeMultiplier: 1.15, // Each upgrade costs 15% more
  rangeCheckInterval: 0.1, // Check for targets every 100ms
};

// ============================================
// ENEMY CONFIGURATION
// ============================================

export const ENEMY_BALANCE = {
  maxPoolSize: 100,
  healthScaling: 1.15, // Health increases 15% per wave
  speedScaling: 1.08, // Speed increases 8% per wave
  bountyScaling: 1.2, // Bounty increases 20% per wave
};

// ============================================
// PROJECTILE CONFIGURATION
// ============================================

export const PROJECTILE_BALANCE = {
  maxPoolSize: 200,
  maxActive: 500,
  collisionCheckInterval: 0.016, // Check every frame
};

// ============================================
// WAVE CONFIGURATION
// ============================================

export const WAVE_BALANCE = {
  totalWaves: 10,
  baseSpawnInterval: 0.5,
  speedUpPerWave: 0.03, // 3% faster spawn per wave
};

// ============================================
// UI CONFIGURATION
// ============================================

export const UI_CONFIG = {
  hudHeight: 60,
  panelWidth: 250,
  panelHeight: 300,
  notificationDuration: 3, // seconds
  hudPadding: 10,
};

// ============================================
// AUDIO CONFIGURATION (for future)
// ============================================

export const AUDIO_CONFIG = {
  enabled: false,
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
};

// ============================================
// DEBUG CONFIGURATION
// ============================================

export const DEBUG_CONFIG = {
  enabled: false,
  showFPS: true,
  showColliders: false,
  showPathfinding: false,
  showTowerRanges: false,
  showEnemyHealth: true,
  enableConsoleLogging: true,
  logEnemySpawns: false,
  logTowerShoots: false,
  logCollisions: false,
};

// ============================================
// COLOR PALETTE
// ============================================

export const COLORS = {
  // UI Colors
  primary: '#00FF00',
  secondary: '#00CCFF',
  warning: '#FFFF00',
  danger: '#FF0000',
  success: '#00FF00',
  info: '#00CCFF',

  // Background Colors
  hudBackground: 'rgba(0, 0, 0, 0.7)',
  panelBackground: 'rgba(30, 30, 30, 0.9)',
  overlayBackground: 'rgba(0, 0, 0, 0.8)',

  // Enemy Colors
  enemyGoblin: '#00AA00',
  enemyDwarve: '#888888',
  enemyElve: '#CCFF00',
  enemyHobbit: '#FFAA00',
  enemyDragon: '#FF0000',

  // Tower Colors
  towerArcher: '#8B4513',
  towerMage: '#9932CC',
  towerCannon: '#556B2F',
  towerFrost: '#00CED1',
  towerAlchemist: '#006400',
  towerTesla: '#FFD700',

  // Projectile Colors
  projectileArrow: '#FFAA00',
  projectileFireball: '#FF4400',
  projectileIceShard: '#00FFFF',
  projectileCannonball: '#666666',
  projectileBolt: '#FFFF00',
  projectileMagicMissile: '#FF00FF',
};

// ============================================
// KEYBOARD CONFIGURATION
// ============================================

export const KEYBOARD_CONFIG = {
  pauseKeys: ['Escape', 'KeyP'],
  startKeys: ['Space'],
  resetKeys: ['KeyR'],
  debugKeys: ['KeyD'],
  towerSelectionKeys: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'],
};

// ============================================
// DIFFICULTY PRESETS
// ============================================

export const DIFFICULTY_PRESETS = {
  easy: {
    moneyMultiplier: 1.5,
    enemyHealthDivisor: 1.2,
    startingMoney: 750,
    description: 'Easier gameplay with more money',
  },
  normal: {
    moneyMultiplier: 1.0,
    enemyHealthDivisor: 1.0,
    startingMoney: 500,
    description: 'Balanced gameplay',
  },
  hard: {
    moneyMultiplier: 0.8,
    enemyHealthDivisor: 0.85,
    startingMoney: 350,
    description: 'Challenging gameplay',
  },
};

// ============================================
// ANIMATION CONFIGURATION
// ============================================

export const ANIMATION_CONFIG = {
  towerShootPulseDuration: 0.2,
  enemyDeathAnimationDuration: 0.5,
  projectileTrailLength: 10,
  notificationFadeDuration: 0.5,
};

// ============================================
// PERFORMANCE THRESHOLDS
// ============================================

export const PERFORMANCE_CONFIG = {
  warnFPSThreshold: 50,
  criticalFPSThreshold: 30,
  maxFrameTimeMS: 33.33, // ~30 FPS
  performanceMonitoringEnabled: true,
};

// ============================================
// EXPORT CANVAS AND CTX FOR LEGACY CODE
// ============================================

export const canvas = document.getElementById(CANVAS_CONFIG.canvasId);
export const ctx = canvas ? canvas.getContext('2d') : null;

// Aliases for common values
export const TILE_SIZE = CANVAS_CONFIG.tileSize;
export const COLS = GRID_CONFIG.cols;
export const ROWS = GRID_CONFIG.rows;
export const gameLife = GAME_CONFIG.startingLives;
export const startingBudget = GAME_CONFIG.startingMoney;