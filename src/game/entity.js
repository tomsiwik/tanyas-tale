/**
 * Base Entity class that all game entities should extend
 * Provides a standardized interface for the game loop and skill system
 */
export class Entity {
    constructor() {
        this.skills = [];
        this.effects = [];
    }

    /**
     * Called every frame by the game loop
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Array} targets - Potential targets for skills
     */
    tick(deltaTime, targets = []) {
        // Process active effects
        this.processEffects(deltaTime);
        
        // Update skills
        this.tickSkills(deltaTime, targets);
    }

    /**
     * Process all active effects on the entity
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    processEffects(deltaTime) {
        // Remove expired effects
        this.effects = this.effects.filter(effect => {
            effect.duration -= deltaTime;
            return effect.duration > 0;
        });
        
        // Apply ongoing effects
        for (const effect of this.effects) {
            effect.apply(this, deltaTime);
        }
    }

    /**
     * Update all skills
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Array} targets - Potential targets for skills
     */
    tickSkills(deltaTime, targets) {
        for (const skill of this.skills) {
            skill.tick(deltaTime, this, targets);
        }
    }

    /**
     * Apply an effect to this entity
     * @param {Effect} effect - The effect to apply
     */
    applyEffect(effect) {
        // Clone the effect to avoid shared state
        const effectCopy = effect.clone();
        
        // Add to active effects
        this.effects.push(effectCopy);
        
        // Apply immediate effect
        effectCopy.apply(this, 0);
    }

    /**
     * Add a skill to this entity
     * @param {Skill} skill - The skill to add
     */
    addSkill(skill) {
        this.skills.push(skill);
        return skill;
    }

    /**
     * Remove a skill from this entity
     * @param {Skill} skill - The skill to remove
     */
    removeSkill(skill) {
        const index = this.skills.indexOf(skill);
        if (index !== -1) {
            this.skills.splice(index, 1);
        }
    }

    /**
     * Get the entity's current state
     * @returns {Object} The entity's state
     */
    getState() {
        // To be implemented by subclasses
        return {};
    }

    /**
     * Get the entity's position
     * @returns {Object} The entity's position {x, y}
     */
    getPosition() {
        // To be implemented by subclasses
        return { x: 0, y: 0 };
    }

    /**
     * Check if the entity is active
     * @returns {boolean} Whether the entity is active
     */
    isActive() {
        // To be implemented by subclasses
        return true;
    }
}
