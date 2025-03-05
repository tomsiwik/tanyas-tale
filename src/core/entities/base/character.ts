import { BaseEntity } from './entity';
import { Point } from '../../interfaces/types';
import { FeatureFlags } from '../../feature-flags';
import {
    AnimationComponent,
    AnimationComponentConfig,
    AutomationComponent,
    AutomationComponentConfig,
    HealthComponent,
    HealthConfig,
    MovementComponent,
    MovementConfig,
    PositionComponent,
    SkillComponent,
    SkillComponentConfig,
    ComponentKeys
} from '../../components';

export interface CharacterConfig {
    position: Point;
    health: HealthConfig;
    movement: MovementConfig;
    animation: AnimationComponentConfig;
    skills?: SkillComponentConfig;
    automation?: AutomationComponentConfig;
}

/**
 * Base class for all characters (player, bots, etc)
 */
export abstract class Character extends BaseEntity {
    protected positionComponent?: PositionComponent;
    protected movementComponent?: MovementComponent;
    protected healthComponent?: HealthComponent;
    protected animationComponent?: AnimationComponent;
    protected skillComponent?: SkillComponent;
    protected automationComponent?: AutomationComponent;

    constructor(protected config: CharacterConfig) {
        super();
        this.initializeComponents();
    }

    /**
     * Initialize all components based on feature flags
     */
    protected initializeComponents(): void {
        // Position component (required)
        if (FeatureFlags.USE_POSITION_COMPONENT) {
            this.positionComponent = this.addComponent(
                ComponentKeys.position,
                new PositionComponent(this, { x: this.config.position.x, y: this.config.position.y })
            );
        }

        // Movement component
        if (FeatureFlags.USE_MOVEMENT_COMPONENT && this.positionComponent) {
            this.movementComponent = this.addComponent(
                ComponentKeys.movement,
                new MovementComponent(this, this.config.movement, this.positionComponent)
            );
        }

        // Health component
        if (FeatureFlags.USE_HEALTH_COMPONENT) {
            this.healthComponent = this.addComponent(
                ComponentKeys.health,
                new HealthComponent(this, this.config.health)
            );
        }

        // Animation component
        if (FeatureFlags.USE_ANIMATION_COMPONENT) {
            this.animationComponent = this.addComponent(
                ComponentKeys.animation,
                new AnimationComponent(this, this.config.animation)
            );
        }

        // Skill component
        if (FeatureFlags.USE_SKILL_COMPONENT && this.config.skills) {
            this.skillComponent = this.addComponent(
                ComponentKeys.skills,
                new SkillComponent(this, this.config.skills)
            );
            this.skillComponent.initialize();
        }

        // Automation component
        if (FeatureFlags.USE_AUTOMATION_COMPONENT && this.config.automation) {
            this.automationComponent = this.addComponent(
                ComponentKeys.automation,
                new AutomationComponent(this, this.config.automation)
            );
            this.automationComponent.initialize();
        }
    }

    /**
     * Update character state
     */
    protected update(deltaTime: number): void {
        // Character-specific update logic in subclasses
    }

    /**
     * Get character position
     */
    getPosition(): Point {
        if (this.positionComponent) {
            return this.positionComponent.getPosition();
        }
        return super.getPosition();
    }

    /**
     * Check if character is active
     */
    isActive(): boolean {
        if (this.healthComponent) {
            return !this.healthComponent.isDead();
        }
        return super.isActive();
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        if (this.animationComponent) {
            this.animationComponent.destroy();
        }
    }
}
