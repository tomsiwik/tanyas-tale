import { Point } from './types';
import { AnimationEffect } from './animateable';
import { DamageInfo } from './attackable';
import { BaseEntity } from '../entities/base/entity';

export interface SkillTarget {
    position: Point;
    entity?: BaseEntity;
}

export interface SkillEffect {
    /**
     * Visual effect of the skill
     */
    animation?: AnimationEffect;
    
    /**
     * Damage to apply
     */
    damage?: DamageInfo;
    
    /**
     * Area of effect radius (0 for single target)
     */
    radius?: number;
}

export interface SkillConfig {
    /**
     * Unique identifier for the skill
     */
    id: string;

    /**
     * Name of the skill
     */
    name: string;

    /**
     * Cooldown time in milliseconds
     */
    cooldown: number;

    /**
     * Range of the skill (0 for infinite)
     */
    range?: number;

    /**
     * Whether the skill requires a target
     */
    requiresTarget: boolean;

    /**
     * Effects produced by the skill
     */
    effects: SkillEffect[];
}

export interface Skillable {
    /**
     * Use a skill on a target
     * @returns Whether the skill was successfully used
     */
    useSkill(skillId: string, target: SkillTarget): boolean;

    /**
     * Check if a skill exists
     */
    hasSkill(skillId: string): boolean;

    /**
     * Get the remaining cooldown for a skill
     * @returns Milliseconds remaining, 0 if ready
     */
    getSkillCooldown(skillId: string): number;

    /**
     * Add a new skill
     */
    addSkill(config: SkillConfig): void;

    /**
     * Remove a skill
     */
    removeSkill(skillId: string): void;

    /**
     * Get all available skills
     */
    getSkills(): SkillConfig[];

    /**
     * Update skill cooldowns
     */
    updateSkills(deltaTime: number): void;
}
