import { Direction, Point } from './types';

export interface Moveable {
    /**
     * Move the entity in a direction at a given speed
     */
    move(direction: Direction, speed: number): void;

    /**
     * Get the current movement direction
     */
    getMoveDirection(): Direction;

    /**
     * Check if the entity is currently moving
     */
    getIsMoving(): boolean;

    /**
     * Set movement state
     */
    setIsMoving(moving: boolean): void;

    /**
     * Get the current velocity vector
     */
    getVelocity(): Point;
}
