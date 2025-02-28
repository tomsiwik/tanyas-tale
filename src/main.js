import * as PIXI from 'pixi.js';
import { config } from './game/config.js';
import { Player } from './game/player.js';

async function startGame() {
    // Initialize PIXI Application
    const app = new PIXI.Application();
    await app.init({
        ...config,
        backgroundAlpha: 1,
        hello: true,
        antialias: false,
        fps: 24
    });

    // Add canvas to page
    document.querySelector('#app').appendChild(app.canvas);

    // Create player
    new Player(app);
}

startGame().catch(console.error);
