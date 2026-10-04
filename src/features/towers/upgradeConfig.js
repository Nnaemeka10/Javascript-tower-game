/**
 * upgradeConfig.js
 * Tower upgrade framework: 3 tiers × 10 purchases = 30 upgrades.
 * Pure functions of a single counter — no state to desync.
 * Phase 3 will attach per-tower ability unlocks; Phase 7 tunes numbers.
 */

export const UPGRADE_CONFIG = {
  maxUpgrades: 30,
  upgradesPerTier: 10,
  tiers: 3,

  // Cost: ceil((baseCost + growth*n) * tierMult), n = purchases already owned
  baseCost: 30,
  costGrowth: 8,
  tierCostMultiplier: [1, 1.6, 2.4],     // tier 1 / 2 / 3

  // Stat growth per purchase — fractions of BASE config values (additive).
  // Per-tower override: TOWER_CONFIG[type].upgradeGrowth (Phase 3 uses it).
  growth: {
    damage: 0.07,   // +7% of base / purchase  → ×3.1 at 30
    range: 0.02,    // +2%                    → ×1.6 at 30
    health: 0.04,   // +4%                    → ×2.2 at 30
  },

  // Extra jump on the purchase that crosses INTO tier 2 or 3
  tierBonusDamage: 0.10,
};

export function getTier(count) {
  return Math.min(UPGRADE_CONFIG.tiers,
    Math.floor(count / UPGRADE_CONFIG.upgradesPerTier) + 1);
}

export function getStepInTier(count) {
  return count % UPGRADE_CONFIG.upgradesPerTier;
}

export function isTierUpPurchase(count) {
  const next = count + 1;
  return next === UPGRADE_CONFIG.upgradesPerTier || next === UPGRADE_CONFIG.upgradesPerTier * 2;
}

export function getUpgradeCost(count) {
  if (count >= UPGRADE_CONFIG.maxUpgrades) return 0;
  const mult = UPGRADE_CONFIG.tierCostMultiplier[
    Math.floor(count / UPGRADE_CONFIG.upgradesPerTier)];
  return Math.ceil((UPGRADE_CONFIG.baseCost + count * UPGRADE_CONFIG.costGrowth) * mult);
}

export const TIER_LABELS = ['I', 'II', 'III'];
export const TIER_COLORS  = { 1: '#9c9cb4', 2: '#6ee7ff', 3: '#ffcc4d' };