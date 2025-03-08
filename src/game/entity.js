import { FeatureFlags } from "../core/feature-flags.js";
import { PositionComponent } from "../core/components/PositionComponent.js";
import { MovementComponent } from "../core/components/MovementComponent.js";
import { Entity as CoreEntity } from "../core/entities/Entity.js";

/**
 * Game Entity class that extends the core Entity class
 * Provides game-specific functionality and component management
 */
export class Entity extends CoreEntity {
  constructor() {
    super();
    this.skills = [];
    this.effects = [];
    this.components = new Map();

    if (FeatureFlags.USE_POSITION_COMPONENT) {
      this.addComponent(
        "position",
        new PositionComponent(this, { x: 0, y: 0 })
      );
    }

    if (FeatureFlags.USE_MOVEMENT_COMPONENT) {
      this.addComponent("movement", new MovementComponent(this));
    }
  }

  /**
   * Called every frame by the game loop
   * @param {number} deltaTime - Time since last frame in milliseconds
   * @param {Array} targets - Potential targets for skills
   */
  tick(deltaTime, targets = []) {
    const movementComponent = this.getComponent("movement");
    if (movementComponent) {
      movementComponent.update(deltaTime);
    }

    this.processEffects(deltaTime);
    this.tickSkills(deltaTime, targets);
  }

  /**
   * Process all active effects on the entity
   * @param {number} deltaTime - Time since last frame in milliseconds
   */
  processEffects(deltaTime) {
    this.effects = this.effects.filter((effect) => {
      effect.duration -= deltaTime;
      return effect.duration > 0;
    });

    for (const effect of this.effects) {
      effect.apply(this, deltaTime);
    }
  }

  /**
   * Update all skills
   * @param {number} deltaTime - Time since last frame in milliseconds
   * @param {Array} targets - Potential targets for skills
   */
  tickSkills(deltaTime, targets) {
    for (const skill of this.skills) {
      skill.tick(deltaTime, this, targets);
    }
  }

  /**
   * Apply an effect to this entity
   * @param {Effect} effect - The effect to apply
   */
  applyEffect(effect) {
    const effectCopy = effect.clone();
    this.effects.push(effectCopy);
    effectCopy.apply(this, 0);
  }

  /**
   * Add a skill to this entity
   * @param {Skill} skill - The skill to add
   */
  addSkill(skill) {
    this.skills.push(skill);
    return skill;
  }

  /**
   * Remove a skill from this entity
   * @param {Skill} skill - The skill to remove
   */
  removeSkill(skill) {
    const index = this.skills.indexOf(skill);
    if (index !== -1) {
      this.skills.splice(index, 1);
    }
  }

  /**
   * Get the entity's current state
   * @returns {Object} The entity's state
   */
  getState() {
    return {};
  }

  /**
   * Get the entity's position
   * @returns {Object} The entity's position {x, y}
   */
  getPosition() {
    const positionComponent = this.getComponent("position");
    if (positionComponent) {
      return positionComponent.getPosition();
    }
    return { x: 0, y: 0 };
  }

  /**
   * Set the entity's position
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   */
  setPosition(x, y) {
    const positionComponent = this.getComponent("position");
    if (positionComponent) {
      positionComponent.setPosition({ x, y });
    }
  }

  /**
   * Check if the entity is active
   * @returns {boolean} Whether the entity is active
   */
  isActive() {
    return true;
  }

  /**
   * Set the entity's velocity
   * @param {number} x - The x velocity
   * @param {number} y - The y velocity
   */
  setVelocity(x, y) {
    const movementComponent = this.getComponent("movement");
    if (movementComponent) {
      movementComponent.setVelocity({ x, y });
    }
  }

  /**
   * Get the entity's velocity
   * @returns {Object} The entity's velocity {x, y}
   */
  getVelocity() {
    const movementComponent = this.getComponent("movement");
    if (movementComponent) {
      return movementComponent.getVelocity();
    }
    return { x: 0, y: 0 };
  }

  addComponent(name, component) {
    this.components.set(name, component);
  }

  getComponent(name) {
    return this.components.get(name);
  }
}
