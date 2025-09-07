import { canvas, COLS, ROWS } from '../utils/constants.js';

let TILE_SIZE;

const DEBUG = true;

export function resizeCanvas() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspectRatio = COLS / ROWS;

    let newWidth, newHeight;

    if (screenWidth < 768) {
        // For small screens, use full width and adjust height
        newWidth = screenWidth;
        newHeight = newWidth / aspectRatio; //use 80% of height

        // Ensure the height does not exceed screen height
        if (newHeight > screenHeight) {
            newHeight = screenHeight;
            newWidth = newHeight * aspectRatio;
        }

    } else {

        // For larger screens, use 70% of width and full height
        newWidth = screenWidth * 0.7; //use 70% of width
        newHeight = newWidth / aspectRatio;

        // Ensure the height does not exceed screen height
        if (newHeight > screenHeight) {
            newHeight = screenHeight;
            newWidth = newHeight * aspectRatio;
        }
    }

   // calculate the tile size based on the new dimensions and as integer pixel perfect
    TILE_SIZE = Math.floor(
        Math.min(newWidth / COLS, newHeight / ROWS
    ));

    //set canvas to exact tile multiples
    canvas.width = TILE_SIZE * COLS;
    canvas.height = TILE_SIZE * ROWS;
    

    //center the canvas with css
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

    if (DEBUG) {
       console.log('📐 Screen:', screenWidth, 'x', screenHeight);
        console.log('🎨 Canvas:', canvas.width, 'x', canvas.height);
        console.log('🟦 TILE_SIZE:', TILE_SIZE);
    }

}

export function initCanvasResizer() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

}

export function getTileSize() {
    return TILE_SIZE;
}
