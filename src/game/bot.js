import * as PIXI from 'pixi.js';
import { botConfig, Direction } from './config.js';
import { Entity } from './entity.js';
import { RegenerationSkill } from './skills.js';
import { SpriteManager } from './spriteManager.js';
import { DirectionSuffix, AnimationType } from './AnimationState.js';

/**
 * Object pool for efficient bot reuse
 */
class ObjectPool {
    constructor(objectFactory, initialSize = 20) {
        this.factory = objectFactory;
        this.pool = [];
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }
    
    get() {
        return this.pool.length > 0 ? this.pool.pop() : this.factory();
    }
    
    release(object) {
        this.pool.push(object);
    }
    
    preAllocate(count) {
        for (let i = 0; i < count; i++) {
            this.pool.push(this.factory());
        }
    }
}

/**
 * Bot state class
 */
class BotState {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.health = botConfig.maxHealth;
        this.active = false;
        this.aimDirection = Direction.NONE;
        this.moveDirection = Direction.NONE;
        this.size = botConfig.size;
        this.isMoving = false;
    }
    
    reset() {
        this.health = botConfig.maxHealth;
        this.active = false;
        this.aimDirection = Direction.NONE;
        this.moveDirection = Direction.NONE;
        this.isMoving = false;
    }
}

/**
 * Bot class - represents an enemy bot
 * Extends the Entity class to provide a standardized interface
 */
export class Bot extends Entity {
    /**
     * Create a new bot
     * @param {PIXI.Application} app - The PIXI application
     * @param {Player} player - The player entity
     */
    constructor(app, player) {
        super();
        
        this.app = app;
        this.player = player;
        
        // Create container for bot elements with transparency
        this.container = new PIXI.Container();
        this.container.sortableChildren = true; // Enable z-index sorting
        
        // Initialize sprite manager
        this.spriteManager = null;
        this.initSpriteManager();
        this.spritesLoaded = false;
        
        // Create temporary placeholder while sprites load
        this.placeholder = new PIXI.Graphics()
            .rect(-botConfig.size/2, -botConfig.size/2, botConfig.size, botConfig.size)
            .fill(botConfig.color);
            
        // Placeholder for loading
        this.placeholder.zIndex = 10;
        this.container.addChild(this.placeholder);

        // Create health bar container with centered positioning
        this.healthBarContainer = new PIXI.Container();
        this.healthBarContainer.y = -botConfig.healthBarOffset - botConfig.healthBarHeight;
        this.healthBarContainer.x = -botConfig.healthBarWidth/2; // Center health bar
        this.healthBarContainer.zIndex = 20; // Above sprite
        
        // Create health bar background
        this.healthBarBg = new PIXI.Graphics()
            .rect(0, -20, botConfig.healthBarWidth, botConfig.healthBarHeight)
            .fill(botConfig.healthBarBgColor)
            .setStrokeStyle({
                width: 1.5,
                color: 0x000000,
                alignment: 0.5 // Center the stroke
            })
            .stroke();
            
        // Create health bar fill
        this.healthBarFill = new PIXI.Graphics()
            .rect(0, -20, botConfig.healthBarWidth, botConfig.healthBarHeight)
            .fill(botConfig.healthBarFillColor);
            
        // Create health bar border
        this.healthBarBorder = new PIXI.Graphics();
        this.healthBarBorder
            .setStrokeStyle({
                width: botConfig.healthBarBorderThickness,
                color: botConfig.healthBarBorderColor
            })
            .rect(0, -20, botConfig.healthBarWidth, botConfig.healthBarHeight);
            
        // Add health bar elements to container
        this.healthBarContainer.addChild(this.healthBarBg);
        this.healthBarContainer.addChild(this.healthBarFill);
        this.healthBarContainer.addChild(this.healthBarBorder);

        // Add health bar container to main container
        this.container.addChild(this.healthBarContainer);

        // Initialize bot state
        this.state = new BotState();
        
        // Initially inactive
        this.container.visible = false;
    }

    /**
     * Initialize the bot
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {PIXI.Container} stage - The stage to add the bot to
     */
    async init(x, y, stage) {
        // Set position
        this.state.x = x;
        this.state.y = y;
        
        // Reset state
        this.state.reset();
        
        // Update health bar
        this.updateHealthBar();
        
        // Initialize sprite manager if needed
        if (!this.spriteManager) {
            await this.initSpriteManager();
        }

        // Load sprite if not loaded
        if (!this.spritesLoaded && this.spriteManager) {
            try {
                // Create initial sprite with shooting animation
                console.log('Creating bot sprite with shooting_s animation');
                this.sprite = this.spriteManager.createSprite('shooting_s');
                
                if (!this.sprite) {
                    console.error('Failed to create bot sprite');
                    return;
                }
                
                // Configure sprite
                const scale = (botConfig.size * 2) / Math.max(this.sprite.width, this.sprite.height);
                this.sprite.scale.set(scale);
                this.sprite.anchor.set(0.5);
                this.sprite.zIndex = 10;
                
                // Update display
                this.container.removeChild(this.placeholder);
                this.container.addChild(this.sprite);
                
                this.spritesLoaded = true;
                console.log('Bot sprite loaded successfully');
            } catch (error) {
                console.error('Failed to load bot sprite:', error);
            }
        }
        
        // Make everything visible
        this.container.visible = true;
        this.container.alpha = 1;
        this.healthBarContainer.visible = true;
        
        // Set initial container position
        this.container.x = this.state.x;
        this.container.y = this.state.y;
        
        // Add to stage if not already added
        if (!this.container.parent) {
            stage.addChild(this.container);
        }
        
        // Add regeneration skill
        this.addSkill(new RegenerationSkill({
            healAmount: 1,
            interval: 1000
        }));
        
        // Activate bot
        this.state.active = true;
    }

    /**
     * Get a random spawn position outside the screen
     * @returns {Object} Spawn position {x, y}
     */
    getRandomSpawnPosition() {
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;
        const margin = botConfig.spawnMargin;
        
        // Decide which side to spawn from (0: top, 1: right, 2: bottom, 3: left)
        const side = Math.floor(Math.random() * 4);
        
        let x, y;
        
        switch (side) {
            case 0: // Top
                x = Math.random() * screenWidth;
                y = -margin - botConfig.size;
                break;
            case 1: // Right
                x = screenWidth + margin;
                y = Math.random() * screenHeight;
                break;
            case 2: // Bottom
                x = Math.random() * screenWidth;
                y = screenHeight + margin;
                break;
            case 3: // Left
                x = -margin - botConfig.size;
                y = Math.random() * screenHeight;
                break;
        }
        
        return { x, y };
    }

    /**
     * Update health bar based on current health
     */
    updateHealthBar() {
        // Calculate health bar fill width based on current health
        const fillWidth = (this.state.health / botConfig.maxHealth) * botConfig.healthBarWidth;
        
        // Update health bar fill
        this.healthBarFill.clear()
            .rect(0, -20, fillWidth, botConfig.healthBarHeight)
            .fill(botConfig.healthBarFillColor);
    }

    /**
     * Get aim direction towards the player
     * @returns {number} Direction enum value
     */
    getAimDirectionToPlayer() {
        const playerPos = this.player.getPosition();
        const botCenterX = this.state.x;
        const botCenterY = this.state.y;

        const dx = playerPos.x - botCenterX;
        const dy = playerPos.y - botCenterY;
        
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
     * Initialize the sprite manager
     */
    async initSpriteManager() {
        try {
            // Load sprite atlas
            const spritesheet = await PIXI.Assets.load('/assets/atlas/sprite_atlas.json');
            this.spriteManager = new SpriteManager(spritesheet);
            await this.spriteManager.initialize();
        } catch (error) {
            console.error('Failed to initialize sprite manager:', error);
        }
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

        // If moving, use running animation
        if (this.state.isMoving) {
            return `${AnimationType.RUNNING}_${suffix}`;
        }

        // If not moving, use shooting animation
        return `${AnimationType.SHOOTING}_${suffix}`;
    }

    /**
     * Update sprite animation based on current state
     * Only called when animation needs to change
     */
    updateAnimation() {
        if (!this.spritesLoaded || !this.sprite) {
            console.log('Cannot update bot animation: sprites not loaded or sprite missing');
            return;
        }
        
        const animationKey = this.getAnimationKey();
        this.spriteManager.updateAnimation(this.sprite, animationKey);
    }

    /**
     * Take damage
     * @param {number} amount - Amount of damage to take
     * @param {EffectManager} effectManager - Effect manager for death effects
     * @returns {boolean} Whether the bot is still alive
     */
    takeDamage(amount, effectManager) {
        if (!this.state.active) return false;
        
        this.state.health = Math.max(0, this.state.health - amount);
        this.updateHealthBar();
        
        if (this.state.health <= 0) {
            // Create death effect at bot's position
            if (effectManager) {
                effectManager.createDeathEffect(this.state.x, this.state.y);
            }
            
            // Deactivate bot
            this.deactivate();
            return false;
        }
        
        return true;
    }

    /**
     * Heal the bot
     * @param {number} amount - Amount of healing
     */
    heal(amount) {
        if (!this.state.active) return;
        
        this.state.health = Math.min(botConfig.maxHealth, this.state.health + amount);
        this.updateHealthBar();
    }

    /**
     * Deactivate the bot
     */
    deactivate() {
        this.state.active = false;
        this.container.visible = false;
    }

    /**
     * Get the bot's position
     * @returns {Object} The bot's position {x, y}
     */
    getPosition() {
        return {
            x: this.state.x,
            y: this.state.y
        };
    }

    /**
     * Get the bot's state
     * @returns {Object} The bot's state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if the bot is active
     * @returns {boolean} Whether the bot is active
     */
    isActive() {
        return this.state.active;
    }

    /**
     * Calculate distance to another entity
     * @param {Entity} entity - The entity to calculate distance to
     * @returns {number} Distance to the entity
     */
    distanceTo(entity) {
        const pos1 = this.getPosition();
        const pos2 = entity.getPosition();
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if the bot is colliding with another entity
     * @param {Entity} entity - The entity to check collision with
     * @param {number} minDistance - Minimum distance for collision
     * @returns {boolean} Whether the bot is colliding with the entity
     */
    isCollidingWith(entity, minDistance) {
        return this.distanceTo(entity) < minDistance;
    }

    /**
     * Move towards a target position while avoiding collisions
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {Array} otherBots - Other bots to avoid
     */
    moveTowards(targetX, targetY, otherBots) {
        if (!this.state.active) return;
        
        // Calculate vector to target
        const targetDx = targetX - this.state.x;
        const targetDy = targetY - this.state.y;
        
        // Calculate distance to target
        const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        
        // Only move if not too close to target
        if (targetDistance <= botConfig.minDistanceToPlayer) return;
        
        // Normalize direction
        const normalizedDx = targetDx / targetDistance;
        const normalizedDy = targetDy / targetDistance;
        
        // Calculate new position
        let newX = this.state.x + normalizedDx * botConfig.speed;
        let newY = this.state.y + normalizedDy * botConfig.speed;
        
        // Check for collisions with other bots
        for (const bot of otherBots) {
            // Skip self and inactive bots
            if (bot === this || !bot.isActive()) continue;
            
            // Calculate distance between centers
            const otherX = bot.state.x;
            const otherY = bot.state.y;
            const botDx = newX - otherX;
            const botDy = newY - otherY;
            const botDistance = Math.sqrt(botDx * botDx + botDy * botDy);
            
            // If too close, adjust position
            if (botDistance < botConfig.minDistanceToBot) {
                // Calculate repulsion vector
                const repulsionFactor = (botConfig.minDistanceToBot - botDistance) / botConfig.minDistanceToBot;
                const repulsionX = botDx / botDistance * repulsionFactor * botConfig.speed;
                const repulsionY = botDy / botDistance * repulsionFactor * botConfig.speed;
                
                // Apply repulsion
                newX += repulsionX;
                newY += repulsionY;
            }
        }
        
        // Check screen boundaries
        newX = Math.max(0, Math.min(this.app.screen.width - botConfig.size, newX));
        newY = Math.max(0, Math.min(this.app.screen.height - botConfig.size, newY));
        
        // Calculate actual movement vector
        const movementDx = newX - this.state.x;
        const movementDy = newY - this.state.y;
        
        // Only update position and direction if actually moving
        if (Math.abs(movementDx) > 0.01 || Math.abs(movementDy) > 0.01) {
            // Update position
            this.state.x = newX;
            this.state.y = newY;
            
            // Update movement state
            this.state.isMoving = true;
            
            // Calculate movement direction based on movement vector
            const angle = Math.atan2(movementDy, movementDx);
            const PI_8 = Math.PI / 8;
            
            // Use angle to determine direction (8 directions)
            if (angle > -PI_8 && angle <= PI_8) this.state.moveDirection = Direction.RIGHT;
            else if (angle > PI_8 && angle <= 3 * PI_8) this.state.moveDirection = Direction.DOWN_RIGHT;
            else if (angle > 3 * PI_8 && angle <= 5 * PI_8) this.state.moveDirection = Direction.DOWN;
            else if (angle > 5 * PI_8 && angle <= 7 * PI_8) this.state.moveDirection = Direction.DOWN_LEFT;
            else if (angle > 7 * PI_8 || angle <= -7 * PI_8) this.state.moveDirection = Direction.LEFT;
            else if (angle > -7 * PI_8 && angle <= -5 * PI_8) this.state.moveDirection = Direction.UP_LEFT;
            else if (angle > -5 * PI_8 && angle <= -3 * PI_8) this.state.moveDirection = Direction.UP;
            else if (angle > -3 * PI_8 && angle <= -PI_8) this.state.moveDirection = Direction.UP_RIGHT;
        } else {
            this.state.isMoving = false;
            this.state.moveDirection = Direction.NONE;
        }
    }

    /**
     * Update the bot
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Array} targets - Potential targets for skills
     * @param {Array} otherBots - Other bots to avoid
     * @param {EffectManager} effectManager - Effect manager for death effects
     */
    tick(deltaTime, targets = [], otherBots = [], effectManager = null) {
        // Skip update if not active
        if (!this.state.active) return;
        
        // Update health bar
        this.updateHealthBar();
        
        // Store previous states
        const prevAimDirection = this.state.aimDirection;
        const prevMoveDirection = this.state.moveDirection;
        const prevIsMoving = this.state.isMoving;
        
        // Update aim direction
        const newAimDirection = this.getAimDirectionToPlayer();
        if (prevAimDirection !== newAimDirection) {
            this.state.aimDirection = newAimDirection;
        }
        
        // Get player position
        const playerPos = this.player.getPosition();
        
        // Move towards player while avoiding collisions
        this.moveTowards(playerPos.x, playerPos.y, otherBots);

        // Update animation if state changed
        if (prevAimDirection !== this.state.aimDirection ||
            prevMoveDirection !== this.state.moveDirection ||
            prevIsMoving !== this.state.isMoving) {
            if (this.spritesLoaded && this.sprite) {
                this.updateAnimation();
            }
        }

        // Update container position
        this.container.x = Math.floor(this.state.x);
        this.container.y = Math.floor(this.state.y);
        
        // Process effects and update skills (from Entity class)
        super.tick(deltaTime, targets);
    }
}

/**
 * BotManager - Manages multiple bots
 */
export class BotManager {
    /**
     * Create a new bot manager
     * @param {PIXI.Application} app - The PIXI application
     * @param {Player} player - The player entity
     * @param {EffectManager} effectManager - Effect manager for death effects
     */
    constructor(app, player, effectManager) {
        this.app = app;
        this.player = player;
        this.effectManager = effectManager;
        
        // Create bot pool
        this.botPool = new ObjectPool(() => new Bot(app, player));
        
        // Active bots
        this.activeBots = [];
        
        // Spawn initial bots
        this.spawnBots(botConfig.spawnCount);
        
        console.log(`Created bot manager with ${this.activeBots.length} bots`);
    }
    
    /**
     * Spawn multiple bots
     * @param {number} count - Number of bots to spawn
     */
    spawnBots(count) {
        for (let i = 0; i < count; i++) {
            this.spawnBot();
        }
    }
    
    /**
     * Spawn a single bot
     */
    spawnBot() {
        // Get bot from pool
        const bot = this.botPool.get();
        
        // Get random spawn position
        const position = bot.getRandomSpawnPosition();
        
        // Initialize bot
        bot.init(position.x, position.y, this.app.stage);
        
        // Add to active bots
        this.activeBots.push(bot);
    }
    
    /**
     * Update all bots
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    tick(deltaTime) {
        // Update all active bots
        for (const bot of this.activeBots) {
            bot.tick(deltaTime, [this.player], this.activeBots, this.effectManager);
        }
        
        // Check for inactive bots and respawn them
        for (let i = this.activeBots.length - 1; i >= 0; i--) {
            const bot = this.activeBots[i];
            if (!bot.isActive()) {
                // Remove from active list
                this.activeBots.splice(i, 1);
                
                // Return to pool
                this.botPool.release(bot);
                
                // Spawn a new bot
                this.spawnBot();
            }
        }
    }
    
    /**
     * Pre-allocate bots
     * @param {number} count - Number of bots to pre-allocate
     */
    preAllocate(count) {
        this.botPool.preAllocate(count);
    }
    
    /**
     * Get all active bots
     * @returns {Array} Array of active bots
     */
    getActiveBots() {
        return this.activeBots;
    }
}
