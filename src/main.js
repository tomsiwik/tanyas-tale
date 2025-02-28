import * as PIXI from 'pixi.js';
import { config } from './game/config.js';
import { Player } from './game/player.js';

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

    // Create player
    new Player(app);
}

// Start the game
startGame().catch(console.error);
