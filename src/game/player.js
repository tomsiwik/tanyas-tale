import * as PIXI from 'pixi.js';
import { config, playerConfig } from './config.js';
import { input } from './input.js';

// Simple direction states
const Direction = {
    NORTH: 'north',
    NORTHEAST: 'northeast',
    EAST: 'east',
    SOUTHEAST: 'southeast',
    SOUTH: 'south',
    SOUTHWEST: 'southwest',
    WEST: 'west',
    NORTHWEST: 'northwest'
};

// Position lookup table for inner square (in logical pixels)
const DirectionPositions = {
    [Direction.NORTH]: { x: 12, y: 0 },     // Centered horizontally, top edge
    [Direction.NORTHEAST]: { x: 24, y: 0 },  // Right top corner
    [Direction.EAST]: { x: 24, y: 12 },     // Right edge, centered vertically
    [Direction.SOUTHEAST]: { x: 24, y: 24 }, // Right bottom corner
    [Direction.SOUTH]: { x: 12, y: 24 },     // Centered horizontally, bottom edge
    [Direction.SOUTHWEST]: { x: 0, y: 24 },  // Left bottom corner
    [Direction.WEST]: { x: 0, y: 12 },       // Left edge, centered vertically
    [Direction.NORTHWEST]: { x: 0, y: 0 }    // Left top corner
};

export class Player {
    constructor(app) {
        this.app = app;
        this.isDucking = false;
        this.currentDirection = null;
        
        // Movement control variables - separate for horizontal and vertical
        this.horizontalMoveCounter = 0;
        this.verticalMoveCounter = 0;
        
        console.log('Creating player sprite');
        
        // Create container for player elements
        this.container = new PIXI.Container();
        
        // Create main square (logical pixels, will be scaled by zoom)
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

        // Set initial position to center (in logical pixels)
        // We divide by zoom since the stage is scaled
        const centerX = Math.floor((app.screen.width / playerConfig.zoom - playerConfig.size) / 2);
        const centerY = Math.floor((app.screen.height / playerConfig.zoom - playerConfig.size) / 2);
        this.container.x = centerX;
        this.container.y = centerY;

        // Add container to stage
        app.stage.addChild(this.container);
        console.log('Player added to stage');

        // Start update loop
        this.app.ticker.add(() => this.update());
    }

    updateDuckState() {
        const newDuckState = input.isDucking();
        if (this.isDucking !== newDuckState) {
            this.isDucking = newDuckState;
            // Clear and redraw with new color
            this.sprite.clear()
                .rect(0, 0, playerConfig.size, playerConfig.size)
                .fill(this.isDucking ? playerConfig.duckColor : playerConfig.color);
        }
    }

    getDirectionFromMouse() {
        const mouse = input.getMousePosition();
        // Convert mouse position to logical pixels
        const logicalMouseX = mouse.x / playerConfig.zoom;
        const logicalMouseY = mouse.y / playerConfig.zoom;
        
        const playerCenterX = this.container.x + playerConfig.size / 2;
        const playerCenterY = this.container.y + playerConfig.size / 2;

        const dx = logicalMouseX - playerCenterX;
        const dy = logicalMouseY - playerCenterY;

        // Simple quadrant-based direction lookup
        const isNorth = dy < -playerConfig.size;
        const isSouth = dy > playerConfig.size;
        const isEast = dx > playerConfig.size;
        const isWest = dx < -playerConfig.size;

        if (isNorth && isEast) return Direction.NORTHEAST;
        if (isNorth && isWest) return Direction.NORTHWEST;
        if (isSouth && isEast) return Direction.SOUTHEAST;
        if (isSouth && isWest) return Direction.SOUTHWEST;
        if (isNorth) return Direction.NORTH;
        if (isSouth) return Direction.SOUTH;
        if (isEast) return Direction.EAST;
        if (isWest) return Direction.WEST;
        return null;
    }

    updateInnerSquarePosition() {
        const newDirection = this.getDirectionFromMouse();
        if (this.currentDirection !== newDirection) {
            this.currentDirection = newDirection;
            if (newDirection) {
                const pos = DirectionPositions[newDirection];
                this.innerSprite.x = pos.x;
                this.innerSprite.y = pos.y;
                this.innerSprite.visible = true;
            } else {
                this.innerSprite.visible = false;
            }
        }
    }

    getCurrentSpeed() {
        return this.isDucking 
            ? playerConfig.speed * playerConfig.duckSpeedMultiplier 
            : playerConfig.speed;
    }

    update() {
        this.updateDuckState();
        this.updateInnerSquarePosition();
        const speed = this.getCurrentSpeed();
        
        // Handle horizontal movement
        if (this.horizontalMoveCounter > 0) {
            this.horizontalMoveCounter--;
        } else {
            // Check horizontal movement
            if (input.isMovingLeft() && this.container.x > 0) {
                this.container.x = Math.floor(this.container.x - speed);
                this.horizontalMoveCounter = playerConfig.moveDelay;
            } else if (input.isMovingRight() && this.container.x < this.app.screen.width / playerConfig.zoom - playerConfig.size) {
                this.container.x = Math.floor(this.container.x + speed);
                this.horizontalMoveCounter = playerConfig.moveDelay;
            }
        }
        
        // Handle vertical movement separately
        if (this.verticalMoveCounter > 0) {
            this.verticalMoveCounter--;
        } else {
            // Check vertical movement
            if (input.isMovingUp() && this.container.y > 0) {
                this.container.y = Math.floor(this.container.y - speed);
                this.verticalMoveCounter = playerConfig.moveDelay;
            } else if (input.isMovingDown() && this.container.y < this.app.screen.height / playerConfig.zoom - playerConfig.size) {
                this.container.y = Math.floor(this.container.y + speed);
                this.verticalMoveCounter = playerConfig.moveDelay;
            }
        }
    }
}
