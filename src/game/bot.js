import * as PIXI from 'pixi.js';
import { botConfig, AIM_POSITIONS, Direction } from './config.js';
import { SkillManager, RegenerationSkill } from './skills.js';

// Object pool for efficient bot reuse
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

// Simple bot state class
class BotState {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.health = botConfig.maxHealth;
        this.active = false;
        this.aimDirection = Direction.NONE;
    }
    
    reset() {
        this.health = botConfig.maxHealth;
        this.active = false;
        this.aimDirection = Direction.NONE;
    }
}

export class Bot {
    constructor(app, player) {
        this.app = app;
        this.player = player;
        
        // Create container for bot elements
        this.container = new PIXI.Container();
        
        // Create main square
        this.sprite = new PIXI.Graphics()
            .rect(0, 0, botConfig.size, botConfig.size)
            .fill(botConfig.color);

        // Create inner direction indicator (aim)
        this.innerSprite = new PIXI.Graphics()
            .rect(0, 0, botConfig.innerSize, botConfig.innerSize)
            .fill(botConfig.innerColor);
        this.innerSprite.visible = true;

        // Create health bar container
        this.healthBarContainer = new PIXI.Container();
        this.healthBarContainer.y = -botConfig.healthBarOffset - botConfig.healthBarHeight;
        
        // Create health bar background
        this.healthBarBg = new PIXI.Graphics()
            .rect(0, 0, botConfig.healthBarWidth, botConfig.healthBarHeight)
            .fill(botConfig.healthBarBgColor);
            
        // Create health bar fill
        this.healthBarFill = new PIXI.Graphics()
            .rect(0, 0, botConfig.healthBarWidth, botConfig.healthBarHeight)
            .fill(botConfig.healthBarFillColor);
            
        // Create health bar border
        this.healthBarBorder = new PIXI.Graphics();
        this.healthBarBorder
            .setStrokeStyle({
                width: botConfig.healthBarBorderThickness,
                color: botConfig.healthBarBorderColor
            })
            .rect(0, 0, botConfig.healthBarWidth, botConfig.healthBarHeight);
            
        // Add health bar elements to container
        this.healthBarContainer.addChild(this.healthBarBg);
        this.healthBarContainer.addChild(this.healthBarFill);
        this.healthBarContainer.addChild(this.healthBarBorder);

        // Add sprites to container
        this.container.addChild(this.sprite);
        this.container.addChild(this.innerSprite);
        this.container.addChild(this.healthBarContainer);

        // Initialize bot state
        this.state = new BotState();
        
        // Create skill manager
        this.skillManager = new SkillManager(this);
        
        // Initially inactive
        this.container.visible = false;
    }

    init(x, y, stage) {
        // Set position
        this.state.x = x;
        this.state.y = y;
        
        // Reset health
        this.state.health = botConfig.maxHealth;
        
        // Update health bar
        this.updateHealthBar();
        
        // Reset appearance
        this.sprite.clear()
            .rect(0, 0, botConfig.size, botConfig.size)
            .fill(botConfig.color);
            
        // Make everything visible
        this.container.visible = true;
        this.container.alpha = 1;
        this.healthBarContainer.visible = true;
        this.innerSprite.visible = true;
        
        // Set initial container position
        this.container.x = this.state.x;
        this.container.y = this.state.y;
        
        // Add to stage if not already added
        if (!this.container.parent) {
            stage.addChild(this.container);
        }
        
        // Add regeneration skill
        this.skillManager.addSkill(new RegenerationSkill(this));
        
        // Activate bot
        this.state.active = true;
    }

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

    updateHealthBar() {
        // Calculate health bar fill width based on current health
        const fillWidth = (this.state.health / botConfig.maxHealth) * botConfig.healthBarWidth;
        
        // Update health bar fill
        this.healthBarFill.clear()
            .rect(0, 0, fillWidth, botConfig.healthBarHeight)
            .fill(botConfig.healthBarFillColor);
    }

    getAimDirectionToPlayer() {
        const playerPos = this.player.getPosition();
        const botCenterX = this.state.x + botConfig.size / 2;
        const botCenterY = this.state.y + botConfig.size / 2;

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

    updateAimPosition() {
        const newAimDirection = this.getAimDirectionToPlayer();
        if (this.state.aimDirection !== newAimDirection) {
            this.state.aimDirection = newAimDirection;
            
            // Use lookup table to get position
            const pos = AIM_POSITIONS[newAimDirection];
            this.innerSprite.x = pos.x;
            this.innerSprite.y = pos.y;
        }
    }

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

    heal(amount) {
        if (!this.state.active) return;
        
        this.state.health = Math.min(botConfig.maxHealth, this.state.health + amount);
        this.updateHealthBar();
    }

    deactivate() {
        this.state.active = false;
        this.container.visible = false;
    }

    getPosition() {
        return {
            x: this.state.x + botConfig.size / 2,
            y: this.state.y + botConfig.size / 2
        };
    }

    distanceTo(entity) {
        const pos1 = this.getPosition();
        const pos2 = entity.getPosition();
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isCollidingWith(entity, minDistance) {
        return this.distanceTo(entity) < minDistance;
    }

    moveTowards(targetX, targetY, otherBots) {
        if (!this.state.active) return;
        
        const botCenterX = this.state.x + botConfig.size / 2;
        const botCenterY = this.state.y + botConfig.size / 2;
        
        // Calculate direction to target
        const dx = targetX - botCenterX;
        const dy = targetY - botCenterY;
        
        // Calculate distance to target
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if not too close to target
        if (distance <= botConfig.minDistanceToPlayer) return;
        
        // Normalize direction
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        // Calculate new position
        let newX = this.state.x + normalizedDx * botConfig.speed;
        let newY = this.state.y + normalizedDy * botConfig.speed;
        
        // Check for collisions with other bots
        for (const bot of otherBots) {
            // Skip self and inactive bots
            if (bot === this || !bot.state.active) continue;
            
            // Calculate distance between centers
            const otherX = bot.state.x + botConfig.size / 2;
            const otherY = bot.state.y + botConfig.size / 2;
            const newCenterX = newX + botConfig.size / 2;
            const newCenterY = newY + botConfig.size / 2;
            
            const botDx = newCenterX - otherX;
            const botDy = newCenterY - otherY;
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
        
        // Update position
        this.state.x = newX;
        this.state.y = newY;
    }

    update(otherBots, effectManager, delta = 1) {
        // Skip update if not active
        if (!this.state.active) return;
        
        // Update health bar
        this.updateHealthBar();
        
        // Update aim position
        this.updateAimPosition();
        
        // Update skills
        this.skillManager.update(delta, []);
        
        // Get player position
        const playerPos = this.player.getPosition();
        
        // Move towards player while avoiding collisions
        this.moveTowards(playerPos.x, playerPos.y, otherBots);
        
        // Update container position
        this.container.x = Math.floor(this.state.x);
        this.container.y = Math.floor(this.state.y);
    }
}

export class BotManager {
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
    
    spawnBots(count) {
        for (let i = 0; i < count; i++) {
            this.spawnBot();
        }
    }
    
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
    
    update(delta = 1) {
        // Update all active bots
        for (const bot of this.activeBots) {
            bot.update(this.activeBots, this.effectManager, delta);
        }
        
        // Check for inactive bots and respawn them
        for (let i = this.activeBots.length - 1; i >= 0; i--) {
            const bot = this.activeBots[i];
            if (!bot.state.active) {
                // Remove from active list
                this.activeBots.splice(i, 1);
                
                // Return to pool
                this.botPool.release(bot);
                
                // Spawn a new bot
                this.spawnBot();
            }
        }
    }
    
    preAllocate(count) {
        this.botPool.preAllocate(count);
    }
    
    getActiveBots() {
        return this.activeBots;
    }
}
