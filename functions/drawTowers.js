import { towers, isTowerSelected } from './manageTower.js';

export default function drawTowers(ctx) {
        for (const tower of towers) {
            const isSelected = isTowerSelected(tower);
            tower.draw(ctx, isSelected);
        }
}
