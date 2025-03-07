import { MovementComponent } from "../MovementComponent.js";
import { Entity } from "../../entities/Entity.js";

describe("MovementComponent", () => {
  it("should update position based on velocity", () => {
    const entity = new Entity();
    const movement = new MovementComponent(entity);

    movement.setVelocity({ x: 10, y: 5 });
    movement.update(1000); // 1 second

    const position = entity.getPosition();
    expect(position.x).toBe(10);
    expect(position.y).toBe(5);
  });
});
