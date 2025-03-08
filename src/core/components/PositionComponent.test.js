import { PositionComponent } from "../PositionComponent.js";
import { Entity } from "../../entities/Entity.js";

describe("PositionComponent", () => {
  it("should initialize with a given position", () => {
    const initialPosition = { x: 100, y: 200 };
    const mockEntity = new Entity();
    const positionComponent = new PositionComponent(
      mockEntity,
      initialPosition
    );

    expect(positionComponent.getPosition()).toEqual(initialPosition);
  });
});
