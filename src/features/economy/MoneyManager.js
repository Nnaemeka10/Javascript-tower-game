/**
 * MoneyManager.js
 * The wallet lives in GameState (single source of truth ).
 * This class passively records income/expense by diffing moneyChanged
 * events. Nothing is paid or charged here.
 */
import { getDifficultyMultipliers } from './economyConfig.js';

class MoneyManager {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty;
    this.difficultyMultipliers = getDifficultyMultipliers(difficulty); // Phase 5 fuel
    this.lastKnownMoney = null;
    this.stats = {
      totalEarned: 0, totalSpent: 0, transactions: 0,
      largestGain: 0, largestLoss: 0,
    };
  }

  async initialize() { console.log('MoneyManager (analytics) initialized'); }

  /** Diff-based recording. First event after reset() re-seeds (not counted). */
  recordMoneyChanged(newTotal) {
    if (this.lastKnownMoney === null) { this.lastKnownMoney = newTotal; return; }
    const delta = newTotal - this.lastKnownMoney;
    this.lastKnownMoney = newTotal;
    if (delta === 0) return;

    this.stats.transactions++;
    if (delta > 0) {
      this.stats.totalEarned += delta;
      this.stats.largestGain = Math.max(this.stats.largestGain, delta);
    } else {
      const spent = -delta;
      this.stats.totalSpent += spent;
      this.stats.largestLoss = Math.max(this.stats.largestLoss, spent);
    }
  }

  reset() {
    this.lastKnownMoney = null;
    this.stats = { totalEarned: 0, totalSpent: 0, transactions: 0, largestGain: 0, largestLoss: 0 };
    console.log('MoneyManager (analytics) reset');
  }

  getStatistics() {
    return {
      ...this.stats,
      netIncome: this.stats.totalEarned - this.stats.totalSpent,
      difficulty: this.difficulty,
    };
  }

  getSnapshot() { return { statistics: this.getStatistics() }; }
}

export default MoneyManager;