import * as PIXI from 'pixi.js';
import { playerConfig, Direction, AIM_POSITIONS } from './config.js';
import { input } from './input.js';

// Simple player state class
class PlayerState {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.moveDirection = Direction.NONE;
        this.aimDirection = Direction.NONE;
        this.isDucking = false;
    }
}

export class Player {
    constructor(app) {
        this.app = app;
        console.log('Creating player sprite');
        
        // Create container for player elements
        this.container = new PIXI.Container();
        
        // Create main square
        this.sprite = new PIXI.Graphics()
            .rect(0, 0, playerConfig.size, playerConfig.size)
            .fill(playerConfig.color);

        // Create inner direction indicator
        this.innerSprite = new PIXI.Graphics()
            .rect(0, 0, playerConfig.innerSize, playerConfig.innerSize)
            .fill(playerConfig.innerColor);
        this.innerSprite.visible = false; // Start with indicator hidden

        // Add sprites to container
        this.container.addChild(this.sprite);
        this.container.addChild(this.innerSprite);

        // Set initial position to center
        const centerX = Math.floor((app.screen.width - playerConfig.size) / 2);
        const centerY = Math.floor((app.screen.height - playerConfig.size) / 2);
        
        // Initialize player state
        this.state = new PlayerState(centerX, centerY);
        
        // Set initial container position
        this.container.x = this.state.x;
        this.container.y = this.state.y;

        // Add container to stage
        app.stage.addChild(this.container);
        console.log('Player added to stage');

        // Start update loop
        this.app.ticker.add(() => this.update());
    }

    updateDuckState() {
        const newDuckState = input.isDucking();
        if (this.state.isDucking !== newDuckState) {
            this.state.isDucking = newDuckState;
            // Clear and redraw with new color
            this.sprite.clear()
                .rect(0, 0, playerConfig.size, playerConfig.size)
                .fill(this.state.isDucking ? playerConfig.duckColor : playerConfig.color);
        }
    }

    getAimDirectionFromMouse() {
        const mouse = input.getMousePosition();
        const playerCenterX = this.state.x + playerConfig.size / 2;
        const playerCenterY = this.state.y + playerConfig.size / 2;

        const dx = mouse.x - playerCenterX;
        const dy = mouse.y - playerCenterY;
        
        // Return NONE if mouse is near center
        const minDistance = playerConfig.size;
        if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) {
            return Direction.NONE;
        }
        
        // Determine primary direction based on angle
        const angle = Math.atan2(dy, dx);
        const PI_8 = Math.PI / 8;
        
        // Use angle to determine direction (8 directions)
        if (angle > -PI_8 && angle <= PI_8) return Direction.RIGHT;
        if (angle > PI_8 && angle <= 3 * PI_8) return Direction.DOWN_RIGHT;
        if (angle > 3 * PI_8 && angle <= 5 * PI_8) return Direction.DOWN;
        if (angle > 5 * PI_8 && angle <= 7 * PI_8) return Direction.DOWN_LEFT;
        if (angle > 7 * PI_8 || angle <= -7 * PI_8) return Direction.LEFT;
        if (angle > -7 * PI_8 && angle <= -5 * PI_8) return Direction.UP_LEFT;
        if (angle > -5 * PI_8 && angle <= -3 * PI_8) return Direction.UP;
        if (angle > -3 * PI_8 && angle <= -PI_8) return Direction.UP_RIGHT;
        
        return Direction.NONE; // Fallback
    }

    updateAimPosition() {
        const newAimDirection = this.getAimDirectionFromMouse();
        if (this.state.aimDirection !== newAimDirection) {
            this.state.aimDirection = newAimDirection;
            
            // Use lookup table to get position
            if (newAimDirection !== Direction.NONE) {
                const pos = AIM_POSITIONS[newAimDirection];
                this.innerSprite.x = pos.x;
                this.innerSprite.y = pos.y;
                this.innerSprite.visible = true;
            } else {
                this.innerSprite.visible = false;
            }
        }
    }

    update() {
        // Update duck state
        this.updateDuckState();
        
        // Update aim position
        this.updateAimPosition();
        
        // Get current movement direction from input
        this.state.moveDirection = input.getDirection();
        
        // Calculate speed based on duck state
        const speed = this.state.isDucking 
            ? playerConfig.speed * playerConfig.duckSpeedMultiplier 
            : playerConfig.speed;
        
        // Apply movement based on direction using bitwise checks
        if (this.state.moveDirection & Direction.LEFT && this.state.x > 0) {
            this.state.x -= speed;
        }
        if (this.state.moveDirection & Direction.RIGHT && this.state.x < this.app.screen.width - playerConfig.size) {
            this.state.x += speed;
        }
        if (this.state.moveDirection & Direction.UP && this.state.y > 0) {
            this.state.y -= speed;
        }
        if (this.state.moveDirection & Direction.DOWN && this.state.y < this.app.screen.height - playerConfig.size) {
            this.state.y += speed;
        }
        
        // Update container position
        this.container.x = Math.floor(this.state.x);
        this.container.y = Math.floor(this.state.y);
    }
}
