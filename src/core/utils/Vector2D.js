export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  scale(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D();
    return this.scale(1 / mag);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  static fromAngle(angle, magnitude = 1) {
    return new Vector2D(
      magnitude * Math.cos(angle),
      magnitude * Math.sin(angle)
    );
  }
}
