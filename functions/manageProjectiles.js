import Projectile from "../classes/projectile/Projectile.js";

let projectiles = []; // Array to hold all projectiles


function updateProjectiles() {
    //update each projectile
    projectiles = projectiles.filter((projectile)=> {
        projectile.update();

        //remove if has hit
        if (projectile.hasHit) {
            return false; // Remove projectile from the array
        }

        return true; // Keep the projectile in the array
    });
}


function drawProjectiles(ctx) {
    // draw each projectile
    for (const projectile of projectiles) {
        console.log(projectiles)
        projectile.draw(ctx);
    }
}
// Function to create a new projectile
function createProjectile(startX, startY, targetEnemy, damage) {
    if (targetEnemy && targetEnemy.currentHealth > 0) {
        projectiles.push(new Projectile(startX, startY, targetEnemy, damage));
    }
}

function resetProjectiles () {
    projectiles = []
}

// Export the projectile array for other modules to access
export {updateProjectiles, drawProjectiles, createProjectile, resetProjectiles, projectiles };