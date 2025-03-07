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
    const position = this.entity.getPosition();

    this.entity.setPosition(
      position.x + this.velocity.x * seconds,
      position.y + this.velocity.y * seconds
    );
  }
}
