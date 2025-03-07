import { Component } from "./Component.js";

/**
 * @typedef {Object} Vector2D
 * @property {number} x - The x coordinate
 * @property {number} y - The y coordinate
 */

/**
 * Component that handles entity positioning
 * @extends Component
 */
export class PositionComponent extends Component {
  /**
   * @param {import('../entities/Entity.js').Entity} entity - The entity this component belongs to
   * @param {Vector2D} initialPosition - The initial position of the entity
   */
  constructor(entity, initialPosition) {
    super(entity);
    /** @type {Vector2D} */
    this.position = { ...initialPosition };
  }

  /**
   * Get the current position
   * @returns {Vector2D} A copy of the current position
   */
  getPosition() {
    return { ...this.position };
  }

  /**
   * Set a new position
   * @param {Vector2D} position - The new position
   */
  setPosition(position) {
    this.position = { ...position };
  }
}
