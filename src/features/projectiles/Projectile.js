/**
 * Projectile
 * Base class for all projectile types.
 * Handles movement, collision detection, and lifespan.
 */

class Projectile {
  /**
   * Create a projectile
   * @param {Object} config - Projectile configuration
   * @param {string} config.id - Unique identifier
   * @param {string} config.type - Projectile type (arrow, fireball, etc.)
   * @param {number} config.x - Starting X position
   * @param {number} config.y - Starting Y position
   * @param {number} config.targetX - Target X position
   * @param {number} config.targetY - Target Y position
   * @param {number} config.speed - Movement speed (pixels per second)
   * @param {number} config.damage - Damage amount
   * @param {string} config.damageType - Type of damage (normal, fire, ice, etc.)
   * @param {number} config.size - Projectile size (width/height)
   * @param {number} config.maxDistance - Max travel distance before disappearing
   * @param {Object} config.target - Target enemy object (optional, for tracking)
   * @param {string} config.color - Color for rendering
   * @param {string} config.image - Image path for rendering
   */
  constructor(config) {
    // Identity
    this.id = config.id;
    this.type = config.type;
    this.image = config.image;
    this.color = config.color || '#ff0000';

    // Position
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.size || 4;
    this.height = config.size || 4;

    // Movement
    this.speed = config.speed || 200; // pixels per second
    this.targetX = config.targetX || this.x;
    this.targetY = config.targetY || this.y;
    this.target = config.target || null; // Tracking target

    // Direction and distance
    this.direction = { x: 0, y: 0 };
    this.distanceTraveled = 0;
    this.maxDistance = config.maxDistance || 1000;
    this.rotation = 0;

    // Damage
    this.damage = config.damage || 10;
    this.damageType = config.damageType || 'normal';
    this.piercing = config.piercing || false; // Can hit multiple enemies?

    // State
    this.hasHit = false;
    this.isDead = false;
    this.lifetime = config.lifetime || 10; // seconds
    this.age = 0;

    // Visual effects
    this.opacity = 1;
    this.trailEnabled = config.trailEnabled ?? true;
    this.trail = []; // Trail positions for visual effect

    // Initialize direction
    this.updateDirection();
  }

  /**
   * Update projectile position
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime) {
    if (this.hasHit || this.isDead) return;

    // Update lifetime
    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.isDead = true;
      return;
    }

    // Update target position if tracking
    if (this.target && !this.target.isDead) {
      this.targetX = this.target.x + this.target.width / 2;
      this.targetY = this.target.y + this.target.height / 2;
      this.updateDirection();
    }

    // Record trail position
    if (this.trailEnabled) {
      this.recordTrailPoint();
    }

    // Move projectile
    const distance = this.speed * deltaTime;
    this.x += this.direction.x * distance;
    this.y += this.direction.y * distance;
    this.distanceTraveled += distance;

    // Update rotation to face direction
    if (this.direction.x !== 0 || this.direction.y !== 0) {
      this.rotation = Math.atan2(this.direction.y, this.direction.x);
    }

    // Check if exceeded max distance
    if (this.distanceTraveled >= this.maxDistance) {
      this.isDead = true;
    }
  }

  /**
   * Update direction towards target
   * @private
   */
  updateDirection() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      this.direction = { x: 0, y: 0 };
    } else {
      this.direction = { x: dx / length, y: dy / length };
    }
  }

  /**
   * Record position for trail effect
   * @private
   */
  recordTrailPoint() {
    this.trail.push({
      x: this.x,
      y: this.y,
      age: this.age,
    });

    // Limit trail length
    if (this.trail.length > 20) {
      this.trail.shift();
    }
  }

  /**
   * Mark projectile as hit
   */
  hit() {
    this.hasHit = true;
    
    // If piercing, don't disappear immediately
    if (!this.piercing) {
      this.isDead = true;
    }
  }

  /**
   * Get distance to target
   * @returns {number} Distance in pixels
   */
  getDistanceToTarget() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get remaining lifetime
   * @returns {number} Remaining time in seconds
   */
  getRemainingLifetime() {
    return Math.max(0, this.lifetime - this.age);
  }

  /**
   * Get travel progress (0-1)
   * @returns {number} Progress ratio
   */
  getProgress() {
    return Math.min(1, this.distanceTraveled / this.maxDistance);
  }

  /**
   * Get opacity based on age
   * @returns {number} Opacity (0-1)
   */
  getOpacity() {
    // Fade out near end of lifetime
    const fadeDuration = 0.5; // seconds
    const timeToFade = this.lifetime - fadeDuration;
    
    if (this.age > timeToFade) {
      const fadeProgress = (this.age - timeToFade) / fadeDuration;
      return this.opacity * (1 - fadeProgress);
    }
    
    return this.opacity;
  }

  /**
   * Get snapshot of projectile state
   * @returns {Object} State snapshot
   */
  getSnapshot() {
    return {
      id: this.id,
      type: this.type,
      position: { x: this.x, y: this.y },
      target: this.target ? { x: this.targetX, y: this.targetY } : null,
      damage: this.damage,
      damageType: this.damageType,
      hasHit: this.hasHit,
      isDead: this.isDead,
      distanceTraveled: this.distanceTraveled,
      age: this.age,
    };
  }

  /**
   * Reset projectile for pooling
   */
  reset() {
    this.x = 0;
    this.y = 0;
    this.hasHit = false;
    this.isDead = false;
    this.distanceTraveled = 0;
    this.age = 0;
    this.opacity = 1;
    this.trail = [];
    this.target = null;
  }
}

export default Projectile;