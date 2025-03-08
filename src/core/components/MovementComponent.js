import { Component } from "./Component.js";

export class MovementComponent extends Component {
  constructor(entity) {
    super(entity);
    this.velocity = { x: 0, y: 0 };
  }

  setVelocity(velocity) {
    this.velocity = { ...velocity };
  }

  getVelocity() {
    return { ...this.velocity };
  }

  update(deltaTime) {
    const seconds = deltaTime / 1000;
    const positionComponent = this.entity.getComponent("position");
    if (!positionComponent) {
      console.warn("MovementComponent requires a PositionComponent");
      return;
    }

    const position = positionComponent.getPosition();
    positionComponent.setPosition({
      x: position.x + this.velocity.x * seconds,
      y: position.y + this.velocity.y * seconds,
    });
  }
}
