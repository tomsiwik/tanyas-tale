/**
 * @typedef {import('../components/Component.js').Component} Component
 */

/**
 * Base entity class that can hold components
 * @class Entity
 */
export class Entity {
  constructor() {
    /** @type {Map<string, Component>} */
    this.components = new Map();
  }

  /**
   * Add a component to this entity
   * @template {Component} T
   * @param {string} key - The key to store the component under
   * @param {T} component - The component to add
   * @returns {T} - The added component
   */
  addComponent(key, component) {
    this.components.set(key, component);
    return component;
  }

  /**
   * Get a component by key
   * @template {Component} T
   * @param {string} key - The key of the component to get
   * @returns {T|undefined} - The component if found, undefined otherwise
   */
  getComponent(key) {
    return this.components.get(key);
  }

  /**
   * Remove a component by key
   * @param {string} key - The key of the component to remove
   */
  removeComponent(key) {
    this.components.delete(key);
  }
}
