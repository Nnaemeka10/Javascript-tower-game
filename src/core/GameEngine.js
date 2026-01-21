/**
 * GameEngine
 * Central orchestrator for all game systems and logic.
 * 
 * Architecture:
 * - Receives RenderSurface (platform adapter) via dependency injection
 * - Coordinates all managers and renderers
 * - Implements game logic (collisions, win/lose conditions)
 * - Maintains separation of concerns (logic ≠ rendering)
 * 
 * The engine is PURE LOGIC - no Canvas, DOM, or platform code.
 */

import GameState from './GameState.js';
import GameLoop from './GameLoop.js';

// Import all managers
import TowerManager from '../features/towers/towerManager.js';
import EnemyManager from '../features/enemies/enemyManager.js';
import ProjectileManager from '../features/projectiles/projectileManager.js';
import WaveManager from '../features/waves/WaveManager.js';
import MoneyManager from '../features/economy/MoneyManager.js';
import UIManager from '../features/ui/UIManager.js';
import MapManager from '../maps/mapManager.js';

// Import all renderers
import TowerRenderer from '../features/towers/towerRenderer.js';
import EnemyRenderer from '../features/enemies/enemyRenderer.js';
import ProjectileRenderer from '../features/projectiles/projectileRenderer.js';
import GridRenderer from '../maps/gridRenderer.js';
import PathRenderer from '../maps/pathRenderer.js';
import UIRenderer from '../features/ui/uiRenderer.js';

// Import utilities
import { setupEventHandlers } from '../features/ui/eventHandlers.js';
import { GAME_CONFIG, CANVAS_CONFIG } from '../utils/constants.js';
import { MAP_CONFIGS } from '../maps/mapConfig.js';

class GameEngine {
  /**
   * Create the game engine
   * @param {RenderSurface} renderSurface - Abstract rendering surface (injected)
   */
  constructor(renderSurface) {
    if (!renderSurface) {
      throw new Error('❌ GameEngine requires a RenderSurface instance');
    }

    // Platform adapter (abstract, platform-agnostic)
    this.renderSurface = renderSurface;

    // Core systems
    this.gameState = new GameState();
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    // Initialize all managers
    this.managers = {
      tower: new TowerManager(),
      enemy: new EnemyManager(),
      projectile: new ProjectileManager(),
      wave: new WaveManager(),
      money: new MoneyManager(),
      ui: new UIManager(),
      map: new MapManager(),
    };

    // Initialize all renderers (each receives renderSurface)
    this.renderers = {
      grid: new GridRenderer(this.renderSurface),
      path: new PathRenderer(this.renderSurface),
      tower: new TowerRenderer(this.renderSurface),
      enemy: new EnemyRenderer(this.renderSurface),
      projectile: new ProjectileRenderer(this.renderSurface),
      ui: new UIRenderer(this.renderSurface),
    };

    // State
    this.isInitialized = false;

    console.log('✅ GameEngine created (renderSurface injected)');
  }

  /**
   * Initialize the game engine and all systems
   * Called once at startup
   */
  async initialize() {
    try {
      console.log('🎬 Initializing GameEngine...');

      // Initialize game state
      this.gameState.initialize();

      // Initialize all managers (order matters - dependencies first)
      await this.managers.map.initialize();
      await this.managers.money.initialize();
      await this.managers.tower.initialize(this.renderSurface, this.managers.map);
      await this.managers.enemy.initialize();
      await this.managers.projectile.initialize();
      await this.managers.wave.initialize();
      await this.managers.ui.initialize();

      // Set enemy path from current map (convert grid to world coordinates)
      const currentMap = this.managers.map.getCurrentMap();
      const tileSize = currentMap.tileSize;
      const worldPath = currentMap.path.map(point => ({
        x: point.x * tileSize + tileSize / 2,
        y: point.y * tileSize + tileSize / 2,
      }));
      const worldSpawn = {
        x: currentMap.spawn.x * tileSize + tileSize / 2,
        y: currentMap.spawn.y * tileSize + tileSize / 2,
      };
      this.managers.enemy.setPath(worldPath);
      this.managers.enemy.setSpawnPoint(worldSpawn);

      // Initialize all renderers
      await this.renderers.grid.initialize();
      await this.renderers.path.initialize();
      await this.renderers.tower.initialize();
      await this.renderers.enemy.initialize();
      await this.renderers.projectile.initialize();
      await this.renderers.ui.initialize();

      // Setup event listeners (from UI layer)
      setupEventHandlers(this);

      // Subscribe to state changes for external updates
      this.subscribeToStateChanges();

      this.isInitialized = true;
      console.log('✅ GameEngine initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize GameEngine:', error);
      this.gameState.setGameError(true);
      throw error;
    }
  }

  /**
   * Subscribe to game state changes for reactive updates
   */
  subscribeToStateChanges() {
    this.gameState.subscribe((eventType, data) => {
      switch (eventType) {
        case 'gameRunningChanged':
          console.log(`Game running: ${data}`);
          break;

        case 'gamePausedChanged':
          console.log(`Game paused: ${data}`);
          break;

        case 'gameOverChanged':
          if (data) {
            console.log('💀 Game Over!');
          }
          break;

        case 'gameWonChanged':
          if (data) {
            console.log('🎉 You won!');
          }
          break;

        case 'moneyChanged':
          // Update UI with new money
          break;

        case 'livesChanged':
          // Update UI with new lives
          break;

        default:
          break;
      }
    });
  }

  /**
   * Start the game loop
   */
  start() {
    if (!this.isInitialized) {
      console.error('❌ GameEngine not initialized. Call initialize() first.');
      return;
    }

    this.gameState.setGameRunning(true);
    this.gameLoop.start();
    
    // Start the first wave
    this.managers.wave.startWave(this.managers.enemy, this.gameState);
    
    console.log('🎮 Game started');
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.gameState.setGameRunning(false);
    this.gameLoop.stop();
    console.log('⏹️ Game stopped');
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    const isPaused = this.gameState.getGamePaused();
    this.gameState.setGamePaused(!isPaused);
  }

  /**
   * Update game logic (called every frame by GameLoop)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Don't update if game is not running
    if (!this.gameState.getGameRunning()) return;

    // Don't update logic if paused (but keep rendering)
    if (this.gameState.getGamePaused()) return;

    try {
      // Update game state performance metrics
      this.gameState.setDeltaTime(deltaTime);
      this.gameState.setFPS(this.gameLoop.getFPS());

      // Update systems in dependency order
      // 1. Wave manager (spawns enemies)
      this.managers.wave.update(deltaTime, this.managers.enemy, this.gameState);

      // 2. Enemy manager (moves enemies)
      this.managers.enemy.update(deltaTime);

      // 3. Tower manager (finds targets)
      this.managers.tower.update(deltaTime, this.managers.enemy.getEnemies(), this.managers.projectile);

      // 4. Projectile manager (moves projectiles)
      this.managers.projectile.update(deltaTime);

      // 5. Collision detection (projectiles hit enemies)
      this.checkProjectileEnemyCollisions();

      // 6. Check if enemies reached end
      this.checkEnemiesReachedEnd();

      // 7. Check win/lose conditions
      this.checkGameConditions();

      // 8. UI updates (last, so it has latest state)
      this.managers.ui.update(deltaTime);

    } catch (error) {
      console.error('❌ Error during game update:', error);
      this.gameState.setGameError(true);
      // Continue running despite error
    }
  }

  /**
   * Render the game (called every frame by GameLoop)
   * Uses RenderSurface for all drawing (platform-agnostic)
   */
  render() {
    try {
      // Clear canvas with background color
      this.renderSurface.clear(GAME_CONFIG.backgroundColor);

      // Reset performance stats for this frame
      this.renderSurface.resetStats?.();

      // Apply camera transform (if enabled)
      this.renderSurface.applyCameraTransform?.();

      // Render in order (bottom to top, background to foreground)
      // 1. Grid (debug - optional)
      if (GAME_CONFIG.showDebugGrid) {
        this.renderSurface.drawDebugGrid(CANVAS_CONFIG.tileSize);
      }

      // 2. Game map background
      this.renderers.grid.render(this.managers.map.getCurrentMap());
      this.renderers.path.render(this.managers.map.getCurrentMap());

      // 3. Game entities
      this.renderers.tower.render(this.managers.tower.getTowers());
      this.renderers.enemy.render(this.managers.enemy.getEnemies());
      this.renderers.projectile.render(this.managers.projectile.getProjectiles());

      // Restore camera transform
      this.renderSurface.restoreCameraTransform?.();

      // 4. UI (above everything, not affected by camera)
      this.renderers.ui.render(this.gameState, this.managers, this.managers.ui);

      // 5. Debug info (if enabled)
      if (GAME_CONFIG.showDebugInfo) {
        this.renderSurface.drawDebugInfo();
      }

    } catch (error) {
      console.error('❌ Error during render:', error);
      // Continue rendering next frame
    }
  }

  // ============================================
  // COLLISION DETECTION
  // ============================================

  /**
   * Check for collisions between projectiles and enemies
   * Applies damage and removes projectiles on hit
   */
  checkProjectileEnemyCollisions() {
    const projectiles = this.managers.projectile.getProjectiles();
    const enemies = this.managers.enemy.getEnemies();

    for (const projectile of projectiles) {
      if (projectile.hasHit) continue; // Already hit

      for (const enemy of enemies) {
        if (enemy.isDead) continue; // Dead enemies don't collide

        // Simple AABB collision detection
        if (this.checkCollision(projectile, enemy)) {
          // Apply damage
          const damage = projectile.damage;
          const damageType = projectile.damageType || 'normal';
          enemy.takeDamage(damage, damageType);

          // Mark projectile as hit
          projectile.hit();

          // Award money if enemy died
          if (enemy.isDead) {
            this.managers.money.addMoney(enemy.bounty);
            this.gameState.incrementEnemiesKilled(1);
            this.gameState.addScore(enemy.bounty);
          }

          // Only one hit per projectile
          break;
        }
      }
    }
  }

  /**
   * AABB (Axis-Aligned Bounding Box) collision detection
   * Simple rectangular collision check
   * @private
   */
  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  // ============================================
  // GAME CONDITION CHECKING
  // ============================================

  /**
   * Check if enemies reached the end of the path
   */
  checkEnemiesReachedEnd() {
    const enemies = this.managers.enemy.getEnemies();

    for (const enemy of enemies) {
      if (enemy.hasReachedEnd()) {
        // Decrease lives
        this.gameState.decreaseLives(1);

        // Remove the enemy
        this.managers.enemy.removeEnemy(enemy);

        // Notify UI
        console.log(`👿 Enemy escaped! Lives: ${this.gameState.getLives()}`);
      }
    }
  }

  /**
   * Check win/lose/end game conditions
   */
  checkGameConditions() {
    const lives = this.gameState.getLives();
    const waves = this.managers.wave;
    const enemies = this.managers.enemy.getEnemies();

    // Check lose condition
    if (lives <= 0 && !this.gameState.getGameOver()) {
      this.endGame(false, 'No lives remaining');
      return;
    }

    // Check if current wave is complete (all enemies spawned AND all dead)
    if (
      waves.isCurrentWaveActive() &&
      waves.allEnemiesSpawned &&
      enemies.length === 0
    ) {
      // Complete the wave and get reward
      const reward = waves.completeWave(this.gameState);
      this.managers.money.addMoney(reward);
      
      // Check if there are more waves
      if (waves.getCurrentWave() <= waves.getTotalWaves()) {
        // Auto-start next wave after a short delay (or wait for player input)
        console.log(`🌊 Starting wave ${waves.getCurrentWave()}...`);
        waves.startWave(this.managers.enemy, this.gameState);
      }
    }

    // Check win condition
    if (
      waves.isAllWavesComplete() &&
      enemies.length === 0 &&
      !this.gameState.getGameWon()
    ) {
      this.endGame(true, 'All waves completed!');
      return;
    }
  }

  /**
   * End the game (win or lose)
   * @private
   */
  endGame(won, reason) {
    if (won) {
      this.gameState.setGameWon(true);
      console.log(`🎉 ${reason}`);
    } else {
      this.gameState.setGameOver(true);
      console.log(`💀 ${reason}`);
    }

    this.stop();
  }

  // ============================================
  // GAME STATE MANAGEMENT
  // ============================================

  /**
   * Reset the game to initial state
   */
  reset() {
    console.log('🔄 Resetting game...');

    this.gameState.reset();
    this.managers.tower.clear();
    this.managers.enemy.clear();
    this.managers.projectile.clear();
    this.managers.wave.reset();
    this.managers.money.reset();
  }

  // ============================================
  // PUBLIC API (for external access)
  // ============================================

  /**
   * Get game state instance
   * @returns {GameState}
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Get a manager by name
   * @param {string} managerName - Manager name (tower, enemy, projectile, wave, money, ui)
   * @returns {Object|null}
   */
  getManager(managerName) {
    return this.managers[managerName] || null;
  }

  /**
   * Get a renderer by name
   * @param {string} rendererName - Renderer name
   * @returns {Object|null}
   */
  getRenderer(rendererName) {
    return this.renderers[rendererName] || null;
  }

  /**
   * Get render surface
   * @returns {RenderSurface}
   */
  getRenderSurface() {
    return this.renderSurface;
  }

  /**
   * Get game loop
   * @returns {GameLoop}
   */
  getGameLoop() {
    return this.gameLoop;
  }

  /**
   * Get complete engine state snapshot (for debugging)
   * @returns {Object}
   */
  getSnapshot() {
    return {
      initialized: this.isInitialized,
      gameState: this.gameState.getSnapshot(),
      gameLoop: this.gameLoop.getPerformanceReport(),
      renderSurface: this.renderSurface.getSnapshot(),
      managers: {
        towers: this.managers.tower.getTowers().length,
        enemies: this.managers.enemy.getEnemies().length,
        projectiles: this.managers.projectile.getProjectiles().length,
        currentWave: this.managers.wave.getCurrentWave(),
        money: this.gameState.getMoney(),
      },
    };
  }
}

export default GameEngine;