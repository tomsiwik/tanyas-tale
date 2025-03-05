import { Point } from '../../interfaces/types';
import { Component, BaseEntity } from '../../entities/base/entity';

export interface PositionConfig {
    x: number;
    y: number;
}

/**
 * Component that handles entity position
 */
export class PositionComponent extends Component {
    private position: Point;

    constructor(entity: BaseEntity, config: PositionConfig) {
        super(entity);
        this.position = { x: config.x, y: config.y };
    }

    /**
     * Update position
     */
    update(_deltaTime: number): void {
        // Position only changes through setPosition
    }

    /**
     * Set position directly
     */
    setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * Move relative to current position
     */
    move(dx: number, dy: number): void {
        this.position.x += dx;
        this.position.y += dy;
    }

    /**
     * Get current position
     */
    getPosition(): Point {
        return { ...this.position };
    }

    /**
     * Calculate distance to another point
     */
    distanceTo(point: Point): number {
        const dx = this.position.x - point.x;
        const dy = this.position.y - point.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate direction to another point
     */
    directionTo(point: Point): Point {
        const dx = point.x - this.position.x;
        const dy = point.y - this.position.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return { x: 0, y: 0 };
        
        return {
            x: dx / length,
            y: dy / length
        };
    }

    /**
     * Check if point is within range
     */
    isInRange(point: Point, range: number): boolean {
        return this.distanceTo(point) <= range;
    }

    /**
     * Interpolate position towards target
     * @param target Target position
     * @param factor Interpolation factor (0-1)
     */
    interpolateTo(target: Point, factor: number): void {
        this.position.x += (target.x - this.position.x) * factor;
        this.position.y += (target.y - this.position.y) * factor;
    }
}
