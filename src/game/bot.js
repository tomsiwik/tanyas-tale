import * as PIXI from "pixi.js";
import { botConfig, Direction } from "./config.js";
import { Entity } from "./entity.js";
import { RegenerationSkill } from "./skills.js";
import { SpriteManager } from "./spriteManager.js";
import { DirectionSuffix, AnimationType } from "./AnimationState.js";
import { FeatureFlags } from "../core/feature-flags.js";
import { PositionComponent } from "../core/components/PositionComponent.js";
import { MovementComponent } from "../core/components/MovementComponent.js";

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

    this.container = new PIXI.Container();
    this.container.sortableChildren = true;
    this.container.zIndex = 5; // Set container z-index lower than player

    this.spriteManager = null;
    this.initSpriteManager();
    this.spritesLoaded = false;

    this.placeholder = new PIXI.Graphics()
      .rect(
        -botConfig.size / 2,
        -botConfig.size / 2,
        botConfig.size,
        botConfig.size
      )
      .fill(botConfig.color);

    this.placeholder.zIndex = 10;
    this.container.addChild(this.placeholder);

    this.healthBarContainer = new PIXI.Container();
    this.healthBarContainer.y =
      -botConfig.healthBarOffset - botConfig.healthBarHeight;
    this.healthBarContainer.x = -botConfig.healthBarWidth / 2;
    this.healthBarContainer.zIndex = 30; // Increased to be above sprites

    // Create health bar background
    this.healthBarBg = new PIXI.Graphics()
      .rect(0, -20, botConfig.healthBarWidth, botConfig.healthBarHeight)
      .fill(botConfig.healthBarBgColor)
      .setStrokeStyle({
        width: 1.5,
        color: 0x000000,
        alignment: 0.5, // Center the stroke
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
        color: botConfig.healthBarBorderColor,
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

    // Add regeneration skill
    this.addSkill(new RegenerationSkill());
  }

  /**
   * Initialize the bot
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {PIXI.Container} stage - The stage to add the bot to
   */
  async init(x, y, stage) {
    // If using component system, initialize components
    if (FeatureFlags.USE_POSITION_COMPONENT && !this.getComponent("position")) {
      this.addComponent("position", new PositionComponent(this, { x, y }));
    }

    if (FeatureFlags.USE_MOVEMENT_COMPONENT && !this.getComponent("movement")) {
      this.addComponent("movement", new MovementComponent(this));
    }

    // Set position - will use component if available
    this.setPosition(x, y);

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
        // Default to running animation for bots (not shooting)
        // Use south direction as default
        console.debug("Bot - Creating sprite with running_s animation");
        this.sprite = this.spriteManager.createSprite("running_s");

        if (!this.sprite) {
          console.error(
            "Failed to create bot sprite - falling back to placeholder"
          );
          this.placeholder.visible = true;
        } else {
          // Configure sprite
          this.sprite.scale.set(1);
          this.sprite.anchor.set(0.5);
          this.sprite.zIndex = 10; // Set sprite z-index
          this.container.addChild(this.sprite);
          this.placeholder.visible = false; // Hide placeholder when sprite is loaded

          // Mark as loaded
          this.spritesLoaded = true;
          console.debug("Bot - Sprite loaded successfully");
        }
      } catch (error) {
        console.error("Error loading bot sprites:", error);
        this.placeholder.visible = true; // Keep placeholder visible on error
      }
    }

    // Show container
    this.container.visible = true;
    this.container.alpha = 1;
    this.healthBarContainer.visible = true;

    // Add to stage if not already added
    if (!this.container.parent && stage) {
      stage.addChild(this.container);
    }

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
    const fillWidth =
      (this.state.health / botConfig.maxHealth) * botConfig.healthBarWidth;

    // Update health bar fill
    this.healthBarFill
      .clear()
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
      // Load sprite atlas - use debug logging
      console.debug("Bot - Loading sprite atlas");
      const spritesheet = await PIXI.Assets.load(
        "/assets/atlas/sprite_atlas.json"
      );
      console.debug("Bot - Sprite atlas loaded", spritesheet);
      this.spriteManager = new SpriteManager(spritesheet);
      await this.spriteManager.initialize();
      console.debug("Bot - SpriteManager initialized");
    } catch (error) {
      console.error("Failed to initialize bot sprite manager:", error);
    }
  }

  /**
   * Get current animation key based on state
   * @returns {string} Animation key
   */
  getAnimationKey() {
    const direction =
      this.state.moveDirection === Direction.NONE
        ? this.state.aimDirection
        : this.state.moveDirection;

    const suffix = DirectionSuffix[direction];

    // Bots should always use running animation when moving
    if (this.state.isMoving) {
      return `${AnimationType.RUNNING}_${suffix}`;
    }

    // Use standing animation when not moving
    return `${AnimationType.STANDING}_${suffix}`;
  }

  /**
   * Update sprite animation based on current state
   * Only called when animation needs to change
   */
  updateAnimation() {
    if (!this.spritesLoaded || !this.sprite) {
      console.log(
        "Cannot update bot animation: sprites not loaded or sprite missing"
      );
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

    this.state.health = Math.min(
      botConfig.maxHealth,
      this.state.health + amount
    );
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
    const positionComponent = this.getComponent("position");
    if (positionComponent) {
      return positionComponent.getPosition();
    }
    return { x: this.state.x, y: this.state.y };
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
    const pos = this.getPosition();
    const targetDx = targetX - pos.x;
    const targetDy = targetY - pos.y;

    // Calculate distance to target
    const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

    // Only move if not too close to target
    if (targetDistance <= botConfig.minDistanceToPlayer) {
      // Stop movement if too close
      if (FeatureFlags.USE_MOVEMENT_COMPONENT) {
        const movementComponent = this.getComponent("movement");
        if (movementComponent) {
          movementComponent.setVelocity({ x: 0, y: 0 });
        }
      }
      // Set not moving when stopped
      this.state.isMoving = false;
      return;
    }

    // Set moving flag - bot should be considered moving when trying to move
    this.state.isMoving = true;

    // Normalize direction
    const normalizedDx = targetDx / targetDistance;
    const normalizedDy = targetDy / targetDistance;

    // Calculate repulsion vector from other bots
    let repulsionX = 0;
    let repulsionY = 0;

    for (const bot of otherBots) {
      // Skip self and inactive bots
      if (bot === this || !bot.isActive()) continue;

      // Calculate distance between centers
      const otherPos = bot.getPosition();
      const botDx = pos.x - otherPos.x;
      const botDy = pos.y - otherPos.y;
      const botDistance = Math.sqrt(botDx * botDx + botDy * botDy);

      // If too close, calculate repulsion
      if (botDistance < botConfig.minDistanceToBot) {
        // Calculate repulsion vector
        const repulsionFactor =
          (botConfig.minDistanceToBot - botDistance) /
          botConfig.minDistanceToBot;
        repulsionX += (botDx / botDistance) * repulsionFactor;
        repulsionY += (botDy / botDistance) * repulsionFactor;
      }
    }

    // Combine target attraction and bot repulsion
    let velocityX = normalizedDx + repulsionX;
    let velocityY = normalizedDy + repulsionY;

    // Normalize combined vector
    const combinedLength = Math.sqrt(
      velocityX * velocityX + velocityY * velocityY
    );
    if (combinedLength > 0) {
      velocityX = (velocityX / combinedLength) * botConfig.speed;
      velocityY = (velocityY / combinedLength) * botConfig.speed;
    }

    // Apply velocity using movement component if available
    if (FeatureFlags.USE_MOVEMENT_COMPONENT) {
      const movementComponent = this.getComponent("movement");
      if (movementComponent) {
        movementComponent.setVelocity({ x: velocityX, y: velocityY });
      }
    } else {
      // Legacy direct position update
      let newX = pos.x + velocityX;
      let newY = pos.y + velocityY;

      // Check screen boundaries
      newX = Math.max(
        0,
        Math.min(this.app.screen.width - botConfig.size, newX)
      );
      newY = Math.max(
        0,
        Math.min(this.app.screen.height - botConfig.size, newY)
      );

      this.setPosition(newX, newY);

      // Calculate move direction based on movement vector
      this.updateDirectionFromVector(velocityX, velocityY);
    }
  }

  updateDirectionFromVector(dx, dy) {
    // Determine if movement is significant
    const isMoving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;

    // Only update isMoving if it changed to false (movement was stopped)
    // We keep isMoving=true when bot is actively trying to move
    if (!isMoving) {
      this.state.isMoving = false;
    }

    if (!isMoving) return;

    // Calculate direction based on angle
    const angle = Math.atan2(dy, dx);
    const octant = Math.floor((((angle + Math.PI) * 4) / Math.PI + 0.5) % 8);

    // Map octants to directions
    const directions = [
      Direction.LEFT,
      Direction.DOWN_LEFT,
      Direction.DOWN,
      Direction.DOWN_RIGHT,
      Direction.RIGHT,
      Direction.UP_RIGHT,
      Direction.UP,
      Direction.UP_LEFT,
    ];

    this.state.moveDirection = directions[octant];
  }

  // Override setPosition to use components first if available
  setPosition(x, y) {
    const positionComponent = this.getComponent("position");
    if (positionComponent) {
      positionComponent.setPosition({ x, y });
    } else if (this.state) {
      this.state.x = x;
      this.state.y = y;
    }

    // Update container if available
    if (this.container) {
      this.container.x = Math.floor(x);
      this.container.y = Math.floor(y);
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

    // Update position from components if available
    const movementComponent = this.getComponent("movement");
    if (movementComponent) {
      movementComponent.update(deltaTime);
      const pos = this.getPosition();
      this.container.x = Math.floor(pos.x);
      this.container.y = Math.floor(pos.y);
    }

    // Update animation if state changed
    if (
      prevAimDirection !== this.state.aimDirection ||
      prevMoveDirection !== this.state.moveDirection ||
      prevIsMoving !== this.state.isMoving
    ) {
      if (this.spritesLoaded && this.sprite) {
        this.updateAnimation();
      }
    }

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
