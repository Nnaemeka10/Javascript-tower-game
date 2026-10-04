/**
 * economyConfig.js
 * TOWER_COSTS, ENEMY_BOUNTIES,WAVE_REWARDS, ECONOMY_CONFIG and all helpers built on them.
 * Single sources: towerConfig.js · enemyConfig.js · waveConfig.js · constants.js.
 */
export const DIFFICULTY_MULTIPLIERS = {
  easy:   { incomeMultiplier: 1.5, towerCostMultiplier: 0.8, enemyBountyMultiplier: 1.2 },
  normal: { incomeMultiplier: 1.0, towerCostMultiplier: 1.0, enemyBountyMultiplier: 1.0 },
  hard:   { incomeMultiplier: 0.7, towerCostMultiplier: 1.3, enemyBountyMultiplier: 0.8 },
};

export function getDifficultyMultipliers(difficulty = 'normal') {
  const m = DIFFICULTY_MULTIPLIERS[difficulty];
  if (!m) {
    console.warn(`Difficulty "${difficulty}" not found, using "normal"`);
    return DIFFICULTY_MULTIPLIERS.normal;
  }
  return m;
}