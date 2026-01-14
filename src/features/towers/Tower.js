/**
 * Tower Entity
 * Represents a single tower instance on the map.
 * 
 * Features:
 * - Position and targeting
 * - Range and rotation
 * - Cooldown and shooting
 * - Health and upgrades
 * - Status effects immunity
 */

import { TOWER_CONFIG } from './towerConfig.js';

class Tower {
  /**
   * Create a new tower
   * @param {number} id - Unique tower identifier
   * @param {string} type - Tower type (archer, mage, cannon, etc.)
   * @param {number} x - World X position
   * @param {number} y - World Y position
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridY - Grid Y coordinate
   */
  constructor(id, type, x, y, gridX, gridY) {
    this.id = id;
    this.type = type;

    // Position
    this.x = x;
    this.y = y;
    this.gridX = gridX;
    this.gridY = gridY;

    // Get config for this tower type
    this.config = TOWER_CONFIG[type] || TOWER_CONFIG.archer;

    // Dimensions
    this.width = this.config.width;
    this.height = this.config.height;
    this.range = this.config.range;

    // Targeting
    this.targetEnemy = null;
    this.targetX = null;
    this.targetY = null;
    this.targetingStrategy = this.config.targetingStrategy || 'closest';
    this.rotation = 0; // Angle in radians

    // Shooting
    this.shotCooldown = 0; // Time until next shot
    this.lastShotTime = 0;
    this.shotsToFire = 0; // Queue for burst firing

    // Upgrades
    this.level = 1;
    this.experiencePoints = 0;
    this.experienceToNextLevel = 100;

    // Health and status
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.isSelected = false;
    this.isDead = false;

    // Statistics
    this.totalDamageDealt = 0;
    this.enemiesKilled = 0;
    this.totalMoneyGenerated = 0;

    // State tracking
    this.hasShot = false;
    this.isActive = true;
  }

  /**
   * Update tower logic (targeting, cooldown, etc.)
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Array} enemies - Array of enemy objects to target
   * @returns {Object|null} Projectile data if tower should fire, null otherwise
   */
  update(deltaTime, enemies) {
    if (this.isDead || !this.isActive) return null;

    // Update cooldown
    if (this.shotCooldown > 0) {
      this.shotCooldown -= deltaTime;
    }

    // Find target if none exists
    if (!this.targetEnemy || this.targetEnemy.isDead) {
      this.targetEnemy = this.findTarget(enemies);
      this.hasShot = false;
    }

    // If we have a target, rotate towards it and try to shoot
    if (this.targetEnemy && !this.targetEnemy.isDead) {
      // Calculate rotation angle
      const dx = this.targetEnemy.x - this.x;
      const dy = this.targetEnemy.y - this.y;
      this.rotation = Math.atan2(dy, dx);

      // Check if ready to shoot
      if (this.shotCooldown <= 0) {
        this.hasShot = true;
        this.shotCooldown = this.config.fireRate;
        this.lastShotTime = 0;

        // Return projectile spawn data
        return this.createProjectileData();
      }
    } else {
      // No target, reset rotation gradually
      this.hasShot = false;
    }

    return null;
  }

  /**
   * Find target enemy based on targeting strategy
   * @private
   * @param {Array} enemies - Array of enemy objects
   * @returns {Object|null} Target enemy or null
   */
  findTarget(enemies) {
    if (enemies.length === 0) return null;

    const validTargets = enemies.filter(enemy => {
      if (enemy.isDead) return false;

      // Check if in range
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= this.range;
    });

    if (validTargets.length === 0) return null;

    switch (this.targetingStrategy) {
      case 'closest':
        return this.getClosestEnemy(validTargets);
      case 'furthest':
        return this.getFurthestEnemy(validTargets);
      case 'weakest':
        return this.getWeakestEnemy(validTargets);
      case 'strongest':
        return this.getStrongestEnemy(validTargets);
      case 'pathProgress':
        return this.getFurthestAlongPath(validTargets);
      default:
        return validTargets[0];
    }
  }

  /**
   * Get closest enemy to tower
   * @private
   */
  getClosestEnemy(enemies) {
    let closest = enemies[0];
    let closestDistance = this.getDistanceToEnemy(closest);

    for (let i = 1; i < enemies.length; i++) {
      const distance = this.getDistanceToEnemy(enemies[i]);
      if (distance < closestDistance) {
        closest = enemies[i];
        closestDistance = distance;
      }
    }

    return closest;
  }

  /**
   * Get furthest enemy from tower
   * @private
   */
  getFurthestEnemy(enemies) {
    let furthest = enemies[0];
    let furthestDistance = this.getDistanceToEnemy(furthest);

    for (let i = 1; i < enemies.length; i++) {
      const distance = this.getDistanceToEnemy(enemies[i]);
      if (distance > furthestDistance) {
        furthest = enemies[i];
        furthestDistance = distance;
      }
    }

    return furthest;
  }

  /**
   * Get weakest enemy (lowest health)
   * @private
   */
  getWeakestEnemy(enemies) {
    let weakest = enemies[0];
    let lowestHealth = weakest.health || 0;

    for (let i = 1; i < enemies.length; i++) {
      const health = enemies[i].health || 0;
      if (health < lowestHealth) {
        weakest = enemies[i];
        lowestHealth = health;
      }
    }

    return weakest;
  }

  /**
   * Get strongest enemy (highest health)
   * @private
   */
  getStrongestEnemy(enemies) {
    let strongest = enemies[0];
    let highestHealth = strongest.health || 0;

    for (let i = 1; i < enemies.length; i++) {
      const health = enemies[i].health || 0;
      if (health > highestHealth) {
        strongest = enemies[i];
        highestHealth = health;
      }
    }

    return strongest;
  }

  /**
   * Get enemy furthest along path
   * @private
   */
  getFurthestAlongPath(enemies) {
    let furthest = enemies[0];
    let maxProgress = furthest.getPathProgress?.() || 0;

    for (let i = 1; i < enemies.length; i++) {
      const progress = enemies[i].getPathProgress?.() || 0;
      if (progress > maxProgress) {
        furthest = enemies[i];
        maxProgress = progress;
      }
    }

    return furthest;
  }

  /**
   * Get distance to enemy
   * @private
   */
  getDistanceToEnemy(enemy) {
    const dx = enemy.x - this.x;
    const dy = enemy.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Create projectile spawn data when tower shoots
   * @private
   * @returns {Object} Projectile data
   */
  createProjectileData() {
    if (!this.targetEnemy) return null;

    const projectileType = this.config.projectileType;
    const damageWithUpgrades = this.calculateDamage();

    return {
      type: projectileType,
      startX: this.x,
      startY: this.y,
      targetX: this.targetEnemy.x,
      targetY: this.targetEnemy.y,
      targetEnemy: this.targetEnemy,
      damage: damageWithUpgrades,
      damageType: this.config.damageType,
      piercing: this.config.piercing,
      areaOfEffect: this.config.areaOfEffect,
      towerId: this.id,
    };
  }

  /**
   * Calculate tower damage with upgrades applied
   * @returns {number} Calculated damage
   */
  calculateDamage() {
    let baseDamage = this.config.damage;

    // Apply level multiplier
    baseDamage *= (1 + (this.level - 1) * 0.15); // 15% per level

    // Apply random variance (±10%)
    const variance = 0.9 + Math.random() * 0.2;
    baseDamage *= variance;

    return Math.round(baseDamage);
  }

  /**
   * Take damage (towers have health)
   * @param {number} amount - Damage amount
   * @returns {boolean} True if tower is still alive
   */
  takeDamage(amount) {
    if (this.isDead) return false;

    this.health -= amount;

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      return false;
    }

    return true;
  }

  /**
   * Repair tower
   * @param {number} amount - Amount to repair
   */
  repair(amount) {
    if (this.isDead) return;

    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  /**
   * Heal tower to full health
   */
  healFull() {
    this.health = this.maxHealth;
    this.isDead = false;
  }

  /**
   * Upgrade tower to next level
   * @returns {boolean} Success
   */
  upgrade() {
    if (this.level >= this.config.maxLevel) {
      console.warn(`Tower ${this.id} is already max level`);
      return false;
    }

    this.level++;
    this.experiencePoints = 0;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

    // Improve stats with level
    this.maxHealth = Math.floor(this.maxHealth * 1.1);
    this.health = this.maxHealth;
    this.range *= 1.05;

    console.log(`🔥 Tower ${this.id} upgraded to level ${this.level}`);

    return true;
  }

  /**
   * Add experience points
   * @param {number} amount - Experience to add
   * @returns {number} New level if upgraded, 0 otherwise
   */
  addExperience(amount) {
    this.experiencePoints += amount;

    let newLevel = 0;
    while (
      this.experiencePoints >= this.experienceToNextLevel &&
      this.level < this.config.maxLevel
    ) {
      this.experiencePoints -= this.experienceToNextLevel;
      if (this.upgrade()) {
        newLevel = this.level;
      }
    }

    return newLevel;
  }

  /**
   * Get health percentage (0-1)
   * @returns {number} Health percentage
   */
  getHealthPercentage() {
    return this.health / this.maxHealth;
  }

  /**
   * Get experience percentage (0-1)
   * @returns {number} Experience percentage
   */
  getExperiencePercentage() {
    return this.experiencePoints / this.experienceToNextLevel;
  }

  /**
   * Get shooting cooldown percentage (0-1)
   * @returns {number} Cooldown percentage (0 = ready, 1 = fully charged)
   */
  getCooldownPercentage() {
    return 1 - (this.shotCooldown / this.config.fireRate);
  }

  /**
   * Record damage dealt (for statistics)
   * @param {number} amount - Damage amount
   */
  recordDamage(amount) {
    this.totalDamageDealt += amount;
  }

  /**
   * Record enemy kill (for statistics)
   * @param {number} bounty - Money earned from kill
   */
  recordKill(bounty) {
    this.enemiesKilled++;
    this.totalMoneyGenerated += bounty;
  }

  /**
   * Reset tower to initial state
   * Used by object pool
   */
  reset() {
    this.targetEnemy = null;
    this.targetX = null;
    this.targetY = null;
    this.rotation = 0;
    this.shotCooldown = 0;
    this.level = 1;
    this.experiencePoints = 0;
    this.experienceToNextLevel = 100;
    this.health = this.maxHealth;
    this.isDead = false;
    this.isSelected = false;
    this.hasShot = false;
    this.isActive = true;
    this.totalDamageDealt = 0;
    this.enemiesKilled = 0;
    this.totalMoneyGenerated = 0;
  }

  /**
   * Get tower snapshot for debugging
   * @returns {Object}
   */
  getSnapshot() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      gridX: this.gridX,
      gridY: this.gridY,
      level: this.level,
      health: `${this.health}/${this.maxHealth}`,
      range: this.range,
      cooldown: this.shotCooldown.toFixed(2),
      target: this.targetEnemy ? this.targetEnemy.id : null,
      rotation: (this.rotation * 180 / Math.PI).toFixed(1),
      damage: this.calculateDamage(),
      stats: {
        totalDamageDealt: this.totalDamageDealt,
        enemiesKilled: this.enemiesKilled,
        totalMoneyGenerated: this.totalMoneyGenerated,
      },
    };
  }
}

export default Tower;