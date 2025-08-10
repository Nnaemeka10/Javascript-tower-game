import { path } from '../maps/map1.js';
import Goblin from '../classes/Goblin.js';
import Dwarve from '../classes/Dwarve.js';
import Dragon from '../classes/Dragon.js';
import Elve from '../classes/Elve.js';
import Hobbit from '../classes/Hobbit.js';
import Enemy from '../classes/Enemy.js';

let spawnTimer = 0; // Timer for spawning enemies
let spawnInterval = 100; // Interval for spawning enemies in frames
let enemies = []

//Array of different enemy types for random selection
const ENEMY_TYPES = [Goblin, Dwarve, Elve, Hobbit, Dragon]

//function to randomly select an enemy type
function getRandomEnemyType() {
    const randomIndex = Math.floor(Math.random() * ENEMY_TYPES.length);
    return ENEMY_TYPES[randomIndex];
}

export default function manageEnemies(ctx, enemiesEscaped) {
    spawnTimer++;
    if (spawnTimer % spawnInterval === 0) {

        //get a random enemy
        const EnemyType = getRandomEnemyType();
        enemies.push(new EnemyType())

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

    // Return the number of enemies escaped
    return enemiesEscaped;
}

// Export the enemies array for other modules to access
export { enemies };