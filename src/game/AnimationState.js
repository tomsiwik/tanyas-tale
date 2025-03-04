import { Direction } from './config.js';

/**
 * Manages the current animation state of an entity
 */
export class AnimationState {
    constructor() {
        this.facing = Direction.NONE;
        this.isMoving = false;
        this.isDucking = false;
        this.isShooting = false;
        this.isExploding = false;
        this.isZapped = false;
        this.currentAnimation = 'idle';
    }

    /**
     * Update the animation state based on entity state
     * @param {Direction} moveDirection - Current movement direction
     * @param {boolean} isDucking - Whether entity is ducking
     * @param {boolean} isShooting - Whether entity is shooting
     * @param {boolean} isExploding - Whether entity is exploding
     * @param {boolean} isZapped - Whether entity is being zapped
     */
    updateState(moveDirection, isDucking = false, isShooting = false, isExploding = false, isZapped = false) {
        // Update state flags
        this.isMoving = moveDirection !== Direction.NONE;
        this.isDucking = isDucking;
        this.isShooting = isShooting;
        this.isExploding = isExploding;
        this.isZapped = isZapped;

        // Update facing direction if moving
        if (this.isMoving) {
            this.facing = moveDirection;
        }

        // Determine current animation based on state priority
        if (this.isExploding) {
            this.currentAnimation = 'death_explode';
        } else if (this.isZapped) {
            this.currentAnimation = 'death_zap';
        } else if (this.isDucking && this.isMoving) {
            this.currentAnimation = 'duck_moving';
        } else if (this.isDucking) {
            this.currentAnimation = 'ducking';
        } else if (this.isShooting) {
            this.currentAnimation = 'shooting';
        } else if (this.isMoving) {
            this.currentAnimation = 'running';
        } else {
            this.currentAnimation = 'standing';
        }
    }

    /**
     * Get the rotation angle in radians for the current facing direction
     * @returns {number} Rotation angle in radians
     */
    getRotation() {
        switch (this.facing) {
            case Direction.RIGHT: return 0;
            case Direction.DOWN_RIGHT: return Math.PI / 4;
            case Direction.DOWN: return Math.PI / 2;
            case Direction.DOWN_LEFT: return 3 * Math.PI / 4;
            case Direction.LEFT: return Math.PI;
            case Direction.UP_LEFT: return 5 * Math.PI / 4;
            case Direction.UP: return 3 * Math.PI / 2;
            case Direction.UP_RIGHT: return 7 * Math.PI / 4;
            default: return 0;
        }
    }
}
