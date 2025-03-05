import { Component, BaseEntity } from '../../entities/base/entity';
import { Skillable, SkillConfig, SkillTarget } from '../../interfaces/skillable';
import { AnimationComponent } from '../animation/animation';
import { HealthComponent } from '../health/health';
import { PositionComponent } from '../position/position';

export interface SkillComponentConfig {
    initialSkills?: SkillConfig[];
}

/**
 * Component that handles entity skills
 */
export class SkillComponent extends Component implements Skillable {
    private skills: Map<string, SkillConfig> = new Map();
    private cooldowns: Map<string, number> = new Map();
    private animationComponent?: AnimationComponent;
    private healthComponent?: HealthComponent;
    private positionComponent?: PositionComponent;

    constructor(
        entity: BaseEntity,
        config: SkillComponentConfig
    ) {
        super(entity);
        
        // Add initial skills
        config.initialSkills?.forEach(skill => this.addSkill(skill));
    }

    /**
     * Initialize required components
     */
    initialize(): void {
        // Get required components
        this.animationComponent = this.entity.getComponentByType(AnimationComponent);
        this.healthComponent = this.entity.getComponentByType(HealthComponent);
        this.positionComponent = this.entity.getComponentByType(PositionComponent);
    }

    /**
     * Update skill cooldowns
     */
    update(deltaTime: number): void {
        // Update cooldowns
        this.updateSkills(deltaTime);
    }

    /**
     * Use a skill on a target
     */
    useSkill(skillId: string, target: SkillTarget): boolean {
        const skill = this.skills.get(skillId);
        if (!skill) {
            console.error(`Skill "${skillId}" not found`);
            return false;
        }

        // Check cooldown
        const cooldown = this.getSkillCooldown(skillId);
        if (cooldown > 0) {
            return false;
        }

        // Check range if specified
        if (skill.range && this.positionComponent) {
            const distance = this.positionComponent.distanceTo(target.position);
            if (distance > skill.range) {
                return false;
            }
        }

        // Apply effects
        skill.effects.forEach(effect => {
            // Apply animation effect if any
            if (effect.animation && this.animationComponent) {
                this.animationComponent.addEffect(effect.animation);
            }

            // Apply damage if any
            if (effect.damage && target.entity) {
                const targetHealth = target.entity.getComponentByType(HealthComponent);
                if (targetHealth) {
                    targetHealth.takeDamage(effect.damage);
                }
            }
        });

        // Start cooldown
        this.cooldowns.set(skillId, skill.cooldown);

        return true;
    }

    /**
     * Check if a skill exists
     */
    hasSkill(skillId: string): boolean {
        return this.skills.has(skillId);
    }

    /**
     * Get the remaining cooldown for a skill
     */
    getSkillCooldown(skillId: string): number {
        return this.cooldowns.get(skillId) ?? 0;
    }

    /**
     * Add a new skill
     */
    addSkill(config: SkillConfig): void {
        this.skills.set(config.id, config);
        this.cooldowns.set(config.id, 0);
    }

    /**
     * Remove a skill
     */
    removeSkill(skillId: string): void {
        this.skills.delete(skillId);
        this.cooldowns.delete(skillId);
    }

    /**
     * Get all available skills
     */
    getSkills(): SkillConfig[] {
        return Array.from(this.skills.values());
    }

    /**
     * Update skill cooldowns
     */
    updateSkills(deltaTime: number): void {
        for (const [skillId, cooldown] of this.cooldowns.entries()) {
            if (cooldown > 0) {
                this.cooldowns.set(skillId, Math.max(0, cooldown - deltaTime));
            }
        }
    }
}
