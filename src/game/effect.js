/**
 * Base Effect class for all game effects
 * Effects are applied to entities and can modify their state
 */
export class Effect {
    /**
     * Create a new effect
     * @param {string} type - The type of effect (e.g., "damage", "heal", "stun")
     * @param {number} value - The value of the effect
     * @param {Entity} source - The entity that created the effect
     * @param {number} duration - Duration in milliseconds, 0 for instant effects
     */
    constructor(type, value, source, duration = 0) {
        this.type = type;
        this.value = value;
        this.source = source;
        this.duration = duration;
    }

    /**
     * Apply the effect to a target
     * @param {Entity} target - The target entity
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    apply(target, deltaTime) {
        // To be implemented by subclasses
    }

    /**
     * Create a copy of this effect
     * @returns {Effect} A new instance of this effect
     */
    clone() {
        return new Effect(this.type, this.value, this.source, this.duration);
    }
}

/**
 * DamageEffect - Deals damage to the target
 */
export class DamageEffect extends Effect {
    /**
     * Create a new damage effect
     * @param {number} damage - Amount of damage to deal
     * @param {Entity} source - The entity that created the effect
     * @param {number} duration - Duration in milliseconds, 0 for instant damage
     * @param {Object} options - Additional options
     */
    constructor(damage, source, duration = 0, options = {}) {
        super('damage', damage, source, duration);
        this.options = options;
        this.effectManager = options.effectManager;
    }

    /**
     * Apply damage to the target
     * @param {Entity} target - The target entity
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    apply(target, deltaTime) {
        if (this.duration === 0 || deltaTime === 0) {
            // Instant damage or first application of damage over time
            target.takeDamage(this.value, this.effectManager);
        } else if (this.duration > 0) {
            // Damage over time
            const tickDamage = (this.value * deltaTime) / this.duration;
            target.takeDamage(tickDamage, this.effectManager);
        }
    }

    /**
     * Create a copy of this effect
     * @returns {DamageEffect} A new instance of this effect
     */
    clone() {
        return new DamageEffect(this.value, this.source, this.duration, this.options);
    }
}

/**
 * HealEffect - Heals the target
 */
export class HealEffect extends Effect {
    /**
     * Create a new heal effect
     * @param {number} amount - Amount of healing
     * @param {Entity} source - The entity that created the effect
     * @param {number} duration - Duration in milliseconds, 0 for instant healing
     */
    constructor(amount, source, duration = 0) {
        super('heal', amount, source, duration);
    }

    /**
     * Apply healing to the target
     * @param {Entity} target - The target entity
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    apply(target, deltaTime) {
        if (this.duration === 0 || deltaTime === 0) {
            // Instant healing or first application of healing over time
            target.heal(this.value);
        } else if (this.duration > 0) {
            // Healing over time
            const tickHeal = (this.value * deltaTime) / this.duration;
            target.heal(tickHeal);
        }
    }

    /**
     * Create a copy of this effect
     * @returns {HealEffect} A new instance of this effect
     */
    clone() {
        return new HealEffect(this.value, this.source, this.duration);
    }
}
