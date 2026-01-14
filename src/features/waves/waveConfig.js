/**
 * Wave Configuration
 * Defines wave progression, enemy compositions, and difficulty scaling.
 * 
 * Wave System:
 * - 10 waves total
 * - Each wave has multiple enemy spawns
 * - Scaling: health +15%, speed +8%, bounty +20% per wave
 * - Boss waves at wave 5 and 10
 */

export const WAVE_CONFIG = {
  // Total number of waves
  totalWaves: 10,

  // Base spawn interval (seconds between enemy spawns)
  baseSpawnInterval: 0.5,

  // Waves array - each defines enemies to spawn
  waves: [
    {
      waveNumber: 1,
      name: 'Goblin Rush',
      description: 'A swarm of weak goblins',
      spawnPattern: [
        { type: 'goblin', count: 8, interval: 0.3 },
      ],
      isBoss: false,
      baseReward: 50,
    },

    {
      waveNumber: 2,
      name: 'Mixed Forces',
      description: 'Goblins and Dwarves',
      spawnPattern: [
        { type: 'goblin', count: 6, interval: 0.4 },
        { type: 'dwarve', count: 3, interval: 0.5 },
      ],
      isBoss: false,
      baseReward: 80,
    },

    {
      waveNumber: 3,
      name: 'Elven Archers',
      description: 'Fast and deadly elves',
      spawnPattern: [
        { type: 'elve', count: 7, interval: 0.3 },
        { type: 'goblin', count: 4, interval: 0.4 },
      ],
      isBoss: false,
      baseReward: 100,
    },

    {
      waveNumber: 4,
      name: 'Hobbits Invasion',
      description: 'Fastest enemies yet',
      spawnPattern: [
        { type: 'hobbit', count: 10, interval: 0.2 },
        { type: 'elve', count: 4, interval: 0.5 },
      ],
      isBoss: false,
      baseReward: 120,
    },

    {
      waveNumber: 5,
      name: 'Dragon Awakens!',
      description: 'A powerful boss dragon',
      spawnPattern: [
        { type: 'hobbit', count: 5, interval: 0.3 },
        { type: 'dragon', count: 1, interval: 2.0 },
        { type: 'dwarve', count: 3, interval: 0.5 },
      ],
      isBoss: true,
      baseReward: 250,
    },

    {
      waveNumber: 6,
      name: 'Veteran Mix',
      description: 'Stronger versions of previous enemies',
      spawnPattern: [
        { type: 'dwarve', count: 8, interval: 0.4 },
        { type: 'elve', count: 6, interval: 0.3 },
        { type: 'goblin', count: 4, interval: 0.5 },
      ],
      isBoss: false,
      baseReward: 150,
    },

    {
      waveNumber: 7,
      name: 'Speedster Wave',
      description: 'All fast enemies',
      spawnPattern: [
        { type: 'hobbit', count: 15, interval: 0.2 },
        { type: 'elve', count: 8, interval: 0.3 },
      ],
      isBoss: false,
      baseReward: 180,
    },

    {
      waveNumber: 8,
      name: 'Tanker Formation',
      description: 'Heavy hitters',
      spawnPattern: [
        { type: 'dragon', count: 1, interval: 1.5 },
        { type: 'dwarve', count: 12, interval: 0.3 },
        { type: 'goblin', count: 8, interval: 0.4 },
      ],
      isBoss: false,
      baseReward: 200,
    },

    {
      waveNumber: 9,
      name: 'Chaos Storm',
      description: 'Everything at once',
      spawnPattern: [
        { type: 'hobbit', count: 12, interval: 0.2 },
        { type: 'elve', count: 10, interval: 0.3 },
        { type: 'dwarve', count: 6, interval: 0.4 },
        { type: 'goblin', count: 8, interval: 0.5 },
      ],
      isBoss: false,
      baseReward: 220,
    },

    {
      waveNumber: 10,
      name: 'Final Boss: Two Dragons',
      description: 'The ultimate challenge',
      spawnPattern: [
        { type: 'dragon', count: 2, interval: 3.0 },
        { type: 'dwarve', count: 15, interval: 0.3 },
        { type: 'elve', count: 12, interval: 0.3 },
        { type: 'hobbit', count: 20, interval: 0.2 },
      ],
      isBoss: true,
      baseReward: 500,
    },
  ],
};

/**
 * Get wave configuration by wave number
 * @param {number} waveNumber - Wave number (1-10)
 * @returns {Object} Wave configuration
 */
export function getWaveConfig(waveNumber) {
  if (waveNumber < 1 || waveNumber > WAVE_CONFIG.totalWaves) {
    return null;
  }

  return WAVE_CONFIG.waves[waveNumber - 1];
}

/**
 * Get spawn interval with difficulty scaling
 * @param {number} waveNumber - Wave number
 * @returns {number} Spawn interval in seconds
 */
export function getSpawnInterval(waveNumber) {
  // Spawn gets slightly faster each wave (up to wave 10)
  const speedMultiplier = 1 - (waveNumber - 1) * 0.03; // 3% faster per wave
  return Math.max(0.1, WAVE_CONFIG.baseSpawnInterval * speedMultiplier);
}

/**
 * Get total enemy count for wave
 * @param {number} waveNumber - Wave number
 * @returns {number} Total enemies to spawn
 */
export function getWaveEnemyCount(waveNumber) {
  const config = getWaveConfig(waveNumber);
  if (!config) return 0;

  return config.spawnPattern.reduce((total, spawn) => total + spawn.count, 0);
}

/**
 * Get total reward for wave
 * @param {number} waveNumber - Wave number
 * @returns {number} Total gold bounty
 */
export function getWaveReward(waveNumber) {
  const config = getWaveConfig(waveNumber);
  if (!config) return 0;

  // Scale reward: +20% per wave
  const scaledReward = config.baseReward * Math.pow(1.2, waveNumber - 1);
  return Math.floor(scaledReward);
}

/**
 * Get wave difficulty score
 * @param {number} waveNumber - Wave number
 * @returns {number} Difficulty score (for UI display)
 */
export function getWaveDifficulty(waveNumber) {
  if (waveNumber < 1 || waveNumber > WAVE_CONFIG.totalWaves) return 0;

  // Simple difficulty: increases with wave number and complexity
  const baseScore = waveNumber * 10;
  const config = getWaveConfig(waveNumber);
  const spawnCount = config.spawnPattern.length;

  return baseScore + spawnCount * 5;
}

/**
 * Check if wave is a boss wave
 * @param {number} waveNumber - Wave number
 * @returns {boolean} Is boss wave
 */
export function isBossWave(waveNumber) {
  const config = getWaveConfig(waveNumber);
  return config && config.isBoss;
}

/**
 * Get wave description for UI
 * @param {number} waveNumber - Wave number
 * @returns {string} Wave description
 */
export function getWaveDescription(waveNumber) {
  const config = getWaveConfig(waveNumber);
  if (!config) return 'Unknown wave';

  let description = config.description;

  if (config.isBoss) {
    description += ' ⚠️';
  }

  return description;
}

/**
 * Log balance report for all waves
 * @param {number} maxWaves - Max waves to report
 */
export function logWaveBalanceReport(maxWaves = WAVE_CONFIG.totalWaves) {
  console.log('========== WAVE BALANCE REPORT ==========');

  for (let w = 1; w <= maxWaves; w++) {
    const config = getWaveConfig(w);
    const enemyCount = getWaveEnemyCount(w);
    const reward = getWaveReward(w);
    const difficulty = getWaveDifficulty(w);

    console.log(
      `Wave ${String(w).padStart(2)} | ${config.name.padEnd(20)} | Enemies: ${String(enemyCount).padStart(3)} | Reward: ${String(reward).padStart(4)} | Difficulty: ${String(difficulty).padStart(3)}`
    );
  }

  console.log('\n=========================================');
}