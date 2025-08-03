import { path } from '../maps/map1.js';
import Enemy from "../classes/Enemy.js";

let spawnTimer = 0; // Timer for spawning enemies
let spawnInterval = 100; // Interval for spawning enemies in frames
let enemies = []

export default function createEnemy(ctx, enemiesEscaped) {
    spawnTimer++;
    if (spawnTimer % spawnInterval === 0) {
        enemies.push(new Enemy());
    }

    // update and draw each enemy
    enemies = enemies.filter((enemy) => {
        enemy.updateEnemy();

        //remove if dead
        if (enemy.currentHealth <= 0) {
            return false; // Remove enemy from the array
        }

        //remove if it reached last tile
        if (enemy.currentTile >= path.length - 1) {
            enemiesEscaped++;
            return false; // Remove enemy from the array
        }

        return true; // Keep the enemy in the array
    });

    // draw each enemy
    for (const enemy of enemies) {
        enemy.drawEnemy(ctx);
    }
}
