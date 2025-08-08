import { path } from '../maps/map1.js';
import { TILE_SIZE } from "../utils/constants.js";
import Tower from "../classes/Tower.js";
import { createProjectile } from './manageProjectiles.js';


let towers = []; // Array to hold all towers
let selectedTower = null; // Currently selected tower for upgrades or actions


export default function manageTower(mouseX, mouseY, ctx) {
    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    //check if we clicked on an existing tower
    const clickedTower = towers.find(tower => 
        tower.x === tileX && tower.y === tileY
    );

    if(clickedTower) {
        //Toggle tower selection
        if(selectedTower === clickedTower) {
            selectedTower = null;
        } else {
            selectedTower = clickedTower;
        }

        console.log('Tower Selected/ deselected');
        return;
    }

    //if we didn't click on a tower, try to place a new one
    // Check if the tile is already occupied by a tower
    const onPath = path.some(tile => tile.x === tileX && tile.y === tileY);

    const towerExists = towers.some(t => t.x === tileX && t.y === tileY);


    if (!onPath && !towerExists) {
    
        // Create a new tower at the clicked position
        towers.push(new Tower(tileX, tileY));

        selectedTower = null;
    } else {
        selectedTower = null;
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

//function to check if tower is selected
export function isTowerSelected(tower) {
    return selectedTower === tower;
}
    

//function to get the selected tower  for external use

export function getSelectedTower () {
    return selectedTower;
}

//function to deselect tower for esc key, etc

export function deselectTower() {
    selectedTower = null;
}
export { towers };