import { Vector2D } from "../Vector2D.js";

describe("Vector2D", () => {
  describe("basic operations", () => {
    it("should add vectors", () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(2, 3);
      const result = v1.add(v2);

      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
      // Original vectors should be unchanged
      expect(v1.x).toBe(1);
      expect(v1.y).toBe(2);
    });

    it("should scale vector", () => {
      const v = new Vector2D(2, 3);
      const result = v.scale(2);

      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it("should calculate magnitude", () => {
      const v = new Vector2D(3, 4);
      expect(v.magnitude()).toBe(5);
    });

    it("should normalize vector", () => {
      const v = new Vector2D(3, 4);
      const result = v.normalize();

      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
    });
  });

  describe("direction calculations", () => {
    it("should calculate angle in radians", () => {
      const v = new Vector2D(1, 1);
      expect(v.angle()).toBeCloseTo(Math.PI / 4);
    });

    it("should create vector from angle", () => {
      const v = Vector2D.fromAngle(Math.PI / 4, Math.sqrt(2));
      expect(v.x).toBeCloseTo(1);
      expect(v.y).toBeCloseTo(1);
    });
  });
});
