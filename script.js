
import drawGrid from "./functions/drawGrid.js";
import drawPath from "./functions/drawPath.js";
import {updateEnemies, drawEnemies, enemies, enemiesEscaped, resetEnemies } from "./functions/manageEnemies.js";
import manageTower, { handleTowerShooting, deselectTower, resetTowers } from "./functions/manageTower.js";
import drawTowers from "./functions/drawTowers.js";
import {updateProjectiles, drawProjectiles, resetProjectiles} from "./functions/manageProjectiles.js";
import drawUI from "./functions/drawUI.js";
import { getTowerCost } from "./functions/manageTower.js";


export const gameLife = 20;



import { initCanvasResizer, getCtx, getCanvasDimensions, getTileSize } from "./functions/resizeCanvas.js";
import WaveManager from "./classes/gameManagers/WaveManager.js";
import MoneyManager from "./classes/gameManagers/MoneyManager.js";

//game states
let gamePaused = false;
let gameRunning = false;
let animationID;
// Initialize canvas and context
let canvas = null


document.addEventListener('DOMContentLoaded', () => {
    initialzeGame();
});

function initialzeGame() {
    try {
        // Initialize canvas resizer and get context
        const ctx = initCanvasResizer({ 
            canvasId: 'gameCanvas',
            debounceDelay: 100,
        });

        if(!ctx) {
            throw new Error('Canvas context initialization failed');
        }

        //get canvas reference for even listners
        canvas = document.getElementById('gameCanvas');

        if(!canvas) {
            throw new Error('Canvas element not found');
        }

        console.log('Canvas and context initialized successfully');

        // set up event listners
        setupEventListeners();

        // start the render loop
        gameLoop();

    } catch (error) {
        console.error('Failed to initialize game', error);

        // Optionally, display an error message to the user
        showErrorMessage('An error occurred while initializing the game. Please try refreshing the page.');
    }
}

// Game loop
const gameLoop = () => {
    try{
        const ctx = getCtx()
        const canvas = getCanvasDimensions()

        //lets clear the canvas each time the game loop runs
        ctx.clearRect(0, 0, canvas.cssWidth, canvas.cssHeight);

        //Always draw static elements
        // draw grid
        drawGrid(ctx);

        // draw path
        drawPath(ctx);

        //update game logic if game is running and not paused
        if (gameRunning) {
            if(!gamePaused) {
                updateEnemies();
                handleTowerShooting(enemies);
                updateProjectiles();
            }

            drawEnemies(ctx);
            drawTowers(ctx);
            drawProjectiles(ctx);

            checkGameOver();
        };
        
          //always draw game ui
          // draw text for enemies escaped
           // draw towers
          drawUI(ctx);

        // loop on next frame
        animationID = requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Error during game loop:', error);

        //try to continue or stop gracefully
        animationID = requestAnimationFrame(gameLoop);
    }
    
};

// Setup all event Listeners
function setupEventListeners() {
    // mouse click for tower placement
    canvas.addEventListener('click', handleMouseClick);

    // Game control buttons
    const startWave = document.getElementById('Start-Wave');
    const pause = document.getElementById('pause');
    const endGame = document.getElementById('End-Game');

    if (startWave) startWave.addEventListener('click', startGame);
    if (pause) pause.addEventListener('click', () => {
        if(gameRunning) {
            if(gamePaused) {
                resumeGame();
            } else {
                pauseGame();
            }
        }
    });
    if (endGame) endGame.addEventListener('click', stopGame);

    // Keyboard events
    document.addEventListener('keydown', handleKeyPress);

    // handle canvas resize events
    window.addEventListener('canvasResized', handleCanvasResize);
}

// Handle mouse click
// Event listener for mouse click to manage tower placement
function handleMouseClick(e) {
    try {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        
        if (gameRunning && !gamePaused) {
            // This will add a tower at the clicked position if it's not on the path and no tower exists there
            const result = manageTower(mouseX, mouseY);

            //provide user feedback
            if(!result.success) {
                handleTowerPlacementError(result.reason);
            }
        }

    } catch (error) {
        console.error('Error handling mouse click:', error);
    }
}

//handle tower placement errors
function handleTowerPlacementError(reason) {
    let message = '';
    switch(reason) {
        case 'insufficient_funds':
            message = `Need ${getTowerCost()} more to place tower`;
            break;
        case 'on_path':
            message = 'Cannot place tower on path';
            break;
        case 'tower_exists':
            message = 'Tower already exists here';
            break;  
        default:
            message = 'Cannot place tower here';
    }
    console.log(message);

    //visual feedback can be added here
}

// Handle keyboard inputs
function handleKeyPress(e) {
    switch (e.code) {
        case 'Escape':
            deselectTower();
            break;
        case 'Space':
            e.preventDefault();
            if (gameRunning) {
                if (gamePaused) {
                    resumeGame();
                } else {
                    pauseGame();
                }
            }
            break;

        default:
            break;
    }
}

//function handleCanvasResize
function handleCanvasResize(e) {
    console.log('Canvas resized:', e.detail);
    // Additional handling can be done here if needed
}

//Game control functions
 const startGame = () => {
        if (!gameRunning) {
            gameRunning = true;
            gamePaused = false;
            console.log('Game Started');

            //update ui
            updateGameControlUI();
        }
    };

const pauseGame = () => {
    if (gameRunning && !gamePaused) {
        gamePaused = true;
        console.log('Game Paused');

        //update UI
        updateGameControlUI();
    }
};

const resumeGame = () => {
    if (gameRunning && gamePaused) {
        gamePaused = false;
        console.log('Game Resumed');

        //update UI
        updateGameControlUI();
    }
};

const stopGame = () => {  
        gameRunning = false;
        gamePaused = false;
        console.log('Game Stopped');

        //update UI
        updateGameControlUI();
        resetGameState();
};

function updateGameControlUI() {
    const playButton = document.getElementById('pause');

    if (playButton) {
        if (gameRunning && !gamePaused) {
            playButton.textContent = '⏸️';
        }else {
            playButton.textContent = '▶️';
        }
    }
}

function checkGameOver() {
    if(enemiesEscaped >= gameLife) {
        gameover('Too many enemies escaped!');
    }

    //add other game over conditions as needed
}

//handle game over
function gameover(reason) {
    console.log('Game Over:', reason);
    stopGame();
     // Display game over message to user
    showGameOverMessage(reason);
    resetGameState(); 
}

function showGameOverMessage(reason) {
    //show game over message
    console.log('Game Over! ', reason);
    alert(`Game Over! ${reason}`); //better ui later
}

function showErrorMessage(message) {
    alert(message); //better ui later
    console.error(message);
}

function resetGameState() {
    WaveManager.reset();
    resetEnemies();
    resetTowers();
    resetProjectiles();
    MoneyManager.reset();
    gameLife = 20;
}




// List of things to do:
// 1. Add a way to end the game when lives reach 0
// 2. Add a way to display the game over message
// 3. ingame menu  
// 6. add a way to upgrade towers
// 7. add sounds
// 8. add enemies that fight for you via confusion tower
// 9. hammer power up that instantly kills all enemies on range
// 10 tower for decreasing ememy speed
// 11. wateRway for ships

// rocket launcher
// automatic gun