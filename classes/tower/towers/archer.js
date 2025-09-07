import { TOWER_CONFIG } from "../../../utils/towerConfig.js";
import Tower from "../Tower.js";

export default class Archer extends Tower {
   constructor(x, y) {
        const { range, fireRate, damage, color, highlightColor } = TOWER_CONFIG.Archer;
        super(x, y, range, fireRate, damage, color, highlightColor);
    }
}