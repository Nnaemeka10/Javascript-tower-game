/**
 * projectileConfig.js
 * Centralized configuration for all projectile types.
 * 
 * Makes it easy to:
 * - Add new projectile types
 * - Balance damage values
 * - Adjust visual properties
 * - Configure special effects
 */

/**
 * Base projectile type configurations
 */
const PROJECTILE_TYPES = {
  Arrow: {
    name: 'Arrow',
    speed: 300,
    damage: 10,
    damageType: 'normal',
    size: 4,
    maxDistance: 1000,
    lifetime: 5,
    piercing: false,
    color: '#FFD700',
    image: 'arrow.png',
    trailEnabled: false,
    description: 'Standard arrow projectile',
  },

  Fireball: {
    name: 'Fireball',
    speed: 150, // Slower but more powerful
    damage: 20,
    damageType: 'fire',
    size: 8,
    maxDistance: 800,
    lifetime: 6,
    piercing: false,
    color: '#FF4500',
    image: 'fireball.png',
    trailEnabled: true,
    trailColor: 'rgba(255, 69, 0, 0.5)',
    description: 'Slow but powerful fire projectile',
  },

  IceShard: {
    name: 'IceShard',
    speed: 250,
    damage: 12,
    damageType: 'ice',
    size: 6,
    maxDistance: 900,
    lifetime: 5,
    piercing: false,
    color: '#87CEEB',
    image: 'ice_shard.png',
    trailEnabled: false,
    description: 'Ice projectile that slows enemies',
  },

  Cannonball: {
    name: 'Cannonball',
    speed: 200,
    damage: 30,
    damageType: 'normal',
    size: 10,
    maxDistance: 1200,
    lifetime: 8,
    piercing: true, // Can hit multiple enemies
    color: '#2F4F4F',
    image: 'cannonball.png',
    trailEnabled: false,
    description: 'Heavy projectile that can pierce through enemies',
  },

  Bolt: {
    name: 'Bolt',
    speed: 400, // Very fast
    damage: 8,
    damageType: 'normal',
    size: 2,
    maxDistance: 1000,
    lifetime: 3,
    piercing: false,
    color: '#FFFF00',
    image: 'bolt.png',
    trailEnabled: false,
    description: 'Quick and light projectile',
  },

  MagicMissile: {
    name: 'MagicMissile',
    speed: 180,
    damage: 15,
    damageType: 'magic',
    size: 7,
    maxDistance: 900,
    lifetime: 7,
    piercing: false,
    color: '#9370DB',
    image: 'magic_missile.png',
    trailEnabled: true,
    trailColor: 'rgba(147, 112, 219, 0.5)',
    description: 'Magic projectile with tracking ability',
    homing: true, // Follows target
  },
};

/**
 * Get configuration for a projectile type
 * @param {string} projectileType - Projectile type name
 * @returns {Object} Projectile configuration
 */
export function getProjectileConfig(projectileType) {
  const config = PROJECTILE_TYPES[projectileType];

  if (!config) {
    console.warn(`⚠️ Unknown projectile type: ${projectileType}`);
    return null;
  }

  return { ...config };
}

/**
 * Get all available projectile types
 * @returns {Array<string>} Array of projectile type names
 */
export function getProjectileTypes() {
  return Object.keys(PROJECTILE_TYPES);
}

/**
 * Get projectiles grouped by damage type
 * @returns {Object} Projectiles by damage type
 */
export function getProjectilesByDamageType() {
  const grouped = {};

  Object.entries(PROJECTILE_TYPES).forEach(([name, config]) => {
    const type = config.damageType;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(name);
  });

  return grouped;
}

/**
 * Calculate projectile damage with modifiers
 * @param {string} projectileType - Projectile type
 * @param {number} towerLevel - Tower upgrade level
 * @param {number} critChance - Critical hit chance (0-1)
 * @returns {number} Calculated damage
 */
export function calculateProjectileDamage(projectileType, towerLevel = 1, critChance = 0) {
  const config = getProjectileConfig(projectileType);
  if (!config) return 0;

  let damage = config.damage;

  // Apply tower level multiplier
  damage *= (1 + (towerLevel - 1) * 0.15); // +15% per level

  // Apply critical chance
  if (Math.random() < critChance) {
    damage *= 1.5; // 50% damage boost on crit
  }

  return Math.ceil(damage);
}

/**
 * Get projectile cost (for economy)
 * @param {string} projectileType - Projectile type
 * @returns {number} Cost in gold
 */
export function getProjectileCost(projectileType) {
  const config = getProjectileConfig(projectileType);
  if (!config) return 0;

  // Cost based on damage and speed
  const baseCost = config.damage * config.speed / 100;
  const multiplier = config.piercing ? 1.5 : 1;
  return Math.ceil(baseCost * multiplier);
}

/**
 * Log all projectile types and their stats
 * Useful for balance checking
 */
export function logProjectileReport() {
  console.log('=== PROJECTILE REPORT ===');

  Object.entries(PROJECTILE_TYPES).forEach(([name, config]) => {
    console.log(`\n${name}:`);
    console.log(`  Damage: ${config.damage} (${config.damageType})`);
    console.log(`  Speed: ${config.speed}`);
    console.log(`  Range: ${config.maxDistance}`);
    console.log(`  Lifetime: ${config.lifetime}s`);
    console.log(`  Piercing: ${config.piercing}`);
    console.log(`  Cost: ${getProjectileCost(name)}`);
  });

  console.log('\n=======================');
}

export default {
  PROJECTILE_TYPES,
  getProjectileConfig,
  getProjectileTypes,
  getProjectilesByDamageType,
  calculateProjectileDamage,
  getProjectileCost,
  logProjectileReport,
};