import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import { Player } from "./player.js";
import { Direction, playerConfig } from "./config.js";
import { FeatureFlags } from "../core/feature-flags.js";
import { input } from "./input.js";
import { MovementComponent } from "../core/components/MovementComponent.js";
import { PositionComponent } from "../core/components/PositionComponent.js";
import * as PIXI from "pixi.js";

vi.mock("./input.js", () => ({
  input: {
    getDirection: vi.fn(),
    getMousePosition: vi.fn(() => ({ x: 0, y: 0 })),
    isDucking: vi.fn(() => false),
    keyState: new Set(),
  },
}));

describe("Movement System", () => {
  let player;
  let app;

  beforeEach(() => {
    app = new PIXI.Application({
      width: 800,
      height: 600,
    });

    FeatureFlags.USE_POSITION_COMPONENT = true;
    FeatureFlags.USE_MOVEMENT_COMPONENT = true;

    player = new Player(app);
    player.state.speed = playerConfig.speed;

    vi.mocked(input.getDirection).mockReturnValue(Direction.NONE);
    vi.mocked(input.isDucking).mockReturnValue(false);
  });

  afterEach(() => {
    if (app) {
      app.destroy();
    }
    vi.clearAllMocks();
  });

  describe("Component Integration", () => {
    test("initializes with both components", () => {
      const positionComponent = player.getComponent("position");
      const movementComponent = player.getComponent("movement");

      expect(positionComponent).toBeInstanceOf(PositionComponent);
      expect(movementComponent).toBeInstanceOf(MovementComponent);
    });

    test("position component reflects container position", () => {
      const pos = player.getComponent("position").getPosition();
      expect(pos.x).toBe(player.container.x);
      expect(pos.y).toBe(player.container.y);
    });
  });

  describe("Input to Movement", () => {
    test.each([
      ["RIGHT", Direction.RIGHT, { x: 5, y: 0 }],
      ["LEFT", Direction.LEFT, { x: -5, y: 0 }],
      ["UP", Direction.UP, { x: 0, y: -5 }],
      ["DOWN", Direction.DOWN, { x: 0, y: 5 }],
      ["UP_RIGHT", Direction.UP | Direction.RIGHT, { x: 3.5355, y: -3.5355 }],
      ["DOWN_LEFT", Direction.DOWN | Direction.LEFT, { x: -3.5355, y: 3.5355 }],
    ])(
      "translates %s input to correct velocity",
      (name, direction, expected) => {
        vi.mocked(input.getDirection).mockReturnValue(direction);

        // First tick sets the velocity based on input
        player.tick(16);

        const velocity = player.getComponent("movement").getVelocity();
        expect(velocity.x).toBeCloseTo(expected.x, 2);
        expect(velocity.y).toBeCloseTo(expected.y, 2);
      }
    );

    test("stops movement when no input", () => {
      vi.mocked(input.getDirection).mockReturnValue(Direction.NONE);

      player.tick(16);

      const velocity = player.getComponent("movement").getVelocity();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });
  });

  describe("Movement to Position", () => {
    test("updates position based on velocity", () => {
      // 1. Set starting position
      player.setPosition(400, 300);

      // 2. Set velocity manually on the movement component
      const movementComponent = player.getComponent("movement");
      const positionComponent = player.getComponent("position");
      movementComponent.setVelocity({ x: 100, y: 0 });

      // 3. Call update directly on the movement component instead of going through tick
      movementComponent.update(1000);

      // 4. Check final position
      const endPos = player.getPosition();

      // Should move 100 units in the x direction
      expect(endPos.x).toBeCloseTo(500);
      expect(endPos.y).toBeCloseTo(300);
    });

    test("normalizes diagonal movement speed", () => {
      // 1. Set starting position
      player.setPosition(400, 300);

      // 2. Set diagonal input
      vi.mocked(input.getDirection).mockReturnValue(
        Direction.UP | Direction.RIGHT
      );

      // 3. Run tick to update velocity
      player.tick(0);

      // 4. Run another tick to apply movement
      player.tick(1000);

      // 5. Check the new position
      const endPos = player.getPosition();
      const distance = Math.sqrt(
        Math.pow(endPos.x - 400, 2) + Math.pow(endPos.y - 300, 2)
      );

      // Should move at the speed defined in playerConfig (5 units/s)
      expect(distance).toBeCloseTo(playerConfig.speed, 1);
    });
  });

  describe("Mouse Following", () => {
    test.each([
      [{ x: 500, y: 300 }, Direction.RIGHT], // Right (2)
      [{ x: 300, y: 500 }, Direction.DOWN_LEFT], // Down-Left (12)
      [{ x: 300, y: 100 }, Direction.UP_LEFT], // Up-Left (9)
      [{ x: 100, y: 300 }, Direction.LEFT], // Left (8)
      [{ x: 500, y: 100 }, Direction.UP_RIGHT], // Up-Right (3)
      [{ x: 500, y: 500 }, Direction.DOWN_RIGHT], // Down-Right (6)
    ])(
      "sets aim direction based on mouse position %p",
      (mousePos, expected) => {
        const centerX = 400;
        const centerY = 300;
        player.setPosition(centerX, centerY);
        vi.mocked(input.getMousePosition).mockReturnValue(mousePos);

        player.tick(16);

        expect(player.state.aimDirection).toBe(expected);
      }
    );

    test("maintains aim direction when not moving", () => {
      const centerX = 400;
      const centerY = 300;
      player.setPosition(centerX, centerY);
      vi.mocked(input.getMousePosition).mockReturnValue({ x: 500, y: 300 });
      vi.mocked(input.getDirection).mockReturnValue(Direction.NONE);

      player.tick(16);

      expect(player.state.aimDirection).toBe(Direction.RIGHT);
      expect(player.state.moveDirection).toBe(Direction.NONE);
    });
  });

  describe("Movement Animation", () => {
    test.each([
      [Direction.RIGHT, "running_e"],
      [Direction.LEFT, "running_w"],
      [Direction.UP, "running_n"],
      [Direction.DOWN, "running_s"],
      [Direction.UP | Direction.RIGHT, "running_ne"],
      [Direction.DOWN | Direction.LEFT, "running_sw"],
    ])("plays correct animation for direction %s", (direction, expected) => {
      vi.mocked(input.getDirection).mockReturnValue(direction);

      player.tick(16);
      player.updateAnimation();

      expect(player.getAnimationKey()).toBe(expected);
    });

    test("transitions to standing animation when stopped", () => {
      // First move
      vi.mocked(input.getDirection).mockReturnValue(Direction.RIGHT);
      player.tick(16);
      player.updateAnimation();
      expect(player.getAnimationKey()).toBe("running_e");

      // Then stop
      vi.mocked(input.getDirection).mockReturnValue(Direction.NONE);
      player.tick(16);
      player.updateAnimation();
      expect(player.getAnimationKey()).toBe("standing_e");
    });
  });
});
