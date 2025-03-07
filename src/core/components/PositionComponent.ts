import { Component } from "./Component";
import { Entity } from "../entities/Entity";
import { Vector2D } from "../interfaces/Vector2D";

export class PositionComponent extends Component {
  private position: Vector2D;

  constructor(entity: Entity, initialPosition: Vector2D) {
    super(entity);
    this.position = { ...initialPosition };
  }

  getPosition(): Vector2D {
    return { ...this.position };
  }

  setPosition(position: Vector2D): void {
    this.position = { ...position };
  }
}
