

export default class Projectile {
    constructor(startX, startY, targetEnemy, damage) {
        this.x = startX; // starting x position
        this.y = startY;
        this.targetEnemy = targetEnemy; // the enemy this projectile is targeting
        this.damage = damage;
        this.speed = 5; // speed of the projectile
        this.length = 15; // length of the projectile
        this.hasHit = false; // flag to check if the projectile has hit the enemy
    }

    update() {
        if(!this.targetEnemy || this.targetEnemy.currentHealth <= 0) {
            this.hasHit = true; // Mark as hit if the target is dead or not set
            return;
        }

        // Calculate the direction vector towards the target enemy
        const deltaX = this.targetEnemy.pixelX - this.x; // difference in x
        const deltaY = this.targetEnemy.pixelY - this.y; // difference in y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // distance to the target

        //Check if the projectile has reached the enemy
        if (distance < this.length) {
            this.targetEnemy.currentHealth -= this.damage; // Deal damage to the enemy
            this.hasHit = true; // Mark as hit
            return; // Stop updating the projectile
        }

        // Normalize the direction vector
        const directionX = deltaX / distance; // direction in x
        const directionY = deltaY / distance; // direction in y

        // Move the projectile towards the target enemy
        this.x += directionX * this.speed;
        this.y += directionY * this.speed;
    }

    draw(ctx) {
        

        if (!this.targetEnemy) return; // Don't draw if no target enemy
        if (this.hasHit) return; // Don't draw if the projectile has hit the enemy



        //calculate the direction for drawing the projectile
        const deltaX = this.targetEnemy.pixelX - this.x;
        const deltaY = this.targetEnemy.pixelY - this.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // avoid division by zero
        if (distance === 0) return;

        // Normalize the direction vector
        const directionX = deltaX / distance;
        const directionY = deltaY / distance;

        // calculate the line end points
        const endX = this.x + directionX * this.length;
        const endY = this.y + directionY * this.length;

        // Draw the projectile as a line
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y); // start point
        ctx.lineTo(endX, endY); // end point
        ctx.stroke();
    }
}