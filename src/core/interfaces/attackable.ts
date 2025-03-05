export interface DamageInfo {
    amount: number;
    type: DamageType;
    source?: unknown;
}

export enum DamageType {
    PHYSICAL = 'PHYSICAL',
    EXPLOSIVE = 'EXPLOSIVE',
    FIRE = 'FIRE',
    ELECTRIC = 'ELECTRIC'
}

export interface Attackable {
    /**
     * Take damage from an attack
     * @returns Whether the entity survived the damage
     */
    takeDamage(info: DamageInfo): boolean;

    /**
     * Check if the entity is dead
     */
    isDead(): boolean;

    /**
     * Get current health
     */
    getHealth(): number;

    /**
     * Get maximum health
     */
    getMaxHealth(): number;

    /**
     * Get current health as a percentage (0-1)
     */
    getHealthPercentage(): number;
}
