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

    setCurrentWave (){}

    getCurrentWave (){}

    setTotalWaves() {}

    getTotalWaves() {}

    startWave () {}

    completeWave () {}

    hasWaveStarted(){}

    isWaveCompleted(){}

    // ==================
    // UI STATE METHODS
    // ==================
    selectedTowerType(){}

    getSelectedTowerType (){}

    deselectTowerType(){}

    setTowerDragging(){}

    isTowerDragging(){}

    setDraggedTowerPosition(){}

    getDraggedTowerPosition () {}

    setHoveredGridCell(){}

    getHoveredGridCell(){}

    clearHoveredGridCell(){}

    // ============================
    //  CANVAS PERFORMANCE METHODS
    // =============================

    setCanvasDimensions
    getCanvasDimensions
    setFPS
    getFPS
    setDeltaTime
    getDeltaTime

    // ===================
    // STATISTICS METHODS
    // ===================
    incrementEnemiesKilled(){}
    incrementTowersPlaced
    getStatistics
    updateHighScore
    getHighScore
    saveHighSCore
    loadHighScore


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

   getSnapShot(){}

}

export default GameState;

//questioss
// concepyt of returning a function
//concept of functions and variables have the same name
// why did spendmoney() return a value and decreaselives() does not


