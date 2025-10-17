import { path } from '../maps/map1.js';
import waveManager from '../classes/gameManagers/WaveManager.js';
import MoneyManager from '../classes/gameManagers/MoneyManager.js';

let spawnTimer = 0; // Timer for spawning enemies
let spawnInterval = 100; // Interval for spawning enemies in frames
let enemies = []
let enemiesEscaped = 0; // Counter for escaped enemies


function spawnEnemies() {
    spawnTimer++;
    if (spawnTimer % spawnInterval === 0) {

        //get a random enemy
        const newEnemy = waveManager.handleSpawning();
        if(newEnemy) {
            enemies.push(newEnemy);
        }

    }
}

//update enemy state
function updateEnemies() {

    //update wave message timer
    waveManager.updateWaveMessage();
    spawnEnemies();
   
    // update and draw each enemy
    enemies = enemies.filter((enemy) => {
        enemy.updateEnemy();

        //remove if dead
        if (enemy.currentHealth <= 0) {
            waveManager.addKillXP(enemy);

            //add money for kill
            MoneyManager.addMoney(enemy);

            //more visuals to be added here like coin moving up to the coin bar

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

    return enemiesEscaped;
}

//Draw all enemies
function drawEnemies(ctx) {
    for (const enemy of enemies) {
        enemy.drawEnemy(ctx);
    }
}


function resetEnemies () {
    spawnTimer = 0; // Timer for spawning enemies
    spawnInterval = 100; // Interval for spawning enemies in frames
    enemies = []
    enemiesEscaped = 0
}


// Export the enemies array for other modules to access
export {updateEnemies, drawEnemies, resetEnemies,enemies, enemiesEscaped };