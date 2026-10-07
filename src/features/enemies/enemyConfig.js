/**
 * enemyConfig.js
 * Centralized configuration for all enemy types.
 * 
 * Contains all stats, properties, and balancing values for enemies.
 * Makes it easy to:
 * - Add new enemy types
 * - Balance difficulty
 * - Scale enemies per wave
 * - Adjust economy (bounties)
 * 
 * All values are declarative and easy to modify.
 */

/**
 * Base enemy type configurations
 * Each enemy type defines its base stats
 */

const ENEMY_TYPES = {
  Goblin: {
    name: 'Goblin',
    health: 30,
    speed: 80, //poixels per second
    size: 16,
    bounty: 10,
    armor: 0,
    resistances: {
      normal: 0,
      fire: 0.1, //10% fire resistance
      ice: 0,
      lightning: 0.15, poison: 0.2, magic: 0.1
    },
    image: 'goblin.png', //path to sprite
    description: 'Fast and weak, low bounty',
    difficulty: 1,
  },

  Dwarve: {
    name: 'Dwarve',
    health: 60,
    speed: 50, // Slower than Goblin
    size: 20,
    bounty: 20,
    armor: 2, // Takes 2 less damage
    resistances: {
      normal: 0,
      fire: 0.2,
      ice: 0.1,
      lightning: 0.1, poison: 0.1,  magic: 0.15
    },
    image: 'dwarve.png',
    description: 'Tanky with armor. Medium speed.',
    difficulty: 2,
  },

 Elve: {
    name: 'Elve',
    health: 45,
    speed: 90, // Faster than most
    size: 18,
    bounty: 15,
    armor: 0,
    resistances: {
      normal: 0,
      fire: 0,
      ice: 0.3, // Very resistant to ice
      lightning: 0.2, poison: 0.15, magic: 0.25
    },
    image: 'elve.png',
    description: 'Swift and agile. High ice resistance.',
    difficulty: 2,
  },

 Hobbit: {
    name: 'Hobbit',
    health: 25,
    speed: 100, // Very fast
    size: 14,
    bounty: 8,
    armor: 0,
    resistances: {
      normal: 0,
      fire: 0,
      ice: 0,
      lightning: 0.1, poison: 0.1,  magic: 0.1
    },
    image: 'hobbit.png',
    description: 'Tiny and quick. Lowest bounty.',
    difficulty: 1,
  },

  Dragon: {
    name: 'Dragon',
    health: 150, // Boss-level
    speed: 40, // Slow but deadly
    size: 32,
    bounty: 100, // High reward
    armor: 5, // Heavy armor
    resistances: {
      normal: 0,
      fire: 0.8, // Very resistant to fire
      ice: 0.3,
      lightning: 0.4, poison: 0.3,  magic: 0.5 
    },
    image: 'dragon.png',
    description: 'Boss enemy. High HP, armor, and bounty.',
    difficulty: 5,
  },

    Troll: {
    name: 'Troll', health: 220, speed: 45, size: 26,
    bounty: 60, armor: 8,
    resistances: { normal: 0, fire: 0.2, ice: 0.1, lightning: 0.2, poison: 0.2 },
    image: 'troll.png', description: 'Walking fortress. Break it with splash or chain.',
    difficulty: 4,
    rages: false,
  },

  Orc: {
    name: 'Orc', health: 120, speed: 60, size: 22,
    bounty: 35, armor: 2,
    resistances: { normal: 0, fire: 0, ice: 0, lightning: 0, poison: 0.15 },
    image: 'orc.png', description: 'Faster with every wound. Finish it fast.',
    difficulty: 3,
    rages: true,                          // +8% speed per hit taken
    rageFactor: 0.08,
    rageCap: 0.8,                         // max +80%
  },

  EnemyMage: {
    name: 'Enemy Mage', health: 180, speed: 55, size: 20,
    bounty: 80, armor: 0,
    resistances: { normal: 0, fire: 0, ice: 0.2, lightning: 0.25, poison: 0.05, magic: 0.6 },
    image: 'enemy_mage.png', description: 'Shields regen. Attrition, not burst.',
    difficulty: 4,
    shields: { amount: 80, regenPerSecond: 8, delay: 2 },
  },
}

/**
 * Wave difficulty scaling
 * Multipliers applied to enemy stats based on wave number
 */
const WAVE_SCALING = {
  health: (waveNumber) => 1 + (waveNumber - 1) * 0.15, // +15% per wave
  speed: (waveNumber) => 1 + (waveNumber - 1) * 0.08, // +8% per wave
  bounty: (waveNumber) => 1 + (waveNumber - 1) * 0.2, // +20% per wave
};




/**
 * Get configuration for an enemy type
 * @param {string} enemyType - Enemy type name
 * @param {number} waveNumber - Current wave (optional, for scaling)
 * @returns {Object} Enemy configuration with stats
 */
export function getEnemyConfig(enemyType, waveNumber = 1) {
  const baseConfig = ENEMY_TYPES[enemyType]

  if(!baseConfig) {
    console.warn(`Unknown enemy Type: ${enemyType}`);
    return null;
  }

  //clone config
  const config = {...baseConfig};

  //apply wave scaling if wave number provided
  if(waveNumber > 1) {
    const healthMultiplier = WAVE_SCALING.health(waveNumber);

    const speedMultiplier = WAVE_SCALING.speed(waveNumber);

    const bountyMultiplier = WAVE_SCALING.bounty(waveNumber);

    config.health = Math.ceil(baseConfig.health * healthMultiplier);
    config.maxHealth = config.health;
    config.speed = baseConfig.speed * speedMultiplier;
    config.bounty = Math.ceil(baseConfig.bounty * bountyMultiplier);
    if (baseConfig.shields) {
      config.shields = {
        amount: Math.round(baseConfig.shields.amount * healthMultiplier),
        regenPerSecond: baseConfig.shields.regenPerSecond,
        delay: baseConfig.shields.delay,
      };
    }
  } else {
    config.maxHealth = config.health;
  }

  return config;
}

/**
 * Export default config object for direct access
 */
export default {
  ENEMY_TYPES,
  WAVE_SCALING,
  getEnemyConfig,
};