import { TOWER_CONFIG } from "../../../src/features/towers/towerConfig.js";
import Tower from "../Tower.js";

export default class Cannon extends Tower {
   constructor(x, y) {
        const { range, fireRate, damage, color, highlightColor } = TOWER_CONFIG.Cannon;
        super(x, y, range, fireRate, damage, color, highlightColor);
    }
}