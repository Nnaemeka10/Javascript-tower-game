import { path } from '../maps/map1.js';
import waveManager from '../classes/WaveManager.js';

let spawnTimer = 0; // Timer for spawning enemies
let spawnInterval = 50; // Interval for spawning enemies in frames
let enemies = []


export default function manageEnemies(ctx, enemiesEscaped) {

    //update wave message timer
    waveManager.updateWaveMessage();

    spawnTimer++;
    if (spawnTimer % spawnInterval === 0) {

        //get a random enemy
        const newEnemy = waveManager.handleSpawning();
        if(newEnemy) {
            enemies.push(newEnemy);
        }

    }

    // update and draw each enemy
    enemies = enemies.filter((enemy) => {
        enemy.updateEnemy();

        //remove if dead
        if (enemy.currentHealth <= 0) {
            waveManager.addKillXP(enemy);
            return false; // Remove enemy from the array
        }

        //remove if it reached last tile
        if (enemy.currentTile >= path.length - 1) {
            enemiesEscaped++;
            return false; // Remove enemy from the array
        }

        return true; // Keep the enemy in the array
    });

    if(waveManager.checkWaveComplete(enemies)) {
        waveManager.startNextWave();
    }
    // draw each enemy
    for (const enemy of enemies) {
        enemy.drawEnemy(ctx);
    }

    // Return the number of enemies escaped
    return enemiesEscaped;
}



// Export the enemies array for other modules to access
export { enemies };