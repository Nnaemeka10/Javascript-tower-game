/**
 * WebSurface (CanvasSurface)
 * Concrete implementation of RenderSurface for HTML5 Canvas 2D context.
 * 
 * This is the ONLY file where Canvas API code should exist.
 * All platform-specific rendering happens here.
 * 
 * Handles:
 * - High DPI displays (retina, 4K, mobile)
 * - Device pixel ratio scaling
 * - Coordinate system transformations
 * - Camera/viewport system
 * - Efficient canvas state management
 */

import RenderSurface from "./RenderSurface.js";

class WebSurface extends RenderSurface {
    /**
   * Create a new WebSurface for HTML5 Canvas
   * @param {HTMLCanvasElement} canvas - Canvas element to render to
   * @param {Object} options - Configuration options
   * @param {boolean} options.autoResize - Auto-resize to window size (default: true)
   * @param {boolean} options.useDevicePixelRatio - Scale for high-DPI displays (default: true)
   * @param {boolean} options.enableCamera - Support camera/viewport (default: true)
   */

    constructor(canvas, options = {}) {
        super();

        if(!canvas) {
            throw new Error('WebSUrface requires a canvas');
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: false});

        if(!this.ctx) {
            throw new Error('failed to get 2d context from canvas');
        }

        //configuration
        this.options  = {
            autoResize: options.autoResize ?? true,
            useDevicePixelRatio: options.useDevicePixelRatio ?? true,
            enableCamera: options.enableCamera ?? true,
            ...options,
        };

        // DDevice pixel ratio for high dpi displays
        this.devicePixelRatio = this.options.useDevicePixelRatio ? window.devicePixelRatio || 1 : 1;

        //canvas dimensions
        this.width = canvas.width;
        this.height = canvas.height;

        //rendering stats
        this.globalAlpha = 1;
        this.smoothing = true;
        this.transformStack = [];

        //camera system
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            enabled: this.options.enableCamera,
        };

        //performance tracking
        this.stats = {
            drawCalls: 0,
            textDrawn: 0,
            imagesDrawn: 0,
        };

        //initialize canvas
        this.initializeCanvas();

        //setup resize listner
        if (this.options.autoResize) {
            window.addEventListener('resize', () => this.handleWindowResize());
        }

        console.log( `Web surface initialized (DPR: ${this.devicePixelRatio}x)`);
    }


    /**
   * Initialize canvas with proper DPI handling
   */
  initializeCanvas() {
    // set CSS size
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    //set actual resolutions with device pixel ratio
    this.canvas.width = this.width * this.devicePixelRatio;
    this.canvas.height = this.height * this.devicePixelRatio;

    //scale context to match
    if(this.devicePixelRatio !== 1){
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio)
    }

    //set default context properties
    this.ctx.imageSmoothingEnabled = this.smoothing;
    this.ctx.globalAlpha = this.globalAlpha;
  }

  /**
   * Handle window resize
   */
  handleWindowResize() {
    const rect = this.canvas.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height

    if (newWidth !== this.width || newHeight !== this.height) {
        this.resize(newWidth, newHeight);
    }
  }

  

  //CORE RENDERING MEHODS

  clear(color = '#222') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.stats.drawCalls++;
  }

  drawRect(x, y, width, height, color, options = {}) {
    const { stroke = false, strokeColor = "#000", strokeWidth = 1, opacity = 1} = options;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity * this.globalAlpha;

    this.ctx.fillRect(x, y, width, height);

    if(stroke) {
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = strokeWidth
        this.ctx.strokeRect(x, y, width, height);
    }

    this.ctx.restore();
    this.stats.drawCalls++;
  }

  drawCircle(x, y, radius, color, options = {}) {
    const {stroke = false, strokeColor = '#000', strokeWidth = 1, opacity = 1} = options;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity * this.globalAlpha;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    if(stroke) {
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.stroke();
    }

    this.ctx.restore();
    this.stats.drawCalls++;
  }

  drawImage(image, x, y, width, height, options = {}){
    const { rotation = 0, opacity = 1, align = 'left', verticalAlign = 'top', } = options;

    this.ctx.save();
    this.ctx.globalAlpha = opacity * this.globalAlpha;

    //calculate offset for alignment
    let offsetX = 0;
    let offsetY = 0;

    if(align === 'center') offsetX = width / 2;
    if(verticalAlign === 'center') offsetY = height / 2;

    //apply transformations
    this.ctx.translate(x + offsetX, y + offsetY);

    if(rotation !== 0) {
        this.ctx.rotate(rotation);
    }

    //draw immage centered on origin (if aligned)
    this.ctx.drawImage(image, -offsetX, -offsetY, width, height);

    this.ctx.restore();
    this.stats.drawCalls++;
    this.stats.imagesDrawn++;
  }

  drawText(text, x, y, style = {}){
    const {font = '16px Arial', color = '#fff', align = 'left', baseline = 'top', opacity = 1} = style;

    this.ctx.save();
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.globalAlpha = opacity * this.globalAlpha;

    this.ctx.fillText(text, x, y);

    this.ctx.restore();
    this.stats.drawCalls++;
    this.stats.textDrawn++;
  }


  drawLine(x1, y1, x2, y2, color, width = 1, options = {}){
    const { lineCap = 'round', lineJoin = 'round', opacity = 1} = options;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = lineCap;
    this.ctx.lineJoin = lineJoin;
    this.ctx.globalAlpha = opacity * this.globalAlpha;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    this.ctx.restore();
    this.stats.drawCalls++;
  }


  drawPolygon(points, color, options = {}){
    const {stroke = false, strokeColor = '#000', opacity = 1} = options;

    if(!points || points.length < 3){
        console.warn('Polygon need at leat 3 points');
        return
    }

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity * this.globalAlpha;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i<points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.closePath();
    this.ctx.fill();

    if(stroke) {
        this.ctx.strokeStyle = strokeColor;
        this.ctx.stroke();
    }

    this.ctx.restore();
    this.stats.drawCalls++;
  }



  //TRANFORMATION AND STATE METHODS
  save(){
    this.ctx.save();
    this.transformStack.push({
        alpha: this.globalAlpha,
        smoothing: this.smoothing,
    });
  }

  restore(){
    this.ctx.restore();
    const state = this.transformStack.pop();
    
    if(state) {
        this.globalAlpha = state.alpha;
        this.smoothing = state.smoothing;
        this.ctx.imageSmoothingEnabled = this.smoothing;
        this.ctx.globalAlpha = this.globalAlpha;
    }
  }

  translate(x, y){
    this.ctx.translate(x, y);
  }

  rotate(angle, originX, originY){
    if(originX !== undefined && originY !== undefined) {
        this.ctx.translate(originX, originY);
        this.ctx.rotate(angle);
        this.ctx.translate(-originX, -originY);
    }else {
        this.ctx.rotate(angle);
    }
  }

  scale(scaleX, scaleY = scaleX){
    this.ctx.scale(scaleX, scaleY)
  }

  setAlpha(alpha){
    this.globalAlpha = Math.max(0, Math.min(1, alpha));
    this.ctx.globalAlpha = this.globalAlpha;
  }
  
  getAlpha(){
    return this.globalAlpha;
  }

  setSmoothing(smooth){
    this.smoothing = smooth;
    this.ctx.imageSmoothingEnabled = smooth;
  }


  //DIMENSION AND COORDINATE SYSTEM
  getDimensions(){
    return {
        width: this.width,
        height: this.height, 
    };
  }

  resize(width, height){
    this.width = width;
    this.height = height;

    //update canvas resolution
    this.canvas.width = width * this.devicePixelRatio;
    this.canvas.height = height * this.devicePixelRatio;

    //reapply DPI scaling
    if(this.devicePixelRatio !== 1) {
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }

    //restore contetx properties
    this.ctx.imageSmoothingEnabled = this.smoothing;
    this.ctx.globalAlpha = this.globalAlpha;

    console.log(`Canvas resized to ${width} x ${height}`)
  }

  getDevicePixelRatio(){
    return this.devicePixelRatio;
  }


  /**
   * Convert screen coordinates to world coordinates
   * Accounts for camera position and zoom
   */
  screenToWorld(screenX, screenY){
    //account for device pixel ratio
    const dprX = screenX / this.devicePixelRatio;
    const dprY = screenY / this.devicePixelRatio;

    if(!this.camera.enabled){
        return {x: dprX, y: dprY};
    }

    //apply inverse camera transformation
    const worldX = dprX / this.camera.zoom + this.camera.x - this.width
    const worldY = dprY / this.camera.zoom + this.camera.y - this.height

    return{ x: worldX, y: worldY};
  }


  /**
   * Convert world coordinates to screen coordinates
   * Accounts for camera position and zoom
   */
  worldToScreen(worldX, worldY){
    if(!this.camera.enabled) {
        return {
            x: worldX * this.devicePixelRatio,
            y: worldY * this.devicePixelRatio,
        };
    }

    //apply camera tranformation
    const screenX = ((worldX - this.camera.x) * this.camera.zoom + this.width/2) * this.devicePixelRatio;
    const screenY = ((worldY - this.camera.y) * this.camera.zoom + this.height/2) * this.devicePixelRatio;

    return {
        x: screenX,
        y: screenY
    };
  }

  /**
   * Set camera position and zoom
   */
  setCamera(x, y, zoom = 1){
    if (!this.camera.enabled){
        console.warn('Camera system is disabled');
        return;
    }

    this.camera.x = x;
    this.camera.y = y;
    this.camera.zoom = Math.max(0.1, zoom);
  }

  /**
   * Get camera state
   */
  getCamera(){
    return this.camera.enabled ? {...this.camera} : null;
  }

  /**
   * Apply camera transformation to canvas
   * Call this before rendering game objects
   */
  applyCameraTranform(){
    if(!this.camera.enabled) return;

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);
  }

  /**
   * Restore canvas after camera transform
   */
  restoreCameraTransform(){
    if(!this.camera.enabled) return;

    this.ctx.restore();
  }

  //BOUNDS AND COLLISONS CHECKING
  isPointInBounds(x, y){
    return x >= 0 && x < this.width && y >=0 && y < this.height;
  }

  isRectInBounds(x, y, width, height){
    return !(x + width < 0 || x > this.width || y + height < 0 || y > this.height);
  }

  isCircleInBounds(x, y, radius){
    return !(x + radius < 0 || x - radius > this.width || y + radius < 0 || y -radius > this.height);
  }

  //DEBUGGING AND INTROSPECTION
  getSnapshot(){
    return {
        ...super.getSnapshot(),
        devicePixelRatio: this.devicePixelRatio,
        drawCalls: this.stats.drawCalls,
        textDrawn: this.stats.textDrawn,
        imagesDrawn: this.stats.imagesDrawn,
    };
  }

  /**
   * Reset performance counters
   */
  resetStats(){
    this.stats.drawCalls = 0;
    this.stats.textDrawn = 0;
    this.stats.imagesDrawn = 0;
  }

  getPerformanceMetrics(){
    return {
        drawCalls: this.stats.drawCalls,
        textDrawn: this.stats.textDrawn,
        imagesDrawn: this.stats.imagesDrawn,
        fps: this.fps || 0,
    };
  }

  /**
   * Get performance metrics
   */
  getCapabilities(){
    return {
        supportsCamera: this.camera.enabled,
        supportsShaders: false,
        supportsLayers: false, //can be added with offscreen canvas
        supportsFilters: true,
        maxTextureSize: 16384, //typical limit
    };
  }

  /** 
   * Drae debug grid
   * For dev
   */
  drawDebugGrid(cellSize = 40, color = 'rgba(255, 255, 255, 0.1)'){
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    //vertical lines
    for (let x = 0; x < this.width; x += cellSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
        this.ctx.stroke();
    }

    //horizontal lines
    for (let y = 0; y < this.height; y += cellSize ) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();
    }
  }

  /**
   * drug debug info overlay
   */
  drawDebugInfo(){
    this.drawText(`Draw calls: ${this.stats.drawCalls}`, 10, 10, {font: '12px monospace', color: '#0f0',});

    this.drawText(`DPR: ${this.devicePixelRatio}x`, 10, 25, {font: '12px monospace', color: '#0f0',});

    this.drawText(`Size: ${this.width}x${this.height}`, 10, 40, {font: '12px monospace', color: '#0f0',});

    if (this.camera.enabled) {
        this.drawText(`Camera: (${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)}) ${this.camera.zoom.toFixed(2)}x`, 10, 55, {font: '12px monospace', color: '#0f0',});
    }
  }
}

export default WebSurface;


//when to use && and ?? and ? : to evaluate ex[pressions]
// why will origin x and y be undefined . in what scenerio would that be since i am passing the values staraight up in the function. doubt if id call the function without puting those argeuments. isnt that edundant. why didnt we check for the angle undefined then, if we are being overly cautious
