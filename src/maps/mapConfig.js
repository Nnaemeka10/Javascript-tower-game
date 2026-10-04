/**
 * mapConfig.js
 * Defines map layouts, paths, and tile types for tower defense levels.
 * Supports multiple maps, spawn/end points, and pathfinding.
 */

export const MAP_CONFIGS = [
  {
    id: 'map1',
    name: 'The Serpent',
    cols: 20, rows: 15, tileSize: 40,
    spawn: { x: 0, y: 2 }, end: { x: 19, y: 12 },
    path: [
      { x: 0, y: 2 }, { x: 17, y: 2 }, { x: 17, y: 7 }, { x: 2, y: 7 },
      { x: 2, y: 12 }, { x: 19, y: 12 }
    ],
    blocked: [ { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 6, y: 10 } ],
    background: '#222244', gridColor: '#444466', pathColor: '#00FF00', blockedColor: '#FF3333',
  },

  {
    id: 'map2',
    name: 'The Serpent',
    cols: 20, rows: 15, tileSize: 40,
    spawn: { x: 0, y: 2 }, end: { x: 19, y: 12 },
    path: [
      { x: 0, y: 2 }, { x: 17, y: 2 }, { x: 17, y: 7 }, { x: 2, y: 7 },
      { x: 2, y: 12 }, { x: 19, y: 12 }
    ],
    blocked: [ { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 6, y: 10 } ],
    background: '#222244', gridColor: '#444466', pathColor: '#00FF00', blockedColor: '#FF3333',
  },

  {
    id: 'map3',
    name: 'The Crossroads',
    cols: 20, rows: 15, tileSize: 40,
    spawn: { x: 0, y: 7 }, end: { x: 19, y: 5 },
    path: [
      { x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 2 }, { x: 14, y: 2 },
      { x: 14, y: 12 }, { x: 8, y: 12 }, { x: 8, y: 5 }, { x: 19, y: 5 }
    ],
    blocked: [ { x: 10, y: 4 }, { x: 11, y: 9 }, { x: 3, y: 10 }, { x: 17, y: 8 }, { x: 6, y: 13 }, { x: 12, y: 6 } ],
    background: '#222244', gridColor: '#444466', pathColor: '#00FF00', blockedColor: '#FF3333',
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