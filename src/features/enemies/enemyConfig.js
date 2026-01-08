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
    },
    image: 'dragon.png',
    description: 'Boss enemy. High HP, armor, and bounty.',
    difficulty: 5,
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
 * Enemy spawning templates for waves
 * Defines what enemies spawn in each wave
 */
const WAVE_TEMPLATES = {
  1: [
    { type: 'Goblin', count: 5, spawnDelay: 0.5 },
  ],

  2: [
    { type: 'Goblin', count: 8, spawnDelay: 0.4 },
    { type: 'Hobbit', count: 3, spawnDelay: 0.3 },
  ],

  3: [
    { type: 'Goblin', count: 5, spawnDelay: 0.5 },
    { type: 'Dwarve', count: 3, spawnDelay: 0.6 },
    { type: 'Elve', count: 2, spawnDelay: 0.4 },
  ],

  4: [
    { type: 'Dwarve', count: 6, spawnDelay: 0.5 },
    { type: 'Elve', count: 4, spawnDelay: 0.4 },
    { type: 'Hobbit', count: 5, spawnDelay: 0.3 },
  ],

  5: [
    { type: 'Elve', count: 8, spawnDelay: 0.35 },
    { type: 'Dragon', count: 1, spawnDelay: 1.0 },
  ],
};

/**
 * Status effect configs
 * How different effects impact enemies
 */
const STATUS_EFFECTS = {
  slow: {
    slowFactor: 0.5, // 50% speed
    duration: 3, // seconds
    stackable: true, // Can stack multiple slows
  },
  stun: {
    duration: 1.5, // seconds
    stackable: false, // Only one stun at a time
  },
  burn: {
    damagePerSecond: 5,
    duration: 4, // seconds
    stackable: true, // Can stack multiple burns
  },
  freeze: {
    slowFactor: 0, // Complete stop
    duration: 2, // seconds
    stackable: false, // Replaces other slows
  },
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
  } else {
    config.maxHealth = config.health;
  }

  return config;
}

/**
 * Get all available enemy types
 * @returns {Array<string>} Array of enemy type names
 */
export function getEnemyTypes() {
  return Object.keys(ENEMY_TYPES);
}

/**
 * Get enemies for a specific wave
 * @param {number} waveNumber - Wave number (1-indexed)
 * @returns {Array<Object>} Array of enemy spawn configs
 */
export function getWaveEnemies(waveNumber) {
  const template = WAVE_TEMPLATES[waveNumber];

  if(!template) {
    console.warn(`No template for wave ${waveNumber}, generating random wave`);
    return generateRandomWave(waveNumber);
  }
  //apply wave scaling to each enemy type
  return template.map(spawn => ({
    ...spawn,
    config: getEnemyConfig(spawn.type, waveNumber),
  }));
}

/**
 * Generate a random wave for unknown wave numbers
 * @private
 */
function generateRandomWave(waveNumber) {
  const enemyTypes = getEnemyTypes();
  const enemyCount = 3 + waveNumber;
  const spawns = [];

  for(let i = 0; i < enemyCount; i++) {
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    spawns.push({
      type: randomType,
      count: 1,
      spawnDelay: 0.5,
      config: getEnemyConfig(randomType, waveNumber),
    });
  }

  return spawns
}

/**
 * Get configuration for a status effect
 * @param {string} effectType - Effect name (slow, stun, burn, freeze)
 * @returns {Object} Effect configuration
 */
export function getStatusEffectConfig(effectType) {
  return STATUS_EFFECTS[effectType] || null;
}

/**
 * Get total difficulty rating for a wave
 * Useful for balancing progression
 * @param {number} waveNumber - Wave number
 * @returns {number} Difficulty score
 */
export function getWaveDifficulty(waveNumber) {
  const enemies = getWaveEnemies(waveNumber);
  let totalDifficulty = 0;

  enemies.forEach(spawn => {
    const baseType = ENEMY_TYPES[spawn.type];
    totalDifficulty += (baseType.difficulty * spawn.count);
  });

  return totalDifficulty
}

/**
 * Get estimated bounty for completing a wave
 * @param {number} waveNumber - Wave number
 * @returns {number} Total bounty possible
 */
export function getWaveBounty(waveNumber) {
  const enemies = getWaveEnemies(waveNumber);
  let totalBounty = 0;

  enemies.forEach(spawn => {
    const config = spawn.config;
    totalBounty += (config.bounty * spawn.count);
  });

  return totalBounty;
}

/**
 * Balance check - log all waves and their stats
 * Useful for difficulty tuning
 */
export function logBalanceReport (waves = 5) {
  console.log('=== GAME BALANCE REPORT ===');

  for(let i = 1; i <= waves; i++) {
    const enemies = getWaveEnemies(i);
    const difficulty = getWaveDifficulty(i);
    const bounty = getWaveBounty(i);

    console.log(`Wave ${i}:`);
    console.log(`  Difficulty: ${difficulty}`);
    console.log(`  Total Bounty: ${bounty}`);
    console.log(`  Enemy Composition:`);

    const breakdown = {};
    enemies.forEach(spawn => {
      breakdown[spawn.type] = (breakdown[spawn.type] || 0) + spawn.count;
    });

    Object.entries(breakdown).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}x`);
    });
  }

  console.log('=======================');
}

/**
 * Export default config object for direct access
 */
export default {
  ENEMY_TYPES,
  WAVE_SCALING,
  WAVE_TEMPLATES,
  STATUS_EFFECTS,
  getEnemyConfig,
  getEnemyTypes,
  getWaveEnemies,
  getStatusEffectConfig,
  getWaveDifficulty,
  getWaveBounty,
  logBalanceReport,
};