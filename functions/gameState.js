class GameState {
    constructor (){

        //Game status Flags
        this.isGameRunning = false;
        this.isGamePaused = false;
        this.isGameOver = false;
        this.isGameWon = false;
        this.hasError = false;

        //player Resources
        this.money = 500; //starting budget
        this.lives = 20; //.. lives
        this.score = 0;

        //Game Progress
        this.currentWave = 0;
        this.totalWaves = 0;
        this.waveStarted = false;
        this.waveCompleted = false;

        //game stats for tracking
        this.stats = {
            totalEnemiesKilled: 0,
            totalTowersPlaced: 0,
            totalMoneyEarned: 0,
            totalMoneySpent: 0,
            highScore: this.loadHighScore(),
        };

        // UI State
        this.selectedTowerType = null;
        this.isDraggingTower = false;
        this.draggedTowerPosition = {x:0, y:0};
        this.hoveredGridCell = null;

        //performance
        this.fps = 0;
        this.deltaTime = 0;

        //listeners for state changes (observer pattern)
        this.listeners = [];

    }

    // initialize game state with default values
    initialize() {
        this.reset();
        console.log('Game State initialized successfully');
    }

    //Reset game state to initial vakues
    reset() {
        this.isGameRunning = false;
        this.isGamePaused = false;
        this.isGameOver = false;
        this.isGameWon = false;
        this.hasError = false;

        //player Resources
        this.money = 500; 
        this.lives = 20; 
        this.score = 0;

        //Game Progress
        this.currentWave = 0;
        this.totalWaves = 0;
        this.waveStarted = false;
        this.waveCompleted = false

        //game stats
        this.stats.totalEnemiesKilled = 0;
        this.stats.totalTowersPlaced = 0;
        this.stats.totalMoneyEarned = 0;
        this.stats.totalMoneySpent = 0;
        
        // UI State
        this.selectedTowerType = null;
        this.isDraggingTower = false;
        this.draggedTowerPosition = {x:0, y:0};
        this.hoveredGridCell = null;

        this.notifyListeners('stateReset');

    }

    // ===================
    // GAME STATUS METHODS
    // ===================


    /**
     * Set game running state
     * @param {boolean} value - Is the game running
     * get game running state @returns {boolean} is the game running
     */
    setGameRunning(value) {
        if (this.isGameRunning !== value) {
            this.isGameRunning = value;
            this.notifyListeners('gameRunningChanged', value);
        }
    }
    isGameRunning () {
        return this.isGameRunning
    }




   /** 
    * set game paused state
    * @param {boolean} value - is game paused
    * get game running state @returns {boolean} is the game paused
    */
   setGamePaused (value) {
    if(this.isGamePaused !== value) {
        this.isGamePaused = value;
        this.notifyListeners('gamePausedChanged', value)
    }
   }
   isGamePaused () {
    return this.isGamePaused
   }





   /**
    *  set game over state
    * @param {boolean} value - is game over
    * get game over state
    * @returns {boolean } is the game over
    */
   setGameOver (value) {
    if(this.isGameOver !== value) {
        this.isGameOver = value;
        this.isGameRunning = false; //stop game
        this.notifyListeners('gameOverChanged', value)
    }
   }
   isGameOver() {
    return this.isGameOver
   }






   /**
    * set game won state
    * @param {boolean} value - is gme won
    * get game over state
    * @returns {boolean} is the game won
    */
   setGameWon (value) {
    if (this.isGameWon !== value) {
        this.isGameWon = value;
        this.isGameRunning = false; //stop when game won
        this.notifyListeners('gameWonChanged', value);

        if(value) {
            this.updateHighScore();
        }
    }
   }
   isGameWon() {
    return this.isGameWon;
   } 






   /**
    * set game error states
    * @param {boolean} value -is there an error
    * get game errror states
    * @returns {boolean} - is there an error
    */
   setGameError(value) {
    if(this.hasError !== value) {
        this.hasError = value;
        this.notifyListeners('gameErrorChanged', value);
    }
   }
   hasGameError() {
    return this.hasError;
   }



   // ============================
   // RESOURCE MANAGEMENT METHODS
   // ===========================

   /**
    * Add money to the player
    * @param {number} amount - money to be added
    * @returns {boolean} success
    */
   addMoney(amount){
    if(amount < 0) {
        console.warn('Cannot add negative money');
        return false;
    }
    this.money += amount;
    this.stats.totalMoneyEarned += amount;
    this.notifyListeners('moneyChanged', this.money);
    return true;
   }


   /**
    * Spend money
    * @param {number} amount - amount to be spent
    * @returns { boolean } success if player has enough money
    */
   spendMoney(amount){
    if(amount < 0) {
        console.warn('Cannot spend negative money');
        return false;
    }
    if(this.money < amount){
        console.warn( `Insufficient funds. Have: ${this.money}, Need: ${this.amount}`);
        return false;
    }
    this.money -= amount;
    this.stats.totalMoneySpent += amount;
    this.notifyListeners('moneyChanged', this.money);
    return true;
   }


   /**
    * Get current money
    * @returns {number} Current money
    */
   getMoney(){
    return this.money;
   }

   /**
    * check if player can afford something
    * @param {number} cost - cost of item
    * @returns {boolean} can afford
    */
   canAfford(cost){
    return this.money >= cost;
   }

   /**
    * decrease player lives
    * @param {number} amount - amount of lives to decrease 
    */
   decreaseLives(amount){
    if(amount < 0) {
        console.warn('Cannot decrease negative lives')
        return;
    }
    this.lives -= amount;
    this.notifyListeners('livesChanged', this.lives)

    if (this.lives <= 0) {
        this.setGameOver(true);
    }
   }


    /**
     * Increase player lives
     * @param {number} amount - Amount to increase
     */
    increaseLives(amount) {
        if (amount < 0) {
        console.warn('⚠️ Cannot increase negative lives');
        return;
        }
        this.lives += amount;
        this.notifyListeners('livesChanged', this.lives);
    }



    /**
     * Get current lives
     * @returns {number} Current lives
     */
    getLives() {
        return this.lives;
    }



    /**
     * Add to score
     * @param {number} points - Points to add
     */
    addScore(points) {
        if (points < 0) {
        console.warn('⚠️ Cannot add negative score');
        return;
        }
        this.score += points;
        this.notifyListeners('scoreChanged', this.score);
    }

    
    /**
     * Get current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }

    // ========================
    // WAVE MANAGEMENT METHODS
    // ========================

    /**
     * set current wave
     * @param {number} wave - Wave number
     */
    setCurrentWave (wave){
        if(this.currentWave !== wave){
            this.currentWave = wave;
            this.notifyListeners('waveChanged', wave);
        }
    }

    /**
     * get current wave
     * @returns {number} -current wave number
     */
    getCurrentWave (){
        return this.currentWave
    }


    /**
     * set total waves
     * @param {number} total - Total number of waves
     */
    setTotalWaves(total) {
        this.totalWaves = total;
    }


    /**
     * get total waves
     * @returns {number} - total waves 
     */
    getTotalWaves() {
        return this.totalWaves;
    }


    /**
     * Start a wave
     */
    startWave () {
        this.waveStarted = true;
        this.waveCompleted = false;
        this.notifyListeners('waveStarted', this.currentWave);
    }


    /**
     * complete a wave
     */
    completeWave () {
        this.waveCompleted = true;
        this.notifyListeners('waveCompleted', this.currentWave)
    }


    /**
     * get wave started state
     * @returns {boolean} - has the wave started
     */
    hasWaveStarted(){
        return this.waveStarted
    }

    /**
     * get wave completed state
     * @returns {boolean} - has the wave completed
     */
    isWaveCompleted(){
        return this.waveCompleted;
    }

    // ==================
    // UI STATE METHODS
    // ==================

    /**
     * Select a tower type
     * @param {string } towerType - Tower type to select
     * 
    */
    selectTowerType(towerType){
        if(this.selectedTowerType !== towerType) {
            this.selectedTowerType == towerType;
            this.notifyListeners('towerTypeSelected', towerType);
        }
    }

     /**
     * Deselect tower type
     */
    deselectTowerType() {
        this.selectedTowerType = null;
        this.notifyListeners('towerTypeDeselected');
    }

    /**
     * Get selected tower type
     * @returns {string|null} Selected tower type or null
     */
    getSelectedTowerType() {
        return this.selectedTowerType;
    }

   
    /**
     * set tower dragging state
     * @param {boolean} isDragging -is Dragging
     */
    setTowerDragging(isDragging){
        this.isDraggingTower = isDragging;
        this.notifyListeners('towerDragStateChanged', isDragging);
    }

    /**
     * Get tower dragging state
     * @returns {boolean} Is dragging tower
     */
    isTowerDragging() {
        return this.isDraggingTower;
    }


    /**
     * set draggged tower position
     * @param {number} x - Position on X axis
     * @param {number} y -Position on Y axis
     */
    setDraggedTowerPosition(x, y){
        this.draggedTowerPosition = {x, y};
        this.notifyListeners('draggedTowerPositionChanged', this.draggedTowerPosition);
    }

    
    /**
     * Get dragged tower position
     * @returns {Object} Position {x, y}
     */
    getDraggedTowerPosition() {
        return this.draggedTowerPosition;
    }

    /**
     * Set hovered grid cell
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     */
    setHoveredGridCell(gridX, gridY) {
        this.hoveredGridCell = { gridX, gridY };
        this.notifyListeners('gridCellHovered', this.hoveredGridCell);
    }

    /**
     * Clear hovered grid cell
     */
    clearHoveredGridCell() {
        this.hoveredGridCell = null;
    }

    /**
     * Get hovered grid cell
     * @returns {Object|null} Grid cell {gridX, gridY} or null
     */
    getHoveredGridCell() {
        return this.hoveredGridCell;
    }

    

    // ============================
    //  CANVAS PERFORMANCE METHODS
    // =============================

    /**
     * Set canvas dimensions
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    setCanvasDimensions(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.notifyListeners('canvasDimensionsChanged', { width, height });
    }

    /**
     * Get canvas dimensions
     * @returns {Object} Dimensions {width, height}
     */
    getCanvasDimensions() {
        return { width: this.canvasWidth, height: this.canvasHeight };
    }

    /**
     * Set FPS
     * @param {number} fps - Frames per second
     */
    setFPS(fps) {
        this.fps = fps;
        this.notifyListeners('fpsChanged', fps);
    }

    /**
     * Get FPS
     * @returns {number} Current FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Set delta time
     * @param {number} deltaTime - Delta time in seconds
     */
    setDeltaTime(deltaTime) {
        this.deltaTime = deltaTime;
    }

    /**
     * Get delta time
     * @returns {number} Delta time in seconds
     */
    getDeltaTime() {
        return this.deltaTime;
    }





    // ===================
    // STATISTICS METHODS
    // ===================

    /**
     * Increment enemies killed
     * @param {number} amount - Amount to increment
     */
    incrementEnemiesKilled(amount = 1) {
        this.stats.totalEnemiesKilled += amount;
        this.notifyListeners('statisticsChanged', this.stats);
    }

    /**
     * Increment towers placed
     * @param {number} amount - Amount to increment
     */
    incrementTowersPlaced(amount = 1) {
        this.stats.totalTowersPlaced += amount;
        this.notifyListeners('statisticsChanged', this.stats);
    }

    /**
     * Get all statistics
     * @returns {Object} - statistics object
     */
    getStatistics(){
        return { ...this.stats };
    }

    /**
     * Update high score if current score is higher
     */
    updateHighScore(){
        if(this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
            this.saveHighSCore(this.score)
        }
    }
    
    /**
     * get high score
     * @returns {number} -high score
     */
    getHighScore(){
        return this.stats.highScore;
    }

    /**
     * save high score to local storage
     * @param {number} score - Score to save
     */
    saveHighSCore(score){
        try {
            localStorage.setItem('towerDefenseHighScore', score.toString());
        } catch (error) {
            console.warn('Could no save high score to high Local storage: ', error);
        }
    }

    /**
     * Load high score from local storage
     * @returns {number} -saved high score or 0
     */
    loadHighScore(){
        try {
            const saved = localStorage.getItem('towerDefenseHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            onsole.warn('Could no load high score from high Local storage: ', error);
            return 0;
        }
    }


   // ========================
   // OBSERVER PATTERN METHODS
   // ========================

   /**
    * Subscribe to state changes
    * @param {Function} callback - Call back function
    * @returns {Function} Unsubscribe function
    * 
    */
   subscribe(callback) {
    this.listeners.push(callback);

    //return unsubscribe  function
    return () => {
        this.listeners = this.listeners.filter(listener => listener != callback)
    };
   }

   /**
    * Notify all listners of the state change
    * @param {string } eventType -tyoe of event
    * @param {*} data - Event data
    */
   notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
        try {
            callback(eventType, data);
        } catch {
            console.error("Error in state listner callback", error);
        }
    });
   }


   /**
    * get complete state snapshot
    * @returns {object} complete game state 
    */
   getSnapShot(){
    return {
        flags: {
            isGameRunning: this.isGameRunning,
            isGamePaused: this.isGamePaused,
            isGameOver: this.isGameOver,
            isGameWon: this.isGameWon,
            hasError: this.hasError,
        },
        resources: {
            money: this.money,
            lives: this.lives,
            score: this.score,
        },
        wave: {
            currentWave: this.currentWave,
            totalWaves: this.totalWaves,
            waveStarted: this.waveStarted,
            waveCompleted: this.waveCompleted,
        },
        ui: {
            selectedTowerType: this.selectedTowerType,
            isDraggingTower: this.isDraggingTower,
            draggedTowerPosition: this.draggedTowerPosition,
            hoveredGridCell: this.hoveredGridCell,
        },
        performance: {
            fps: this.fps,
            deltaTime: this.deltaTime,
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
        },
        stats: { ...this.stats },
    }
   }

}

export default GameState;

