import { botConfig } from './config.js';

// Base Skill class
class Skill {
    constructor(owner, config = {}) {
        this.owner = owner;
        this.config = config;
        this.active = true;
        this.cooldown = 0;
        this.lastUsed = 0;
    }
    
    // Update skill (called every frame)
    update(delta, targets) {
        // Skip if not active
        if (!this.active) return;
        
        // Handle cooldown
        if (this.cooldown > 0) {
            const now = Date.now();
            if (now - this.lastUsed < this.cooldown) {
                return;
            }
        }
        
        // Apply skill effect
        this.apply(delta, targets);
        
        // Update last used time if skill has cooldown
        if (this.cooldown > 0) {
            this.lastUsed = Date.now();
        }
    }
    
    // Apply skill effect (to be overridden by subclasses)
    apply(delta, targets) {
        // Override in subclasses
    }
    
    // Activate skill
    activate() {
        this.active = true;
    }
    
    // Deactivate skill
    deactivate() {
        this.active = false;
    }
}

// Proximity Damage Skill (damages entities close to the owner)
export class ProximityDamageSkill extends Skill {
    constructor(owner, config = {}) {
        super(owner, {
            // Default configuration
            minDamage: botConfig.minDamage / 2, // Half the current damage
            maxDamage: botConfig.maxDamage / 2, // Half the current damage
            minDistance: botConfig.minDamageDistance,
            maxDistance: botConfig.maxDamageDistance,
            effectManager: null,
            ...config
        });
    }
    
    apply(delta, targets) {
        // Skip if no targets
        if (!targets || targets.length === 0) return;
        
        const ownerPos = this.owner.getPosition();
        
        // Apply damage to all targets based on distance
        for (const target of targets) {
            // Skip inactive targets
            if (!target.state.active) continue;
            
            // Calculate distance to target
            const targetPos = target.getPosition();
            const dx = targetPos.x - ownerPos.x;
            const dy = targetPos.y - ownerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate damage based on distance
            const damage = this.calculateDamage(distance);
            
            // Apply damage if close enough
            if (damage > 0) {
                target.takeDamage(damage, this.config.effectManager);
            }
        }
    }
    
    calculateDamage(distance) {
        if (distance > this.config.minDistance) return 0;
        
        // Linear interpolation between min and max damage based on distance
        const t = Math.max(0, Math.min(1, (this.config.minDistance - distance) / 
            (this.config.minDistance - this.config.maxDistance)));
        return this.config.minDamage + t * (this.config.maxDamage - this.config.minDamage);
    }
}

// Regeneration Skill (heals the owner over time)
export class RegenerationSkill extends Skill {
    constructor(owner, config = {}) {
        super(owner, {
            // Default configuration
            healAmount: 1, // 1 HP per second
            interval: 1000, // 1 second interval
            ...config
        });
        
        this.cooldown = this.config.interval;
        this.lastUsed = Date.now();
    }
    
    apply(delta, targets) {
        // Heal the owner
        if (this.owner.heal) {
            this.owner.heal(this.config.healAmount);
        }
    }
}

// Skill Manager (manages skills for an entity)
export class SkillManager {
    constructor(owner) {
        this.owner = owner;
        this.skills = [];
    }
    
    // Add a skill
    addSkill(skill) {
        this.skills.push(skill);
        return skill;
    }
    
    // Remove a skill
    removeSkill(skill) {
        const index = this.skills.indexOf(skill);
        if (index !== -1) {
            this.skills.splice(index, 1);
        }
    }
    
    // Update all skills
    update(delta, targets) {
        for (const skill of this.skills) {
            skill.update(delta, targets);
        }
    }
    
    // Activate all skills
    activateAll() {
        for (const skill of this.skills) {
            skill.activate();
        }
    }
    
    // Deactivate all skills
    deactivateAll() {
        for (const skill of this.skills) {
            skill.deactivate();
        }
    }
}
