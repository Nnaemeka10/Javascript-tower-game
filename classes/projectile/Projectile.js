

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
        //I'm using a collison radius so it doesnt get to the heart of the enemy and mess up the visuals previously it was the arrow length.
        //more like I changed from using the arrrow length to using the enemy radius plus a small buffer as a determinatnt for when to deal damage
        const collisonRadius = this.targetEnemy.radius + 10; // radius of the enemy plus a small buffer
        if (distance <= collisonRadius) {
            // damage the enemy
            this.dealDamage(); // Deal damage to the enemy
            this.hasHit = true; // Mark as hit
            return; // Stop updating the projectile
        }
        

        // Avoid division by zero and ensure that if are very close and haven't hit yet, we hit next frame
        //really doubting if it was necessaary to do this.
        if(distance < this.speed) {
            //move the projectile to the enemy's position
            this.x = this.targetEnemy.pixelX;
            this.y = this.targetEnemy.pixelY;
        } else {
            // Normalize the direction vector
            const directionX = deltaX / distance; // direction in x
            const directionY = deltaY / distance; // direction in y

            // Move the projectile towards the target enemy
            this.x += directionX * this.speed;
            this.y += directionY * this.speed;
        }      
    }

    dealDamage() {
        if (this.targetEnemy && this.targetEnemy.currentHealth > 0){
            this.targetEnemy.currentHealth -= this.damage;

            //An overdo validation to ensure health doesn't go below zero
            if (this.targetEnemy.currentHealth < 0) {
                this.targetEnemy.currentHealth = 0;
            }

            //small damage effects, might expand later
            this.targetEnemy.hitFlash = 5; //frames to flash
        }
    }


    draw(ctx) {

        if (!this.targetEnemy || this.hasHit) return; // Don't draw if no target enemy oor if arrow has hit



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