import { TOWER_CONFIG } from "../../../utils/towerConfig.js";
import Tower from "../Tower.js";

export default class Flamethrower extends Tower {
   constructor(x, y) {
        const { range, fireRate, damage, color, highlightColor } = TOWER_CONFIG.Flamethrower;
        super(x, y, range, fireRate, damage, color, highlightColor);
    }
}