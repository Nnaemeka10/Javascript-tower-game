/**
 * Tower Manager
 * Manages tower lifecycle, placement, targeting, and object pooling.
 * 
 * Responsibilities:
 * - Create and place towers on grid
 * - Update tower logic (targeting, shooting)
 * - Query towers by position or criteria
 * - Object pooling for performance
 * - Handle tower removal and cleanup
 */

import Tower from './Tower.js';
import { TOWER_CONFIG, getTowerConfig, getTowerCost } from './towerConfig.js';
import { CANVAS_CONFIG } from '../../utils/constants.js';

class TowerManager {
  constructor() {
    // Active towers
    this.towers = [];
    this.towerMap = new Map(); // Grid position -> tower for quick lookup

    // Object pool for performance
    this.pool = [];
    this.maxPoolSize = 100;

    // Tower ID counter
    this.nextTowerId = 1;

    // Grid for spatial queries
    this.gridSize = 40; // Cell size for spatial partitioning
    this.gridCells = new Map(); // Cell key -> array of tower IDs

    // Statistics
    this.totalTowersPlaced = 0;
    this.totalMoneySpent = 0;

    // State
    this.isInitialized = false;
  }

  /**
   * Initialize tower manager
   * @param {RenderSurface} renderSurface - For dimension queries (optional)
   */
  async initialize(renderSurface) {
    console.log('🏰 TowerManager initializing...');

    // Pre-pool some tower instances for performance
    for (let i = 0; i < 20; i++) {
      this.pool.push(new Tower(this.nextTowerId++, 'archer', 0, 0, 0, 0));
    }

    this.isInitialized = true;
    console.log('✅ TowerManager initialized');
  }

  /**
   * Place a tower at specified position
   * @param {string} towerType - Type of tower to place
   * @param {number} x - World X coordinate
   * @param {number} y - World Y coordinate
   * @param {Object} gameState - Game state for money management
   * @returns {Tower|null} Created tower or null if placement failed
   */
  placeTower(towerType, x, y, gameState) {
    // Validate tower type
    if (!TOWER_CONFIG[towerType]) {
      console.error(`❌ Invalid tower type: ${towerType}`);
      return null;
    }

    // Convert to grid coordinates
    const gridX = Math.floor(x / CANVAS_CONFIG.tileSize);
    const gridY = Math.floor(y / CANVAS_CONFIG.tileSize);

    // Check if grid cell is already occupied
    const gridKey = `${gridX},${gridY}`;
    if (this.towerMap.has(gridKey)) {
      console.warn(`⚠️ Grid cell (${gridX}, ${gridY}) already occupied`);
      return null;
    }

    // Check if player can afford the tower
    const cost = getTowerCost(towerType, 1);
    if (!gameState.canAfford(cost)) {
      console.warn(`⚠️ Cannot afford ${towerType} (cost: ${cost}, money: ${gameState.getMoney()})`);
      return null;
    }

    // Deduct money from player
    gameState.spendMoney(cost);

    // Create or reuse tower
    const tower = this.createTower(towerType, x, y, gridX, gridY);

    if (!tower) {
      // Refund money if creation failed
      gameState.addMoney(cost);
      return null;
    }

    // Add to active towers
    this.towers.push(tower);
    this.towerMap.set(gridKey, tower);

    // Add to spatial grid
    this.addToSpatialGrid(tower);

    // Statistics
    this.totalTowersPlaced++;
    this.totalMoneySpent += cost;
    gameState.incrementTowersPlaced(1);

    console.log(`✅ Tower placed: ${towerType} at (${gridX}, ${gridY})`);

    return tower;
  }

  /**
   * Create or reuse a tower from pool
   * @private
   */
  createTower(towerType, x, y, gridX, gridY) {
    let tower;

    // Try to get from pool
    if (this.pool.length > 0) {
      tower = this.pool.pop();
      tower.type = towerType;
      tower.config = TOWER_CONFIG[towerType];
      tower.x = x;
      tower.y = y;
      tower.gridX = gridX;
      tower.gridY = gridY;
      tower.reset();
    } else {
      // Create new if pool empty
      tower = new Tower(this.nextTowerId++, towerType, x, y, gridX, gridY);
    }

    return tower;
  }

  /**
   * Remove a tower
   * @param {Tower} tower - Tower to remove
   */
  removeTower(tower) {
    // Remove from arrays
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      this.towers.splice(index, 1);
    }

    // Remove from map
    const gridKey = `${tower.gridX},${tower.gridY}`;
    this.towerMap.delete(gridKey);

    // Remove from spatial grid
    this.removeFromSpatialGrid(tower);

    // Return to pool if space available
    if (this.pool.length < this.maxPoolSize) {
      tower.reset();
      this.pool.push(tower);
    }

    console.log(`🗑️ Tower removed: ${tower.id}`);
  }

  /**
   * Update all towers
   * @param {number} deltaTime - Time since last update
   * @param {Array} enemies - Array of enemies for targeting
   * @param {ProjectileManager} projectileManager - To spawn projectiles
   */
  update(deltaTime, enemies, projectileManager) {
    for (const tower of this.towers) {
      const projectileData = tower.update(deltaTime, enemies);

      // If tower should fire, have projectile manager create projectile
      if (projectileData && projectileManager) {
        projectileManager.createProjectile(
          projectileData.type,
          projectileData.startX,
          projectileData.startY,
          projectileData.targetX,
          projectileData.targetY,
          projectileData.damage,
          projectileData.damageType,
          tower.id
        );
      }
    }
  }

  /**
   * Get tower at grid position
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridY - Grid Y coordinate
   * @returns {Tower|null}
   */
  getTowerAt(gridX, gridY) {
    const gridKey = `${gridX},${gridY}`;
    return this.towerMap.get(gridKey) || null;
  }

  /**
   * Get towers in circular area
   * @param {number} x - World X coordinate
   * @param {number} y - World Y coordinate
   * @param {number} radius - Search radius
   * @returns {Array} Array of towers in range
   */
  getTowersInArea(x, y, radius) {
    const result = [];

    for (const tower of this.towers) {
      const dx = tower.x - x;
      const dy = tower.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        result.push(tower);
      }
    }

    return result;
  }

  /**
   * Get towers by type
   * @param {string} towerType - Type to filter by
   * @returns {Array} Array of towers of specified type
   */
  getTowersByType(towerType) {
    return this.towers.filter(tower => tower.type === towerType);
  }

  /**
   * Get all towers
   * @returns {Array} Array of all active towers
   */
  getTowers() {
    return this.towers;
  }

  /**
   * Get tower by ID
   * @param {number} towerId - Tower ID
   * @returns {Tower|null}
   */
  getTowerById(towerId) {
    return this.towers.find(tower => tower.id === towerId) || null;
  }

  /**
   * Select tower (for UI highlighting)
   * @param {Tower} tower - Tower to select
   */
  selectTower(tower) {
    // Deselect previous selection
    for (const t of this.towers) {
      t.isSelected = false;
    }

    // Select new tower
    if (tower) {
      tower.isSelected = true;
      console.log(`🎯 Tower selected: ${tower.id} (${tower.type})`);
    }
  }

  /**
   * Upgrade tower
   * @param {Tower} tower - Tower to upgrade
   * @param {Object} gameState - Game state for money management
   * @returns {boolean} Success
   */
  upgradeTower(tower, gameState) {
    if (tower.level >= tower.config.maxLevel) {
      console.warn(`⚠️ Tower ${tower.id} is already max level`);
      return false;
    }

    const cost = Math.floor(tower.config.upgradeCost * Math.pow(1.15, tower.level - 1));

    if (!gameState.canAfford(cost)) {
      console.warn(`⚠️ Cannot afford upgrade (cost: ${cost}, money: ${gameState.getMoney()})`);
      return false;
    }

    gameState.spendMoney(cost);
    tower.upgrade();
    this.totalMoneySpent += cost;

    return true;
  }

  /**
   * Repair tower
   * @param {Tower} tower - Tower to repair
   * @param {number} amount - Amount to repair
   * @param {Object} gameState - Game state for money management
   * @returns {boolean} Success
   */
  repairTower(tower, amount, gameState) {
    const cost = amount * 2; // 2 gold per 1 health

    if (!gameState.canAfford(cost)) {
      return false;
    }

    gameState.spendMoney(cost);
    tower.repair(amount);
    this.totalMoneySpent += cost;

    return true;
  }

  /**
   * Add spatial grid entry for tower
   * @private
   */
  addToSpatialGrid(tower) {
    const cellX = Math.floor(tower.x / this.gridSize);
    const cellY = Math.floor(tower.y / this.gridSize);
    const cellKey = `${cellX},${cellY}`;

    if (!this.gridCells.has(cellKey)) {
      this.gridCells.set(cellKey, []);
    }

    this.gridCells.get(cellKey).push(tower.id);
  }

  /**
   * Remove spatial grid entry for tower
   * @private
   */
  removeFromSpatialGrid(tower) {
    const cellX = Math.floor(tower.x / this.gridSize);
    const cellY = Math.floor(tower.y / this.gridSize);
    const cellKey = `${cellX},${cellY}`;

    if (this.gridCells.has(cellKey)) {
      const towers = this.gridCells.get(cellKey);
      const index = towers.indexOf(tower.id);
      if (index > -1) {
        towers.splice(index, 1);
      }

      if (towers.length === 0) {
        this.gridCells.delete(cellKey);
      }
    }
  }

  /**
   * Get tower types
   * @returns {Array<string>}
   */
  getTowerTypes() {
    return Object.keys(TOWER_CONFIG);
  }

  /**
   * Clear all towers
   */
  clear() {
    this.towers = [];
    this.towerMap.clear();
    this.gridCells.clear();
    console.log('🧹 All towers cleared');
  }

  /**
   * Get manager statistics
   * @returns {Object}
   */
  getStatistics() {
    return {
      activeTowers: this.towers.length,
      pooledTowers: this.pool.length,
      totalPlaced: this.totalTowersPlaced,
      totalMoneySpent: this.totalMoneySpent,
      towersByType: this.getTowerTypes().reduce((acc, type) => {
        acc[type] = this.getTowersByType(type).length;
        return acc;
      }, {}),
    };
  }

  /**
   * Get manager snapshot for debugging
   * @returns {Object}
   */
  getSnapshot() {
    return {
      activeTowers: this.towers.length,
      poolSize: this.pool.length,
      maxPoolSize: this.maxPoolSize,
      nextTowerId: this.nextTowerId,
      statistics: this.getStatistics(),
      towers: this.towers.map(t => t.getSnapshot()),
    };
  }
}

export default TowerManager;