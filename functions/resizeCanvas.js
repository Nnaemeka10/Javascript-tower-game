
import { COLS, ROWS } from '../utils/constants.js';

// ----------------------
// Module state
// ----------------------
let ctx = null;
let currentTileSize = null;
let resizeListenerAttached = false;
let canvas = null;
let debouncedResizeHandler = null;

// Debug flag
const DEBUG = false;

// ----------------------
// Debounce utility
// ----------------------
function debounce(fn, delay = 100) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ----------------------
// Canvas getter with validation
// ----------------------
function getCanvas() {
    if (!canvas) {
        // Try to get canvas from DOM
        canvas = document.getElementById('game-canvas') || document.querySelector('canvas');
        
        if (!canvas) {
            throw new Error('Canvas element not found. Make sure canvas exists in DOM.');
        }
    }
    return canvas;
}

// ----------------------
// Internal resize function
// ----------------------
function _resizeCanvas() {
    try {
        // Get canvas safely
        const canvasElement = getCanvas();
        
        // Sanity checks
        if (!Number.isInteger(COLS) || COLS <= 0) {
            throw new Error('COLS must be a positive integer.');
        }
        if (!Number.isInteger(ROWS) || ROWS <= 0) {
            throw new Error('ROWS must be a positive integer.');
        }

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = COLS / ROWS;
        const dpr = window.devicePixelRatio || 1;

        let newWidth, newHeight;

        // Responsive sizing
        if (screenWidth < 768) {
            newWidth = screenWidth * 0.95; // Leave some margin on mobile
            newHeight = newWidth / aspectRatio;
            if (newHeight > screenHeight * 0.8) { // More conservative on mobile
                newHeight = screenHeight * 0.8;
                newWidth = newHeight * aspectRatio;
            }
        } else {
            newWidth = screenWidth * 0.7;
            newHeight = newWidth / aspectRatio;
            if (newHeight > screenHeight * 0.9) { // More conservative
                newHeight = screenHeight * 0.9;
                newWidth = newHeight * aspectRatio;
            }
        }

        // Calculate tile size (minimum 1px)
        currentTileSize = Math.max(1, Math.floor(Math.min(newWidth / COLS, newHeight / ROWS)));
        
        // Calculate actual canvas dimensions
        const actualWidth = currentTileSize * COLS;
        const actualHeight = currentTileSize * ROWS;

        // Set canvas internal resolution (DPR aware for crisp rendering)
        canvasElement.width = actualWidth * dpr;
        canvasElement.height = actualHeight * dpr;

        // Set CSS size (what user sees)
        canvasElement.style.width = `${actualWidth}px`;
        canvasElement.style.height = `${actualHeight}px`;

        // Initialize ctx once
        if (!ctx) {
            ctx = canvasElement.getContext('2d');
            if (!ctx) {
                throw new Error('Failed to get 2D canvas context.');
            }
        }

        // Scale context for high-DPI rendering but keep logical coordinates
        ctx.scale(dpr, dpr);
        
        // Set image rendering for pixel art (if needed)
        ctx.imageSmoothingEnabled = false;

        // Center canvas
        canvasElement.style.display = 'block';
        canvasElement.style.margin = '0 auto';

        if (DEBUG) {
            console.log('📐 Screen:', screenWidth, 'x', screenHeight);
            console.log('🎨 Canvas (internal):', canvasElement.width, 'x', canvasElement.height);
            console.log('🎨 Canvas (CSS):', actualWidth, 'x', actualHeight);
            console.log('🟦 TILE_SIZE:', currentTileSize);
            console.log('🖋 DPR:', dpr);
            console.log('📏 Grid:', COLS, 'x', ROWS);
        }

        // Dispatch custom event for other modules to listen to
        window.dispatchEvent(new CustomEvent('canvasResized', {
            detail: {
                tileSize: currentTileSize,
                canvasWidth: actualWidth,
                canvasHeight: actualHeight,
                ctx: ctx
            }
        }));

    } catch (error) {
        console.error('Error resizing canvas:', error);
        throw error; // Re-throw for proper error handling
    }
}

// ----------------------
// Public API
// ----------------------
export function initCanvasResizer({ 
    debounceDelay = 100, 
    attachListener = true,
    canvasId = 'gameCanvas' 
} = {}) {
    try {
        // Try to get canvas with specific ID if provided
        if (canvasId) {
            canvas = document.getElementById(canvasId);
        }
        
        // Immediate initial resize
        _resizeCanvas();

        // Attach debounced resize listener only once
        if (attachListener && !resizeListenerAttached) {
            debouncedResizeHandler = debounce(_resizeCanvas, debounceDelay);
            window.addEventListener('resize', debouncedResizeHandler);
            resizeListenerAttached = true;
        }

        return ctx;
    } catch (error) {
        console.error('Failed to initialize canvas resizer:', error);
        return null;
    }
}

// Manually trigger resize
export function resizeCanvas() {
    try {
        _resizeCanvas();
    } catch (error) {
        console.error('Manual resize failed:', error);
    }
}

// Safe getters with fallbacks
export function getCtx() {
    if (!ctx) {
        console.warn('Canvas context not initialized. Attempting to initialize...');
        return initCanvasResizer();
    }
    return ctx;
}

export function getTileSize() {
    if (currentTileSize === null) {
        console.warn('Tile size not initialized. Attempting to initialize...');
        initCanvasResizer();
    }
    return currentTileSize || 32; // Fallback tile size
}

// Cleanup function
export function cleanup() {
    if (debouncedResizeHandler && resizeListenerAttached) {
        window.removeEventListener('resize', debouncedResizeHandler);
        resizeListenerAttached = false;
        debouncedResizeHandler = null;
    }
    
    ctx = null;
    currentTileSize = null;
    canvas = null;
}

// Get current canvas dimensions
export function getCanvasDimensions() {
    const canvasElement = getCanvas();
    return {
        width: canvasElement.width,
        height: canvasElement.height,
        cssWidth: parseInt(canvasElement.style.width),
        cssHeight: parseInt(canvasElement.style.height),
        tileSize: currentTileSize
    };
}