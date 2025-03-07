/**
 * @abstract
 * @class Component
 * Base class for all components in the entity component system
 */
export class Component {
  /**
   * @param {import('../entities/Entity.js').Entity} entity - The entity this component belongs to
   */
  constructor(entity) {
    if (this.constructor === Component) {
      throw new Error("Component is an abstract class");
    }
    this.entity = entity;
  }
}
