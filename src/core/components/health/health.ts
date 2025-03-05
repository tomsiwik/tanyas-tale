import { Component, BaseEntity } from '../../entities/base/entity';
import { Attackable, DamageInfo, DamageType } from '../../interfaces/attackable';

export interface HealthConfig {
    maxHealth: number;
    initialHealth?: number;
    damageResistance?: Partial<Record<DamageType, number>>;
}

/**
 * Component that handles entity health and damage
 */
export class HealthComponent extends Component implements Attackable {
    private currentHealth: number;
    private readonly damageResistance: Record<DamageType, number>;

    constructor(
        entity: BaseEntity,
        private config: HealthConfig
    ) {
        super(entity);
        this.currentHealth = config.initialHealth ?? config.maxHealth;
        
        // Initialize damage resistance (0 = no resistance, 1 = immune)
        this.damageResistance = {
            [DamageType.PHYSICAL]: 0,
            [DamageType.EXPLOSIVE]: 0,
            [DamageType.FIRE]: 0,
            [DamageType.ELECTRIC]: 0,
            ...config.damageResistance
        };
    }

    /**
     * Update health state
     */
    update(_deltaTime: number): void {
        // Health only changes through damage/healing
    }

    /**
     * Take damage from an attack
     * @returns Whether the entity survived the damage
     */
    takeDamage(info: DamageInfo): boolean {
        if (this.isDead()) return false;

        // Apply damage resistance
        const resistance = this.damageResistance[info.type] ?? 0;
        const actualDamage = info.amount * (1 - resistance);

        // Apply damage
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);

        return !this.isDead();
    }

    /**
     * Check if entity is dead
     */
    isDead(): boolean {
        return this.currentHealth <= 0;
    }

    /**
     * Get current health
     */
    getHealth(): number {
        return this.currentHealth;
    }

    /**
     * Get maximum health
     */
    getMaxHealth(): number {
        return this.config.maxHealth;
    }

    /**
     * Get current health as a percentage (0-1)
     */
    getHealthPercentage(): number {
        return this.currentHealth / this.config.maxHealth;
    }

    /**
     * Get resistance to a damage type
     */
    getResistance(type: DamageType): number {
        return this.damageResistance[type];
    }

    /**
     * Set resistance to a damage type
     */
    setResistance(type: DamageType, value: number): void {
        this.damageResistance[type] = Math.max(0, Math.min(1, value));
    }
}
