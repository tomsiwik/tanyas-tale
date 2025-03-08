import { describe, test, expect, beforeEach, afterEach } from "vitest";
import * as PIXI from "pixi.js";
import { Player } from "./player.js";
import { Direction, playerConfig } from "./config.js";
import { FeatureFlags } from "../core/feature-flags.js";
import { vi } from "vitest";

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

describe.each([
  ["with component system", true],
  ["without component system", false],
])("Player Integration %s", (description, useComponents) => {
  let player;
  let app;

  beforeEach(async () => {
    app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundAlpha: 0,
      antialias: false,
    });

    FeatureFlags.COMPONENT_SYSTEM = useComponents;
    player = new Player(app);

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

    await player.loadSprites();
  });

  afterEach(() => {
    if (app) {
      app.destroy();
    }
    FeatureFlags.COMPONENT_SYSTEM = false;
  });

  test("initializes at screen center", async () => {
    const pos = player.getPosition();
    expect(pos.x).toBe(400);
    expect(pos.y).toBe(300);
    expect(player.container.x).toBe(400);
    expect(player.container.y).toBe(300);
    expect(player.sprite).toBeDefined();
    expect(player.spritesLoaded).toBe(true);
  });

  test("updates position and animation when moving", async () => {
    player.updatePosition(Direction.RIGHT, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(player.state.moveDirection).toBe(Direction.RIGHT);
    expect(player.sprite.currentAnimationKey).toBe("running_e");

    player.tick(1000);
    const pos = player.getPosition();
    expect(pos.x).toBe(500);
    expect(pos.y).toBe(300);

    player.updatePosition(Direction.NONE, 0);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(player.state.moveDirection).toBe(Direction.NONE);
    expect(player.sprite.currentAnimationKey).toBe("standing_e");
  });

  test("updates health bar visually", () => {
    const player = new Player(app);

    player.spriteManager = {
      createSprite,
      updateAnimation: vi.fn(),
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

    player.spritesLoaded = true;
    player.sprite = player.spriteManager.createSprite();

    player.healthBarContainer = new PIXI.Container();
    player.healthBarContainer.y =
      -playerConfig.healthBarOffset - playerConfig.healthBarHeight;
    player.healthBarContainer.zIndex = 20;

    const healthBarFill = {
      clear: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
    };
    healthBarFill.clear.mockReturnValue(healthBarFill);
    healthBarFill.rect.mockReturnValue(healthBarFill);
    healthBarFill.fill.mockReturnValue(healthBarFill);
    player.healthBarFill = healthBarFill;

    player.takeDamage(25);

    expect(player.state.health).toBe(25);
    expect(player.healthBarFill.clear).toHaveBeenCalled();
    expect(player.healthBarFill.rect).toHaveBeenCalledWith(
      -playerConfig.healthBarWidth / 2,
      -20,
      playerConfig.healthBarWidth * 0.5,
      playerConfig.healthBarHeight
    );
    expect(player.healthBarFill.fill).toHaveBeenCalledWith(
      playerConfig.healthBarFillColor
    );
  });

  test("handles diagonal movement with normalized velocity", async () => {
    player.updatePosition(Direction.DOWN_RIGHT, 100);
    player.tick(1000);

    const pos = player.getPosition();
    expect(pos.x).toBeCloseTo(470.71, 2);
    expect(pos.y).toBeCloseTo(370.71, 2);

    expect(player.sprite.currentAnimationKey).toBe("running_se");
  });
});
