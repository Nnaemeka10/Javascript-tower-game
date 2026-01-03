// Game engine refactor. Central guy to handle all systems
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

   }
}