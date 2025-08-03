import { TILE_SIZE } from '../utils/constants.js';

export default class Tower {
    constructor(x, y) {
        this.x = x; // grid column
        this.y = y; // grid row
        this.range = 2; // range of the tower in tiles or tiles in radius
        this.fireRate = 60 // time between shots in miliseconds or cooldown
        this.cooldown = 0; // cooldown timer for firing
        this.damage = 10; // damage dealt to enemies
        this.radius = TILE_SIZE / 3; // radius of the tower 
    }

    // method to draw the tower
    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE / 2, // center x
            this.y * TILE_SIZE + TILE_SIZE / 2, // center y
            this.radius, // radius
            0, // start angle
            Math.PI * 2 // end angle
        );
        ctx.fill();
    }
}