import { PositionComponent } from "../PositionComponent";
import { Vector2D } from "../../interfaces/Vector2D";
import { Entity } from "../../entities/Entity";

describe("PositionComponent", () => {
  it("should initialize with a given position", () => {
    const initialPosition: Vector2D = { x: 100, y: 200 };
    const mockEntity = new Entity();
    const positionComponent = new PositionComponent(
      mockEntity,
      initialPosition
    );

    expect(positionComponent.getPosition()).toEqual(initialPosition);
  });
});
