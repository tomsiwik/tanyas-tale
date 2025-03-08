import * as PIXI from "pixi.js";
import { playerConfig, Direction, AIM_POSITIONS } from "./config.js";
import { input } from "./input.js";
import { Entity } from "./entity.js";
import { SpriteManager } from "./spriteManager.js";
import { DirectionSuffix, AnimationType } from "./AnimationState.js";
import { debug } from "../utils/debug.js";
import { PositionComponent } from "../core/components/PositionComponent.js";
import { MovementComponent } from "../core/components/MovementComponent.js";
import { FeatureFlags } from "../core/feature-flags.js";

/**
 * Player state class
 */
class PlayerState {
  constructor() {
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
    debug.player("Creating player sprite");
    this.state = new PlayerState();
    this.setupGraphics();

    const centerX = Math.floor(app.screen.width / 2);
    const centerY = Math.floor(app.screen.height / 2);

    if (FeatureFlags.USE_POSITION_COMPONENT) {
      this.addComponent(
        new PositionComponent(this, { x: centerX, y: centerY })
      );
    }
    if (FeatureFlags.USE_MOVEMENT_COMPONENT) {
      this.addComponent(new MovementComponent(this));
    }

    this.setPosition(centerX, centerY);
    this.initSpriteManager();
  }

  setupGraphics() {
    this.container = new PIXI.Container();
    this.container.sortableChildren = true;
    this.container.zIndex = 10;

    this.setupPlaceholder();
    this.setupHealthBar();

    this.app.stage.addChild(this.container);
  }

  setupPlaceholder() {
    this.placeholder = new PIXI.Graphics()
      .rect(
        -playerConfig.size / 2,
        -playerConfig.size / 2,
        playerConfig.size,
        playerConfig.size
      )
      .fill(playerConfig.color);

    this.placeholder.zIndex = 20;
    this.container.addChild(this.placeholder);
  }

  setupHealthBar() {
    this.healthBarContainer = new PIXI.Container();
    this.healthBarContainer.y =
      -playerConfig.healthBarOffset - playerConfig.healthBarHeight;
    this.healthBarContainer.zIndex = 40;

    this.healthBarBg = new PIXI.Graphics()
      .rect(
        -playerConfig.healthBarWidth / 2,
        -20,
        playerConfig.healthBarWidth,
        playerConfig.healthBarHeight
      )
      .fill({
        color: playerConfig.healthBarBgColor,
        alpha: playerConfig.healthBarBgAlpha,
      })
      .setStrokeStyle({
        width: 1.5,
        color: 0x000000,
        alignment: 0.5,
      })
      .stroke();

    this.healthBarFill = new PIXI.Graphics()
      .rect(
        -playerConfig.healthBarWidth / 2,
        -20,
        playerConfig.healthBarWidth,
        playerConfig.healthBarHeight
      )
      .fill(playerConfig.healthBarFillColor);

    this.healthBarBorder = new PIXI.Graphics();
    this.healthBarBorder
      .setStrokeStyle({
        width: playerConfig.healthBarBorderThickness,
        color: playerConfig.healthBarBorderColor,
        alignment: 0.5,
      })
      .rect(
        -playerConfig.healthBarWidth / 2,
        -20,
        playerConfig.healthBarWidth,
        playerConfig.healthBarHeight
      );

    this.healthBarContainer.addChild(this.healthBarBg);
    this.healthBarContainer.addChild(this.healthBarFill);
    this.healthBarContainer.addChild(this.healthBarBorder);
    this.container.addChild(this.healthBarContainer);
  }

  /**
   * Initialize sprites and animations
   */
  async initSpriteManager() {
    try {
      const spritesheet = await PIXI.Assets.load(
        "/assets/atlas/sprite_atlas.json"
      );
      this.spriteManager = new SpriteManager(spritesheet);
      await this.spriteManager.initialize();
      await this.loadSprites();
    } catch (error) {
      debug.player.error("Failed to initialize sprites:", error);
    }
  }

  /**
   * Load sprite textures and create the animated sprite
   */
  async loadSprites() {
    if (!this.spriteManager) {
      debug.player.warn("Sprite manager not initialized");
      return;
    }

    debug.player("Loading player sprites...");

    this.sprite = this.spriteManager.createSprite("running_s");
    if (!this.sprite) {
      debug.player.error("Failed to create sprite");
      return;
    }

    const scale =
      (playerConfig.size * 2) / Math.max(this.sprite.width, this.sprite.height);
    this.sprite.scale.set(scale);
    this.sprite.anchor.set(0.5);
    this.sprite.zIndex = 10;

    this.container.removeChild(this.placeholder);
    this.container.addChild(this.sprite);

    this.spritesLoaded = true;
    debug.player("Player sprites loaded successfully");
  }

  /**
   * Get aim direction from mouse position using angle-based lookup
   * @returns {Direction} Direction enum value
   */
  getAimDirectionFromMouse(mousePos) {
    const pos = this.getPosition();
    const dx = mousePos.x - pos.x;
    const dy = mousePos.y - pos.y;

    if (Math.abs(dx) < playerConfig.size && Math.abs(dy) < playerConfig.size) {
      return Direction.NONE;
    }

    // Calculate angle in radians, normalize to [0, 2π]
    // Note: We negate dy because screen coordinates have y increasing downwards
    const angle = (Math.atan2(-dy, dx) + 2 * Math.PI) % (2 * Math.PI);

    // Convert angle to 8 sectors (45° each)
    const sector = Math.floor(((angle * 4) / Math.PI + 0.5) % 8);

    // Map sectors to directions, starting from right and going counter-clockwise
    const directionMap = [
      Direction.RIGHT, // 0°
      Direction.UP_RIGHT, // 45°
      Direction.UP, // 90°
      Direction.UP_LEFT, // 135°
      Direction.LEFT, // 180°
      Direction.DOWN_LEFT, // 225°
      Direction.DOWN, // 270°
      Direction.DOWN_RIGHT, // 315°
    ];

    return directionMap[sector];
  }

  /**
   * Get current animation key based on state
   * @returns {string} Animation key
   */
  getAnimationKey() {
    const direction =
      this.state.moveDirection === Direction.NONE
        ? this.state.aimDirection || Direction.DOWN
        : this.state.moveDirection;

    let suffix = DirectionSuffix[direction] || DirectionSuffix[Direction.DOWN];

    if (this.state.isDucking) {
      return `${AnimationType.DUCKING}_${suffix}`;
    }

    return this.state.moveDirection !== Direction.NONE
      ? `${AnimationType.RUNNING}_${suffix}`
      : `${AnimationType.STANDING}_${suffix}`;
  }

  /**
   * Update sprite animation based on current state
   * Only called when animation needs to change
   */
  updateAnimation() {
    if (!this.spritesLoaded || !this.sprite) {
      debug.player(
        "Cannot update animation: sprites not loaded or sprite missing"
      );
      return;
    }

    const newKey = this.getAnimationKey();
    if (this.sprite.currentAnimationKey !== newKey) {
      this.spriteManager.updateAnimation(this.sprite, newKey);
      this.sprite.currentAnimationKey = newKey;
    }
  }

  /**
   * Update player position based on movement direction and speed
   * @param {Direction} direction - Movement direction
   * @param {number} speed - Movement speed
   */
  updatePosition(direction, speed) {
    if (!this.state.active) return;

    const movementComponent = this.getComponent("movement");
    const positionComponent = this.getComponent("position");

    if (movementComponent && positionComponent) {
      const velocity = {
        x:
          (direction & Direction.RIGHT ? 1 : 0) -
          (direction & Direction.LEFT ? 1 : 0),
        y:
          (direction & Direction.DOWN ? 1 : 0) -
          (direction & Direction.UP ? 1 : 0),
      };

      const length = Math.sqrt(
        velocity.x * velocity.x + velocity.y * velocity.y
      );
      if (length > 0) {
        velocity.x = (velocity.x / length) * speed;
        velocity.y = (velocity.y / length) * speed;
      }

      movementComponent.setVelocity(velocity);
    } else {
      const dx =
        (direction & Direction.RIGHT ? 1 : 0) -
        (direction & Direction.LEFT ? 1 : 0);
      const dy =
        (direction & Direction.DOWN ? 1 : 0) -
        (direction & Direction.UP ? 1 : 0);

      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0) {
        const normalizedDx = (dx / length) * speed;
        const normalizedDy = (dy / length) * speed;

        const pos = this.getPosition();
        this.setPosition(pos.x + normalizedDx, pos.y + normalizedDy);
      }
    }
  }

  /**
   * Update health bar based on current health
   */
  updateHealthBar() {
    const healthPercent = this.state.health / playerConfig.initialHealth;
    const width = playerConfig.healthBarWidth * healthPercent;

    this.healthBarFill
      .clear()
      .rect(
        -playerConfig.healthBarWidth / 2,
        -20,
        width,
        playerConfig.healthBarHeight
      )
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
    this.state.health = Math.min(
      playerConfig.initialHealth,
      this.state.health + amount
    );
    this.updateHealthBar();
  }

  /**
   * Get the player's position
   * @returns {Object} The player's position {x, y}
   */
  getPosition() {
    const positionComponent = this.getComponent("position");
    if (positionComponent) {
      const pos = positionComponent.getPosition();
      return { x: pos.x, y: pos.y };
    }
    return { x: this.container.x, y: this.container.y };
  }

  /**
   * Set the player's position
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   */
  setPosition(x, y) {
    const positionComponent = this.getComponent("position");
    if (positionComponent) {
      positionComponent.setPosition({ x, y });
    }
    this.container.x = x;
    this.container.y = y;
  }

  /**
   * Get the player's state
   * @returns {Object} The player's state
   */
  getState() {
    return { ...this.state };
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
    if (!this.state.active) return;

    // 1. Get input and update state
    const moveDirection = input.getDirection();
    this.state.moveDirection = moveDirection;
    this.state.isDucking = input.isDucking();

    const mousePos = input.getMousePosition();
    this.state.aimDirection = this.getAimDirectionFromMouse(mousePos);

    // 2. Update velocity based on input
    this.updatePosition(moveDirection, playerConfig.speed);

    // 3. Apply movement after velocity is set
    const movementComponent = this.getComponent("movement");
    if (movementComponent) {
      movementComponent.update(deltaTime);
      const pos = this.getPosition();
      this.container.x = pos.x;
      this.container.y = pos.y;
    }

    // 4. Update visuals
    this.updateAnimation();
    this.updateHealthBar();
  }
}
