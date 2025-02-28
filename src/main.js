import * as PIXI from 'pixi.js';
import { config } from './game/config.js';
import { Player } from './game/player.js';
import { GameUI } from './game/ui.js';

async function startGame() {
    // Initialize PIXI Application with simplified config
    const app = new PIXI.Application();
    await app.init({
        ...config,
        backgroundAlpha: 1,
        antialias: false, // Disable antialiasing for pixel-perfect rendering
        fps: 24 // Set to 24 FPS for retro feel
    });

    // Add canvas to page
    document.querySelector('#app').appendChild(app.canvas);

    // Hide the default cursor
    app.canvas.style.cursor = 'none';

    // Create player
    const player = new Player(app);
    
    // Create UI
    const ui = new GameUI(app);
}

// Start the game
startGame().catch(console.error);
