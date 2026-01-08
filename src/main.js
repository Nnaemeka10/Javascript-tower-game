/**
 * Main Entry Point
 * Initializes and starts the game with platform-agnostic rendering.
 * 
 * Architecture:
 * Platform (DOM) → RenderSurface (adapter) → GameEngine → Game logic
 * 
 * This file handles:
 * - Canvas DOM access (ONLY place where DOM is accessed for canvas)
 * - RenderSurface creation
 * - GameEngine initialization
 * - Keyboard shortcuts
 * - UI event listeners
 */

import GameEngine from "./core/GameEngine";
import WebSurface from "./rendering/WebSurface";
import { CANVAS_CONFIG } from './utils/constants;'

//GLOBALS
let gameEngine = null;
let renderSurface = null;

//INITIALIZATION
/**
 * Initialize game when dom is ready
 */
async function initializeGame() {
    try {
        console.log('Initializing tower defence game......');

        //get canvas element (only dom access for canvas)
        const canvas = document.getElementById(CANVAS_CONFIG.canvasId);
        if(!canvas) {
            throw new Error(`Canvas element with ID "${CANVAS_CONFIG.canvasId}" not found`);
        }

        //create render surface (platform adapter)
        renderSurface = new WebSurface(canvas, {
            autoResize: true,
            useDevicePixelRatio: true,
            enableCamera: true,
        });

        console.log('Render surface created');

        //create game engine and inject render surface
        gameEngine = new GameEngine(renderSurface);

        //initialize all systems
        await gameEngine.initialize();

        //setup event listners
        setupKeyBoardShortcuts();
        setupUIEventListeners();
        setupCanvasEventListeners();
        setupWindowEventListeners();

        console.log('Game Ready to start!');
        console.log('Press space or click start to begin')

    } catch (error) {
        console.error(' Failed to initialize game:', error);
        showErrorDialog('Failed to initialize game. check console for details.');
    }
}

//KEYBOARD SHORTCUTS
function setupKeyBoardShortcuts(){}
function handleSpaceKey(){}
function handleEscapeKey(){}
function handlePauseKey(){}
function handleResetKey(){}
function handleDebugKey(){}
function handleTowerSelectionKey(){}


//UI EVENT LISTENERS
function setupUIEventListeners(){}

//CANVAS EVENT LISTENERS
function setupCanvasEventListeners(){}

function handleCanvasClick (){}

function handleCanvasMouseMove(){}

function handleCanvasMouseDown(){}

function handleCanvasMouseUp(){}

function handleCanvasMouseLeave(){}

function handleCanvasDragOver(){}

function handleCanvasDrop(){}



//WINDOWS EVENT LISTENERS

function setupWindowEventListeners(){}

//UTILITY FUNCTIONS
function showErrorDialog(){}

function getGameEngine(){}

function getRenderSurface(){}

//ENTRY POINT
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

//export for global access(debugging in console
window.gameEngine = gameEngine;
window.renderSurface = renderSurface;
window.getGameEngine = getGameEngine;
window.getRenderSurface = getRenderSurface;

console.log('main.js loaded (Platform - RenderSurface - GameEngine)')