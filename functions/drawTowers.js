import { towers } from './manageTower.js';

export default function drawTowers(ctx) {
        for (const tower of towers) {
        
            tower.draw(ctx);
        }
}
