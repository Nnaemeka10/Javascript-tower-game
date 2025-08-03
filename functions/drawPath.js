import { path } from '../maps/map1.js';
import { TILE_SIZE } from '../utils/constants.js';

export default function drawPath(ctx) {
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