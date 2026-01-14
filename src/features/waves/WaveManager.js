/**
 * Wave Manager
 * Manages wave progression, enemy spawning, and wave lifecycle.
 * 
 * Responsibilities:
 * - Track current wave and progress
 * - Spawn enemies according to wave pattern
 * - Handle wave completion and transitions
 * - Manage spawn timing and intervals
 */

import { WAVE_CONFIG, getWaveConfig, getSpawnInterval, getWaveReward } from './waveConfig.js';

class WaveManager {
  constructor() {
    // Wave state
    this.currentWave = 0;
    this.totalWaves = WAVE_CONFIG.totalWaves;
    this.isWaveActive = false;
    this.waveStartTime = 0;
    this.waveElapsedTime = 0;

    // Spawn management
    this.nextSpawnTime = 0;
    this.currentSpawnIndex = 0; // Which spawn group in wave
    this.currentSpawnCount = 0; // How many enemies spawned in current group
    this.allEnemiesSpawned = false;

    // Statistics
    this.enemiesSpawnedThisWave = 0;
    this.waveStartedCount = 0;
    this.waveCompletedCount = 0;

    // State
    this.isInitialized = false;
  }

  /**
   * Initialize wave manager
   */
  async initialize() {
    console.log('🌊 WaveManager initializing...');

    this.currentWave = 1;
    this.isInitialized = true;

    console.log('✅ WaveManager initialized');
  }

  /**
   * Start current wave
   * @param {EnemyManager} enemyManager - To spawn enemies
   * @param {GameState} gameState - For state updates
   */
  startWave(enemyManager, gameState) {
    if (this.currentWave > this.totalWaves) {
      console.warn('⚠️ All waves already completed');
      return;
    }

    this.isWaveActive = true;
    this.waveStartTime = 0;
    this.waveElapsedTime = 0;
    this.nextSpawnTime = 0;
    this.currentSpawnIndex = 0;
    this.currentSpawnCount = 0;
    this.allEnemiesSpawned = false;
    this.enemiesSpawnedThisWave = 0;
    this.waveStartedCount++;

    gameState.setCurrentWave(this.currentWave);
    gameState.startWave();

    const waveConfig = getWaveConfig(this.currentWave);
    console.log(`🌊 Wave ${this.currentWave} started: ${waveConfig.name}`);
  }

  /**
   * Update wave logic
   * @param {number} deltaTime - Time since last update
   * @param {EnemyManager} enemyManager - To spawn enemies
   * @param {GameState} gameState - For state updates
   * @returns {Array} Spawned enemies
   */
  update(deltaTime, enemyManager, gameState) {
    if (!this.isInitialized || !this.isWaveActive) {
      return [];
    }

    this.waveElapsedTime += deltaTime;
    this.nextSpawnTime -= deltaTime;

    const spawnedEnemies = [];
    const waveConfig = getWaveConfig(this.currentWave);

    if (!waveConfig) {
      console.error('❌ Invalid wave config');
      return [];
    }

    // Process spawning
    while (
      this.nextSpawnTime <= 0 &&
      this.currentSpawnIndex < waveConfig.spawnPattern.length &&
      !this.allEnemiesSpawned
    ) {
      const spawnGroup = waveConfig.spawnPattern[this.currentSpawnIndex];

      // Spawn one enemy from current group
      if (this.currentSpawnCount < spawnGroup.count) {
        const enemy = enemyManager.spawnEnemy(spawnGroup.type);

        if (enemy) {
          spawnedEnemies.push(enemy);
          this.enemiesSpawnedThisWave++;
          this.currentSpawnCount++;

          // Reset timer for next spawn
          const spawnInterval = spawnGroup.interval;
          this.nextSpawnTime = spawnInterval;
        }
      }

      // Move to next spawn group if current is complete
      if (this.currentSpawnCount >= spawnGroup.count) {
        this.currentSpawnIndex++;
        this.currentSpawnCount = 0;
      }
    }

    // All enemies spawned
    if (
      this.currentSpawnIndex >= waveConfig.spawnPattern.length &&
      !this.allEnemiesSpawned
    ) {
      this.allEnemiesSpawned = true;
      console.log(`✓ All enemies spawned for wave ${this.currentWave}`);
    }

    return spawnedEnemies;
  }

  /**
   * Complete current wave
   * @param {GameState} gameState - For state updates
   * @returns {number} Reward money
   */
  completeWave(gameState) {
    if (!this.isWaveActive) {
      return 0;
    }

    this.isWaveActive = false;
    this.waveCompletedCount++;

    const reward = getWaveReward(this.currentWave);

    gameState.addMoney(reward);
    gameState.completeWave();

    console.log(`🎉 Wave ${this.currentWave} completed! Earned ${reward} gold`);

    // Move to next wave
    if (this.currentWave < this.totalWaves) {
      this.currentWave++;
      return reward;
    } else {
      // All waves completed
      console.log('✨ All waves completed! You win!');
      return reward;
    }
  }

  /**
   * Skip to next wave (for testing)
   * @param {EnemyManager} enemyManager - To clear enemies
   * @param {GameState} gameState - For state updates
   */
  skipToNextWave(enemyManager, gameState) {
    if (this.isWaveActive) {
      this.completeWave(gameState);
    }

    if (this.currentWave < this.totalWaves) {
      this.startWave(enemyManager, gameState);
    }
  }

  /**
   * Get current wave config
   * @returns {Object} Wave configuration
   */
  getCurrentWaveConfig() {
    return getWaveConfig(this.currentWave);
  }

  /**
   * Check if current wave is active
   * @returns {boolean}
   */
  isCurrentWaveActive() {
    return this.isWaveActive;
  }

  /**
   * Check if all waves are completed
   * @returns {boolean}
   */
  isAllWavesComplete() {
    return this.currentWave > this.totalWaves && !this.isWaveActive;
  }

  /**
   * Get current wave number
   * @returns {number}
   */
  getCurrentWave() {
    return this.currentWave;
  }

  /**
   * Get total waves
   * @returns {number}
   */
  getTotalWaves() {
    return this.totalWaves;
  }

  /**
   * Get wave progress (0-1)
   * @returns {number}
   */
  getWaveProgress() {
    if (!this.isWaveActive) return 0;

    const waveConfig = getWaveConfig(this.currentWave);
    if (!waveConfig) return 0;

    const totalSpawns = waveConfig.spawnPattern.reduce(
      (sum, group) => sum + group.count,
      0
    );

    return Math.min(1, this.enemiesSpawnedThisWave / totalSpawns);
  }

  /**
   * Get time elapsed in current wave
   * @returns {number}
   */
  getWaveElapsedTime() {
    return this.waveElapsedTime;
  }

  /**
   * Reset wave manager (for game reset)
   */
  reset() {
    this.currentWave = 1;
    this.isWaveActive = false;
    this.waveElapsedTime = 0;
    this.nextSpawnTime = 0;
    this.currentSpawnIndex = 0;
    this.currentSpawnCount = 0;
    this.allEnemiesSpawned = false;
    this.enemiesSpawnedThisWave = 0;

    console.log('🔄 Wave manager reset');
  }

  /**
   * Get manager statistics
   * @returns {Object}
   */
  getStatistics() {
    return {
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      isActive: this.isWaveActive,
      enemiesSpawned: this.enemiesSpawnedThisWave,
      wavesCompleted: this.waveCompletedCount,
      wavesStarted: this.waveStartedCount,
    };
  }

  /**
   * Get manager snapshot for debugging
   * @returns {Object}
   */
  getSnapshot() {
    return {
      initialized: this.isInitialized,
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      isActive: this.isWaveActive,
      elapsedTime: this.waveElapsedTime.toFixed(2),
      enemiesSpawned: this.enemiesSpawnedThisWave,
      progress: (this.getWaveProgress() * 100).toFixed(1),
      statistics: this.getStatistics(),
    };
  }
}

export default WaveManager;