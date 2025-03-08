import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import * as PIXI from "pixi.js";
import { Player } from "./player.js";
import { Direction, playerConfig } from "./config.js";
import { FeatureFlags } from "../core/feature-flags.js";
import { input } from "./input.js";

// Mock input module
vi.mock("./input.js", () => ({
  input: {
    getMousePosition: vi.fn(() => ({ x: 0, y: 0 })),
  },
}));

describe.each([
  ["with component system", true],
  ["without component system", false],
])("Player %s", (description, useComponents) => {
  let player;
  let app;
  let spriteManager;

  beforeEach(async () => {
    // Setup PIXI application
    app = new PIXI.Application({
      width: 800,
      height: 600,
    });

    // Enable/disable component system
    FeatureFlags.COMPONENT_SYSTEM = useComponents;

    // Create player
    player = new Player(app);

    // Mock sprite manager
    const createSprite = () => {
      const sprite = {
        width: 32,
        height: 32,
        scale: { set: vi.fn() },
        anchor: { set: vi.fn() },
        zIndex: 0,
        currentAnimationKey: "standing_s",
        gotoAndPlay: vi.fn(),
        gotoAndStop: vi.fn(),
        play: vi.fn(),
        stop: vi.fn(),
      };

      sprite.gotoAndPlay.mockImplementation((name) => {
        sprite.currentAnimationKey = name;
        return sprite;
      });

      sprite.gotoAndStop.mockImplementation((name) => {
        sprite.currentAnimationKey = name;
        return sprite;
      });

      return sprite;
    };

    const spriteManager = {
      createSprite,
      updateAnimation: vi.fn().mockImplementation((sprite, animationName) => {
        sprite.currentAnimationKey = animationName;
      }),
      spritesheet: {
        parse: vi.fn().mockReturnValue({
          animations: {
            standing_s: [],
            standing_e: [],
            running_e: [],
            running_se: [],
          },
        }),
      },
    };

    player.spriteManager = spriteManager;
    player.spritesLoaded = true;
    player.sprite = player.spriteManager.createSprite();
  });

  afterEach(() => {
    if (app) {
      app.destroy();
    }
    FeatureFlags.COMPONENT_SYSTEM = false;
    vi.clearAllMocks();
  });

  test("initializes at screen center", () => {
    const pos = player.getPosition();
    expect(pos.x).toBe(400);
    expect(pos.y).toBe(300);
    expect(player.container.x).toBe(400);
    expect(player.container.y).toBe(300);
  });

  test("updates position based on velocity", () => {
    player.setVelocity(100, 0);
    player.tick(1000);
    const pos = player.getPosition();
    expect(pos.x).toBe(500);
    expect(pos.y).toBe(300);
    expect(player.container.x).toBe(500);
    expect(player.container.y).toBe(300);
  });

  test("updates movement direction and animation", () => {
    player.updatePosition(Direction.RIGHT, 0);
    expect(player.state.moveDirection).toBe(Direction.RIGHT);
    expect(player.sprite.currentAnimationKey).toBe("running_e");

    player.updatePosition(Direction.NONE, 0);
    expect(player.state.moveDirection).toBe(Direction.NONE);
    expect(player.sprite.currentAnimationKey).toBe("standing_e");
  });

  test("moves in the correct direction", () => {
    // Test right movement
    player.updatePosition(Direction.RIGHT, 100);
    player.tick(1000);
    let pos = player.getPosition();
    expect(pos.x).toBe(500);
    expect(pos.y).toBe(300);

    // Test diagonal movement (should be normalized)
    player.setPosition(400, 300); // Reset position
    player.updatePosition(Direction.DOWN_RIGHT, 100);
    player.tick(1000);
    pos = player.getPosition();
    // Should move ~70.7 units in both directions (100/√2)
    expect(pos.x).toBeCloseTo(470.71, 2);
    expect(pos.y).toBeCloseTo(370.71, 2);
  });

  test("handles mouse aim direction", () => {
    // Mock mouse position to the right of the player
    vi.mocked(input.getMousePosition).mockReturnValue({ x: 500, y: 300 });

    expect(player.getAimDirectionFromMouse()).toBe(Direction.RIGHT);

    // Mock mouse position below the player
    vi.mocked(input.getMousePosition).mockReturnValue({ x: 400, y: 400 });

    expect(player.getAimDirectionFromMouse()).toBe(Direction.DOWN);
  });

  test("updates health bar visually", () => {
    // Take 50% damage
    player.takeDamage(25);

    // Check health state
    expect(player.state.health).toBe(25);

    // Verify that updateHealthBar was called with correct width
    const healthPercent = player.state.health / playerConfig.initialHealth;
    const expectedWidth = playerConfig.healthBarWidth * healthPercent;

    // Check if the health bar was redrawn with the correct width
    expect(player.healthBarFill.clear).toHaveBeenCalled();
    expect(player.healthBarFill.rect).toHaveBeenCalledWith(
      -playerConfig.healthBarWidth / 2,
      -20,
      expectedWidth,
      playerConfig.healthBarHeight
    );
  });
});
