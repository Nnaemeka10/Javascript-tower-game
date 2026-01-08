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
import GameState from "./GameState";
import GameLoop from "./GameLoop";

class GameEngine {
    constructor (renderSurface) {
        //initialize rendering
        this.renderSurface = renderSurface;

        //initialize core systems
        this.gameState = new GameState();
        this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

        //initialize all managers
        this.managers = {
            tower: new TowerManager(),
            enemy: new EnemyManager(),
            projectile: new ProjectileManager(),
            wave: new WaveManager(),
            money: new MoneyManager(),
            ui: new UIManager(),
        };

        //initialize all renderers
        this.renderers = {
            tower: new TowerRenderer(this.renderSurface),
            enemy: new EnemyRenderer(this.renderSurface),
            projectile: new ProjectileRenderer(this.renderSurface),
            map: new MapRenderer(this.renderSurface),
            ui: new UIRenderer(this.renderSurface),
        };

        this.isInitialized = false;
    }

    // initialize game engine and all systems
    async initialize() {
        try {
            //set up canvas
            resizeCanvas(this.canvas);

            //initialize game sate
            this.gameState.initialize();

            //initialize all managers in order
            await this.managers.money.initialize();
            await this.managers.tower.initialize();
            await this.managers.enemy.initialize();
            await this.managers.projectile.initialize();
            await this.managers.wave.initialize();
            await this.managers.ui.initialize();

            //initialize all renederers
            await this.renderers.map.initialize();
            await this.renderers.tower.initialize();
            await this.renderers.enemy.initialize();
            await this.renderers.projectile.initialize();
            await this.renderers.ui.initialize();

            //setup event listners
            setupEventListeners(this);

            this.isInitialized = true;
            console.log('GameEngine initialized successfully');
        } catch (error) {
            console.error(' Failed to initialize GameEngine', error);
            throw error;
        }
    }

    // start the game loop
    start() {
        if (!this.isInitialized) {
            console.error('GameEngine not initialized, call initialize() first.');
            return;
        }
        this.gameState.setGameRunning(true);
        this.gameLoop.start();
        console.log( 'Game started')
    }

    //stop game
    stop() {
        this.gameState.setGameRunning(false);
        this.gameLoop.stop();
        console.log( 'Game stopped')
    }

   /**
   * Update game logic (called by GameLoop)
   * @param {number} deltaTime - Time since last frame in seconds
   */

   update(deltaTime) {
    if (!this.gameState.getIsGameRunning()) return;
    if(this.gameState.isGamePaused()) return;

    try {
        // Update systems in dependency order
      this.managers.wave.update(deltaTime);
      this.managers.enemy.update(deltaTime);
      this.managers.tower.update(deltaTime);
      this.managers.projectile.update(deltaTime);
      
      // Check collisions between projectiles and enemies
      this.checkProjectileEnemyCollisions();
      
      // Check if enemies reached the end
      this.checkEnemiesReachedEnd();
      
      // Check win/lose conditions
      this.checkGameConditions();
      
    } catch (error) {
      console.error('❌ Error during game update:', error);
      this.handleError(error);
    }
   }

    /**
   * Render the game (called by GameLoop)
   */
  render() {
    try {
      // Clear canvas
      this.ctx.fillStyle = '#222';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Render in order (background to foreground)
      this.renderers.map.render(this.gameState);
      this.renderers.tower.render(this.managers.tower.getTowers(), this.gameState);
      this.renderers.enemy.render(this.managers.enemy.getEnemies(), this.gameState);
      this.renderers.projectile.render(this.managers.projectile.getProjectiles(), this.gameState);
      this.renderers.ui.render(this.gameState, this.managers);
      
    } catch (error) {
      console.error('❌ Error during render:', error);
    }
  }

  /**
   * Check for collisions between projectiles and enemies
   */
  checkProjectileEnemyCollisions() {
    const projectiles = this.managers.projectile.getProjectiles();
    const enemies = this.managers.enemy.getEnemies();
    
    projectiles.forEach(projectile => {
      enemies.forEach(enemy => {
        if (this.checkCollision(projectile, enemy)) {
          enemy.takeDamage(projectile.damage);
          projectile.hit();
          
          if (enemy.isDead()) {
            this.managers.enemy.removeEnemy(enemy);
            this.managers.money.addMoney(enemy.bounty);
          }
        }
      });
    });
  }

  /**
   * Check if enemies reached the end of the path
   */
  checkEnemiesReachedEnd() {
    const enemies = this.managers.enemy.getEnemies();
    
    enemies.forEach(enemy => {
      if (enemy.hasReachedEnd()) {
        this.gameState.decreaseLives(1);
        this.managers.enemy.removeEnemy(enemy);
      }
    });
  }

  /**
   * Check win/lose conditions
   */
  checkGameConditions() {
    const lives = this.gameState.getLives();
    const waves = this.managers.wave;
    const enemies = this.managers.enemy.getEnemies();
    
    // Check lose condition
    if (lives <= 0) {
      this.gameState.setGameOver(true);
      this.stop();
      console.log('💀 Game Over! You lost.');
      return;
    }
    
    // Check win condition
    if (waves.isAllWavesComplete() && enemies.length === 0) {
      this.gameState.setGameWon(true);
      this.stop();
      console.log('🎉 You won!');
    }
  }

  /**
   * Simple AABB collision detection
   */
  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  /**
   * Handle window resize
   */
  handleResize() {
    resizeCanvas(this.canvas);
    // Notify systems that canvas was resized
    this.renderers.map.onCanvasResize(this.canvas);
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    const isPaused = this.gameState.isGamePaused();
    this.gameState.setGamePaused(!isPaused);
    console.log(isPaused ? '▶️ Game resumed' : '⏸️ Game paused');
  }

  /**
   * Handle errors gracefully
   */
  handleError(error) {
    console.error('Game error:', error);
    // Could trigger error UI here
    this.gameState.setGameError(true);
  }

  /**
   * Reset the game to initial state
   */
  reset() {
    this.gameState.reset();
    this.managers.tower.clear();
    this.managers.enemy.clear();
    this.managers.projectile.clear();
    this.managers.wave.reset();
    this.managers.money.reset();
    console.log('🔄 Game reset');
  }

  /**
   * Getter methods for external access
   */
  getGameState() {
    return this.gameState;
  }

  getManager(managerName) {
    return this.managers[managerName];
  }

  getRenderer(rendererName) {
    return this.renderers[rendererName];
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.ctx;
  }
}

export default GameEngine;
