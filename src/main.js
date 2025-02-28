import * as PIXI from 'pixi.js';
import { config } from './game/config.js';
import { playerConfig } from './game/config.js';
import { Player } from './game/player.js';

async function startGame() {
    // Initialize PIXI Application
    const app = new PIXI.Application();
    await app.init({
        ...config,
        backgroundAlpha: 1,
        hello: true,
        antialias: false, // Disable antialiasing for pixel-perfect rendering
        fps: 24
    });

    // Apply zoom by scaling the stage
    app.stage.scale.set(playerConfig.zoom);

    // Add canvas to page
    document.querySelector('#app').appendChild(app.canvas);

    // Create player
    new Player(app);
}

startGame().catch(console.error);
