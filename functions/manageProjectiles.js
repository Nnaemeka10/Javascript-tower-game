import Projectile from "../classes/Projectile.js";

let projectiles = []; // Array to hold all projectiles

export default function manageProjectiles(ctx) {
    //update each projectile
    projectiles = projectiles.filter((projectile)=> {
        projectile.update();

        //remove if has hit
        if (projectile.hasHit) {
            return false; // Remove projectile from the array
        }

        return true; // Keep the projectile in the array
    });

    // draw each projectile
    for (const projectile of projectiles) {
        projectile.draw(ctx);
    }
}

// Function to create a new projectile
export function createProjectile(startX, startY, targetEnemy, damage) {
    projectiles.push(new Projectile(startX, startY, targetEnemy, damage));
}

// Export the projectile array for other modules to access
export { projectiles };