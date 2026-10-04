/**
 * Event Handlers
 * Central event delegation for tower placement, selection, and UI interaction.
 * 
 * This bridges the main.js event listeners with the game managers.
 * Handles:
 * - Tower placement from click events
 * - Tower selection and dragging
 * - UI button interactions
 * - Tower upgrade/sell functionality
 */

/**
 * Setup all event handlers by delegating to managers
 * @param {GameEngine} gameEngine - Game engine instance
 */
import { CANVAS_CONFIG } from '../../utils/constants.js';
export function setupEventHandlers(gameEngine) {
  const gameState = gameEngine.getGameState();
  const towerManager = gameEngine.getManager('tower');
  const uiManager = gameEngine.getManager('ui');

  // Store reference for later use
  gameEngine.eventHandlers = {
    gameState,
    towerManager,
    uiManager,
    gameEngine,
  };

  console.log('Event handlers setup complete');
}

/**
 * Handle canvas click for tower placement
 * @param {number} worldX - World coordinate X
 * @param {number} worldY - World coordinate Y
 * @param {GameEngine} gameEngine - Game engine instance
 */
export function handleTowerPlacement(worldX, worldY, gameEngine) {
  const gameState = gameEngine.getGameState();
  const towerManager = gameEngine.getManager('tower');
  const selectedType = gameState.getSelectedTowerType();

  if (!selectedType) return;

  // Convert world to grid coordinates using config
  const gridX = Math.floor(worldX / CANVAS_CONFIG.tileSize);
  const gridY = Math.floor(worldY / CANVAS_CONFIG.tileSize);

  // Check if cell already has tower
  const existingTower = towerManager.getTowerAt(gridX, gridY);
  if (existingTower) {
    console.warn('Cell already occupied');
    gameState.deselectTowerType(); // Clear placement mode on invalid action
    return;
  }

  // Place tower
  const tower = towerManager.placeTower(selectedType, worldX, worldY, gameState);

  if (tower) {
    console.log(`Placed ${selectedType} tower at grid (${gridX}, ${gridY})`);
  } else {
    console.warn('Failed to place tower (Invalid spot or insufficient funds)');
  }
  
  // Deselect tower type after placement (exits placement mode)
  gameState.deselectTowerType();
}

/**
 * Handle tower selection from click
 * @param {number} worldX - World coordinate X
 * @param {number} worldY - World coordinate Y
 * @param {GameEngine} gameEngine - Game engine instance
 * @returns {Tower|null} Selected tower or null
 */
export function handleTowerSelection(worldX, worldY, gameEngine) {
  const towerManager = gameEngine.getManager('tower');

  const gridX = Math.floor(worldX / CANVAS_CONFIG.tileSize);
  const gridY = Math.floor(worldY / CANVAS_CONFIG.tileSize);
  const tower = towerManager.getTowerAt(gridX, gridY);

  towerManager.selectTower(tower);   // null clears selection + range circle
  return tower;
}

/**
 * Handle tower upgrade request
 * @param {Tower} tower - Tower to upgrade
 * @param {GameEngine} gameEngine - Game engine instance
 * @returns {boolean} Success
 */
export function handleTowerUpgrade(tower, gameEngine) {
  if (!tower) {
    console.warn('No tower selected');
    return false;
  }

  const gameState = gameEngine.getGameState();
  const towerManager = gameEngine.getManager('tower');

  const success = towerManager.upgradeTower(tower, gameState);

  if (success) {
    console.log(`Tower upgraded to level ${tower.level}`);
  }

  return success;
}

/**
 * Handle tower repair request
 * @param {Tower} tower - Tower to repair
 * @param {GameEngine} gameEngine - Game engine instance
 * @returns {boolean} Success
 */
export function handleTowerRepair(tower, gameEngine) {
  if (!tower) {
    console.warn('No tower selected');
    return false;
  }

  const gameState = gameEngine.getGameState();
  const towerManager = gameEngine.getManager('tower');

  const repairAmount = Math.ceil(tower.maxHealth * 0.25); // Repair 25% health
  const success = towerManager.repairTower(tower, repairAmount, gameState);

  if (success) {
    console.log(`Tower repaired (${repairAmount} health restored)`);
  }

  return success;
}

/**
 * Handle tower sell request
 * @param {Tower} tower - Tower to sell
 * @param {GameEngine} gameEngine - Game engine instance
 */
export function handleTowerSell(tower, gameEngine) {
  if (!tower) {
    console.warn(' No tower selected');
    return;
  }

  const gameState = gameEngine.getGameState();
  const towerManager = gameEngine.getManager('tower');

  // Calculate sell price (50% of upgrade cost spent)
  const sellPrice = Math.floor(
    tower.config.cost * 0.5 + tower.upgradeCount  * 15
  );

  gameState.addMoney(sellPrice);
  towerManager.removeTower(tower);

  console.log(`Tower sold for ${sellPrice} gold (T${tower.getUpgradeInfo().tierLabel})`);
}

/**
 * Handle tower type selection
 * @param {string} towerType - Type of tower to select
 * @param {GameEngine} gameEngine - Game engine instance
 */
export function handleTowerTypeSelection(towerType, gameEngine) {
  const gameState = gameEngine.getGameState();
  const currentType = gameState.getSelectedTowerType();

  if (currentType === towerType) {
    // Deselect if clicking same type
    gameState.deselectTowerType();
    console.log('Tower selection cleared');
  } else {
    // Select new type
    gameState.selectTowerType(towerType);
    console.log(`Selected tower: ${towerType}`);
  }
}

/**
 * Handle tower drag start
 * @param {number} worldX - World coordinate X
 * @param {number} worldY - World coordinate Y
 * @param {GameEngine} gameEngine - Game engine instance
 */
export function handleTowerDragStart(worldX, worldY, gameEngine) {
  const gameState = gameEngine.getGameState();
  const tower = handleTowerSelection(worldX, worldY, gameEngine);

  if (tower) {
    gameState.setTowerDragging(true);
    gameState.setDraggedTowerPosition(tower.x, tower.y);
  }
}

/**
 * Handle tower drag end
 * @param {number} worldX - World coordinate X
 * @param {number} worldY - World coordinate Y
 * @param {GameEngine} gameEngine - Game engine instance
 */
export function handleTowerDragEnd(worldX, worldY, gameEngine) {
  const gameState = gameEngine.getGameState();
  const towerManager = gameEngine.getManager('tower');

  if (!gameState.isTowerDragging()) {
    return;
  }

  const draggedPos = gameState.getDraggedTowerPosition();
  const nearbyTowers = towerManager.getTowersInArea(draggedPos.x, draggedPos.y, 20);

  if (nearbyTowers.length > 0) {
    // Tower was selected and dragged
    console.log('Tower drag ended');
  }

  gameState.setTowerDragging(false);
}

/**
 * Get tower info for UI display
 * @param {Tower} tower - Tower to get info for
 * @returns {Object} Tower info
 */
export function getTowerInfo(tower) {
  if (!tower) return null;
  return {
    id: tower.id,
    type: tower.type,
    name: tower.config.name,
    emoji: tower.config.emoji,
    accent: tower.config.color,
    health: tower.health,
    maxHealth: tower.maxHealth,
    healthPercent: (tower.getHealthPercentage() * 100).toFixed(1),
    damage: tower.getDamageStat(),
    baseDamage: tower.config.damage,
    range: Math.floor(tower.range),
    baseRange: tower.config.range,
    shotsPerSec: (1 / tower.shotInterval).toFixed(1),   // fixed old "0.5/s" mislabel
    upgrade: tower.getUpgradeInfo(),
    combat: {
      kills: tower.enemiesKilled,
      damageDealt: Math.round(tower.totalDamageDealt),
    },
  };
}