
import drawGrid from "./functions/drawGrid.js";
import { canvas } from "./utils/constants.js";
import drawPath from "./functions/drawPath.js";
import createEnemy, { enemies } from "./functions/createEnemy.js";
import manageTower, { handleTowerShooting } from "./functions/manageTower.js";
import drawTowers from "./functions/drawTowers.js";
import manageProjectiles from "./functions/manageProjectiles.js";


const ctx = canvas.getContext('2d');
let enemiesEscaped = 0; // Counter for escaped enemies
const gameLife = 20; // Game live counter



// Game loop
const gameLoop = () => {
    //lets clear the canvas each time the game loop runs
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw grid
    drawGrid(ctx);

    // draw path
    drawPath(ctx);

    // create and update  and draw enemy
    enemiesEscaped = createEnemy(ctx, enemiesEscaped);

    // handle tower shooting
    handleTowerShooting(enemies);

   // draw towers
   drawTowers(ctx);
   
    // manage projectiles
    manageProjectiles(ctx);

    // draw text for enemies escaped
    drawText();

    // loop on next frame
    requestAnimationFrame(gameLoop);
}



// Event listener for mouse click to manage tower placement
// This will add a tower at the clicked position if it's not on the path and no tower exists there
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    

    manageTower(mouseX, mouseY, ctx);
});


   


 const drawText = () => {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(`Lives left: ${gameLife - enemiesEscaped}`, 150, 50);
}


// start game

gameLoop();