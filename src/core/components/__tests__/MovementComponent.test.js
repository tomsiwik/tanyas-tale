import { MovementComponent } from "../MovementComponent.js";
import { PositionComponent } from "../PositionComponent.js";
import { Entity } from "../../entities/Entity.js";

describe("MovementComponent", () => {
  it("should update position based on velocity", () => {
    const entity = new Entity();
    const position = new PositionComponent(entity, { x: 0, y: 0 });
    const movement = new MovementComponent(entity);

    entity.addComponent("position", position);
    entity.addComponent("movement", movement);

    movement.setVelocity({ x: 10, y: 5 });
    movement.update(1000); // 1 second

    const pos = position.getPosition();
    expect(pos.x).toBe(10);
    expect(pos.y).toBe(5);
  });
});
