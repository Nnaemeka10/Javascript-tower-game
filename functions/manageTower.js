import { path } from '../maps/map1.js';
import { TILE_SIZE } from "../utils/constants.js";
import Tower from "../classes/Tower.js";
import { createProjectile } from './manageProjectiles.js';


let towers = []; // Array to hold all towers

export default function manageTower(mouseX, mouseY, ctx) {
    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    // Check if the tile is already occupied by a tower
    const onPath = path.some(tile => tile.x === tileX && tile.y === tileY);

    const towerExists = towers.some(t => t.x === tileX && t.y === tileY);


    if (!onPath && !towerExists) {
    
        // Create a new tower at the clicked position
        towers.push(new Tower(tileX, tileY));
    }
}

// Function to handle tower shooting 
export function handleTowerShooting(enemies) {
    for (const tower of towers) {
        const shootCommand = tower.update(enemies); // Update the tower and check if it can shoot
        // If the tower is ready to shoot, create a projectile
        if( shootCommand.shoot) {
            createProjectile(
                shootCommand.startX,
                shootCommand.startY,
                shootCommand.target,
                tower.damage
            );
        }
    }
}
    
export { towers };