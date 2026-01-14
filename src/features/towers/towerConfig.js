/**
 * Tower Configuration
 * Centralized data for all tower types with balancing and upgrade progression.
 * 
 * Tower Types:
 * - Archer: Basic fast tower
 * - Mage: AOE damage tower
 * - Cannon: High damage slow tower
 * - Frost: Slow tower with ice damage
 * - Alchemist: Poison damage over time
 * - Tesla: Chain lightning tower
 */

export const TOWER_CONFIG = {
  archer: {
    name: 'Archer Tower',
    emoji: '🏹',
    cost: 100,
    upgradeCost: 50,
    width: 24,
    height: 24,
    health: 50,
    range: 150,
    fireRate: 0.5, // Shots per second
    damage: 15,
    damageType: 'normal',
    projectileType: 'arrow',
    piercing: false,
    areaOfEffect: 0,
    targetingStrategy: 'closest',
    maxLevel: 10,
    description: 'Fast, cheap tower. Good for beginners.',
    color: '#8B4513', // Brown
    secondaryColor: '#D2691E', // Lighter brown
  },

  mage: {
    name: 'Mage Tower',
    emoji: '✨',
    cost: 150,
    upgradeCost: 75,
    width: 24,
    height: 24,
    health: 60,
    range: 120,
    fireRate: 0.75,
    damage: 25,
    damageType: 'magic',
    projectileType: 'magicMissile',
    piercing: false,
    areaOfEffect: 40, // AOE radius
    targetingStrategy: 'pathProgress', // Targets furthest along path
    maxLevel: 10,
    description: 'Magic damage with AOE. Hits multiple enemies.',
    color: '#9932CC', // Purple
    secondaryColor: '#DA70D6', // Light purple
  },

  cannon: {
    name: 'Cannon Tower',
    emoji: '🔫',
    cost: 200,
    upgradeCost: 100,
    width: 24,
    height: 24,
    health: 80,
    range: 180,
    fireRate: 1.5, // Slower but harder hitting
    damage: 50,
    damageType: 'normal',
    projectileType: 'cannonball',
    piercing: true,
    areaOfEffect: 50, // Large explosion
    targetingStrategy: 'strongest', // Targets highest health
    maxLevel: 10,
    description: 'Heavy hitter. Slow but devastating.',
    color: '#556B2F', // Dark olive
    secondaryColor: '#9ACD32', // Yellow-green
  },

  frost: {
    name: 'Frost Tower',
    emoji: '❄️',
    cost: 120,
    upgradeCost: 60,
    width: 24,
    height: 24,
    health: 55,
    range: 140,
    fireRate: 0.6,
    damage: 12,
    damageType: 'ice',
    projectileType: 'iceShard',
    piercing: false,
    areaOfEffect: 30,
    targetingStrategy: 'weakest', // Targets lowest health
    maxLevel: 10,
    description: 'Freezes and slows enemies. Support tower.',
    color: '#00CED1', // Cyan
    secondaryColor: '#E0FFFF', // Light cyan
    slowEffect: {
      factor: 0.4, // 40% slow
      duration: 2,
    },
  },

  alchemist: {
    name: 'Alchemist Tower',
    emoji: '⚗️',
    cost: 140,
    upgradeCost: 70,
    width: 24,
    height: 24,
    health: 65,
    range: 130,
    fireRate: 0.8,
    damage: 20,
    damageType: 'poison',
    projectileType: 'poison',
    piercing: false,
    areaOfEffect: 35,
    targetingStrategy: 'pathProgress',
    maxLevel: 10,
    description: 'Poison damage over time. Weakens enemies.',
    color: '#006400', // Dark green
    secondaryColor: '#32CD32', // Lime green
    poisonEffect: {
      damagePerSecond: 5,
      duration: 4,
    },
  },

  tesla: {
    name: 'Tesla Tower',
    emoji: '⚡',
    cost: 180,
    upgradeCost: 90,
    width: 24,
    height: 24,
    health: 70,
    range: 110,
    fireRate: 1.0,
    damage: 30,
    damageType: 'lightning',
    projectileType: 'bolt',
    piercing: true,
    areaOfEffect: 0, // Chaining instead
    targetingStrategy: 'closest',
    maxLevel: 10,
    description: 'Chain lightning. Jumps between enemies.',
    color: '#FFD700', // Gold
    secondaryColor: '#FFFF00', // Yellow
    chainEffect: {
      maxChains: 3,
      chainRange: 80,
      damageMultiplier: 0.8, // 80% of original
    },
  },
};

/**
 * Get tower configuration by type
 * @param {string} towerType - Type of tower
 * @param {number} level - Tower level (optional, for scaling)
 * @returns {Object} Tower configuration
 */
export function getTowerConfig(towerType, level = 1) {
  const config = { ...TOWER_CONFIG[towerType] };

  if (level > 1) {
    // Apply level-based scaling
    const levelMultiplier = 1 + (level - 1) * 0.15; // 15% per level
    config.damage = Math.floor(config.damage * levelMultiplier);
    config.range = Math.floor(config.range * (1 + (level - 1) * 0.05)); // 5% per level
    config.health = Math.floor(config.health * levelMultiplier);
  }

  return config;
}

/**
 * Get all available tower types
 * @returns {Array<string>} Array of tower type names
 */
export function getTowerTypes() {
  return Object.keys(TOWER_CONFIG);
}

/**
 * Get tower cost (including upgrades)
 * @param {string} towerType - Type of tower
 * @param {number} level - Tower level
 * @returns {number} Total cost
 */
export function getTowerCost(towerType, level = 1) {
  const config = TOWER_CONFIG[towerType];
  if (!config) return 0;

  if (level === 1) {
    return config.cost;
  }

  // Cost for upgrades from level 1 to desired level
  let totalCost = config.cost;
  for (let i = 2; i <= level; i++) {
    totalCost += Math.floor(config.upgradeCost * Math.pow(1.15, i - 2));
  }

  return totalCost;
}

/**
 * Calculate tower damage with various modifiers
 * @param {string} towerType - Type of tower
 * @param {number} level - Tower level
 * @param {number} critChance - Critical hit chance (0-1)
 * @returns {number} Calculated damage
 */
export function calculateTowerDamage(towerType, level = 1, critChance = 0) {
  const config = getTowerConfig(towerType, level);
  let damage = config.damage;

  // Apply critical strike if triggered
  if (Math.random() < critChance) {
    damage *= 1.5; // 50% crit damage
  }

  return Math.floor(damage);
}

/**
 * Get upgrade cost for next level
 * @param {string} towerType - Type of tower
 * @param {number} currentLevel - Current level
 * @returns {number} Upgrade cost
 */
export function getUpgradeCost(towerType, currentLevel = 1) {
  const config = TOWER_CONFIG[towerType];
  if (!config || currentLevel >= config.maxLevel) {
    return 0;
  }

  return Math.floor(config.upgradeCost * Math.pow(1.15, currentLevel - 1));
}

/**
 * Get tower stats for current level
 * @param {string} towerType - Type of tower
 * @param {number} level - Tower level
 * @returns {Object} Tower stats
 */
export function getTowerStats(towerType, level = 1) {
  const config = getTowerConfig(towerType, level);

  return {
    type: towerType,
    name: config.name,
    level: level,
    health: config.health,
    damage: config.damage,
    range: config.range,
    fireRate: config.fireRate,
    cost: getTowerCost(towerType, level),
    upgradeCost: getUpgradeCost(towerType, level),
  };
}

/**
 * Generate balance report for all towers
 * @param {number} level - Tower level to report on
 * @returns {Object} Balance report
 */
export function getBalanceReport(level = 1) {
  const report = {};

  for (const [towerType, config] of Object.entries(TOWER_CONFIG)) {
    const scaledConfig = getTowerConfig(towerType, level);
    const dps = scaledConfig.damage / scaledConfig.fireRate; // Damage per second

    report[towerType] = {
      name: config.name,
      costEfficiency: dps / config.cost, // Damage per second per gold
      damagePerSecond: dps.toFixed(1),
      damage: scaledConfig.damage,
      fireRate: scaledConfig.fireRate,
      range: scaledConfig.range,
      health: scaledConfig.health,
      cost: config.cost,
    };
  }

  return report;
}

/**
 * Log balance report to console
 * @param {number} maxLevel - Max level to report
 */
export function logBalanceReport(maxLevel = 5) {
  console.log('========== TOWER BALANCE REPORT ==========');

  for (let level = 1; level <= maxLevel; level++) {
    console.log(`\n--- Level ${level} ---`);
    const report = getBalanceReport(level);

    for (const [type, stats] of Object.entries(report)) {
      console.log(
        `${type.padEnd(12)} | DPS: ${stats.damagePerSecond.padStart(6)} | Cost: ${String(stats.cost).padStart(4)} | Efficiency: ${stats.costEfficiency.toFixed(2)}`
      );
    }
  }

  console.log('\n=========================================');
}