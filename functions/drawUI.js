
import MoneyManager from '../classes/gameManagers/MoneyManager.js';
import  waveManager  from '../classes/gameManagers/WaveManager.js';

import { gameLife } from '../script.js';
import { enemiesEscaped } from './manageEnemies.js';
import { getCanvasDimensions } from './resizeCanvas.js';


export default function drawUI (ctx) {
    const waveInfo = waveManager.getWaveInfo();
    const moneyInfo = MoneyManager.getCurrentMoney();
    
    const canvas = getCanvasDimensions()
    //draw 'wave incoming
    if(waveInfo.showWaveMessage) {
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${waveInfo.currentWave} Incoming!`, (canvas.width / 2)-150, 50);
        ctx.textAlign = 'left'; // reset alignment
    }
    document.getElementById('money').querySelector('span').textContent = `$ ${moneyInfo}`
    document.getElementById('wave-text').textContent = `Wave: ${waveInfo.currentWave}`
    document.getElementById('scores').querySelector('span').textContent = waveInfo.totalXPKilled *15
    document.getElementById('lives').querySelector('span').textContent = gameLife - enemiesEscaped;

    document.querySelector('.waveFill').style.width = (waveInfo.waveProgress * 100) + '%';
}

export function resetUI () {
    const waveInfo = waveManager.getWaveInfo();
    const moneyInfo = MoneyManager.getCurrentMoney();
    
    const canvas = getCanvasDimensions()

    document.getElementById('money').querySelector('span').textContent = `$ ${moneyInfo}`
    document.getElementById('wave-text').textContent = `Wave: ${waveInfo.currentWave}`
    document.getElementById('scores').querySelector('span').textContent = waveInfo.totalXPKilled *15
    document.getElementById('lives').querySelector('span').textContent = gameLife - enemiesEscaped;

    document.querySelector('.waveFill').style.width = (waveInfo.waveProgress * 100) + '%';
}