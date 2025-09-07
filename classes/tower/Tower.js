import { getTileSize } from "../../functions/resizeCanvas.js";



export default class Tower {

    constructor(x, y, range = 2, fireRate = 60, damage = 10, color = 'blue', highlightColor = 'lightblue') {
        this.x = x; // grid column
        this.y = y; // grid row
        this.range = range; // range of the tower in tiles or tiles in radius
        this.fireRate = fireRate // time between shots in miliseconds or cooldown
        this.cooldown = 0; // cooldown timer for firing
        this.damage = damage; // damage dealt to enemies
        this.color = color; // color of the tower
        this.highlightColor = highlightColor; // color when selected
        this.currentTarget = null; // the enemy currently targeted by the tower
    }

    getPixelPosition() {
        const TILE_SIZE = getTileSize();
        return {
            pixelX: this.x * TILE_SIZE + TILE_SIZE / 2,
            pixelY: this.y * TILE_SIZE + TILE_SIZE / 2,
        };
    }

    getRadius() {
        const TILE_SIZE = getTileSize();
        return TILE_SIZE / 3; // radius is one-third of the tile size
    }


    //find the best target (closest enemy in range and furtherest in path)
    findTarget(enemies) {
        let bestTarget = null; // The best target found so far
        let furtherestDistance = -1; // Start with a negative distance to find the closest enemy
        for (const enemy of enemies) {
            // check if the enemy is within range
            if (this.isInRange(enemy)) {
                //calculate how far along the path the enemy is
                // higher curent tile + progress means further along the path
                const totalProgress = enemy.currentTile + enemy.progress; // current tile + progress towards next tile

                
                if (totalProgress > furtherestDistance) {
                    // If this enemy is further along the path than the best target found so far
                    furtherestDistance = totalProgress; // Update the furthest distance
                    bestTarget = enemy; // Update the best target
                }
            }
        }
        return bestTarget; // Return the best target found
    }

    isInRange(enemy) {
        const TILE_SIZE = getTileSize();
        const { pixelX, pixelY } = this.getPixelPosition();
        // Calculate the distance to the enemy
        const deltaX =enemy.pixelX - pixelX; // difference in x
        const deltaY = enemy.pixelY - pixelY; // difference in y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // distance to the enemy

        //convert the range from tiles to pixels
        const rangeInPixels = this.range * TILE_SIZE; // range in pixels

        return distance <= rangeInPixels; // Check if the enemy is within range
    }


    // method to update the tower's state 
    update(enemies) {
        // Check if the tower is not ready to fire
        if (this.cooldown > 0) {
            this.cooldown--; // Decrease the cooldown timer
        }

        // check if current target is still valid(if it exists and is alive) 
        if( this.currentTarget) {
            if(this.currentTarget.currentHealth <= 0 || !this.isInRange(this.currentTarget)) {
                this.currentTarget = null; // Clear the target if it's dead or out of range
            }
        }

        // If no current target, find a new one
        if (!this.currentTarget) {
            this.currentTarget = this.findTarget(enemies); // Find a new target
        }

        // If a target is found and the tower is ready to fire
        if (this.currentTarget && this.cooldown <= 0) {
            const { pixelX, pixelY } = this.getPixelPosition();
            this.cooldown = this.fireRate; // Reset the cooldown timer  
            return {
                shoot: true, // Indicate that the tower is shooting
                target: this.currentTarget, // Return the target enemy
                startX: pixelX, // Starting x position of the projectile
                startY: pixelY, // Starting y position of the projectile
                damage: this.damage // Damage dealt by the projectile
            };
        }
        return { shoot: false }; // Indicate that the tower is not shooting
     }


    // method to draw the tower
    draw(ctx, isSelected = false) {
        const TILE_SIZE = getTileSize();
        const { pixelX, pixelY } = this.getPixelPosition();
        const radius = this.getRadius();
        
        //change the tower color based on selection
        ctx.fillStyle = isSelected ? this.highlightColor : this.color;
        ctx.beginPath();
        ctx.arc(
            pixelX, // center x
            pixelY, // center y
            radius, // radius
            0, // start angle
            Math.PI * 2 // end angle
        );
        ctx.fill();


        if (isSelected) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pixelX, pixelY, this.range * TILE_SIZE, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw the tower border, not really necessary
        ctx.strokeStyle = 'darkblue';
        ctx.lineWidth = 2;
        ctx.beginPath ();
        ctx.arc(
            pixelX, // center x
            pixelY, // center y
            radius, // radius
            0, // start angle
            Math.PI * 2 // end angle
        );
        ctx.stroke();
    }
}