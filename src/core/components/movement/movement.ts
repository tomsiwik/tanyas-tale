import { Direction, Point } from '../../interfaces/types';
import { Moveable } from '../../interfaces/moveable';
import { Component, BaseEntity } from '../../entities/base/entity';
import { PositionComponent } from '../position/position';

export interface MovementConfig {
    baseSpeed: number;
    acceleration?: number;
    deceleration?: number;
    maxSpeed?: number;
}

/**
 * Component that handles entity movement
 */
export class MovementComponent extends Component implements Moveable {
    private direction: Direction = Direction.NONE;
    private _isMoving: boolean = false;
    private velocity: Point = { x: 0, y: 0 };
    private currentSpeed: number = 0;
    private positionComponent: PositionComponent;

    constructor(
        entity: BaseEntity,
        private config: MovementConfig,
        positionComponent: PositionComponent
    ) {
        super(entity);
        this.positionComponent = positionComponent;
        this.config.acceleration = config.acceleration ?? this.config.baseSpeed * 4;
        this.config.deceleration = config.deceleration ?? this.config.baseSpeed * 2;
        this.config.maxSpeed = config.maxSpeed ?? this.config.baseSpeed * 1.5;
    }

    /**
     * Update movement based on current direction and speed
     */
    update(deltaTime: number): void {
        if (!this._isMoving) {
            // Apply deceleration
            if (this.currentSpeed > 0) {
                this.currentSpeed = Math.max(0, this.currentSpeed - this.config.deceleration! * deltaTime);
            }
        } else {
            // Apply acceleration
            this.currentSpeed = Math.min(
                this.config.maxSpeed!,
                this.currentSpeed + this.config.acceleration! * deltaTime
            );
        }

        // Update position based on velocity
        if (this.currentSpeed > 0) {
            const movement = this.getDirectionVector(this.direction);
            const dx = movement.x * this.currentSpeed * deltaTime;
            const dy = movement.y * this.currentSpeed * deltaTime;
            
            this.velocity = { x: dx, y: dy };
            this.positionComponent.move(dx, dy);
        } else {
            this.velocity = { x: 0, y: 0 };
        }
    }

    /**
     * Start moving in a direction
     */
    move(direction: Direction, speed: number): void {
        this.direction = direction;
        this.setIsMoving(true);
        this.config.baseSpeed = speed;
        this.config.maxSpeed = speed * 1.5;
    }

    /**
     * Stop moving
     */
    stop(): void {
        this.setIsMoving(false);
    }

    /**
     * Get current movement direction
     */
    getMoveDirection(): Direction {
        return this.direction;
    }

    /**
     * Check if currently moving
     */
    getIsMoving(): boolean {
        return this._isMoving;
    }

    /**
     * Set movement state
     */
    setIsMoving(moving: boolean): void {
        this._isMoving = moving;
    }

    /**
     * Get current velocity vector
     */
    getVelocity(): Point {
        return { ...this.velocity };
    }

    /**
     * Convert direction enum to vector
     */
    private getDirectionVector(direction: Direction): Point {
        switch (direction) {
            case Direction.UP:
                return { x: 0, y: -1 };
            case Direction.UP_RIGHT:
                return { x: 0.707, y: -0.707 };
            case Direction.RIGHT:
                return { x: 1, y: 0 };
            case Direction.DOWN_RIGHT:
                return { x: 0.707, y: 0.707 };
            case Direction.DOWN:
                return { x: 0, y: 1 };
            case Direction.DOWN_LEFT:
                return { x: -0.707, y: 0.707 };
            case Direction.LEFT:
                return { x: -1, y: 0 };
            case Direction.UP_LEFT:
                return { x: -0.707, y: -0.707 };
            default:
                return { x: 0, y: 0 };
        }
    }
}
