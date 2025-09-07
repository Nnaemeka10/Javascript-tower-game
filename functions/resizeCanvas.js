import { canvas, COLS, ROWS } from '../utils/constants.js';

let TILE_SIZE;

export function resizeCanvas() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspectRatio = COLS / ROWS;

    let targetWidth, targetHeight;

    if (screenWidth < 768) {
        // For small screens, use full width and adjust height
        targetWidth = screenWidth;
        targetHeight = screenHeight * 0.8; //use 80% of height

    } else {
        targetWidth = screenWidth * 0.7; //use 70% of width
        targetHeight = screenHeight;
    }

    //fit into available space while maintaining aspect ratio
    if (targetWidth / targetHeight > aspectRatio) {
        //too wide for the height, limit by height
        canvas.height = targetHeight;
        canvas.width = targetHeight * aspectRatio;
    } else {
        //too tall for the width, limit by width
        canvas.width = targetWidth;
        canvas.height = targetWidth / aspectRatio;
    }

    //pick tile size from available width
    let tileWidth = Math.floor(canvas.width / COLS);
    let tileHeight = Math.floor(canvas.height / ROWS);
    
    //use the smaller of the two to ensure fit 
    TILE_SIZE = Math.min(tileWidth, tileHeight);

    //resize canvas to match exact tile size
    canvas.width = TILE_SIZE * COLS;
    canvas.height = TILE_SIZE * ROWS;

    // //snap dimensions to multiples of COLS and ROWS
    // canvas.width = Math.floor(canvas.width / COLS) * COLS;
    // canvas.height = Math.floor(canvas.height / ROWS) * ROWS;

    // //calculate tile size based on new canvas size
    // TILE_SIZE = canvas.width / COLS;

    //center the canvas with css
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

}

export function initCanvasResizer() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

}

export function getTileSize() {
    return TILE_SIZE;
}
