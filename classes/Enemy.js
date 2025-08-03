import { path } from '../maps/map1.js';
import { TILE_SIZE } from '../utils/constants.js';

export default class Enemy {
    constructor() {
        this.currentTile = 0; // index in the path array
        this.progress = 0; // how far between the current tile and the next tile
        this.speed = 0.02; // speed of the enemy
        this.radius = TILE_SIZE /3; // radius of the enemy
        this.maxHealth = 100; // max health of the enemy
        this.currentHealth = 100; // current health of the enemy
    }

    // update method to move the enemy along the path
    updateEnemy() {
        if(this.currentTile >= path.length - 1) return; // Reached the end

        const current = path[this.currentTile];
        const next = path[this.currentTile +1];

        // interpolate position
        const x = current.x + (next.x - current.x) * this.progress;
        const y = current.y + (next.y - current.y) * this.progress;

        this.pixelX = x * TILE_SIZE + TILE_SIZE / 2; // Center the enemy in the tile
        this.pixelY = y * TILE_SIZE + TILE_SIZE / 2; 

        this.progress += this.speed;

        //Move to the next tile if done with the current one
        if (this.progress >= 1) {
            this.progress = 0;
            this.currentTile++;
        }
    }

    // draw method to render the enemy
    drawEnemy(ctx) {

        // enemy circle
        ctx.beginPath();
        ctx.fillStyle = 'purple';
        ctx.arc(this.pixelX, this.pixelY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // enemy health bar
        const barWidth = TILE_SIZE / 2;
        const barHeight = 5;
        const x = this.pixelX - barWidth / 2;
        const y = this.pixelY - this.radius - 10; 

        // Draw the health bar background and current health
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, barWidth, barHeight);

        //formatting the health bar
        const healthRatio = this.currentHealth / this.maxHealth;
        ctx.fillStyle = 'limegreen';
        ctx.fillRect(x, y, barWidth * healthRatio, barHeight);
    }

}