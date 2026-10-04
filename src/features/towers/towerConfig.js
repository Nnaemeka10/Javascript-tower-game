/**
 * towerConfig.js — Phase 3: chess-piece identity rework.
 * Renames: archer→ballista, mage→flame, frost→freeze.
 * fireRate → shotInterval (seconds between shots — the old name lied).
 * DELETED (never-implemented dead config): areaOfEffect, slowEffect,
 * poisonEffect, piercing, upgradeCost, maxLevel, experience fields.
 * Splash/DoT/slow now live in tierAbilities and ARE implemented (GameEngine).
 */

export const TOWER_CONFIG = {
  ballista: {
    name: 'Ballista', emoji: '🏹',
    cost: 100,
    width: 24, height: 24, health: 50, range: 150,
    shotInterval: 0.5,          // seconds between shots
    damage: 15, damageType: 'normal',
    projectileType: 'Arrow',
    targetingStrategy: 'closest',
    upgradeGrowth: { damage: 0.05, range: 0.02, health: 0.03, shotInterval: -0.02 },
    tierAbilities: {
      2: { label: 'Twin Shot',  multiShot: 2 },
      3: { label: 'Volley',     multiShot: 3 },   // pawn promotion
    },
    description: 'Pawn — cheap, fast, promotes into a volley machine.',
    color: '#8B4513', secondaryColor: '#D2691E',
  },

  freeze: {
    name: 'Freeze Tower', emoji: '❄️',
    cost: 120,
    width: 24, height: 24, health: 55, range: 140,
    shotInterval: 0.6,
    damage: 12, damageType: 'ice',
    projectileType: 'IceShard',
    targetingStrategy: 'weakest',
    upgradeGrowth: { damage: 0.02, range: 0.03, health: 0.03, shotInterval: -0.01 },
    tierAbilities: {
      2: { label: 'Cryo Field',  onHit: { slow: { factor: 0.55, duration: 1.5 } } },
      3: { label: 'Time Rewind', onHit: { pushBack: 70 } },   // teleports enemies backwards
    },
    description: 'Bishop — control piece; bends tempo, not health bars.',
    color: '#00CED1', secondaryColor: '#E0FFFF',
  },

  flame: {
    name: 'Flame Tower', emoji: '🔥',
    cost: 150,
    width: 24, height: 24, health: 60, range: 120,   // knight: awkward range
    shotInterval: 0.75,
    damage: 25, damageType: 'fire',                  // dragons resist 80% — by design
    projectileType: 'Fireball',
    targetingStrategy: 'pathProgress',
    upgradeGrowth: { damage: 0.08, range: 0.025, health: 0.04 },
    tierAbilities: {
      2: { label: 'Immolate',  onHit: { burn: { dps: 6,  duration: 3 } } },
      3: { label: 'White Hot', onHit: { burn: { dps: 12, duration: 4 } } },
    },
    description: 'Knight — mid-range burst; the damage outlives the hit.',
    color: '#FF4500', secondaryColor: '#FFAA33',
  },

  cannon: {
    name: 'Cannon Tower', emoji: '🔫',
    cost: 200,
    width: 24, height: 24, health: 80, range: 180,
    shotInterval: 1.5,                                // rook stays slow — identity
    damage: 50, damageType: 'normal',
    projectileType: 'Cannonball',
    targetingStrategy: 'strongest',
    upgradeGrowth: { damage: 0.09, range: 0.025, health: 0.04 },
    tierAbilities: {
      2: { label: 'Siege Rounds',   onHit: { splash: { radius: 55, falloff: 0.6 } } },
      3: { label: 'Heavy Ordnance', onHit: { splash: { radius: 75, falloff: 0.7 } } },
    },
    description: 'Rook — long lines, slow, devastating.',
    color: '#556B2F', secondaryColor: '#9ACD32',
  },

  tesla: {
    name: 'Tesla Tower', emoji: '⚡',
    cost: 180,
    width: 24, height: 24, health: 70, range: 110,
    shotInterval: 1.0,
    damage: 30, damageType: 'lightning',
    projectileType: 'Bolt',
    targetingStrategy: 'closest',
    chainEffect: { maxChains: 3, chainRange: 90, damageMultiplier: 0.8 }, // grows 3→4→5 with tier
    upgradeGrowth: { damage: 0.08, range: 0.02, health: 0.04, shotInterval: -0.01 },
    tierAbilities: {
      2: { label: 'Arc Conduction' },   // chain 4 (engine reads tier)
      3: { label: 'Storm Crown' },      // chain 5 + last jump stuns 0.4s
    },
    description: 'Queen — touches everything; crowns with a stunning arc.',
    color: '#FFD700', secondaryColor: '#FFFF00',
  },

  alchemist: {
    name: 'Alchemist Tower', emoji: '⚗️',
    cost: 140,
    width: 24, height: 24, health: 65, range: 130,
    shotInterval: 0.8,
    damage: 20, damageType: 'poison',
    projectileType: 'Poison',
    targetingStrategy: 'pathProgress',
    upgradeGrowth: { damage: 0.06, range: 0.02, health: 0.06 },
    tierAbilities: {
      2: { label: 'Lingering Toxin', onHit: { poison: { dps: 5, duration: 4 } } },
      3: { label: 'Contagion',
           onDeath: { contagion: { radius: 90, dps: 6, duration: 4 } } },
    },
    description: 'King — wins the long endgame through attrition.',
    color: '#006400', secondaryColor: '#32CD32',
  },
};

export function getTowerTypes() { return Object.keys(TOWER_CONFIG); }

export function getTowerCost(towerType, level = 1) {
  const config = TOWER_CONFIG[towerType];
  return config ? config.cost : 0;
}