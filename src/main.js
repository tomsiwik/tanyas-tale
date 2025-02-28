import * as PIXI from 'pixi.js';
import { config } from './game/config.js';
import { Player } from './game/player.js';

async function startGame() {
    // Initialize PIXI Application
    const app = new PIXI.Application();
    await app.init(config);

    // Add canvas to page and set its style
    const canvas = app.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    document.querySelector('#app').appendChild(canvas);

    // Handle window resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    // Create player
    new Player(app);
}

startGame().catch(console.error);
