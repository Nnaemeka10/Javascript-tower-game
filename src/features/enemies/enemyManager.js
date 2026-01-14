/**
 * EnemyManager
 * Manages all enemies in the game.
 * Handles spawning, updating, removal, and queries.
 */

import Enemy from "./Enemy.js";
import { getEnemyConfig } from "./enemyConfig.js";

class EnemyManager {
    constructor() {
        this.enemies = []; //active enemies
        this.enemyPool = []; //object pool for enemies
        this.maxPoolSize = 100;
        this.nextEnemyId = 0; //for generating unique enemy ids

        //configuration
        this.path = []; //enemy path waypoints
        this.spawnPoint = {x: 0, y:0}
    }

    /**
     * Initialize the eemy manager
     */
    async initialize() {
        console.log( 'EnemyManager initialized')
    }

    /**
     * set the path for enemies to follow
     * @param {Array<Object>} path - Path waypoints [{x, y}, ...]
     */
    setPath(path) {
        this.path = path;
    }

    /**
     * set the spawn point for enemies
     * @param {Object} spawnPoint - Spawn Point [x, y]
     */
    setSpawnPoint(spawnPoint){
        this.spawnPoint = spawnPoint;
    }

    /**
     * Spawn an Enemy of a specific type
     * @param {String} enemyType - Type of enemy to be spawned (Goblin, Dwarve, etc.)
     * @returns {Enemy|null} Spawned enemy of null if failed
     */
    spawnEnemy(enemyType){
        try {
            //Get enemy configuration
            const config = getEnemyConfig(enemyType);
            if(!config) {
                console.warn(`Unknown enemy type: ${enemyType}`)
                return null;
            }

            //creeate or reuse enemy object
            let enemy;
            if (this.enemyPool.length > 0) {
                enemy = this.enemyPool.pop();
                //reset and reconfigure pooled enemy
                Object.assign(enemy, {
                    id: `enemy_${this.nextEnemyId++}`,
                    type: enemyType,
                    ...config,
                    path: this.path,
                    x: this.spawnPoint.x,
                    y: this.spawnPoint.y,
                });

                enemy.reset();
            } else {
                enemy = new Enemy({
                    id: `enemy_${this.nextEnemyId++}`,
                    type: enemyType,
                    ...config,
                    path: this.path,
                });
            }

            this.enemies.push(enemy);
            return enemy;

        } catch (error) {
            console.error(`Failed to spawn enemy ${enemyType}:`, error);
            return null;
        }
    }

    /**
     * Spawn multiple enemies of the same type
     * @param {string} enemyType - type of enemy
     * @param {number} count -Number of enemies to spawn
     * @param {number} spawnInterval - Delay between spawns in seconds
     * @returns {Array<Enemy>} Spawned enemies
     */
    spawnEnemyWave(enemyType, count, spawnInterval = 0.5){
        const spawnedEnemies = [];

        for (let i = 0; i < count; i++){
            const enemy = this.spawnEnemy(enemyType);
            if(enemy) {
                spawnedEnemies.push(enemy);
            }
        }
        return spawnedEnemies;
    }

    /**
     * Update all enemies
     * @param {number} deltaTime - Time since last update in seconds  
     */
    update(deltaTime){
        //update all active enemies
        for (let i = this.enemies.length - 1; i >=0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);

            //remove dead enemies
            if (enemy.isDead) {
                this.removeEnemy(enemy);
            }
        }
    }

    /**
     * Remove an enemy and return it to the pool
     * @param {Enemy} enemy - Enemy to remove
     */
    removeEnemy(enemy){
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);

            //return to pool if space is available
            if(this.enemyPool.length < this.maxPoolSize) {
                enemy.reset();
                this.enemyPool.push(enemy);
            }
        }
    }

    /**
     * Remove all enemies
     */
    clear(){
        this.enemies = [];
        this.enemyPool = [];
        this.nextEnemyId = 0;
    }

    /**
     * get all active enemies
     * @returns {Array<Enemy>} Array of active enemies
     */
    getEnemies(){
        return this.enemies;
    }

    /**
     * Get enemy by id
     * @param {string} enemyId - Enemy ID
     * @returns {Enemy|null} Enemy or null if not found 
     */
    getEnemyById(enemyId){
        return this.enemies.find(enemy => enemy.id === enemyId) || null;
    }

    /**
     * get enemies of a specific type
     * @param {string} enemyType - Enemy type gto filter
     * @returns {Array<Enemy>} - Enemies of that type 
     */
    getEnemiesByType(enemyType){
        return this.enemies.filter(enemy => enemy.type === enemyType);
    }

    /**
     * Get enemies within a certain search area (circle or rectangle)
     * @param {number} x - Center X
     * @param {number} y - Center y
     * @param {number} radius - Search Radius
     * @returns {Array<Enemy>} - Enemies in search area  
     */
    getEnemiesInArea(x, y, radius){
        return this.enemies.filter(enemy => {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy* dy);
            return distance <= radius
        });
    }

    /**
     * Get the first enemy ( closest to spawn point / furthest along path)
     * @returns {Enemy|null} first enemy or null if none exists
     */
    getFirstEnemy(){
        if(this.enemies.length === 0) return null;

        //find enemy furthest along path
        let firstEnemy = this.enemies[0];
        let maxProgress = firstEnemy.getPathProgress();

        for (let i = 1; i < this.enemies.length; i++) {
            const progress = this.enemies[i].getPathProgress();
            if(progress > maxProgress) {
                maxProgress = progress;
                firstEnemy = this.enemies[i];
            }
        }

        return firstEnemy;
    }

    /**
     * get the last enemy (closest to spawn point)
     * @returns {Enemy|null} last enemy or null if none exist
     */
    getLastEnemy(){
        if (this.enemies.length === 0) return null;

        //find enemy closest to the spawn poinyt
        let lastEnemy = this.enemies[0];
        let minProgress = lastEnemy.getPathProgress();
        
        for (let i = 1; i < this.enemies.length; i++) {
            const progress = this.enemies[i].getPathProgress();
            if(progress < minProgress) {
                minProgress = progress;
                lastEnemy = this.enemies[i];
            }
        }

        return lastEnemy
    }

    /**
     * Get enemies that have reached the end
     * @returns {Array<Enemy>} Enemies at the end
     */
    getEnemiesAtEnd(){
        return this.enemies.filter(enemy => enemy.hasReachedEnd());
    }

    /**
     * get enemies with lowest health (for targeting)
     * @param {number} count -Number of enemies to return
     * @returns {Array<Enemy>} ENemies sorted by health (lowest first)
     */
    getLowestHealthEnemies(count = 1){
        return [...this.enemies]
            .sort((a, b) => a.health - b.health)
            .slice(0, count);
    }

    /**
     * Get enemies with highest health
     * @param {number} count - Number of enemies to return
     * @returns {Array<Enemy>} Enemies sorted by health (highest first)
     */
    getHighestHealthEnemies(count = 1) {
        return [...this.enemies]
            .sort((a, b) => b.health - a.health)
            .slice(0, count);
    }

    /**
     * get enemies furtherest along the path
     * @param {number} count - Number of enemies to return
     * @returns {Array<Enemy>} Enemies sorted by path progress (furtherest First)
     */
    getFurthestEnemies(count = 1){
        return [...this.enemies]
            .sort((a, b) => b.getPathProgress() - a.getPathProgress())
            .slice(0, count);
    }

    /**
     * Get total number of active enemies
     * @returns {number} Number of enemies
     */
    getEnemyCount() {
        return this.enemies.length;
    }

    /**
     * get Total health of all enemies
     * @returns { number } Total health
     */
    getTotalHealth(){
        return this.enemies.reduce((sum, enemy) => sum + enemy.health, 0);
    }

    /**
     * Get the total bounty of all enemies
     * @returns {number} Total bounty if all are killed
     */
    getTotalBounty(){
        return this.enemies.reduce((sum, enemy) => sum + enemy.bounty, 0);
    }

    /**
     * kill all enemies of a specific type
     * @param {string} enemyType - Enemy Type to kill
     * @returns {number} number of enemies killed
     */
    killEnemyType(enemyType){
        const enemies = this.getEnemiesByType(enemyType);
        enemies.forEach(enemy => enemy.takeDamage(enemy.maxHealth));
        return enemies.length
    }

    /**
     * Damage all enemies in an area
     * @param {number } x - center x
     * @param {number } y - center y
     * @param {number } radius - damage radius
     * @param {number } damage - damage amount
     * @param {string } damageType - type of damage
     * @returns {number} Number of enemies damaged
     */
    damageEnemiesInArea(x, y, radius, damage, damageType = 'normal'){
        const enemies = this.getEnemiesInArea(x, y, radius);
        enemies.forEach(enemy => enemy.takeDamage(damage, damageType));
        return enemies.length
    }

    /**
     * Apply slow effect to all enemies in area
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Effect radius
     * @param {number} slowFactor - Speed multiplier (0-1)
     * @param {number} duration - Effect duration in seconds
     * @returns {number} Number of enemies affected
     */
    slowEnemiesInArea(x, y, radius, slowFactor, duration) {
        const enemies = this.getEnemiesInArea(x, y, radius);
        enemies.forEach(enemy => enemy.applySlow(slowFactor, duration));
        return enemies.length;
    }

    /**
     * Apply stun effect to all enemies in area
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Effect radius
     * @param {number} duration - Effect duration in seconds
     * @returns {number} Number of enemies affected
     */
    stunEnemiesInArea(x, y, radius, duration) {
        const enemies = this.getEnemiesInArea(x, y, radius);
        enemies.forEach(enemy => enemy.applyStun(duration));
        return enemies.length;
    }

    /**
     * Apply burn effect to all enemies in area
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Effect radius
     * @param {number} damagePerSecond - Damage per second
     * @param {number} duration - Effect duration in seconds
     * @returns {number} Number of enemies affected
     */
    burnEnemiesInArea(x, y, radius, damagePerSecond, duration) {
        const enemies = this.getEnemiesInArea(x, y, radius);
        enemies.forEach(enemy => enemy.applyBurn(damagePerSecond, duration));
        return enemies.length;
    }

    /**
     * Get manager statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        return {
        activeEnemies: this.enemies.length,
        pooledEnemies: this.enemyPool.length,
        totalEnemyTypes: this.getEnemyTypeCount(),
        totalHealth: this.getTotalHealth(),
        totalBounty: this.getTotalBounty(),
        };
    }

    /**
     * get count of different enemy types active
     * @returns {number} number of unique types 
     */
    getEnemyTypeCount(){
        const types = new Set(this.enemies.map(e => e.type));
        return types.size;
    }

    /**
     * Get a break down of enemies by type
     * @returns {Object} count of each enemy type
     */
    getEnemyTypeBreakDown(){
        const breakdown = {};
        this.enemies.forEach(enemy => {
            breakdown[enemy.type] = (breakdown[enemy.type] || 0) + 1;
        });

        return breakdown;
    }

    /**
     * Get a snapshot of all enemies for debugging
     * @returns {Array<Object>} Snapshots of aall enemies
     */
    getSnapshot(){
        return this.enemies.map(enemy => enemy.getSnapshot());
    }
}

export default EnemyManager;

