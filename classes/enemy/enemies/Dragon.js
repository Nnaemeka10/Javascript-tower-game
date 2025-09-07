import { ENEMY_CONFIG } from '../../../utils/enemyConfig.js';
import Enemy from '../Enemy.js'


export default class Dragon extends Enemy {
    constructor(scaledHealth) {
        const {baseHealth, speed, color} = ENEMY_CONFIG.Dragon;
        super(scaledHealth, baseHealth, speed, color);
    }
}