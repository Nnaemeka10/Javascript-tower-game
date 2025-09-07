import { ctx } from '../utils/constants.js';
import  waveManager  from '../classes/gameManagers/WaveManager.js';

import { canvas, gameLife } from '../utils/constants.js';
import { enemiesEscaped } from './manageEnemies.js';



export default function drawUI () {
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