import { path } from '../maps/map1.js';
import { TOWER_CONFIG } from '../utils/towerConfig.js';
import { createProjectile } from './manageProjectiles.js';
import MoneyManager from '../classes/gameManagers/MoneyManager.js';
import { getTileSize } from './resizeCanvas.js';



let towers = []; // Array to hold all towers
let selectedTower = null; // Currently selected tower for upgrades or actions

const towerTypes = Object.entries(TOWER_CONFIG).map(([name, cfg]) => {
    return {
        name,
        class: cfg.class, 
        ...cfg
    }
}) 

export default function manageTower(mouseX, mouseY) {
    const TILE_SIZE = getTileSize();
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

        return { success: true, reason: 'tower_selected' };
    }

    //if we didn't click on a tower, try to place a new one
    // Check if the tile is already occupied by a tower
    const onPath = path.some(tile => tile.x === tileX && tile.y === tileY);

    const towerExists = towers.some(t => t.x === tileX && t.y === tileY);
    const towerType = towerTypes[0]; // Default to the first tower type for now
    const cost = towerType.cost;

    if (onPath) {
        return { success: false, reason: 'on_path' };
    }

    if (towerExists) {
        return { success: false, reason: 'tower_exists' };
    }

    if(!MoneyManager.canAfford(cost)) {
        return { success: false, reason: 'insufficient_funds', cost};
    }

    
    // Create a new tower at the clicked position
        const newTower = new towerType.class(tileX, tileY);
        towers.push(newTower);
        MoneyManager.spendMoney(cost);
        selectedTower = null;

        return { success: true, reason: 'tower_placed'};
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


//function to remove tower (for future sell feature)
export function removeTower(tower) {
    const index = towers.indexOf(tower);
    if (index > -1) {
        towers.splice(index, 1);
        if (selectedTower === tower) {
            selectedTower = null; // Deselect if the removed tower was selected
        }
        return true;
    }
    return false;
}

//function to reset towers (for game over, etc)
export function resetTowers() {
    towers = [];
    selectedTower = null;
}

export function getTowerCost(typeName = towerTypes[0].name) {
    const towerType = towerTypes.find(t => t.name === typeName);
    return towerType ? towerType.cost : 0;
} 


export { towers };