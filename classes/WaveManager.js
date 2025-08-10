import Dragon from "./Dragon.js";
import Dwarve from "./Dwarve.js";
import Elve from "./Elve.js";
import Goblin from "./Goblin.js";
import Hobbit from "./Hobbit.js";


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
        
        //Enemy types available for spawning
        this.enemyTypes = [
            //will edit this later with info from the goblin class
            {class: Goblin, xpCost: 2},
            {class: Dwarve, xpCost: 2},
            {class: Elve, xpCost: 4},
            {class: Hobbit, xpCost: 1},
            {class: Dragon, xpCost: 2},
        ];
    }


    //Get available enemy types based on the current wave
    getAvailableEnemyTypes () {
        let availableTypes = []

        if (this.currentWave <= 3) {
            //rule 1, no elves until wave 4
            availableTypes = this.enemyTypes.filter(type => type.class !== Elve );
        } else if (this.currentWave <= 10) {
            //probability based elve spawning from wave 4-10
            const elfProbability = (this.currentWave -3) / 8; // gradually increase from 12.5% to close to 100%
             
            if(Math.random() < elfProbability) {
                availableTypes = this.enemyTypes; //include elves
            } else {
                availableTypes = this.enemyTypes.filter(type => type.class !== Elve);
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
            return new enemyType.class();
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

}

export default new WaveManager();