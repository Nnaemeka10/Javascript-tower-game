/**
 * mapManager.js
 * Handles map selection, grid queries, pathfinding, and tile validation.
 * Provides API for game logic to interact with map data.
 */

import { MAP_CONFIGS, getMapConfig } from './mapConfig.js';

class MapManager {
  constructor() {
    this.maps = MAP_CONFIGS;
    this.currentMapId = this.maps[0]?.id || null;
    this.currentMap = getMapConfig(this.currentMapId);
  }

  /**
   * Initialize the map manager
   */
  async initialize() {
    // Placeholder for any async initialization if needed
  }

  /**
   * Select a map by id
   * @param {string} mapId
   */
  selectMap(mapId) {
    const map = getMapConfig(mapId);
    if (map) {
      this.currentMapId = mapId;
      this.currentMap = map;
      return true;
    }
    return false;
  }

  /**
   * Get current map config
   * @returns {Object}
   */
  getCurrentMap() {
    return this.currentMap;
  }

  /**
   * Get all available maps
   * @returns {Array}
   */
  getAllMaps() {
    return this.maps;
  }

  /**
   * Is a tile blocked (obstacle)?
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isBlocked(x, y) {
    return this.currentMap.blocked.some(tile => tile.x === x && tile.y === y);
  }

  /**
   * Is a tile a valid tower spot?
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isTowerSpot(x, y) {
    return this.currentMap.towerSpots.some(spot => spot.x === x && spot.y === y);
  }

  /**
   * Get path waypoints for enemy movement
   * @returns {Array}
   */
  getPathWaypoints() {
    return this.currentMap.path;
  }

  /**
   * Get spawn point
   * @returns {Object}
   */
  getSpawnPoint() {
    return this.currentMap.spawn;
  }

  /**
   * Get end point
   * @returns {Object}
   */
  getEndPoint() {
    return this.currentMap.end;
  }

  /**
   * Get grid size
   * @returns {Object} {cols, rows, tileSize}
   */
  getGridSize() {
    const { cols, rows, tileSize } = this.currentMap;
    return { cols, rows, tileSize };
  }

  /**
   * Validate if a grid cell is within bounds
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isInBounds(x, y) {
    const { cols, rows } = this.currentMap;
    return x >= 0 && x < cols && y >= 0 && y < rows;
  }

  /**
   * Find nearest tower spot to a given position
   * @param {number} x
   * @param {number} y
   * @returns {Object|null}
   */
  findNearestTowerSpot(x, y) {
    let minDist = Infinity;
    let nearest = null;
    this.currentMap.towerSpots.forEach(spot => {
      const dx = spot.x - x;
      const dy = spot.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = spot;
      }
    });
    return nearest;
  }

  /**
   * Get a snapshot of current map state (for debugging)
   * @returns {Object}
   */
  getSnapshot() {
    return {
      id: this.currentMapId,
      config: this.currentMap
    };
  }
}

export default MapManager;