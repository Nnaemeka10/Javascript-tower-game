export const ROUND_CONFIG = {
  intermissionSeconds: 7,
  bonusLivesPerRound: 10,
  maxLives: 20,
  baseCompletionBonus: 350,
  bonusPerRound: 150,          // bonus = 350 + 150*(round-1)
  scaling: {
    health: (r) => 1 + (r - 1) * 0.30,
    speed:  (r) => 1 + (r - 1) * 0.06,
    bounty: (r) => 1 + (r - 1) * 0.22,
    reward: (r) => 1 + (r - 1) * 0.18,
  },
};

export function getRoundContext(round) {
  return {
    round,
    healthMult: ROUND_CONFIG.scaling.health(round),
    speedMult:  ROUND_CONFIG.scaling.speed(round),
    bountyMult: ROUND_CONFIG.scaling.bounty(round),
    rewardMult: ROUND_CONFIG.scaling.reward(round),
  };
}

export function getRoundCompletionBonus(round) {
  return ROUND_CONFIG.baseCompletionBonus + ROUND_CONFIG.bonusPerRound * (round - 1);
}

//before round start, players can place their towers where they wish from second round upwards with the money liquidate from their first round since the board changed under them