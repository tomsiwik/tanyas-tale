import { Component, BaseEntity } from '../../entities/base/entity';
import { Automatable, AIState, AIBehavior, AIConfig } from '../../interfaces/automatable';
import { MovementComponent } from '../movement/movement';
import { PositionComponent } from '../position/position';
import { SkillComponent } from '../skills/skill';
import { Direction, Point } from '../../interfaces/types';

export interface AutomationComponentConfig extends AIConfig {
    initialBehavior?: AIBehavior;
}

/**
 * Component that handles entity AI behavior
 */
export class AutomationComponent extends Component implements Automatable {
    private state: AIState = {
        currentBehavior: AIBehavior.IDLE,
        behaviorTime: 0
    };
    
    private movementComponent?: MovementComponent;
    private positionComponent?: PositionComponent;
    private skillComponent?: SkillComponent;

    constructor(
        entity: BaseEntity,
        private config: AutomationComponentConfig
    ) {
        super(entity);
        this.state.currentBehavior = config.initialBehavior ?? AIBehavior.IDLE;
    }

    /**
     * Initialize required components
     */
    initialize(): void {
        this.movementComponent = this.entity.getComponentByType(MovementComponent);
        this.positionComponent = this.entity.getComponentByType(PositionComponent);
        this.skillComponent = this.entity.getComponentByType(SkillComponent);
    }

    /**
     * Update AI behavior
     */
    update(deltaTime: number): void {
        if (!this.state.target || !this.positionComponent) return;

        this.state.behaviorTime += deltaTime;

        // Update behavior based on target distance
        if (this.shouldUpdateBehavior()) {
            this.updateBehavior();
        }

        // Execute current behavior
        this.executeBehavior(deltaTime);
    }

    /**
     * Set the target entity
     */
    setTarget(target: BaseEntity | null): void {
        if (target) {
            this.state.target = target;
            this.state.lastKnownTargetPosition = target.getPosition();
        } else {
            this.state.target = undefined;
            this.state.lastKnownTargetPosition = undefined;
        }
    }

    /**
     * Get current target
     */
    getTarget(): BaseEntity | null {
        return this.state.target ?? null;
    }

    /**
     * Get current AI state
     */
    getAIState(): AIState {
        return { ...this.state };
    }

    /**
     * Configure AI behavior
     */
    configure(config: AIConfig): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Force a specific behavior
     */
    setBehavior(behavior: AIBehavior): void {
        this.state.currentBehavior = behavior;
        this.state.behaviorTime = 0;
    }

    /**
     * Check if entity can see target
     */
    canSeeTarget(): boolean {
        if (!this.state.target || !this.positionComponent) return false;

        const targetPos = this.state.target.getPosition();
        this.state.lastKnownTargetPosition = targetPos;

        // Simple line of sight check
        return this.positionComponent.isInRange(targetPos, this.config.chaseRange);
    }

    /**
     * Check if behavior should be updated
     */
    private shouldUpdateBehavior(): boolean {
        if (!this.state.target || !this.positionComponent) return false;

        const targetPos = this.state.target.getPosition();
        const distance = this.positionComponent.distanceTo(targetPos);

        switch (this.state.currentBehavior) {
            case AIBehavior.IDLE:
                return distance <= this.config.chaseRange;
            case AIBehavior.CHASE:
                return distance <= this.config.preferredRange || distance > this.config.chaseRange;
            case AIBehavior.ATTACK:
                return distance > this.config.preferredRange || distance < this.config.retreatRange;
            case AIBehavior.RETREAT:
                return distance >= this.config.preferredRange;
            case AIBehavior.PATROL:
                return distance <= this.config.chaseRange;
            default:
                return false;
        }
    }

    /**
     * Update current behavior based on conditions
     */
    private updateBehavior(): void {
        if (!this.state.target || !this.positionComponent) return;

        const targetPos = this.state.target.getPosition();
        const distance = this.positionComponent.distanceTo(targetPos);

        if (distance > this.config.chaseRange) {
            this.setBehavior(this.config.patrolPoints ? AIBehavior.PATROL : AIBehavior.IDLE);
        } else if (distance < this.config.retreatRange) {
            this.setBehavior(AIBehavior.RETREAT);
        } else if (distance <= this.config.preferredRange) {
            this.setBehavior(AIBehavior.ATTACK);
        } else {
            this.setBehavior(AIBehavior.CHASE);
        }
    }

    /**
     * Convert point to direction
     */
    private getDirectionFromPoint(point: Point): Direction {
        const angle = Math.atan2(point.y, point.x);
        const degrees = angle * (180 / Math.PI);

        // Convert angle to 8-way direction
        if (degrees >= -22.5 && degrees < 22.5) return Direction.RIGHT;
        if (degrees >= 22.5 && degrees < 67.5) return Direction.DOWN_RIGHT;
        if (degrees >= 67.5 && degrees < 112.5) return Direction.DOWN;
        if (degrees >= 112.5 && degrees < 157.5) return Direction.DOWN_LEFT;
        if (degrees >= 157.5 || degrees < -157.5) return Direction.LEFT;
        if (degrees >= -157.5 && degrees < -112.5) return Direction.UP_LEFT;
        if (degrees >= -112.5 && degrees < -67.5) return Direction.UP;
        return Direction.UP_RIGHT;
    }

    /**
     * Execute current behavior
     */
    private executeBehavior(deltaTime: number): void {
        if (!this.movementComponent || !this.positionComponent || !this.state.target) return;

        const targetPos = this.state.target.getPosition();
        const currentPos = this.positionComponent.getPosition();
        const direction = this.positionComponent.directionTo(targetPos);

        switch (this.state.currentBehavior) {
            case AIBehavior.CHASE:
                this.movementComponent.move(
                    this.getDirectionFromPoint(direction),
                    this.config.speedMultipliers[AIBehavior.CHASE]
                );
                break;

            case AIBehavior.RETREAT:
                // Move away from target
                this.movementComponent.move(
                    this.getDirectionFromPoint({ x: -direction.x, y: -direction.y }),
                    this.config.speedMultipliers[AIBehavior.RETREAT]
                );
                break;

            case AIBehavior.ATTACK:
                // Stop moving and use skills if available
                this.movementComponent.stop();
                if (this.skillComponent) {
                    const skills = this.skillComponent.getSkills();
                    for (const skill of skills) {
                        this.skillComponent.useSkill(skill.id, { position: targetPos, entity: this.state.target });
                    }
                }
                break;

            case AIBehavior.PATROL:
                if (this.config.patrolPoints && this.config.patrolPoints.length > 0) {
                    // Simple patrol between points
                    const currentPatrolPoint = this.config.patrolPoints[0];
                    const patrolDirection = this.positionComponent.directionTo(currentPatrolPoint);
                    this.movementComponent.move(
                        this.getDirectionFromPoint(patrolDirection),
                        this.config.speedMultipliers[AIBehavior.PATROL]
                    );

                    // If reached point, move it to the end of the list
                    if (this.positionComponent.isInRange(currentPatrolPoint, 5)) {
                        this.config.patrolPoints.push(this.config.patrolPoints.shift()!);
                    }
                }
                break;

            case AIBehavior.IDLE:
            default:
                this.movementComponent.stop();
                break;
        }
    }
}
