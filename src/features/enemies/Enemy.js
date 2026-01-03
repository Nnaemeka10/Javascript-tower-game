/**
 * Enemy
 * Base class for all enemy types.
 * Handles movement along a path, health, and collision detection.
 */

class Enemy {
    /**
   * Create an enemy
   * @param {Object} config - Enemy configuration
   * @param {string} config.id - Unique identifier
   * @param {string} config.type - Enemy type (Goblin, Dwarve, etc.)
   * @param {Array<Object>} config.path - Path waypoints [{x, y}, ...]
   * @param {number} config.health - Starting health
   * @param {number} config.maxHealth - Maximum health
   * @param {number} config.speed - Movement speed (pixels per second)
   * @param {number} config.size - Enemy size (width/height)
   * @param {number} config.bounty - Money reward for killing
   * @param {string} config.image - Image path or sprite
   * @param {Object} config.specialAbilities - Special abilities config
   */
  constructor(config) {
    //identtity
    this.id = config.id;
    this.type = config.type;
    this.image = config.image;

    //position and movenment
    this.path = config.path || [];
    this.pathIndex = 0; //Current way point index
    this.distanceAlongSegment = 0; //distance travelled on current segment
    this.x = this.path[0]?.x || 0;
    this.y = this.path[0]?.y || 0;
    this.width = config.size || 20;
    this.height = config.size || 20;

    //movement
    this.speed = config.speed || 50; //pixels per second
    this.direction = {x:0, y:0}; //unit direction
    this.rotation = 0; //rotation angle in radians

    //health
    this.health = config.health || 100;
    this.maxHealth = config.maxHealth || 100;
    this.isDead = false;
    
    //stats
    this.bounty = config.bounty || 10; //money reward
    this.armor = config.armor || 0; //damage reduction
    this.resistances = config.resistances || {}; //type based resistances (fire, ice, etc.)

    //status effects
    this.statusEffects = {
        slow: {active: false, duration: 0, slowFactor: 1}, //0-1, 1 = normal speed
        stun: {active: false, duration: 0 },
        burn: {active: false, duration: 0, damagePerSecond: 0},
        freeze: {active: false, duration: 0},
    };

    //special abilities
    this.specialAbilities = config.specialAbilities || {};

    //rendering
    this.rotation = 0;
    this.opacity = 1;

    //initialize path folowing
    this.updateDirection();
  }

  /**
   * Update enemy position along the path
   * @param {number} deltaTime - Time since last update in seconds
   */
  update(deltaTime){
    if(this.isDead) return;

    //apply slow effect to speed
    const effectiveSpeed = this.speed * this.statusEffects.slow.slowFactor;

    //update status effects
    this.updateStatusEffects(deltaTime);

    //dont move if stunned
    if(this.statusEffects.stun.active) return;

    //move along the path
    this.moveAlongPath(effectiveSpeed, deltaTime);

    //update rotation to face duirection of movement
    if (this.direction.x !== 0 || this.direction.y !==0) {
        this.rotation = Math.atan2(this.direction.y, this.direction.x);
    }
  }

  /**
   * Move the enemy along th epredefined path
   * @param {number} speed - Movement speed in pixels per second
   * @param {number} deltaTime - time since last update
   */
  moveAlongPath(speed, deltaTime){
    if(this.pathIndex >= this.path.length -1) {
        //reachjed the end of path
        return;
    }

    const distance = speed * deltaTime; // distance to move this frame
    let remainingDistance = distance;

    while (remainingDistance > 0 && this.pathIndex < this.path.length -1) {
        const currentWaypoint = this.path[this.pathIndex];
        const nextWaypoint = this.path[this.pathIndex + 1];

        //calcyuklate disytance to next waypoint
        const dx = nextWaypoint.x - currentWaypoint.x;
        const dy = nextWaypoint.y - currentWaypoint.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        //distance remaining to nexty waypoint
        const distanceToNext = segmentLength - this.distanceAlongSegment;

        if (remainingDistance >= distanceToNext) {
            //move to next waypoint
            remainingDistance -= distanceToNext;
            this.pathIndex++;
            this.distanceAlongSegment = 0;
            this.updateDirection();
        } else {
            //move along current segment
            this.distanceAlongSegment += remainingDistance;
            remainingDistance = 0
        }
    }

    //update actual poition based on path progress
    this.updatePosition();
  }

  /**
   * upfate the enemys actual x, y cordinates based on path progress
   */
  updatePosition(){
    if(this.pathIndex >= this.path.length) {
        this.x = this.path[this.path.length - 1].x;
        this.y = this.path[this.path.length - 1].y;
        return;
    }
    const currentWaypoint = this.path[this.pathIndex];
    const nextWaypoint = this.path[Math.min(this.pathIndex + 1, this.path.length - 1)];

    const dx = nextWaypoint.x - currentWaypoint.x;
    const dy = nextWaypoint.y - currentWaypoint.y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    if(segmentLength === 0) {
        this.x = currentWaypoint.x;
        this.y = currentWaypoint.y;
        return;
    }

    const progress = this.distanceAlongSegment / segmentLength;
    this.x = currentWaypoint.x + dx * progress;
    this.y = currentWaypoint.y + dy * progress;
  }

  /**
   * upfate directionn vector
   */
  updateDirection(){
    if (this.pathIndex >= this.path.length -1){
        this.direction = {x:0, y:0 };
        return;
    }

    const current = this.path[this.pathIndex];
    const next = this.path[this.pathIndex + 1];

    const dx = next.x - current.x;
    const dy =  next.y - current.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0){
        this.direction = { x: 0, y: 0 }
    } else {
        this.direction = {x: dx / length, y: dy / length };
    }
  }

  /**
   * Update status effects
   * @param {number} deltaTime - Time since last update
   */
  updateStatusEffects(deltaTime){
    //update slow effect
    if (this.statusEffects.slow.active) {
        this.statusEffects.slow.duration -= deltaTime;
        if(this.statusEffects.slow.duration <= 0) {
            this.statusEffects.slow.active = false;
            this.statusEffects.slow.slowFactor = 1;
        }
    }

    //upfdate stun effect
    if(this.statusEffects.stun.active) {
        this.statusEffects.stun.duration -= deltaTime;
        if(this.statusEffects.stun.duration <= 0) {
            this.statusEffects.stun.active = false;
        }
    }

    //update burn effect
    if(this.statusEffects.burn.active) {
        this.statusEffects.burn.duration -= deltaTime;
        if(this.statusEffects.burn.duration <= 0) {
            this.statusEffects.burn.active = false;
        } else {
            //apply burn damage
            const damageThisFrame = this.statusEffects.burn.damagePerSecond * deltaTime;
            this.takeDamage(damageThisFrame);
        }
    }

    //update freeze effect
    if(this.statusEffects.freeze.active) {
        this.statusEffects.freeze.duration -= deltaTime;
        if(this.statusEffects.freeze.duration <= 0) {
            this.statusEffects.freeze.active = false;
        }
    }
  }

  /**
   * Apply damage to the enemy
   * @param {number} damage - Damage amount
   * @param {string} damageType - Type of damage (normal, fire, ice, etc.)
   * @returns {number} Actual damage taken
   */
  takeDamage(damage, damageType = 'normal'){
    if(this.isDead) return 0;

    //apply armor reduction
    let actualDamage = Math.max(1, damage - this.armor);
    
    //apply type based resistances
    if (this.resistances[damageType]) {
        actualDamage *= (1 - this.resistances[damageType]);
    }

    this.health -= actualDamage;

    //check if dead
    if(this.health <= 0) {
        this.health = 0;
        this.isDead = true;
    }

    return actualDamage;
  }

  /**
   * Heal the enemy
   * @param {number} amount - Healing amount
   */
  heal(amount){
    if(this.isDead) return;
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  /**
   * Apply slow effect
   * @param {number} slowFactor - Speed multiplier (0-1)
   * @param {number } duration - Duration in seconds
   */
  applySlow(slowFactor, duration){
    this.statusEffects.slow.active = true;
    this.statusEffects.slow.slowFactor = Math.max(0, Math.min(1, slowFactor));
    this.statusEffects.slow.duration = Math.max(this.statusEffects.slow.duration, duration);
  }

  /**
   * Apply stun
   * @param {number} duration - duration of stun in seconds
   */
  applyStun(duration){
    this.statusEffects.stun.active = true;
    this.statusEffects.stun.duration = Math.max(this.statusEffects.stun.duration, duration)
  }

  /**
   * Apply burn effect
   * @param {number} damagePerSecond - Damage per second
   * @param {number} duration - Damage duration in seconds
   */
  applyBurn(damagePerSecond, duration){
    this.statusEffects.burn.active = true;
    this.statusEffects.burn.damagePerSecond = damagePerSecond;
    this.statusEffects.burn.duration = Math.max(this.statusEffects.burn.duration, duration)
  }

  /**
   * Apply freeze effect
   * @param {number} duration - duration of freeze effect
   */
  applyFreeze(duration){
    this.statusEffects.freeze.active = true;
    this.statusEffects.freeze.duration = Math.max(this.statusEffects.freeze.duration, duration)
    this.applySlow(0, duration); //freeze = complete slow
  }

  /**
   * Check if enemy has reached the end of the path
   * @returns {boolean} true if reached end
   */
  hasReachedEnd(){
    return this.pathIndex >= this.path.length -1 && 
           this.distanceAlongSegment >= 0;
  }

  /**
   * Get health percentage
   * @returns {number} Health percentage
   */
  getHealthPercentage(){
    return this.health / this.maxHealth
  }

  /**
   * Get current waypoint index
   * @returns {number} waypoint index
   */
  getPathProgress(){
    return this.pathIndex / (this.path.length - 1);
  }

  /**
   * get distance traveled along path
   * @returns {number} ditance trvelled along path in pixels
   */
  getDistanceTraveled(){
    let distance = 0

    //sum distances up to current waypoint
    for (let i = 0; i < this.pathIndex; i++) {
        const current = this.path[i];
        const next = this.path[i + 1];
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        distance += Math.sqrt(dx * dx + dy * dy);
    } 

    //add distances on current segment
    distance += this.distanceAlongSegment;

    return distance;
  }

  /**
   * Get total path length
   * @returns {number} Total path length in pixels
   */
  getTotalPathLength(){
    let totalLength = 0

    //sum distances up to current waypoint
    for (let i = 0; i < this.path.length -1; i++) {
        const current = this.path[i];
        const next = this.path[i + 1];
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
    } 

    return totalLength;
  }

  /**
   * Get a snapshot of enemy state
   * @returns {Object} Enemy state snapshot
   */
  getSnapshot() {
    return {
      id: this.id,
      type: this.type,
      position: { x: this.x, y: this.y },
      health: this.health,
      maxHealth: this.maxHealth,
      isDead: this.isDead,
      speed: this.speed,
      bounty: this.bounty,
      pathProgress: this.getPathProgress(),
      statusEffects: { ...this.statusEffects },
    };
  }

 
  /**
   * Reset enemy to initial state (for reuse/pooling)
   */
  reset() {
    this.health = this.maxHealth;
    this.isDead = false;
    this.pathIndex = 0;
    this.distanceAlongSegment = 0;
    this.opacity = 1;
    this.rotation = 0;

    // Clear status effects
    Object.keys(this.statusEffects).forEach(key => {
      this.statusEffects[key].active = false;
      this.statusEffects[key].duration = 0;
    });

    this.updatePosition();
    this.updateDirection();
  }
}

export default Enemy;
