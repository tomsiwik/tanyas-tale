import * as PIXI from 'pixi.js';
import { playerConfig, Direction, AIM_POSITIONS } from './config.js';
import { input } from './input.js';
import { Entity } from './entity.js';
import { SpriteManager } from './spriteManager.js';
import { DirectionSuffix, AnimationType } from './AnimationState.js';

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
        this.health = playerConfig.initialHealth;
        this.size = playerConfig.size;
        this.active = true;
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
        this.spriteManager = null;
        this.initSpriteManager();
        this.spritesLoaded = false;
        
        // Create temporary placeholder while sprites load
        this.placeholder = new PIXI.Graphics()
            .rect(-playerConfig.size/2, -playerConfig.size/2, playerConfig.size, playerConfig.size)
            .fill(playerConfig.color);
        
        // Placeholder for loading
        this.placeholder.zIndex = 10; // Same as sprite
        this.container.addChild(this.placeholder);
        
        // Create health bar container and position it further above the player
        this.healthBarContainer = new PIXI.Container();
        this.healthBarContainer.y = -playerConfig.healthBarOffset - playerConfig.healthBarHeight;
        this.healthBarContainer.zIndex = 20; // Higher than sprite
        
        // Create health bar background
        this.healthBarBg = new PIXI.Graphics()
            .rect(-playerConfig.healthBarWidth/2, -20, playerConfig.healthBarWidth, playerConfig.healthBarHeight)
            .fill({ color: playerConfig.healthBarBgColor, alpha: playerConfig.healthBarBgAlpha })
            .setStrokeStyle({
                width: 1.5,
                color: 0x000000,
                alignment: 0.5 // Center the stroke
            })
            .stroke();
            
        // Create health bar fill
        this.healthBarFill = new PIXI.Graphics()
            .rect(-playerConfig.healthBarWidth/2, -20, playerConfig.healthBarWidth, playerConfig.healthBarHeight)
            .fill(playerConfig.healthBarFillColor);
            
        // Create health bar border
        this.healthBarBorder = new PIXI.Graphics();
        this.healthBarBorder
            .setStrokeStyle({
                width: playerConfig.healthBarBorderThickness,
                color: playerConfig.healthBarBorderColor,
                alignment: 0.5 // Center the stroke
            })
            .rect(-playerConfig.healthBarWidth/2, -20, playerConfig.healthBarWidth, playerConfig.healthBarHeight);
            
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
    }
    
    /**
     * Initialize sprites and animations
     */
    async initSpriteManager() {
        try {
            // Load sprite atlas
            const spritesheet = await PIXI.Assets.load('/assets/atlas/sprite_atlas.json');
            this.spriteManager = new SpriteManager(spritesheet);
            await this.spriteManager.initialize();
            await this.loadSprites();
        } catch (error) {
            console.error('Failed to initialize sprites:', error);
        }
    }

    /**
     * Load sprite textures and create the animated sprite
     */
    async loadSprites() {
        try {
            if (!this.spriteManager) {
                console.warn('Sprite manager not initialized');
                return;
            }

            console.log('Loading player sprites...');
            
            // Create initial sprite with running_s animation
            console.log('Creating sprite with running_s animation');
            this.sprite = this.spriteManager.createSprite('running_s');
            
            if (!this.sprite) {
                console.error('Failed to create sprite');
                return;
            }
            
            // Configure sprite
            const scale = (playerConfig.size * 2) / Math.max(this.sprite.width, this.sprite.height);
            this.sprite.scale.set(scale);
            this.sprite.anchor.set(0.5);
            this.sprite.zIndex = 10;
            
            // Update display
            this.container.removeChild(this.placeholder);
            this.container.addChild(this.sprite);
            
            this.spritesLoaded = true;
            console.log('Player sprites loaded successfully');
        } catch (error) {
            console.error('Failed to load player sprites:', error);
        }
    }

    /**
     * Get aim direction from mouse position using angle-based lookup
     * @returns {Direction} Direction enum value
     */
    getAimDirectionFromMouse() {
        const mouse = input.getMousePosition();
        const dx = mouse.x - this.state.x;
        const dy = mouse.y - this.state.y;
        
        // Return NONE if mouse is near center
        const minDistance = playerConfig.size;
        if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) {
            return Direction.NONE;
        }
        
        // Get angle in radians and normalize to [0, 2π]
        const angle = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);
        
        // Convert angle to direction using 45-degree sectors
        const sector = Math.floor(((angle + Math.PI / 8) % (2 * Math.PI)) / (Math.PI / 4));
        
        // Map sectors to Direction enum values
        const directionMap = [
            Direction.RIGHT,
            Direction.DOWN_RIGHT,
            Direction.DOWN,
            Direction.DOWN_LEFT,
            Direction.LEFT,
            Direction.UP_LEFT,
            Direction.UP,
            Direction.UP_RIGHT
        ];
        
        return directionMap[sector];
    }

    /**
     * Get current animation key based on state
     * @returns {string} Animation key
     */
    getAnimationKey() {
        const direction = this.state.moveDirection === Direction.NONE 
            ? this.state.aimDirection 
            : this.state.moveDirection;
            
        const suffix = DirectionSuffix[direction];

        if (this.state.isDucking) {
            return `${AnimationType.DUCKING}_${suffix}`;
        }

        // If moving, use running animation
        if (this.state.moveDirection !== Direction.NONE) {
            return `${AnimationType.RUNNING}_${suffix}`;
        }

        // If not moving, use standing animation
        return `${AnimationType.STANDING}_${suffix}`;
    }

    /**
     * Update sprite animation based on current state
     * Only called when animation needs to change
     */
    updateAnimation() {
        if (!this.spritesLoaded || !this.sprite) {
            console.log('Cannot update animation: sprites not loaded or sprite missing');
            return;
        }
        
        const animationKey = this.getAnimationKey();
        this.spriteManager.updateAnimation(this.sprite, animationKey);
    }

    /**
     * Update player position based on movement direction and speed
     * @param {Direction} direction - Movement direction
     * @param {number} speed - Movement speed
     */
    updatePosition(direction, speed) {
        // Calculate movement based on direction enum
        const moveX = (
            (direction === Direction.RIGHT || direction === Direction.UP_RIGHT || direction === Direction.DOWN_RIGHT) ? speed :
            (direction === Direction.LEFT || direction === Direction.UP_LEFT || direction === Direction.DOWN_LEFT) ? -speed :
            0
        );
        
        const moveY = (
            (direction === Direction.DOWN || direction === Direction.DOWN_RIGHT || direction === Direction.DOWN_LEFT) ? speed :
            (direction === Direction.UP || direction === Direction.UP_RIGHT || direction === Direction.UP_LEFT) ? -speed :
            0
        );
        
        // Apply movement with bounds checking
        if ((moveX < 0 && this.state.x > 0) || (moveX > 0 && this.state.x < this.app.screen.width)) {
            this.state.x += moveX;
        }
        if ((moveY < 0 && this.state.y > 0) || (moveY > 0 && this.state.y < this.app.screen.height)) {
            this.state.y += moveY;
        }
        
        // Update container position
        this.container.x = Math.floor(this.state.x);
        this.container.y = Math.floor(this.state.y);
    }

    /**
     * Update health bar based on current health
     */
    updateHealthBar() {
        // Calculate health bar fill width based on current health
        const fillWidth = (this.state.health / playerConfig.maxHealth) * playerConfig.healthBarWidth;
        
        // Update health bar fill
        this.healthBarFill.clear()
            .rect(-playerConfig.healthBarWidth/2, -20, fillWidth, playerConfig.healthBarHeight)
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
        // Update states
        const wasDucking = this.state.isDucking;
        const prevDirection = this.state.moveDirection;
        const prevAimDirection = this.state.aimDirection;
        
        // Update current state
        this.state.isDucking = input.isDucking();
        this.state.aimDirection = this.getAimDirectionFromMouse();
        this.state.moveDirection = input.getDirection();
        
        // Update health bar
        this.updateHealthBar();
        
        // Calculate speed based on duck state
        const speed = this.state.isDucking 
            ? playerConfig.speed * playerConfig.duckSpeedMultiplier 
            : playerConfig.speed;
        
        // Update position based on movement
        this.updatePosition(this.state.moveDirection, speed);
        
        // Only update animation if state changed
        if (wasDucking !== this.state.isDucking || 
            prevDirection !== this.state.moveDirection || 
            prevAimDirection !== this.state.aimDirection) {
            this.updateAnimation();
        }
        
        // Process effects and update skills (from Entity class)
        super.tick(deltaTime, targets);
    }
}
