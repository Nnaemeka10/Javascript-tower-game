/**
 * economyConfig.js
 * Centralized economy configuration including costs, bounties, and scaling.
 * All monetary values tied to game balance parameters.
 */

// ============================================
// TOWER COSTS
// ============================================

export const TOWER_COSTS = {
  archer: 50,      // Basic tower, low cost
  mage: 150,       // Area damage, high cost
  cannon: 200,     // Powerful single target, highest cost
  frost: 120,      // Utility tower (slow), mid cost
  alchemist: 140,  // Poison/DoT tower, mid cost
  tesla: 180,      // Chain lightning, high cost
};

/**
 * Get tower cost by type
 * @param {string} towerType
 * @returns {number} Cost in gold
 */
export function getTowerCost(towerType) {
  const cost = TOWER_COSTS[towerType];
  if (cost === undefined) {
    console.warn(`❌ Tower type "${towerType}" not found in TOWER_COSTS`);
    return 0;
  }
  return cost;
}

/**
 * Get upgrade cost for a tower (scales with level)
 * @param {number} currentLevel - Current tower level (1-10)
 * @param {number} baseCost - Base tower cost
 * @returns {number} Upgrade cost
 */
export function getUpgradeCost(currentLevel, baseCost) {
  if (currentLevel >= 10) return 0; // Max level
  // Upgrade cost scales: 30% of base per level
  return Math.ceil(baseCost * 0.3 * (currentLevel + 1));
}

// ============================================
// ENEMY BOUNTIES
// ============================================

export const ENEMY_BOUNTIES = {
  goblin: 10,      // Weak, low reward
  dwarve: 20,      // Medium, mid reward
  elve: 15,        // Fast but weak
  hobbit: 8,       // Very weak, lowest reward
  dragon: 100,     // Boss, high reward
};

/**
 * Get base bounty for enemy type
 * @param {string} enemyType
 * @returns {number} Base bounty in gold
 */
export function getEnemyBounty(enemyType) {
  const bounty = ENEMY_BOUNTIES[enemyType];
  if (bounty === undefined) {
    console.warn(`❌ Enemy type "${enemyType}" not found in ENEMY_BOUNTIES`);
    return 0;
  }
  return bounty;
}

/**
 * Get scaled bounty for a wave
 * @param {string} enemyType
 * @param {number} waveNumber - Current wave (1-10)
 * @returns {number} Scaled bounty
 */
export function getScaledBounty(enemyType, waveNumber = 1) {
  const baseBounty = getEnemyBounty(enemyType);
  // Scale bounty: +20% per wave (1.2^(waveNumber-1))
  const multiplier = Math.pow(1.2, Math.max(0, waveNumber - 1));
  return Math.ceil(baseBounty * multiplier);
}

// ============================================
// WAVE REWARDS
// ============================================

export const WAVE_REWARDS = {
  completionBonus: 50,  // Bonus for completing a wave
  bossBonus: 200,       // Extra bonus for boss waves
};

/**
 * Get reward for completing a wave
 * @param {number} waveNumber - Wave number (1-10)
 * @param {boolean} isBossWave - Is this a boss wave?
 * @returns {number} Completion reward
 */
export function getWaveCompletionReward(waveNumber, isBossWave = false) {
  let reward = WAVE_REWARDS.completionBonus;
  
  // Add scaling based on wave difficulty
  reward += Math.ceil(waveNumber * 5);
  
  // Double reward for boss waves
  if (isBossWave) {
    reward += WAVE_REWARDS.bossBonus;
  }
  
  return reward;
}

// ============================================
// DIFFICULTY SCALING
// ============================================

export const DIFFICULTY_MULTIPLIERS = {
  easy: {
    incomeMultiplier: 1.5,        // +50% income
    towerCostMultiplier: 0.8,     // -20% tower cost
    enemyBountyMultiplier: 1.2,   // +20% bounties
  },
  normal: {
    incomeMultiplier: 1.0,        // Normal income
    towerCostMultiplier: 1.0,     // Normal cost
    enemyBountyMultiplier: 1.0,   // Normal bounty
  },
  hard: {
    incomeMultiplier: 0.7,        // -30% income
    towerCostMultiplier: 1.3,     // +30% tower cost
    enemyBountyMultiplier: 0.8,   // -20% bounties
  },
};

/**
 * Get difficulty multipliers
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {Object} Multipliers {incomeMultiplier, towerCostMultiplier, enemyBountyMultiplier}
 */
export function getDifficultyMultipliers(difficulty = 'normal') {
  const multipliers = DIFFICULTY_MULTIPLIERS[difficulty];
  if (!multipliers) {
    console.warn(`❌ Difficulty "${difficulty}" not found, using "normal"`);
    return DIFFICULTY_MULTIPLIERS.normal;
  }
  return multipliers;
}

// ============================================
// ECONOMY CONSTANTS
// ============================================

export const ECONOMY_CONFIG = {
  // Starting resources
  startingMoney: 500,
  startingLives: 20,
  
  // Income
  passiveIncomePerSecond: 1,         // Passive income (optional passive tower income)
  killStreakBonus: true,             // Bonus for rapid kills
  killStreakWindow: 2,               // Window in seconds for kill streak
  killStreakMinKills: 3,             // Min kills for bonus
  killStreakBonusPerKill: 5,         // Bonus per kill in streak
  
  // Penalties
  loseLifePenalty: 0,                // Money lost per life (0 = none)
  
  // Money caps (optional)
  maxMoney: 99999,                   // Max money cap (prevents overflow)
  minMoney: 0,                       // Min money (can't go negative)
  
  // Transaction logging
  enableTransactionLog: false,       // Log every money transaction
  
  // Scaling
  waveMoneyScaling: 1.1,            // Money rewards increase by 10% per wave
};

/**
 * Calculate adjusted tower cost with difficulty
 * @param {string} towerType
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {number} Adjusted cost
 */
export function getAdjustedTowerCost(towerType, difficulty = 'normal') {
  const baseCost = getTowerCost(towerType);
  const { towerCostMultiplier } = getDifficultyMultipliers(difficulty);
  return Math.ceil(baseCost * towerCostMultiplier);
}

/**
 * Calculate adjusted bounty with difficulty
 * @param {string} enemyType
 * @param {number} waveNumber
 * @param {string} difficulty
 * @returns {number} Adjusted bounty
 */
export function getAdjustedBounty(enemyType, waveNumber = 1, difficulty = 'normal') {
  const baseBounty = getScaledBounty(enemyType, waveNumber);
  const { enemyBountyMultiplier } = getDifficultyMultipliers(difficulty);
  return Math.ceil(baseBounty * enemyBountyMultiplier);
}

/**
 * Get economy balance report (for debugging)
 * @returns {Object}
 */
export function getEconomyBalanceReport() {
  return {
    towerCosts: TOWER_COSTS,
    enemyBounties: ENEMY_BOUNTIES,
    waveRewards: WAVE_REWARDS,
    upgradeExamples: {
      archerLevel1to2: getUpgradeCost(1, TOWER_COSTS.archer),
      archerLevel5to6: getUpgradeCost(5, TOWER_COSTS.archer),
      archerLevel10: getUpgradeCost(10, TOWER_COSTS.archer),
    },
    scaledBounties: {
      goblinWave1: getScaledBounty('goblin', 1),
      goblinWave5: getScaledBounty('goblin', 5),
      goblinWave10: getScaledBounty('goblin', 10),
      dragonWave5: getScaledBounty('dragon', 5),
      dragonWave10: getScaledBounty('dragon', 10),
    },
    waveCompletionRewards: {
      wave1: getWaveCompletionReward(1, false),
      wave5: getWaveCompletionReward(5, true),
      wave10: getWaveCompletionReward(10, true),
    },
  };
}

/**
 * Log economy balance report to console
 */
export function logEconomyBalanceReport() {
  const report = getEconomyBalanceReport();
  console.log('=== ECONOMY BALANCE REPORT ===');
  console.log('Tower Costs:', report.towerCosts);
  console.log('Enemy Bounties:', report.enemyBounties);
  console.log('Upgrade Costs:', report.upgradeExamples);
  console.log('Scaled Bounties (Wave Scaling):', report.scaledBounties);
  console.log('Wave Completion Rewards:', report.waveCompletionRewards);
  console.log('Difficulty Multipliers:', DIFFICULTY_MULTIPLIERS);
  console.log('==============================');
}