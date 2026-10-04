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
import RoundManager from '../features/rounds/RoundManager.js';

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
      throw new Error(' GameEngine requires a RenderSurface instance');
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

    this.roundManager = new RoundManager({
      gameState: this.gameState, waveManager: this.managers.wave,
      enemyManager: this.managers.enemy, mapManager: this.managers.map,
      towerManager: this.managers.tower, uiManager: this.managers.ui,
      gameEngine: this,
    });

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

    console.log('GameEngine created (renderSurface injected)');
  }

  /**
   * Initialize the game engine and all systems
   * Called once at startup
   */
  async initialize() {
    try {
      console.log('Initializing GameEngine...');

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
      await this.roundManager.initialize();

      // Apply the current map to enemy pathing
      this.applyCurrentMap();

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
      console.log(' GameEngine initialized successfully');

    } catch (error) {
      console.error(' Failed to initialize GameEngine:', error);
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
            console.log('Game Over!');
          }
          break;

        case 'gameWonChanged':
          if (data) {
            console.log(' You won!');
          }
          break;

        case 'moneyChanged':
          this.managers.money.recordMoneyChanged(data);   
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
      console.error('GameEngine not initialized. Call initialize() first.');
      return;
    }

    this.gameState.setTotalWaves(this.managers.wave.getTotalWaves());
    this.gameState.setGameRunning(true);
    this.gameLoop.start();
    this.roundManager.start();
    
    // Start the first wave
    this.managers.wave.startWave(this.managers.enemy, this.gameState);
    
    console.log(' Game started');
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.gameState.setGameRunning(false);
    this.gameLoop.stop();
    console.log('Game stopped');
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
      this.roundManager.update(deltaTime);
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
      console.error('Error during game update:', error);
      this.gameState.setGameError(true);
      // Continue running despite error
    }
  }

  /**
   * Derive enemy path/spawn from the CURRENT map. Called on init AND every round change.
   */
  applyCurrentMap() {
    const m = this.managers.map.getCurrentMap();
    const t = m.tileSize;
    this.managers.enemy.setPath(m.path.map(p => ({ x: p.x * t + t / 2, y: p.y * t + t / 2 })));
    this.managers.enemy.setSpawnPoint({ x: m.spawn.x * t + t / 2, y: m.spawn.y * t + t / 2 });
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
      this.renderers.tower.render(
        this.managers.tower.getTowers(),
        this.gameState,
        this.managers.map,
        this.managers.tower
      );
      this.renderers.enemy.render(this.managers.enemy.getEnemies());
      this.renderers.projectile.render(this.managers.projectile.getProjectiles());

      // 4. UI (above everything, not affected by camera)
      this.renderers.ui.render(this.gameState, this.managers, this.managers.ui);

      // Restore camera transform
      this.renderSurface.restoreCameraTransform?.();

      

      // 5. Debug info (if enabled)
      if (GAME_CONFIG.showDebugInfo) {
        this.renderSurface.drawDebugInfo();
      }

    } catch (error) {
      console.error(' Error during render:', error);
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
      if (projectile.hasHit) continue;

      for (const enemy of enemies) {
        if (enemy.isDead || !enemy.isActive) continue;

        let hit = false;
        if (projectile.target && projectile.target.id === enemy.id) {
          const dx = (enemy.x + enemy.width / 2) - (projectile.x + projectile.width / 2);
          const dy = (enemy.y + enemy.height / 2) - (projectile.y + projectile.height / 2);
          if (Math.hypot(dx, dy) < enemy.width / 2) hit = true;
        }
        if (!hit && this.checkCollision(projectile, enemy)) hit = true;
        if (!hit) continue;

        // ---- primary hit
        const sourceTower = projectile.sourceTowerId != null
          ? this.managers.tower.getTowerById(projectile.sourceTowerId) : null;
        const actual = enemy.takeDamage(projectile.damage, projectile.damageType || 'normal');
        if (sourceTower) sourceTower.recordDamage(actual);
        projectile.hit();

        this.applyOnHitEffects(sourceTower, enemy);                       // slow / burn / poison / rewind
        this.applySplash(sourceTower, enemy, actual, projectile.damageType); // cannon
        if (sourceTower?.config.chainEffect) {
          this.applyChain(sourceTower, enemy, actual, projectile.damageType); // tesla
        }

        if (enemy.isDead) {
          this.registerKill(enemy, sourceTower);
          this.applyContagion(sourceTower, enemy);                        // alchemist T3
        }
        break;
      }
    }
  }

  /** Tier-gated on-hit status effects. Tier III keeps Tier II's effects (cumulative). */
  applyOnHitEffects(sourceTower, enemy) {
    if (!sourceTower || !enemy || enemy.isDead) return;
    const ab = sourceTower.config.tierAbilities;
    if (!ab) return;
    const tier = sourceTower.getTier();

    for (const t of [2, 3]) {
      if (tier < t) continue;
      const onHit = ab[t]?.onHit;
      if (!onHit) continue;
      if (onHit.slow)    enemy.applySlow(onHit.slow.factor, onHit.slow.duration);
      if (onHit.poison) enemy.applyPoison(onHit.poison.dps, onHit.poison.duration, sourceTower.id);
      if (onHit.burn)   enemy.applyBurn(onHit.burn.dps, onHit.burn.duration, sourceTower.id);
      if (onHit.pushBack) enemy.pushBack(onHit.pushBack);
    }
  }

  /** Cannon tier splash: falloff damage around the primary target. */
  applySplash(sourceTower, primary, primaryDamage, damageType) {
    if (!sourceTower) return;
    const tier = sourceTower.getTier();
    const ab = sourceTower.config.tierAbilities;
    const splash = (tier >= 3 && ab?.[3]?.onHit?.splash)
                || (tier >= 2 && ab?.[2]?.onHit?.splash) || null;
    if (!splash) return;

    const nearby = this.managers.enemy.getEnemiesInArea(primary.x, primary.y, splash.radius)
      .filter(e => e !== primary && !e.isDead && e.isActive);
    for (const e of nearby) {
      const actual = e.takeDamage(Math.round(primaryDamage * (splash.falloff ?? 0.6)), damageType);
      sourceTower.recordDamage(actual);
      if (e.isDead) this.registerKill(e, sourceTower);
    }
  }

  /** Tesla chain: jumps to nearest unstruck enemy, decaying damage. Tier extends 3→4→5. */
  applyChain(sourceTower, primary, primaryDamage, damageType) {
    const ce = sourceTower.config.chainEffect;
    const tier = sourceTower.getTier();
    const jumps = ce.maxChains + (tier - 1);
    let lastDamage = primaryDamage;
    let origin = primary;
    const struck = new Set([primary.id]);

    for (let j = 0; j < jumps; j++) {
      const candidates = this.managers.enemy.getEnemiesInArea(origin.x, origin.y, ce.chainRange)
        .filter(e => !e.isDead && e.isActive && !struck.has(e.id));
      if (candidates.length === 0) break;

      candidates.sort((a, b) =>
        Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y));
      const next = candidates[0];

      lastDamage *= ce.damageMultiplier;
      const actual = next.takeDamage(Math.round(lastDamage), damageType);
      sourceTower.recordDamage(actual);

      if (tier >= 3 && j === jumps - 1) next.applyStun(0.4);   // Storm Crown
      if (next.isDead) this.registerKill(next, sourceTower);

      struck.add(next.id);
      origin = next;
    }
  }

  /** Single kill-reward path for primary / splash / chain kills. */
    registerKill(enemy, sourceTower) {
    const killer = sourceTower
      ?? (enemy.deathSourceTag != null ? this.managers.tower.getTowerById(enemy.deathSourceTag) : null);
    if (killer) killer.recordKill(enemy.bounty);
    this.gameState.addMoney(enemy.bounty);
    this.gameState.incrementEnemiesKilled(1);
    this.gameState.addScore(enemy.bounty);
  }

  /** Alchemist T3: a poisoned enemy dying spreads poison nearby. */
  applyContagion(sourceTower, deadEnemy) {
    if (!sourceTower || sourceTower.getTier() < 3) return;
    const c = sourceTower.config.tierAbilities?.[3]?.onDeath?.contagion;
    if (!c || !deadEnemy.statusEffects.burn.active) return;   // only poisoned victims spread

    const nearby = this.managers.enemy.getEnemiesInArea(deadEnemy.x, deadEnemy.y, c.radius)
      .filter(e => !e.isDead && e.isActive);
    for (const e of nearby) e.applyBurn(c.dps, c.duration);
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
        console.log(` Enemy escaped! Lives: ${this.gameState.getLives()}`);
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
      
      // Check if there are more waves
      if (waves.getCurrentWave() <= waves.getTotalWaves()) {
        // Auto-start next wave after a short delay (or wait for player input)
        console.log(`Starting wave ${waves.getCurrentWave()}...`);
        waves.startWave(this.managers.enemy, this.gameState);
      }
    }

    // Check win condition
    if (waves.isAllWavesComplete() && enemies.length === 0 && !this.roundManager.isTransitioning()) {
      this.roundManager.beginRoundTransition();
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
      console.log(`Victory ${reason}`);
    } else {
      this.gameState.setGameOver(true);
      console.log(`Defeat: ${reason}`);
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
    console.log('Resetting game...');

    this.gameState.reset();
    this.roundManager.reset();
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
      round: this.roundManager.getCurrentRound(),
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