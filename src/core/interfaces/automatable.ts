import { Point } from './types';
import { BaseEntity } from '../entities/base/entity';

export interface AIState {
    /**
     * Current target entity
     */
    target?: BaseEntity;

    /**
     * Last known position of target
     */
    lastKnownTargetPosition?: Point;

    /**
     * Current behavior state
     */
    currentBehavior: AIBehavior;

    /**
     * Time in current behavior
     */
    behaviorTime: number;
}

export enum AIBehavior {
    IDLE = 'IDLE',
    CHASE = 'CHASE',
    ATTACK = 'ATTACK',
    RETREAT = 'RETREAT',
    PATROL = 'PATROL'
}

export interface AIConfig {
    /**
     * Maximum distance to chase target
     */
    chaseRange: number;

    /**
     * Distance to keep from target
     */
    preferredRange: number;

    /**
     * Distance to start retreating
     */
    retreatRange: number;

    /**
     * Movement speed multipliers for different behaviors
     */
    speedMultipliers: {
        [key in AIBehavior]: number;
    };

    /**
     * Patrol points if in patrol mode
     */
    patrolPoints?: Point[];
}

export interface Automatable {
    /**
     * Update AI behavior
     */
    update(deltaTime: number): void;

    /**
     * Set the target entity
     */
    setTarget(target: BaseEntity | null): void;

    /**
     * Get current target
     */
    getTarget(): BaseEntity | null;

    /**
     * Get current AI state
     */
    getAIState(): AIState;

    /**
     * Configure AI behavior
     */
    configure(config: AIConfig): void;

    /**
     * Force a specific behavior
     */
    setBehavior(behavior: AIBehavior): void;

    /**
     * Check if entity can see target
     */
    canSeeTarget(): boolean;
}
