/**
 * RenderSurface
 * Abstract base class for platform-agnostic rendering.
 * Defines the contract that all renderers must implement.
 * 
 * Supports multiple platforms:
 * - Web (Canvas) via CanvasSurface
 * - React Native (Skia) via SkiaSurface
 * - WebGL via WebGLSurface
 * - Headless (testing) via HeadlessSurface
 * 
 * No DOM, Canvas, or platform-specific code lives here.
 * This is pure interface/contract.
 */

class RenderSurface {
    constructor() {
        //prevent direct instantiation
        if(new.target === RenderSurface) {
            throw new Error('Render Surface is abstract, us ea concrete implementation, skia, websurface, etc')
        }
    }


    // ======================
    // CORE RENDERING SURFACE
    // ======================

    /**
     * Clear the entire surface
     * @param {string} color - Color to clear with( hex, rgb, rgba)
     * @example
     * surface.clear('#222222');
     * surface.clear('rgba(0, 0, 0, 0.8'); 
     */
    clear(color = '#222') {
        throw new Error('na subclass go implement clear(), no direct calling')
    }

    /**
   * Draw a filled rectangle
   * @param {number} x - X coordinate (world space)
   * @param {number} y - Y coordinate (world space)
   * @param {number} width - Rectangle width in pixels
   * @param {number} height - Rectangle height in pixels
   * @param {string} color - Fill color (hex or rgba)
   * @param {Object} options - Optional drawing parameters
   * @param {boolean} options.stroke - Draw outline?
   * @param {string} options.strokeColor - Outline color
   * @param {number} options.strokeWidth - Outline width
   * @param {number} options.opacity - Alpha value (0-1)
   * @example
   * surface.drawRect(10, 10, 100, 50, '#ff0000');
   * surface.drawRect(10, 10, 100, 50, '#ff0000', { stroke: true, strokeColor: '#000' });
   */
  drawRect(x, y, width, height, color, options = {}){
    throw new Error('drawRect() must be implemented by subclass')
  }

  /**
   * Draw a filled circle
   * @param {number} x - Center X coordinate
   * @param {number} y - Center Y coordinate
   * @param {number} radius - Circle radius in pixels
   * @param {string} color - Fill color
   * @param {Object} options - Optional parameters
   * @param {boolean} options.stroke - Draw outline?
   * @param {string} options.strokeColor - Outline color
   * @param {number} options.strokeWidth - Outline width
   */
  drawCircle(x, y, radius, color, options = {}){
    throw new Error('drawCircle () must be implemented by subclass')
  }

  /**
   * Draw an image or sprite
   * @param {Image|CanvasImageSource|Object} image - Image to draw
   * @param {number} x - X position (world space)
   * @param {number} y - Y position (world space)
   * @param {number} width - Display width
   * @param {number} height - Display height
   * @param {Object} options - Optional drawing parameters
   * @param {number} options.rotation - Rotation in radians
   * @param {number} options.opacity - Alpha value (0-1)
   * @param {string} options.align - 'left' | 'center' (default: 'left')
   * @param {string} options.verticalAlign - 'top' | 'center' (default: 'top')
   * @example
   * surface.drawImage(enemyImage, 100, 100, 32, 32, { rotation: Math.PI / 4 });
   */
  drawImage(image, x, y, width, height, options = {}) {
    throw new Error('drawImage() must be implemented by subclass');
  }

  /**
   * Draw text
   * @param {string} text - Text content to render
   * @param {number} x - X position (world space)
   * @param {number} y - Y position (world space)
   * @param {Object} style - Text styling
   * @param {string} style.font - Font string (e.g. "16px Arial")
   * @param {string} style.color - Text color
   * @param {string} style.align - 'left' | 'center' | 'right' (default: 'left')
   * @param {string} style.baseline - 'top' | 'middle' | 'bottom' (default: 'top')
   * @param {number} style.opacity - Alpha value (0-1)
   * @example
   * surface.drawText('Wave 1', 50, 50, { font: '24px bold Arial', color: '#fff' });
   */
  drawText(text, x, y, style = {}) {
    throw new Error('drawText() must be implemented by subclass');
  }

  /**
   * Draw a line
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @param {string} color - Line color
   * @param {number} width - Line width in pixels
   * @param {Object} options - Optional parameters
   * @param {string} options.lineCap - 'butt' | 'round' | 'square'
   * @param {string} options.lineJoin - 'bevel' | 'round' | 'miter'
   */
  drawLine(x1, y1, x2, y2, color, width = 1, options = {}) {
    throw new Error('drawLine() must be implemented by subclass');
  }

  /**
   * Draw a polygon (connected points)
   * @param {Array<{x, y}>} points - Array of points
   * @param {string} color - Fill color
   * @param {Object} options - Optional parameters
   * @param {boolean} options.stroke - Draw outline?
   * @param {string} options.strokeColor - Outline color
   */
  drawPolygon(points, color, options = {}) {
    throw new Error('drawPolygon() must be implemented by subclass');
  }




  // ============================================
  // TRANSFORMATION & STATE METHODS
  // ============================================

  /**
   * Save the current drawing state (stack-based)
   * Used before transformations to preserve state
   * Must be paired with restore()
   * @example
   * surface.save();
   * surface.translate(50, 50);
   * surface.drawRect(0, 0, 20, 20, '#f00');
   * surface.restore();
   */
  save() {
    throw new Error('save() must be implemented by subclass');
  }

  /**
   * Restore the previous drawing state
   * Reverses effects of save()
   */
  restore() {
    throw new Error('restore() must be implemented by subclass');
  }

  /**
   * Translate the coordinate system
   * @param {number} x - X offset
   * @param {number} y - Y offset
   */
  translate(x, y) {
    throw new Error('translate() must be implemented by subclass');
  }

  /**
   * Rotate the coordinate system
   * @param {number} angle - Rotation angle in radians
   * @param {number} originX - Rotation origin X (optional)
   * @param {number} originY - Rotation origin Y (optional)
   */
  rotate(angle, originX, originY) {
    throw new Error('rotate() must be implemented by subclass');
  }

  /**
   * Scale the coordinate system
   * @param {number} scaleX - X scale factor
   * @param {number} scaleY - Y scale factor (defaults to scaleX)
   */
  scale(scaleX, scaleY = scaleX) {
    throw new Error('scale() must be implemented by subclass');
  }

  /**
   * Set global opacity/alpha
   * Affects all subsequent drawing operations
   * @param {number} alpha - Alpha value (0-1)
   */
  setAlpha(alpha) {
    throw new Error('setAlpha() must be implemented by subclass');
  }

  /**
   * Get current global alpha
   * @returns {number} Current alpha value (0-1)
   */
  getAlpha() {
    throw new Error('getAlpha() must be implemented by subclass');
  }

  /**
   * Enable/disable image smoothing
   * @param {boolean} smooth - Enable smoothing?
   */
  setSmoothing(smooth) {
    throw new Error('setSmoothing() must be implemented by subclass');
  }




  // ============================================
  // DIMENSION & COORDINATE SYSTEM
  // ============================================

  /**
   * Get surface dimensions
   * @returns {Object} {width, height} in CSS pixels
   */
  getDimensions() {
    throw new Error('getDimensions() must be implemented by subclass');
  }

  /**
   * Resize the surface
   * @param {number} width - New width in pixels
   * @param {number} height - New height in pixels
   */
  resize(width, height) {
    throw new Error('resize() must be implemented by subclass');
  }

  /**
   * Get device pixel ratio
   * Handles high-DPI displays (retina, 4K, mobile)
   * @returns {number} DPR (1 on desktop, 2+ on high-DPI)
   * @example
   * const dpr = surface.getDevicePixelRatio();
   * // On retina: 2
   * // On desktop: 1
   */
  getDevicePixelRatio() {
    throw new Error('getDevicePixelRatio() must be implemented by subclass');
  }

  /**
   * Convert screen coordinates to world coordinates
   * Accounts for camera position, viewport, scaling,(zoom)
   * @param {number} screenX - Screen X pixel
   * @param {number} screenY - Screen Y pixel
   * @returns {Object} {x, y} in world space
   * @example
   * const mousePos = surface.screenToWorld(event.clientX, event.clientY);
   */
  screenToWorld(screenX, screenY) {
    // Default implementation (no camera/transform)
    return { x: screenX, y: screenY };
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - World X
   * @param {number} worldY - World Y
   * @returns {Object} {x, y} in screen space
   */
  worldToScreen(worldX, worldY) {
    // Default implementation (no camera/transform)
    return { x: worldX, y: worldY };
  }

  /**
   * Set camera position (for viewport-based rendering)
   * Optional - only implement if you support camera systems
   * @param {number} x - Camera center X
   * @param {number} y - Camera center Y
   * @param {number} zoom - Zoom level (default: 1)
   */
  setCamera(x, y, zoom = 1) {
    // implement in subclass
  }

  /**
   * Get camera position
   * @returns {Object} {x, y, zoom} or null if no camera
   */
  getCamera() {
    // implement in subclass 
    return null;
  }




  // ============================================
  // BOUNDS & COLLISION CHECKING
  // ============================================

  /**
   * Check if a point is within surface bounds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if within bounds
   */
  isPointInBounds(x, y) {
    const { width, height } = this.getDimensions();
    return x >= 0 && x < width && y >= 0 && y < height;
  }

   /**
   * Check if a rectangle intersects with surface bounds
   * @param {number} x - Rectangle X
   * @param {number} y - Rectangle Y
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @returns {boolean} True if intersects visible area
   */
  isRectInBounds(x, y, width, height) {
    const { width: surfaceWidth, height: surfaceHeight } = this.getDimensions();
    return !(
      x + width < 0 ||
      x > surfaceWidth ||
      y + height < 0 ||
      y > surfaceHeight
    );
  }

   /**
   * Check if a circle is visible
   * @param {number} x - Circle center X
   * @param {number} y - Circle center Y
   * @param {number} radius - Circle radius
   * @returns {boolean} True if visible
   */
  isCircleInBounds(x, y, radius){
    const { width, height} = this.getDimensions();
    return ! (
        x + radius < 0 ||
        x - radius > width ||
        y + radius < 0 ||
        y - radius > height
    );
  }



  // ============================================
  // DEBUGGING & INTROSPECTION
  // ============================================

  /**
   * Get complete snapshot of rendering state
   * Useful for debugging and performance monitoring
   * @returns {Object} State snapshot
   */
  getSnapshot() {
    return {
        dimensions: this.getDimensions(),
        devicePixelRatio: this.getDevicePixelRatio(),
        alpha: this.getAlpha(),
        camera: this.getCamera(),
        implementation: this.constructor.name,
    };
  }

  /**
   * Get performance metrics (if implemented)
   * @returns {Object|null} Performance data or null
   */
  getPerformanceMetrics() {
    // implement in subclass for detailed metrics
    return null;
  }

  /**
   * Get supported features for this surface
   * @returns {Object} Feature flags
   */
  getCapabilities() {
    return {
      supportsCamera: false,
      supportsShaders: false,
      supportsLayers: false,
      supportsFilters: false,
      maxTextureSize: null,
    };
  }
}

export default RenderSurface;