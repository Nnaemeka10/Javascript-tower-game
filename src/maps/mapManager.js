/**
 * mapManager.js
 * Handles map selection, grid queries, pathfinding, and tile validation.
 * Provides API for game logic to interact with map data.
 */

import { MAP_CONFIGS, getMapConfig } from './mapConfig.js';
import { MapGenerator } from './mapGenerator.js';

class MapManager {
  constructor() {
    this.maps = MAP_CONFIGS;
    this.currentMapId = this.maps[0]?.id || null;
    this.currentMap = getMapConfig(this.currentMapId);
    this.generator = new MapGenerator();
    this.generator.setBaseSeed(Date.now() >>> 0);   // session seed: new boards every session,
                                                    // identical boards within a session (fair resets)
  }

  /**
   * Initialize the map manager
   */
  async initialize() {
    // Placeholder for any async initialization if needed
  }

  /**
   * Is a tile on the enemy path corridor? (within half a tile of any segment)
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isOnPath(x, y) {
    const path = this.currentMap.path;
    if (!path || path.length < 2) return false;

    for (let i = 0; i < path.length - 1; i++) {
      if (this._pointNearSegment(x, y, path[i], path[i + 1])) return true;
    }
    return false;
  }

 /**
   * Grid-cell center within 0.5 tiles of segment a→b
   * @private
   */
  _pointNearSegment(px, py, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return Math.hypot(px - a.x, py - a.y) <= 0.5;

    let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy)) <= 0.5;
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
   * Round→map selection. 
   * @param {number} round
   * @returns {void}
  */
   loadMapForRound(round) {
    if (round === 1) { this.selectMap('map1'); return; }
    this.currentMap = this.generator.generate(round);
    this.currentMapId = this.currentMap.id;
  }

  /**
   * Get the name of the map for a given round
   * @param {number} round
   * @returns {string}
   */
  getMapNameForRound(round) {
    if (round === 1) return this.maps[0].name;
    return this.generator.generate(round).name;     // cache hit — same map advanceRound will load
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
   * Get a snapshot of current map state (for debugging)
   * @returns {Object}
   */
  getSnapshot() {
    return {
      id: this.currentMapId,
      config: this.currentMap,
      generated: this.currentMapId.startsWith('gen_'),
    };
  }
}

export default MapManager;