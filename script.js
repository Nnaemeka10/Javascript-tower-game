
import drawGrid from "./functions/drawGrid.js";
import { canvas } from "./utils/constants.js";
import drawPath from "./functions/drawPath.js";
import manageEnemies, { enemies } from "./functions/manageEnemies.js";
import manageTower, { handleTowerShooting, isTowerSelected, deselectTower } from "./functions/manageTower.js";
import drawTowers from "./functions/drawTowers.js";
import manageProjectiles from "./functions/manageProjectiles.js";
import waveManager from "./classes/gameManagers/WaveManager.js";


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
    enemiesEscaped = manageEnemies(ctx, enemiesEscaped);

    // handle tower shooting
    handleTowerShooting(enemies);

   // draw towers
   drawTowers(ctx);
   
    // manage projectiles
    manageProjectiles(ctx);

    // draw text for enemies escaped
    drawUI();

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


   //event listner for keyboard escape
   document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        deselectTower()
    }
   });


 const drawUI = () => {
    const waveInfo = waveManager.getWaveInfo();

    //draw 'wave incoming
    if(waveInfo.showWaveMessage) {
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${waveInfo.currentWave} Incoming!`, canvas.width / 2, 50);
        ctx.textAlign = 'left'; // reset alignment
    }

    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(`Wave: ${waveInfo.currentWave}`, 110, 80);
    ctx.fillText(`Total XP Killed: ${waveInfo.totalXPKilled}`, 110, 100);
    ctx.fillText(`Lives left: ${gameLife - enemiesEscaped}`, 110, 120);
    
    // Draw wave progress bar (optional visual feedback)
    const barWidth = 200;
    const barHeight = 10;
    const barX = 350;
    const barY = 80;
    
    // Background
    ctx.fillStyle = 'black';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress
    ctx.fillStyle = 'yellow';
    ctx.fillRect(barX, barY, barWidth * waveInfo.waveProgress, barHeight);
    
    // Border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Progress text
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Wave Progress: ${waveInfo.spentXP}/${waveInfo.totalXP} XP`, barX, barY + barHeight + 15);
}


// start game
gameLoop();   


// List of things to do:
// 1. Add a way to end the game when lives reach 0
// 2. Add a way to display the game over message
// 3. ingame menu  
// 5. add different types of towers
// 6. add a way to upgrade towers and a round system of increasingly defficult oponents