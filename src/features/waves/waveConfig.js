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
    { waveNumber: 1, name: 'Scouts', isBoss: false, baseReward: 50,
      spawnPattern: [{ type: 'Goblin', count: 8, interval: 0.4 }] },

    { waveNumber: 2, name: 'Quick Feet', isBoss: false, baseReward: 60,
      spawnPattern: [
        { type: 'Goblin', count: 6, interval: 0.35 },
        { type: 'Hobbit', count: 6, interval: 0.2 }] },

    { waveNumber: 3, name: 'First Riddle', isBoss: false, baseReward: 70,   // intro Mage
      spawnPattern: [
        { type: 'EnemyMage', count: 2, interval: 1.2 },
        { type: 'Goblin', count: 6, interval: 0.3 }] },

    { waveNumber: 4, name: 'Rage Warning', isBoss: false, baseReward: 80,   // intro Orc
      spawnPattern: [
        { type: 'Orc', count: 4, interval: 0.7 },
        { type: 'Goblin', count: 6, interval: 0.3 }] },

    { waveNumber: 5, name: 'The Wall', isBoss: true, baseReward: 250,       // intro Troll (boss-wave pacing)
      spawnPattern: [
        { type: 'Troll', count: 2, interval: 2.5 },
        { type: 'Orc', count: 3, interval: 0.6 },
        { type: 'Goblin', count: 8, interval: 0.25 }] },

    { waveNumber: 6, name: 'Mixed Doubles', isBoss: false, baseReward: 150,
      spawnPattern: [
        { type: 'Dwarve', count: 8, interval: 0.4 },
        { type: 'Elve', count: 6, interval: 0.3 },
        { type: 'Orc', count: 4, interval: 0.5 }] },

    { waveNumber: 7, name: 'Casters\' Council', isBoss: false, baseReward: 170,
      spawnPattern: [
        { type: 'EnemyMage', count: 4, interval: 1.0 },
        { type: 'Elve', count: 8, interval: 0.3 }] },

    { waveNumber: 8, name: 'Fortress', isBoss: false, baseReward: 200,
      spawnPattern: [
        { type: 'Troll', count: 3, interval: 2.0 },
        { type: 'Dwarve', count: 10, interval: 0.35 }] },

    { waveNumber: 9, name: 'Everything, Angry', isBoss: false, baseReward: 220,
      spawnPattern: [
        { type: 'Orc', count: 8, interval: 0.4 },
        { type: 'EnemyMage', count: 3, interval: 1.2 },
        { type: 'Elve', count: 10, interval: 0.25 },
        { type: 'Goblin', count: 10, interval: 0.2 }] },

    { waveNumber: 10, name: 'Dragons\' Court', isBoss: true, baseReward: 500,
      spawnPattern: [
        { type: 'Dragon', count: 2, interval: 3.0 },
        { type: 'Troll', count: 2, interval: 2.5 },
        { type: 'EnemyMage', count: 4, interval: 1.0 },
        { type: 'Orc', count: 6, interval: 0.4 },
        { type: 'Hobbit', count: 20, interval: 0.15 }] },
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
  const bossMult = config.isBoss ? 2 : 1;
  return (config.baseReward + waveNumber * 10) * bossMult;
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
    description += ' (Boss Wave!)';
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