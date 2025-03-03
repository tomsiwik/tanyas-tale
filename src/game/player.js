import * as PIXI from 'pixi.js';
import { playerConfig, Direction, AIM_POSITIONS } from './config.js';
import { input } from './input.js';
import { Entity } from './entity.js';
import { SpriteManager } from './spriteManager.js';

/**
 * Player state class
 */
class PlayerState {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.moveDirection = Direction.NONE;
        this.aimDirection = Direction.NONE;
        this.isDucking = false;
        this.health = playerConfig.maxHealth;
        this.size = playerConfig.size;
        this.active = true;
        this.isMoving = false; // Track if player is moving
    }
}

/**
 * Player class - represents the player character
 * Extends the Entity class to provide a standardized interface
 */
export class Player extends Entity {
    /**
     * Create a new player
     * @param {PIXI.Application} app - The PIXI application
     */
    constructor(app) {
        super();
        
        this.app = app;
        console.log('Creating player sprite');
        
        // Create container for player elements with transparent background
        this.container = new PIXI.Container();
        this.container.sortableChildren = true; // Enable z-index sorting
        
        // Initialize sprite manager
        this.spriteManager = new SpriteManager('/assets/sprites/');
        this.spritesLoaded = false;
        this.spriteUpdatePromise = Promise.resolve(); // Track ongoing sprite updates
        
        // Create temporary placeholder while sprites load
        this.placeholder = new PIXI.Graphics()
            .rect(-playerConfig.size/2, -playerConfig.size/2, playerConfig.size, playerConfig.size)
            .fill(playerConfig.color);
        
        // Placeholder for loading
        this.placeholder.zIndex = 10; // Same as sprite
        this.container.addChild(this.placeholder);
        
        // Create health bar container and position it further above the player
        this.healthBarContainer = new PIXI.Container();
        this.healthBarContainer.y = -(playerConfig.healthBarOffset * 2) - playerConfig.healthBarHeight - 8;
        this.healthBarContainer.zIndex = 20; // Higher than sprite
        
        // Create health bar background
        this.healthBarBg = new PIXI.Graphics()
            .rect(-playerConfig.healthBarWidth/2, 0, playerConfig.healthBarWidth, playerConfig.healthBarHeight)
            .fill(playerConfig.healthBarBgColor);
            
        // Create health bar fill
        this.healthBarFill = new PIXI.Graphics()
            .rect(-playerConfig.healthBarWidth/2, 0, playerConfig.healthBarWidth, playerConfig.healthBarHeight)
            .fill(playerConfig.healthBarFillColor);
            
        // Create health bar border
        this.healthBarBorder = new PIXI.Graphics();
        this.healthBarBorder
            .setStrokeStyle({
                width: playerConfig.healthBarBorderThickness,
                color: playerConfig.healthBarBorderColor
            })
            .rect(-playerConfig.healthBarWidth/2, 0, playerConfig.healthBarWidth, playerConfig.healthBarHeight);
            
        // Add health bar elements to container
        this.healthBarContainer.addChild(this.healthBarBg);
        this.healthBarContainer.addChild(this.healthBarFill);
        this.healthBarContainer.addChild(this.healthBarBorder);
        this.container.addChild(this.healthBarContainer);

        // Set initial position to center
        const centerX = Math.floor(app.screen.width / 2);
        const centerY = Math.floor(app.screen.height / 2);
        
        // Initialize player state
        this.state = new PlayerState(centerX, centerY);
        
        // Set initial container position
        this.container.x = this.state.x;
        this.container.y = this.state.y;

        // Add container to stage
        app.stage.addChild(this.container);
        console.log('Player added to stage');
        
        // Load sprites asynchronously
        this.loadSprites();
    }
    
    /**
     * Load sprite textures and create the animated sprite
     */
    async loadSprites() {
        try {
            console.log('Loading player sprites...');
            
            // Create initial sprite with standing animation
            this.sprite = await this.spriteManager.createSprite(Direction.DOWN, false);
            
            // Set sprite scale to be twice the player size for better visibility
            const scale = (playerConfig.size * 2) / Math.max(this.sprite.width, this.sprite.height);
            this.sprite.scale.set(scale);
            
            // Ensure the sprite has transparency
            this.sprite.alpha = 1;
            
            // Use nearest neighbor scaling to prevent blurriness
            this.sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            
            // Remove placeholder and add sprite
            this.container.removeChild(this.placeholder);
            
            // Set sprite z-index and add to container
            this.sprite.zIndex = 10; // Higher than shadow
            
            // Create a mask with further reduced height to fix blurriness
            const spriteWidth = this.sprite.width;
            const spriteHeight = this.sprite.height;
            const mask = new PIXI.Graphics()
                .rect(-spriteWidth/2, -spriteHeight/2 + 6, spriteWidth, spriteHeight - 14)
                .fill(0xFFFFFF);
            
            // Apply the mask to the sprite
            this.sprite.mask = mask;
            this.container.addChild(mask);
            this.container.addChild(this.sprite);
            
            this.spritesLoaded = true;
            console.log('Player sprites loaded successfully');
        } catch (error) {
            console.error('Failed to load player sprites:', error);
        }
    }

    /**
     * Update duck state based on input
     */
    updateDuckState() {
        const newDuckState = input.isDucking();
        if (this.state.isDucking !== newDuckState) {
            this.state.isDucking = newDuckState;
            
            // Ducking will use different sprite coordinates later
            // No color change needed
        }
    }

    /**
     * Get aim direction from mouse position
     * @returns {number} Direction enum value
     */
    getAimDirectionFromMouse() {
        const mouse = input.getMousePosition();
        const playerCenterX = this.state.x;
        const playerCenterY = this.state.y;

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

    /**
     * Update aim position based on mouse
     */
    updateAimPosition() {
        const newAimDirection = this.getAimDirectionFromMouse();
        if (this.state.aimDirection !== newAimDirection) {
            this.state.aimDirection = newAimDirection;
            
            // No longer update sprite based on aim direction
            // Sprite animation is now based solely on movement direction
        }
    }

    /**
     * Queue a sprite update to avoid multiple concurrent updates
     * @param {number} direction - Direction enum value
     * @param {boolean} isMoving - Whether the entity is moving
     */
    queueSpriteUpdate(direction, isMoving) {
        // Chain the new update to the previous one
        this.spriteUpdatePromise = this.spriteUpdatePromise
            .then(() => this.spriteManager.updateSprite(this.sprite, direction, isMoving))
            .catch(err => console.error('Error updating sprite:', err));
    }

    /**
     * Update health bar based on current health
     */
    updateHealthBar() {
        // Calculate health bar fill width based on current health
        const fillWidth = (this.state.health / playerConfig.maxHealth) * playerConfig.healthBarWidth;
        
        // Update health bar fill
        this.healthBarFill.clear()
            .rect(-playerConfig.healthBarWidth/2, 0, fillWidth, playerConfig.healthBarHeight)
            .fill(playerConfig.healthBarFillColor);
    }

    /**
     * Take damage
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} Whether the player is still alive
     */
    takeDamage(amount) {
        this.state.health = Math.max(0, this.state.health - amount);
        this.updateHealthBar();
        
        if (this.state.health <= 0) {
            this.state.active = false;
        }
        
        return this.state.health > 0;
    }

    /**
     * Heal the player
     * @param {number} amount - Amount of healing
     */
    heal(amount) {
        this.state.health = Math.min(playerConfig.maxHealth, this.state.health + amount);
        this.updateHealthBar();
    }

    /**
     * Get the player's position
     * @returns {Object} The player's position {x, y}
     */
    getPosition() {
        return {
            x: this.state.x,
            y: this.state.y
        };
    }

    /**
     * Get the player's state
     * @returns {Object} The player's state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if the player is active
     * @returns {boolean} Whether the player is active
     */
    isActive() {
        return this.state.active;
    }

    /**
     * Update the player
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Array} targets - Potential targets for skills
     */
    tick(deltaTime, targets = []) {
        // Update duck state
        this.updateDuckState();
        
        // Update aim position
        this.updateAimPosition();
        
        // Update health bar
        this.updateHealthBar();
        
        // Get current movement direction from input
        const prevMoveDirection = this.state.moveDirection;
        this.state.moveDirection = input.getDirection();
        
        // Check if player is moving
        const wasMoving = this.state.isMoving;
        this.state.isMoving = this.state.moveDirection !== Direction.NONE;
        
        // Calculate speed based on duck state
        const speed = this.state.isDucking 
            ? playerConfig.speed * playerConfig.duckSpeedMultiplier 
            : playerConfig.speed;
        
        // Apply movement based on direction using bitwise checks
        if (this.state.moveDirection & Direction.LEFT && this.state.x > 0) {
            this.state.x -= speed;
        }
        if (this.state.moveDirection & Direction.RIGHT && this.state.x < this.app.screen.width) {
            this.state.x += speed;
        }
        if (this.state.moveDirection & Direction.UP && this.state.y > 0) {
            this.state.y -= speed;
        }
        if (this.state.moveDirection & Direction.DOWN && this.state.y < this.app.screen.height) {
            this.state.y += speed;
        }
        
        // Update container position
        this.container.x = Math.floor(this.state.x);
        this.container.y = Math.floor(this.state.y);
        
        // Update sprite animation if movement state or direction changed
        if (this.spritesLoaded && this.sprite && 
            (wasMoving !== this.state.isMoving || prevMoveDirection !== this.state.moveDirection)) {
            
            // Always use movement direction for sprite animation
            // If not moving, use the last movement direction
            const displayDirection = this.state.moveDirection !== Direction.NONE 
                ? this.state.moveDirection 
                : prevMoveDirection;
                
            // Queue sprite update (non-blocking)
            this.queueSpriteUpdate(displayDirection, this.state.isMoving);
        }
        
        // Process effects and update skills (from Entity class)
        super.tick(deltaTime, targets);
    }
}
