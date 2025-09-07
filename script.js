
import drawGrid from "./functions/drawGrid.js";
import { canvas } from "./utils/constants.js";
import drawPath from "./functions/drawPath.js";
import manageEnemies, { enemies } from "./functions/manageEnemies.js";
import manageTower, { handleTowerShooting, isTowerSelected, deselectTower } from "./functions/manageTower.js";
import drawTowers from "./functions/drawTowers.js";
import manageProjectiles from "./functions/manageProjectiles.js";
import drawUI from "./functions/drawUI.js";


import { ctx } from "./utils/constants.js";
import { initCanvasResizer } from "./functions/resizeCanvas.js";


//game states
let gamePaused = false;
let gameRunning = false;
let animationID;

initCanvasResizer();

// Game loop
const gameLoop = () => {
    //lets clear the canvas each time the game loop runs
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw grid
    drawGrid(ctx);

    // draw path
    drawPath(ctx);

    if (!gameRunning || gamePaused) return; // Stop the loop if the game is not running or paused
    // create and update  and draw enemy
    manageEnemies(ctx);

    // handle tower shooting
    handleTowerShooting(enemies);

   // draw towers
    drawTowers(ctx);
   
    // manage projectiles
    manageProjectiles(ctx);

    // draw text for enemies escaped
    drawUI();

    // loop on next frame
    animationID = requestAnimationFrame(gameLoop);
}



// Event listener for mouse click to manage tower placement
// This will add a tower at the clicked position if it's not on the path and no tower exists there
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    

    manageTower(mouseX, mouseY, ctx);
});

    const pauseGame = () => {
        // Function to pause the game
        // This can be implemented by stopping the game 
        if (gameRunning && !gamePaused) {
            gamePaused = true;
            cancelAnimationFrame(animationID);
        }
    }

    const resumeGame = () => {
        if (gameRunning && gamePaused) {
            gamePaused = false;
            animationID = requestAnimationFrame(gameLoop);
        }
    }

    const startGame = () => {
        if (!gameRunning) {
            gameRunning = true;
            gamePaused = false;
            animationID = requestAnimationFrame(gameLoop);
        }
    }

    const stopGame = () => {  
        gameRunning = false;
        gamePaused = false;
        cancelAnimationFrame(animationID);
        // Additional reset logic can be added here if needed
    }

    document.getElementById('play').addEventListener('click', startGame);
    document.getElementById('wavecontrols').addEventListener('click', pauseGame);
    document.getElementById('speed').addEventListener('click', resumeGame);

   //event listner for keyboard escape
   document.addEventListener('keydown', e => {
    switch (e.code) {
        case 'Escape':
            deselectTower();
            break;
        case 'Space':
            e.preventDefault();
            //pause game
            pauseGame();
            break;
        default:
            break;
    }
   }); 

gameLoop()
// List of things to do:
// 1. Add a way to end the game when lives reach 0
// 2. Add a way to display the game over message
// 3. ingame menu  
// 6. add a way to upgrade towers