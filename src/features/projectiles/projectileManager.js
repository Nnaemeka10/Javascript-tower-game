/**
 * ProjectileManager
 * Manages all projectiles in the game.
 * Handles creation, updating, removal, and queries.
 */

import Projectile from './Projectile.js';
import { getProjectileConfig } from './projectileConfig.js';

class ProjectileManager {
  //constructor which initializes the projectile manager with an empty list of active projectiles, a pool for reusing projectiles, and configuration settings for maxpool size and projectileid. 
  constructor() {
    this.projectiles = []; // Active projectiles
    this.projectilePool = []; // Object pool for reuse
    this.maxPoolSize = 200;
    this.nextProjectileId = 0;

    // Configuration
    this.config = {
      usePooling: true,
      maxProjectiles: 500,
    };
  }

  /**
   * Initialize the projectile manager and log to console to show that the copde ha sgotten to here
   */
  async initialize() {
    console.log('ProjectileManager initialized');
  }

  /**
   * Create a new projectile
   * @param {string} projectileType - Type of projectile
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @param {number} damage - Damage amount
   * @param {Object} options - Additional options
   * @returns {Projectile|null} Created projectile or null
   */
  createProjectile(projectileType, startX, startY, targetX, targetY, damage, options = {}) {
    try {
      // Check projectile limit
      if (this.projectiles.length >= this.config.maxProjectiles) {
        console.warn('Max projectiles reached');
        return null;
      }

      // Get projectile config
      const config = getProjectileConfig(projectileType);
      if (!config) {
        console.warn(`Unknown projectile type: ${projectileType}`);
        return null;
      }

      // Build a unified configuration object
      const projectileConfig = {
        id: `projectile_${this.nextProjectileId++}`,
        type: projectileType,
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        target: options.target, // Ensure target is passed
        damage: damage || config.damage,
        damageType: config.damageType,
        speed: config.speed,
        maxDistance: config.maxDistance,
        lifetime: config.lifetime,
        color: config.color,
        size: config.size,
        trailEnabled: config.trailEnabled,
        trailColor: config.trailColor,
        piercing: config.piercing,
        ...options
      };

      let projectile;
      if (this.config.usePooling && this.projectilePool.length > 0) {
        projectile = this.projectilePool.pop();
        projectile.init(projectileConfig);
      } else {
        // New projectiles also use the unified config
        projectile = new Projectile(projectileConfig);
      }

      this.projectiles.push(projectile);
      return projectile;

    } catch (error) {
      console.error(`Failed to create projectile ${projectileType}:`, error);
      return null;
    }
  }

  /**
   * Update all projectiles
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);

      // Remove dead projectiles
      if (projectile.isDead) {
        this.removeProjectile(projectile);
      }
    }
  }

  /**
   * Remove a projectile and return to pool
   * @param {Projectile} projectile - Projectile to remove
   */
  removeProjectile(projectile) {
    const index = this.projectiles.indexOf(projectile);
    if (index > -1) {
      this.projectiles.splice(index, 1);

      // Return to pool if space available
      if (this.config.usePooling && this.projectilePool.length < this.maxPoolSize) {
        projectile.deactivate();
        this.projectilePool.push(projectile);
      }
    }
  }

  /**
   * Remove all projectiles
   */
  clear() {
    this.projectiles = [];
    this.projectilePool = [];
    this.nextProjectileId = 0;
  }

  /**
   * Get all active projectiles
   * @returns {Array<Projectile>} Active projectiles
   */
  getProjectiles() {
    return this.projectiles;
  }

  /**
   * Get projectiles of a specific type
   * @param {string} projectileType - Projectile type
   * @returns {Array<Projectile>} Projectiles of that type
   */
  getProjectilesByType(projectileType) {
    return this.projectiles.filter(p => p.type === projectileType);
  }

  /**
   * Get projectiles with damage type
   * @param {string} damageType - Damage type
   * @returns {Array<Projectile>} Projectiles with that damage type
   */
  getProjectilesByDamageType(damageType) {
    return this.projectiles.filter(p => p.damageType === damageType);
  }

  /**
   * Get projectiles in an area
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Search radius
   * @returns {Array<Projectile>} Projectiles in area
   */
  getProjectilesInArea(x, y, radius) {
    return this.projectiles.filter(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  }

  /**
   * Get total number of active projectiles
   * @returns {number} Projectile count
   */
  getProjectileCount() {
    return this.projectiles.length;
  }

  /**
   * Get manager statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      activeProjectiles: this.projectiles.length,
      pooledProjectiles: this.projectilePool.length,
      totalTypes: new Set(this.projectiles.map(p => p.type)).size,
    };
  }

  /**
   * Get snapshot of all projectiles
   * @returns {Array<Object>} Projectile snapshots
   */
  getSnapshot() {
    return this.projectiles.map(p => p.getSnapshot());
  }
}

export default ProjectileManager;