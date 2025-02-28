import * as PIXI from 'pixi.js';
import { playerConfig } from './config.js';
import { input } from './input.js';

export class Player {
    constructor(app) {
        this.app = app;
        console.log('Creating player sprite');
        
        // Create a simple red rectangle using modern Graphics API
        this.sprite = new PIXI.Graphics()
            .rect(0, 0, playerConfig.size, playerConfig.size)
            .fill(playerConfig.color);

        // Log initial position values
        const centerX = (app.screen.width - playerConfig.size) / 2;
        const centerY = (app.screen.height - playerConfig.size) / 2;
        console.log('Screen dimensions:', app.screen.width, app.screen.height);
        console.log('Setting player position to:', centerX, centerY);

        // Set initial position to center
        this.sprite.x = centerX;
        this.sprite.y = centerY;

        // Add to stage
        app.stage.addChild(this.sprite);
        console.log('Player added to stage');

        // Start update loop
        this.app.ticker.add(() => this.update());
    }

    update() {
        // Update position based on input
        if (input.isPressed('ArrowLeft') && this.sprite.x > 0) {
            this.sprite.x -= playerConfig.speed;
        }
        if (input.isPressed('ArrowRight') && this.sprite.x < this.app.screen.width - this.sprite.width) {
            this.sprite.x += playerConfig.speed;
        }
        if (input.isPressed('ArrowUp') && this.sprite.y > 0) {
            this.sprite.y -= playerConfig.speed;
        }
        if (input.isPressed('ArrowDown') && this.sprite.y < this.app.screen.height - this.sprite.height) {
            this.sprite.y += playerConfig.speed;
        }
    }
}
