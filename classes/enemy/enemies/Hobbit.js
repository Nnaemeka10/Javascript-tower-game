import { ENEMY_CONFIG } from '../../../utils/enemyConfig.js';
import Enemy from '../Enemy.js'

export default class Hobbit extends Enemy {
    constructor(scaledHealth) {
        const cfg = ENEMY_CONFIG.Hobbit;
        super(scaledHealth, cfg.baseHealth, cfg.speed, cfg.color);
    }
}