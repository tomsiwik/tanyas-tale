import { Component } from "../components/Component";

export class Entity {
  private components: Map<string, Component> = new Map();

  addComponent<T extends Component>(key: string, component: T): T {
    this.components.set(key, component);
    return component;
  }

  getComponent<T extends Component>(key: string): T | undefined {
    return this.components.get(key) as T;
  }

  removeComponent(key: string): void {
    this.components.delete(key);
  }
}
