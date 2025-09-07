import { ENEMY_CONFIG } from '../../../utils/enemyConfig.js';
import Enemy from '../Enemy.js'

export default class Elve extends Enemy {
    constructor(scaledHealth) {
        const {baseHealth, speed, color} = ENEMY_CONFIG.Elve;
        super(scaledHealth, baseHealth, speed, color);
    }
}