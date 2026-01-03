/**
 * GameLoop
 * Manages the main game loop using requestAnimationFrame.
 * Handles frame timing, delta time calculation, and FPS tracking.
 */
class GameLoop {
    constructor (updateCallback, renderCallback){
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;

        //timing
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;

        //configs
        this.targetFPS = 60;
        this.targetFrameTime = 1000 / this.targetFPS; //16.67ms fr 60 fps
        this.maxDeltaTime = 0.1; //cap delta time to prevent spiral of death

        //loop state
        this.isRunning = false;
        this.isPaused = false;
        this.animationFrameId = null;

        //performance monitoring
        this.frameTimings = [];
        this.maxFrameTimings = 60; //track last 60 frames
        
        //bind methods to prevent 'this' context
        this.loop = this.loop.bind(this); 
    }

    /**
     * Start game loop
     */
    start(){
        if(this.isRunning) {
            console.warn('Gameloop is already running');
            return;
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateTime = this.lastFrameTime;

        console.log(' Gameloop started')
        this.loop();
    }

    /**
     * Stop game loop
     */
    stop(){
        if(!this.isRunning) {
            console.warn('GameLoop is not running');
            return;
        }

        this.isRunning = false;

        if(this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        console.log('Game loop stopped');
    }

    /**
     * Main game loop - called everyframe
     * @param {number} currentTime - Time stamp from requrstanimationframe
     */
    loop(currentTime){
        if(!this.isRunning) return;

        try {
            //Calculate delta time
            this.deltaTime = (currentTime - this.lastFrameTime) /1000; //convert to seconds

            //cap delta tie to prevent spiral of death e.g if tab loses focus for a while
            if (this.deltaTime > this.maxDeltaTime) {
                this.deltaTime = this.maxDeltaTime;
            }

            this.lastFrameTime = currentTime;

            //update FPS counter
            this.updateFPS(currentTime);

            //record frame timing for performance monitoring
            this.recordFrameTiming(this.deltaTime);

            //call update callback with delta time
            if(this.updateCallback) {
                this.updateCallback(this.deltaTime);
            } 

            //call render callback
            if (this.renderCallback) {
                this.renderCallback();
            }

            this.frameCount++;
        } catch (error) {
            console.error('Error in game loop: ', error);
            //continue to llop even if there is an error
        }

        //request next frame
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    /**
     * Update FPS counter ( updates every second)
     * @param {number} currentTime - current time stamp
     */
    updateFPS(currentTime){
        const timesSinceLastUpdate = currentTime - this.fpsUpdateTime;

        if(timesSinceLastUpdate >= 1000 ) {
            //update every 1000ms
            this.fps = Math.round(this.frameCount * (1000 / timesSinceLastUpdate));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;

            //log FPS if it significatly  different from target
            if(Math.abs(this.fps - this.targetFPS) > 5) {
                console.log(`FPS: ${this.fps} (Target: ${this.targetFPS})`);
            }
        }
    }

    /**
     * record frame timing for performance analysis
     * @param {number} frameTime - Frame time in seconds
     */
    recordFrameTiming(frameTime){
        const frameTimeMS = frameTime * 1000;
        this.frameTimings.push(frameTimeMS);

        if( this.frameTimings.length > this.maxFrameTimings) {
            this.frameTimings.shift();
        }
    }

    /**
     * Get Average frame time in milliseconds
     * @returns {number} - Average frame time
     */
    getAverageFraneTime(){
        if (this.frameTimings.length === 0) return 0;

        const sum = this.frameTimings.reduce((a, b) => a + b, 0);

        return sum / this.frameTimings.length;
    }

    /**
     * get the mac frame time in milliseconds (useful for detecting spikes) 
     * @returns {number} - Max frame time
    */
   getMaxFrameTime(){
    return Math.max(...this.frameTimings);
   }

   
    /**
     * get the min frame time in milliseconds  
     * @returns {number} - Min frame time
    */
   getMinFrameTime(){
    return Math.min(...this.frameTimings);
   }

    /**
     * Pause the loop (doesn't stop RAF, just skips update/render)
     */
    pause() {
        this.isPaused = true;
        console.log('⏸️ GameLoop paused');
    }

    /**
     * Resume the loop
     */
    resume() {
        this.isPaused = false;
        console.log('▶️ GameLoop resumed');
    }

    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    getFPS() {
        return this.fps;
    }

   /**
   * Get current delta time
   * @returns {number} Delta time in seconds
   */
    getDeltaTime() {
        return this.deltaTime;
    }


   /**
    * Get performance report
    * @returns {Object} - performance metrics
    */
   getPerformanceReport(){
    return {
        fps: this.fps,
        averageFrameTime: this.getAverageFraneTime().toFixed(2),
        maxFrameTime: this.getMaxFrameTime().toFixed(2),
        minFrameTime: this.getMinFrameTime().toFixed(2),
        frameCount: this.frameCount,
        isRunning: this.isRunning,
        isPaused: this.isPaused,
    };
   }

   /**
    *  Set target FPS
    *  @param {number} fps - Target frames per seconds
    */ 
   setTargetFPS(fps){
    this.targetFPS = fps;
    this.targetFrameTime = 1000 / fps;
    console.log(`Target FPS set to: ${fps}`);
   }

   /**
   * Get whether the loop is running
   * @returns {boolean} True if running
   */
  getIsRunning() {
    return this.isRunning;
  }

  /**
   * Get whether the loop is paused
   * @returns {boolean} True if paused
   */
  getIsPaused() {
    return this.isPaused;
  }

}

export default GameLoop