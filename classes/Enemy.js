import { path } from '../maps/map1.js';
import { TILE_SIZE } from '../utils/constants.js';

export default class Enemy {
    constructor(health = 100, speed = 0.02, color = 'purple') {
        this.currentTile = 0; // index in the path array
        this.progress = 0; // how far between the current tile and the next tile
        this.speed = speed; // speed of the enemy
        this.maxHealth = health; // max health of the enemy
        this.currentHealth = health; // current health of the enemy
        this.color = color
        this.hitFlash = 0; // frames remaining for the hit flash effect
        this.xpCost = speed * health;
        
        const baseRadius = TILE_SIZE /3;
        const healthMultiplier = Math.sqrt(health / 100);
        this.radius = baseRadius * healthMultiplier;
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

        // Handle hit flash effect
        if (this.hitFlash > 0) {
            this.hitFlash--; // Decrease the hit flash timer
        }
    }

    // draw method to render the enemy
    drawEnemy(ctx) {

        //determine enemy color(flash white when hit)
        let enemyColor = this.color;
        if (this.hitFlash > 0) {
            enemyColor = this.hitFlash % 2 === 0 ? 'white' : this.color; // Flash white when hit
        }
        // enemy circle
        ctx.beginPath();
        ctx.fillStyle = enemyColor;
        ctx.arc(this.pixelX, this.pixelY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // enemy health bar
        const barWidth = Math.max(TILE_SIZE / 2, this.radius * 1.5);
        const barHeight = 5;
        const x = this.pixelX - barWidth / 2;
        const y = this.pixelY - this.radius - 10;  //position above enemy

        // Draw the health bar border
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, barWidth, barHeight);

        //formatting the health bar with color coding
        const healthRatio = this.currentHealth / this.maxHealth;
        let healthColor = 'limegreen'; 
        if (healthRatio < 0.3) {
            healthColor = 'red'; // Low health
        } else if (healthRatio < 0.6) {
            healthColor = 'orange'; // Medium health
        }
        ctx.fillStyle = healthColor;
        ctx.fillRect(x, y, barWidth * healthRatio, barHeight);

        //white border around the health bar
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    //check if the enemy is dead
    isDead() {
        return this.currentHealth <= 0;
    }

    //Get enemy's position for targeting
    getPosition() {
        return {
            x: this.pixelX,
            y: this.pixelY
        };
    }
}