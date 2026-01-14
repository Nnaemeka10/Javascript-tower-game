/**
 * MoneyManager.js
 * Manages player economy: money, transactions, scaling, and statistics.
 * Tracks income, expenses, and provides economic state queries.
 */

import {
  ECONOMY_CONFIG,
  getTowerCost,
  getEnemyBounty,
  getScaledBounty,
  getWaveCompletionReward,
  getUpgradeCost,
  getDifficultyMultipliers,
  getAdjustedTowerCost,
  getAdjustedBounty,
} from './economyConfig.js';

class MoneyManager {
  /**
   * @param {number} startingMoney - Initial money (default: from config)
   * @param {string} difficulty - Game difficulty ('easy', 'normal', 'hard')
   */
  constructor(startingMoney = ECONOMY_CONFIG.startingMoney, difficulty = 'normal') {
    // Current resources
    this.currentMoney = startingMoney;
    this.startingMoney = startingMoney;

    // Difficulty
    this.difficulty = difficulty;
    this.difficultyMultipliers = getDifficultyMultipliers(difficulty);

    // Transactions
    this.transactionLog = [];
    this.maxTransactionHistory = 100; // Keep last 100 transactions

    // Statistics
    this.stats = {
      totalEarned: 0,          // Total money earned
      totalSpent: 0,           // Total money spent on towers
      totalBounties: 0,        // Total money from enemy kills
      totalWaveRewards: 0,     // Total from wave completion bonuses
      totalUpgradeCosts: 0,    // Total spent on upgrades
      totalRepairCosts: 0,     // Total spent on repairs
      killStreak: 0,           // Current kill streak count
      lastKillTime: 0,         // Timestamp of last kill
      maxMoneyReached: startingMoney,  // Highest money achieved
      transactions: 0,         // Total transaction count
    };

    // Passive income
    this.lastPassiveIncomeTime = Date.now();
    this.passiveIncomeEnabled = false;

    console.log(`💰 MoneyManager created (difficulty: ${difficulty}, starting: $${startingMoney})`);
  }


  /**
     * Initialize the money manager
     * Lifecycle hook for GameEngine
    */
  async initialize() {
    console.log('💰 MoneyManager initialized');
  }

  // ============================================
  // TRANSACTION METHODS
  // ============================================

  /**
   * Add money (income from kills, bonuses, etc)
   * @param {number} amount - Amount to add
   * @param {string} source - Source description (kill, wave, bonus, etc)
   * @returns {boolean} Success
   */
  addMoney(amount, source = 'income') {
    if (amount <= 0) {
      console.warn(`⚠️ Attempted to add invalid amount: ${amount}`);
      return false;
    }

    this.currentMoney += amount;

    // Track max money reached
    if (this.currentMoney > this.stats.maxMoneyReached) {
      this.stats.maxMoneyReached = this.currentMoney;
    }

    // Cap max money
    if (this.currentMoney > ECONOMY_CONFIG.maxMoney) {
      this.currentMoney = ECONOMY_CONFIG.maxMoney;
    }

    // Update statistics
    this.stats.totalEarned += amount;
    this.stats.transactions++;

    // Log transaction
    this.logTransaction({
      type: 'income',
      source,
      amount,
      balanceBefore: this.currentMoney - amount,
      balanceAfter: this.currentMoney,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Spend money (towers, upgrades, repairs)
   * @param {number} amount - Amount to spend
   * @param {string} purpose - Purpose description (tower, upgrade, repair, etc)
   * @returns {boolean} Success if sufficient funds
   */
  spendMoney(amount, purpose = 'expense') {
    if (amount <= 0) {
      console.warn(`⚠️ Attempted to spend invalid amount: ${amount}`);
      return false;
    }

    if (this.currentMoney < amount) {
      console.warn(`💸 Insufficient funds: have $${this.currentMoney}, need $${amount}`);
      return false;
    }

    this.currentMoney -= amount;

    // Update statistics
    this.stats.totalSpent += amount;
    this.stats.transactions++;

    // Category-specific stats
    if (purpose === 'upgrade') {
      this.stats.totalUpgradeCosts += amount;
    } else if (purpose === 'repair') {
      this.stats.totalRepairCosts += amount;
    }

    // Log transaction
    this.logTransaction({
      type: 'expense',
      purpose,
      amount,
      balanceBefore: this.currentMoney + amount,
      balanceAfter: this.currentMoney,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Award money from killing an enemy
   * @param {string} enemyType - Enemy type
   * @param {number} waveNumber - Current wave
   * @returns {number} Money awarded
   */
  awardEnemyBounty(enemyType, waveNumber = 1) {
    const bounty = getAdjustedBounty(enemyType, waveNumber, this.difficulty);
    this.addMoney(bounty, `kill:${enemyType}`);
    this.stats.totalBounties += bounty;

    // Update kill streak
    const now = Date.now();
    if (now - this.stats.lastKillTime < ECONOMY_CONFIG.killStreakWindow * 1000) {
      this.stats.killStreak++;
      
      // Bonus for kill streaks
      if (this.stats.killStreak >= ECONOMY_CONFIG.killStreakMinKills) {
        const streakBonus = ECONOMY_CONFIG.killStreakBonusPerKill * (this.stats.killStreak - ECONOMY_CONFIG.killStreakMinKills + 1);
        this.addMoney(streakBonus, `streak:${this.stats.killStreak}`);
      }
    } else {
      this.stats.killStreak = 1; // Reset streak
    }
    this.stats.lastKillTime = now;

    return bounty;
  }

  /**
   * Award wave completion bonus
   * @param {number} waveNumber - Wave number
   * @param {boolean} isBossWave - Is this a boss wave?
   * @returns {number} Money awarded
   */
  awardWaveCompletion(waveNumber, isBossWave = false) {
    const reward = getWaveCompletionReward(waveNumber, isBossWave);
    this.addMoney(reward, `wave:${waveNumber}${isBossWave ? ':boss' : ''}`);
    this.stats.totalWaveRewards += reward;
    return reward;
  }

  /**
   * Log a transaction (for history/debugging)
   * @private
   */
  logTransaction(transaction) {
    if (!ECONOMY_CONFIG.enableTransactionLog) return;

    this.transactionLog.push(transaction);

    // Keep only recent transactions
    if (this.transactionLog.length > this.maxTransactionHistory) {
      this.transactionLog.shift();
    }
  }

  // ============================================
  // COST CALCULATION METHODS
  // ============================================

  /**
   * Get tower placement cost with difficulty applied
   * @param {string} towerType
   * @returns {number} Cost in gold
   */
  getTowerPlacementCost(towerType) {
    return getAdjustedTowerCost(towerType, this.difficulty);
  }

  /**
   * Get upgrade cost for a tower
   * @param {string} towerType
   * @param {number} currentLevel
   * @returns {number} Upgrade cost
   */
  getTowerUpgradeCost(towerType, currentLevel) {
    const baseCost = getTowerCost(towerType);
    const upgradeCost = getUpgradeCost(currentLevel, baseCost);
    
    // Apply difficulty multiplier
    const { towerCostMultiplier } = this.difficultyMultipliers;
    return Math.ceil(upgradeCost * towerCostMultiplier);
  }

  /**
   * Get repair cost for a tower (estimate: 20% of tower cost per missing health point)
   * @param {string} towerType
   * @param {number} damageTaken - Health points to restore
   * @returns {number} Repair cost
   */
  getTowerRepairCost(towerType, damageTaken) {
    const towerCost = getTowerCost(towerType);
    const costPerHealth = (towerCost * 0.2) / 100; // Assume 100 max health
    return Math.ceil(costPerHealth * damageTaken);
  }

  // ============================================
  // STATE QUERY METHODS
  // ============================================

  /**
   * Get current money
   * @returns {number}
   */
  getMoney() {
    return this.currentMoney;
  }

  /**
   * Check if player can afford something
   * @param {number} cost
   * @returns {boolean}
   */
  canAfford(cost) {
    return this.currentMoney >= cost;
  }

  /**
   * Get difference between required cost and current money
   * @param {number} cost
   * @returns {number} Shortfall (0 if can afford)
   */
  getShortfall(cost) {
    return Math.max(0, cost - this.currentMoney);
  }

  /**
   * Get estimated time to afford something (based on passive income)
   * @param {number} cost
   * @returns {number} Seconds needed (Infinity if passive income disabled)
   */
  getTimeToAfford(cost) {
    if (!this.passiveIncomeEnabled || ECONOMY_CONFIG.passiveIncomePerSecond <= 0) {
      return Infinity;
    }

    const needed = this.getShortfall(cost);
    if (needed <= 0) return 0;

    return needed / ECONOMY_CONFIG.passiveIncomePerSecond;
  }

  /**
   * Get ROI (Return On Investment) for a tower
   * Estimates how many kills needed to recoup tower cost
   * @param {string} towerType
   * @param {string} targetEnemyType
   * @param {number} waveNumber
   * @returns {number} Estimated kills to ROI
   */
  estimateTowerROI(towerType, targetEnemyType, waveNumber = 1) {
    const towerCost = this.getTowerPlacementCost(towerType);
    const bountyPerKill = getAdjustedBounty(targetEnemyType, waveNumber, this.difficulty);
    
    if (bountyPerKill <= 0) return Infinity;
    
    return Math.ceil(towerCost / bountyPerKill);
  }

  // ============================================
  // PASSIVE INCOME
  // ============================================

  /**
   * Enable passive income (optional feature)
   */
  enablePassiveIncome() {
    this.passiveIncomeEnabled = true;
    this.lastPassiveIncomeTime = Date.now();
    console.log('💰 Passive income enabled');
  }

  /**
   * Disable passive income
   */
  disablePassiveIncome() {
    this.passiveIncomeEnabled = false;
    console.log('💤 Passive income disabled');
  }

  /**
   * Update passive income (call from game loop)
   * @param {number} deltaTime - Time since last update in seconds
   */
  updatePassiveIncome(deltaTime) {
    if (!this.passiveIncomeEnabled) return;

    const passivePerFrame = ECONOMY_CONFIG.passiveIncomePerSecond * deltaTime;
    if (passivePerFrame > 0) {
      this.addMoney(Math.ceil(passivePerFrame), 'passive');
    }
  }

  // ============================================
  // STATISTICS & REPORTING
  // ============================================

  /**
   * Get economy statistics
   * @returns {Object}
   */
  getStatistics() {
    return {
      currentMoney: this.currentMoney,
      startingMoney: this.startingMoney,
      maxMoneyReached: this.stats.maxMoneyReached,
      totalEarned: this.stats.totalEarned,
      totalSpent: this.stats.totalSpent,
      netIncome: this.stats.totalEarned - this.stats.totalSpent,
      totalBounties: this.stats.totalBounties,
      totalWaveRewards: this.stats.totalWaveRewards,
      totalUpgradeCosts: this.stats.totalUpgradeCosts,
      totalRepairCosts: this.stats.totalRepairCosts,
      currentKillStreak: this.stats.killStreak,
      totalTransactions: this.stats.transactions,
      difficulty: this.difficulty,
    };
  }

  /**
   * Get transaction history
   * @param {number} limit - Max transactions to return
   * @returns {Array}
   */
  getTransactionHistory(limit = 10) {
    return this.transactionLog.slice(-limit);
  }

  /**
   * Get economy snapshot (for debugging)
   * @returns {Object}
   */
  getSnapshot() {
    return {
      money: this.currentMoney,
      statistics: this.getStatistics(),
      recentTransactions: this.getTransactionHistory(5),
    };
  }

  /**
   * Get debug report
   */
  getDebugReport() {
    const stats = this.getStatistics();
    console.log('=== MONEY MANAGER DEBUG ===');
    console.log(`Current Money: $${stats.currentMoney}`);
    console.log(`Net Income: $${stats.netIncome} (earned: $${stats.totalEarned}, spent: $${stats.totalSpent})`);
    console.log(`Kill Streak: ${stats.currentKillStreak}`);
    console.log(`Difficulty: ${stats.difficulty}`);
    console.log(`Multipliers:`, this.difficultyMultipliers);
    console.log(`Transactions: ${stats.totalTransactions}`);
    console.log(`Recent Transactions:`, this.getTransactionHistory(5));
    console.log('===========================');
  }

  // ============================================
  // RESET
  // ============================================

  /**
   * Reset economy to initial state
   */
  reset() {
    this.currentMoney = this.startingMoney;
    this.transactionLog = [];
    this.stats = {
      totalEarned: 0,
      totalSpent: 0,
      totalBounties: 0,
      totalWaveRewards: 0,
      totalUpgradeCosts: 0,
      totalRepairCosts: 0,
      killStreak: 0,
      lastKillTime: 0,
      maxMoneyReached: this.startingMoney,
      transactions: 0,
    };
    console.log('💰 MoneyManager reset');
  }
}

export default MoneyManager;