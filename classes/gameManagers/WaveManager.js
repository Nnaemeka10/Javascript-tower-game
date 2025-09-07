import { ENEMY_CONFIG } from "../../utils/enemyConfig.js";

class WaveManager {
    constructor() {
        this.currentWave = 1;
        this.baseXP = 10; //starting xp budget for wave 1
        this.currentWaveXP = this.baseXP;
        this.spentXP = 0; //XP spent in current wavw
        this.waveInProgress = true;
        this.allEnemiesSpawned = false; //flag to track enemy spawning
        this.showWaveMessage = false; //flag to show incoming wave message
        this.waveMessageTimer = 0; //timer for wave message display
        this.totalXPKilled = 0; //track total xp for killed enemies
        
        //track which enemmies have spawned
        this.spawnedEnemyTypes = new Set()
        //track which enemy apperared and when each enemy spawned
        this.firstSpawnWave = new Map();

        //Enemy types available for spawning from the enemy config
        this.enemyTypes = Object.entries(ENEMY_CONFIG).map(([name, cfg]) => {
            const xpCost = cfg.speed * cfg.baseHealth;
            return {
                name,
                class: cfg.class,
                ...cfg,
                xpCost,
            };
        });
    }


    //Get scaled health for an enemy type
    getScaledHealth (enemyType) {
        const hasSpawned = this.spawnedEnemyTypes.has(enemyType.name);

        if (!hasSpawned) {
            //first time spawning
            return enemyType.baseHealth;
        } else {
            // Calculate health increase 5 HP per wave since first spawn
            const wavesSinceFirstSpawn = this.getWavesSinceFirstSpawn(enemyType.name);
            const healthIncrease = wavesSinceFirstSpawn * 5 
            return  enemyType.baseHealth + healthIncrease;
        }
    }

    //track when enemy type first spawned
    getWavesSinceFirstSpawn(enemyTypeName) {
        //we will store this data in a map later for more precision
        if(!this.firstSpawnWave.has(enemyTypeName)) {
            return 0;
        }

        const firstWave = this.firstSpawnWave.get(enemyTypeName);
        return this.currentWave - firstWave
        
    }
    //Get available enemy types based on the current wave
    getAvailableEnemyTypes () {

        let availableTypes = []

        if (this.currentWave <= 3) {
            //rule 1, no elves until wave 4
            availableTypes = this.enemyTypes.filter(type => type.name !== "Elve");
        } else if (this.currentWave <= 10) {
            //probability based elve spawning from wave 4-10
            const elfProbability = (this.currentWave -3) / 8; // gradually increase from 12.5% to close to 100%
             
            if(Math.random() < elfProbability) {
                availableTypes = this.enemyTypes; //include elves
            } else {
                availableTypes = this.enemyTypes.filter(type => type.name !== "Elve");
            }
        } else {
            //wave 10 and above, all enemies available equally
            availableTypes = this.enemyTypes;
        }

        return availableTypes;
    }

    //Get a random enemy that fits within the remaining budget
    getRandomAffordableEnemy() {
        const availableTypes = this.getAvailableEnemyTypes();
        const remainingXP = this.currentWaveXP - this.spentXP

        //filter enemeis we can afford
        const affordableEnemies = availableTypes.filter(
            enemy => enemy.xpCost <= remainingXP
        );

        if(affordableEnemies.length === 0) {
            return null; //can't afford anymore enemies
        }

        //random selection from affordable enemies
        const randomIndex = Math.floor(Math.random() * affordableEnemies.length);
        return affordableEnemies[randomIndex];
    }

    //spawn enemy if all enemies havent been spawned
    // also update stuff that need to be updated per spawning
    handleSpawning () {
        if (this.allEnemiesSpawned) return null;

        const enemyType = this.getRandomAffordableEnemy();

        if (enemyType) {
            this.spentXP += enemyType.xpCost;

            // mark enemy as recently spawned
            this.spawnedEnemyTypes.add(enemyType.name);
            
            //record the wave spawned
            if (!this.firstSpawnWave.has(enemyType.name)) {
                this.firstSpawnWave.set(enemyType.name, this.currentWave);
            }

            //create enemy with scaled health
            const scaledHealth = this.getScaledHealth(enemyType)
            
            //pass scaled health into constructor
            return new enemyType.class(scaledHealth)
        } else {
            //can't afford any more enemies, our get affordable enemy returned null
            this.allEnemiesSpawned = true;

            console.log(`Wave ${this.currentWave}: Spawning complete. Spent ${this.spentXP}/${this.currentWaveXP} XP`);
            return null;
        }
    }

    //check if wave should end (all enemies dead or escaped)
    checkWaveComplete (activeEnemies) {
        return this.allEnemiesSpawned && activeEnemies.length === 0;
    }

    //start next wave
    startNextWave () {
        this.currentWave ++;
        //double each wave
        this.currentWaveXP = this.baseXP * Math.pow(2, this.currentWave -1);
        this.spentXP = 0;
        this.allEnemiesSpawned = false;
        this.waveInProgress = true;

        //show wave message
        this.showWaveMessage = true;
        this.waveMessageTimer = 180;

        console.log(`Starting Wave ${this.currentWave} with ${this.currentWaveXP} XP budget`);
    }

    //add XP when enemy is killed
    addKillXP(enemy) {
        this.totalXPKilled += enemy.xpCost;
    }

    updateWaveMessage () {
        if(this.waveMessageTimer > 0) {
            this.waveMessageTimer --;

            if ( this.waveMessageTimer <= 0 ) {
                this.showWaveMessage = false;
            }
        }
    }

    //Get wave status for UI
    getWaveInfo () {
        return {
            currentWave: this.currentWave,
            totalXPKilled: this.totalXPKilled,
            showWaveMessage: this.showWaveMessage,
            spentXP: this.spentXP,
            totalXP: this.currentWaveXP,
            waveProgress: this.spentXP / this.currentWaveXP  
        };
    }

    //get current health for debugging
    getCurrentHealthForType(enemyTypeName) {
        const enemyType = this.enemyTypes.find(type => type.name === enemyTypeName);
        return enemyType ? this.getScaledHealth(enemyType) : null;
    }

}

export default new WaveManager();