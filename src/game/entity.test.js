import { Entity } from "./entity.js";
import { FeatureFlags } from "../core/feature-flags.js";

describe("Entity", () => {
  let originalFlags;

  beforeEach(() => {
    originalFlags = {
      USE_POSITION_COMPONENT: FeatureFlags.USE_POSITION_COMPONENT,
      USE_MOVEMENT_COMPONENT: FeatureFlags.USE_MOVEMENT_COMPONENT,
    };
  });

  afterEach(() => {
    FeatureFlags.USE_POSITION_COMPONENT = originalFlags.USE_POSITION_COMPONENT;
    FeatureFlags.USE_MOVEMENT_COMPONENT = originalFlags.USE_MOVEMENT_COMPONENT;
  });

  describe("position handling", () => {
    it("should use legacy position system when feature flag is off", () => {
      FeatureFlags.USE_POSITION_COMPONENT = false;
      const entity = new Entity();

      entity.setPosition(100, 200);
      expect(entity.getPosition()).toEqual({ x: 100, y: 200 });
      expect(entity.x).toBe(100);
      expect(entity.y).toBe(200);
    });

    it("should use position component when feature flag is on", () => {
      FeatureFlags.USE_POSITION_COMPONENT = true;
      const entity = new Entity();

      entity.setPosition(100, 200);
      expect(entity.getPosition()).toEqual({ x: 100, y: 200 });
      expect(entity.x).toBe(100);
      expect(entity.y).toBe(200);
    });
  });

  describe("movement handling", () => {
    it("should use legacy movement system when feature flag is off", () => {
      FeatureFlags.USE_MOVEMENT_COMPONENT = false;
      const entity = new Entity();

      entity.setVelocity(10, 5);
      entity.tick(1000);

      expect(entity.getPosition()).toEqual({ x: 10, y: 5 });
    });

    it("should use movement component when feature flag is on", () => {
      FeatureFlags.USE_MOVEMENT_COMPONENT = true;
      const entity = new Entity();

      entity.setVelocity(10, 5);
      entity.tick(1000);

      expect(entity.getPosition()).toEqual({ x: 10, y: 5 });
    });

    it("should maintain velocity state", () => {
      FeatureFlags.USE_MOVEMENT_COMPONENT = true;
      const entity = new Entity();

      entity.setVelocity(10, 5);
      expect(entity.getVelocity()).toEqual({ x: 10, y: 5 });
    });
  });
});
