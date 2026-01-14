/**
 * mapConfig.js
 * Defines map layouts, paths, and tile types for tower defense levels.
 * Supports multiple maps, spawn/end points, and pathfinding.
 */

export const MAP_CONFIGS = [
  {
    id: 'map1',
    name: 'Classic Path',
    cols: 20,
    rows: 15,
    tileSize: 40,
    spawn: { x: 0, y: 7 },
    end: { x: 19, y: 7 },
    path: [
      { x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 3 }, { x: 10, y: 3 },
      { x: 10, y: 11 }, { x: 15, y: 11 }, { x: 15, y: 7 }, { x: 19, y: 7 }
    ],
    blocked: [
      // Example: Blocked tiles for obstacles
      { x: 8, y: 5 }, { x: 8, y: 6 }, { x: 8, y: 7 }, { x: 8, y: 8 },
      { x: 12, y: 9 }, { x: 12, y: 10 }
    ],
    towerSpots: [
      // Example: Valid tower placement spots
      { x: 3, y: 5 }, { x: 6, y: 2 }, { x: 9, y: 12 }, { x: 14, y: 8 },
      { x: 17, y: 10 }
    ],
    background: '#222244',
    gridColor: '#444466',
    pathColor: '#00FF00',
    blockedColor: '#FF3333',
    towerSpotColor: '#FFD700'
  },
  // Add more maps here as needed
];

/**
 * Get map config by id
 * @param {string} id - Map id
 * @returns {Object|null}
 */
export function getMapConfig(id) {
  return MAP_CONFIGS.find(map => map.id === id) || null;
}

/**
 * Get all map configs
 * @returns {Array}
 */
export function getAllMapConfigs() {
  return MAP_CONFIGS;
}