/**
 * Main Entry Point
 * Initializes and starts the game with platform-agnostic rendering.
 * 
 * Architecture:
 * Platform (DOM) → RenderSurface (adapter) → GameEngine → Game logic
 * 
 * This file handles:
 * - Canvas DOM access (ONLY place where DOM is accessed for canvas)
 * - RenderSurface creation
 * - GameEngine initialization
 * - Keyboard shortcuts
 * - UI event listeners
 */

import GameEngine from './core/GameEngine.js';
import WebSurface from './rendering/WebSurface.js';
import { CANVAS_CONFIG } from './utils/constants.js';

// ============================================
// GLOBALS
// ============================================

let gameEngine = null;
let renderSurface = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the game when DOM is ready
 */
async function initializeGame() {
  try {
    console.log('🚀 Initializing Tower Defense Game...');

    // Get canvas element (ONLY DOM access for canvas)
    const canvas = document.getElementById(CANVAS_CONFIG.canvasId);
    if (!canvas) {
      throw new Error(`❌ Canvas element with ID "${CANVAS_CONFIG.canvasId}" not found`);
    }

    // Create RenderSurface (platform adapter)
    renderSurface = new WebSurface(canvas, {
      autoResize: true,
      useDevicePixelRatio: true,
      enableCamera: true,
    });

    console.log('✅ RenderSurface created');

    // Create GameEngine and inject RenderSurface
    gameEngine = new GameEngine(renderSurface);

    // Initialize all systems
    await gameEngine.initialize();

    // Setup event listeners
    setupKeyboardShortcuts();
    setupUIEventListeners();
    setupCanvasEventListeners();
    setupWindowEventListeners();

    console.log('✅ Game ready to start!');
    console.log('💡 Press SPACE or click START to begin');

  } catch (error) {
    console.error('❌ Failed to initialize game:', error);
    showErrorDialog('Failed to initialize game. Check console for details.');
  }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

/**
 * Setup keyboard event listeners for game shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (!gameEngine) return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        handleSpaceKey();
        break;

      case 'Escape':
        event.preventDefault();
        handleEscapeKey();
        break;

      case 'KeyP':
        event.preventDefault();
        handlePauseKey();
        break;

      case 'KeyR':
        event.preventDefault();
        handleResetKey();
        break;

      case 'KeyD':
        event.preventDefault();
        handleDebugKey();
        break;

      // Number keys for tower selection (1-9)
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9':
        handleTowerSelectionKey(event.code);
        break;

      default:
        break;
    }
  });

  console.log('⌨️ Keyboard shortcuts configured');
}

/**
 * Handle Space key - Start/Resume/Restart game
 */
function handleSpaceKey() {
  if (!gameEngine) return;

  const gameState = gameEngine.getGameState();

  // If game is over or won, restart
  if (gameState.isGameOver() || gameState.isGameWon()) {
    console.log('🔄 Restarting game...');
    gameEngine.reset();
    gameEngine.start();
  }
  // If game is not running, start it
  else if (!gameState.isGameRunning()) {
    console.log('▶️ Starting game...');
    gameEngine.start();
  }
  // If game is running and paused, resume
  else if (gameState.isGamePaused()) {
    console.log('▶️ Resuming game...');
    gameEngine.togglePause();
  }
  // If game is running, pause it
  else {
    console.log('⏸️ Pausing game...');
    gameEngine.togglePause();
  }
}

/**
 * Handle Escape key - Pause/Resume game
 */
function handleEscapeKey() {
  if (!gameEngine) return;

  const gameState = gameEngine.getGameState();
  if (gameState.isGameRunning()) {
    gameEngine.togglePause();
  }
}

/**
 * Handle P key - Pause game
 */
function handlePauseKey() {
  if (!gameEngine) return;

  const gameState = gameEngine.getGameState();
  if (gameState.isGameRunning() && !gameState.isGamePaused()) {
    gameEngine.togglePause();
  }
}

/**
 * Handle R key - Reset game
 */
function handleResetKey() {
  if (!gameEngine) return;

  console.log('🔄 Resetting game...');
  gameEngine.reset();
}

/**
 * Handle D key - Show debug info
 */
function handleDebugKey() {
  if (!gameEngine) return;

  const gameState = gameEngine.getGameState();
  const gameLoop = gameEngine.gameLoop;

  console.log('=== DEBUG INFO ===');
  console.log('Game State:', gameState.getSnapshot());
  console.log('Game Loop:', gameLoop.getPerformanceReport());
  console.log('RenderSurface:', renderSurface.getSnapshot());
  console.log('RenderSurface Performance:', renderSurface.getPerformanceMetrics());
  console.log('Towers:', gameEngine.getManager('tower').getTowers());
  console.log('Enemies:', gameEngine.getManager('enemy').getEnemies());
  console.log('Projectiles:', gameEngine.getManager('projectile').getProjectiles());
  console.log('==================');
}

/**
 * Handle tower selection keys (1-9)
 * @param {string} keyCode - The key code pressed
 */
function handleTowerSelectionKey(keyCode) {
  if (!gameEngine) return;

  const towerManager = gameEngine.getManager('tower');
  const towerTypes = towerManager.getTowerTypes();
  const towerNumber = parseInt(keyCode.replace('Digit', ''), 10);

  if (towerNumber > 0 && towerNumber <= towerTypes.length) {
    const selectedTowerType = towerTypes[towerNumber - 1];
    gameEngine.getGameState().selectTowerType(selectedTowerType);
    console.log(`🏹 Selected tower: ${selectedTowerType}`);
  }
}

// ============================================
// UI EVENT LISTENERS
// ============================================

/**
 * Setup UI button event listeners
 */
function setupUIEventListeners() {
  const startButton = document.getElementById('start');
  const pauseButton = document.getElementById('pause');
  const resetButton = document.getElementById('reset');

  // Start button
  if (startButton) {
    startButton.addEventListener('click', () => {
      if (!gameEngine) return;

      const gameState = gameEngine.getGameState();

      if (gameState.isGameOver() || gameState.isGameWon()) {
        gameEngine.reset();
        gameEngine.start();
      } else if (!gameState.isGameRunning()) {
        gameEngine.start();
      }
    });
  }

  // Pause button
  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      if (!gameEngine) return;

      if (gameEngine.getGameState().isGameRunning()) {
        gameEngine.togglePause();
      }
    });
  }

  // Reset button
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (!gameEngine) return;
      gameEngine.reset();
    });
  }

  console.log('🎮 UI event listeners configured');
}

// ============================================
// CANVAS EVENT LISTENERS
// ============================================

/**
 * Setup canvas event listeners for interaction
 */
function setupCanvasEventListeners() {
  const canvas = renderSurface.canvas;

  canvas.addEventListener('click', (event) => {
    if (!gameEngine) return;
    handleCanvasClick(event);
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!gameEngine) return;
    handleCanvasMouseMove(event);
  });

  canvas.addEventListener('mousedown', (event) => {
    if (!gameEngine) return;
    handleCanvasMouseDown(event);
  });

  canvas.addEventListener('mouseup', (event) => {
    if (!gameEngine) return;
    handleCanvasMouseUp(event);
  });

  canvas.addEventListener('mouseleave', (event) => {
    if (!gameEngine) return;
    handleCanvasMouseLeave(event);
  });

  canvas.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (!gameEngine) return;
    handleCanvasDragOver(event);
  });

  canvas.addEventListener('drop', (event) => {
    event.preventDefault();
    if (!gameEngine) return;
    handleCanvasDrop(event);
  });

  console.log('🖱️ Canvas event listeners configured');
}

/**
 * Handle canvas click - Tower placement
 */
function handleCanvasClick(event) {
  const gameState = gameEngine.getGameState();
  if (!gameState.isGameRunning() || gameState.isGamePaused()) {
    return;
  }

  // Get click position (account for canvas offset and DPI)
  const rect = renderSurface.canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  // Convert screen coordinates to world coordinates
  const { x: worldX, y: worldY } = renderSurface.screenToWorld(screenX, screenY);

  // Delegate to tower manager or event handler
  const towerManager = gameEngine.getManager('tower');
  if (towerManager && towerManager.handleTowerPlacement) {
    towerManager.handleTowerPlacement(worldX, worldY);
  }
}

/**
 * Handle canvas mouse move - Tower preview/drag
 */
function handleCanvasMouseMove(event) {
  const rect = renderSurface.canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  const { x: worldX, y: worldY } = renderSurface.screenToWorld(screenX, screenY);

  // Update game state with hover position
  gameEngine.getGameState().setHoveredGridCell(
    Math.floor(worldX / CANVAS_CONFIG.tileSize),
    Math.floor(worldY / CANVAS_CONFIG.tileSize)
  );
}

/**
 * Handle canvas mouse down - Tower drag start
 */
function handleCanvasMouseDown(event) {
  const gameState = gameEngine.getGameState();
  if (!gameState.isGameRunning()) return;

  const rect = renderSurface.canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  const { x: worldX, y: worldY } = renderSurface.screenToWorld(screenX, screenY);

  // Delegate to UI manager for drag handling
  const uiManager = gameEngine.getManager('ui');
  if (uiManager && uiManager.handleDragStart) {
    uiManager.handleDragStart(worldX, worldY);
  }
}

/**
 * Handle canvas mouse up - Tower drag end
 */
function handleCanvasMouseUp(event) {
  const rect = renderSurface.canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  const { x: worldX, y: worldY } = renderSurface.screenToWorld(screenX, screenY);

  // Delegate to UI manager for drag end
  const uiManager = gameEngine.getManager('ui');
  if (uiManager && uiManager.handleDragEnd) {
    uiManager.handleDragEnd(worldX, worldY);
  }
}

/**
 * Handle canvas mouse leave - Reset hover state
 */
function handleCanvasMouseLeave(event) {
  gameEngine.getGameState().clearHoveredGridCell();
}

/**
 * Handle canvas drag over
 */
function handleCanvasDragOver(event) {
  // Placeholder for drag-and-drop from UI elements
}

/**
 * Handle canvas drop
 */
function handleCanvasDrop(event) {
  // Placeholder for drag-and-drop from UI elements
}

// ============================================
// WINDOW EVENT LISTENERS
// ============================================

/**
 * Setup window-level event listeners
 */
function setupWindowEventListeners() {
  // Handle visibility change (pause game when tab loses focus)
  document.addEventListener('visibilitychange', () => {
    if (!gameEngine) return;

    const gameState = gameEngine.getGameState();
    if (document.hidden) {
      if (gameState.isGameRunning() && !gameState.isGamePaused()) {
        gameEngine.togglePause();
        console.log('⏸️ Game paused (tab hidden)');
      }
    } else {
      if (gameState.isGameRunning() && gameState.isGamePaused()) {
        gameEngine.togglePause();
        console.log('▶️ Game resumed (tab visible)');
      }
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (!gameEngine) return;

    const { width, height } = renderSurface.getDimensions();
    console.log(`📐 Canvas resized to ${width}x${height}`);

    // Notify managers if needed
    const uiManager = gameEngine.getManager('ui');
    if (uiManager && uiManager.handleResize) {
      uiManager.handleResize(width, height);
    }
  });

  console.log('🪟 Window event listeners configured');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Display error dialog to user
 * @param {string} message - Error message
 */
function showErrorDialog(message) {
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff4444;
    color: white;
    padding: 20px;
    border-radius: 10px;
    z-index: 9999;
    font-size: 16px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  `;
  dialog.textContent = message;
  document.body.appendChild(dialog);

  setTimeout(() => {
    dialog.remove();
  }, 5000);
}

/**
 * Get game engine instance (for console debugging)
 * @returns {GameEngine} The game engine instance
 */
function getGameEngine() {
  return gameEngine;
}

/**
 * Get render surface instance (for console debugging)
 * @returns {WebSurface} The render surface instance
 */
function getRenderSurface() {
  return renderSurface;
}

// ============================================
// ENTRY POINT
// ============================================

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

// Export for global access (debugging in console)
window.gameEngine = gameEngine;
window.renderSurface = renderSurface;
window.getGameEngine = getGameEngine;
window.getRenderSurface = getRenderSurface;

console.log('📄 main.js loaded (Platform → RenderSurface → GameEngine)');