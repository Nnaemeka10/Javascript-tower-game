import { path } from '../maps/map1.js';
import { getTileSize } from './resizeCanvas.js';


export default function drawPath(ctx) {
    const TILE_SIZE = getTileSize();
    for (const tile of path) {
        ctx.fillStyle = 'red';
        ctx.fillRect(
            tile.x * TILE_SIZE,
            tile.y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        );
    }
}