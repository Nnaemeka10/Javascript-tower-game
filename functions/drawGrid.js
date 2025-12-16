import { COLS, ROWS} from '../src/utils/constants.js';
import { getTileSize } from './resizeCanvas.js';
import { getCanvasDimensions } from './resizeCanvas.js';

export default function drawGrid(ctx) {
   const canvas = getCanvasDimensions();
   const TILE_SIZE = getTileSize();
    ctx.strokeStyle = '#444';

    //Draw vertical lines
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0); // Start at the top of the column
        ctx.lineTo(x * TILE_SIZE, canvas.height); // End at the bottom of the column
         ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(canvas.width, y * TILE_SIZE);
        ctx.stroke();
    }
}