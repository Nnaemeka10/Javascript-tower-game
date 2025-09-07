import { startingBudget as defaultBudget } from "../../utils/constants.js";

class MoneyManager {
    constructor ( startingBudget = defaultBudget) {
       this.currentMoney = startingBudget;
       this.totalEarned = startingBudget;
       this.totalSpent = 0;
    }

    addMoney(enemy) {
        //calculate Money
        const rawMoney = enemy.scaledHealth * enemy.speed;
        const roundedMoney = Math.round(rawMoney) * 10;

        this.currentMoney += roundedMoney;
        this. totalEarned += roundedMoney

        console.log(`Enemy killed! Added ${roundedMoney} coins. Total: ${this.currentMoney}`);
        return roundedMoney;
    }

    //spend monry (for towers, upgrades, etc)
    spendMoney(amount){
        if(this.canAfford(amount)) {
            this.currentMoney -= amount;
            this.totalSpent += amount;
            return true;
        }
        return false;
    }

    //check if we can afford something
    canAfford(amount) {
        return this.currentMoney >= amount;
    }

    //get curent money for ui
    getCurrentMoney () {
        return this.currentMoney;
    }

    //strictly for debug purposes
    getMoneyStats () {
        return {
            current: this.currentMoney,
            totalEarned: this.totalEarned,
            totalSpent: this.totalSpent
        };
    }

    //for resets after game over
    reset(startingBudget = defaultBudget) {
        this.currentMoney = startingBudget;
        this.totalEarned = startingBudget;
        this.totalSpent = 0;
    }

}

export default new MoneyManager();