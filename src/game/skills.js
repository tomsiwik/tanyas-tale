import { botConfig, coneAttackConfig, DIRECTION_ANGLES } from './config.js';
import * as PIXI from 'pixi.js';
import { DamageEffect, HealEffect } from './effect.js';

/**
 * Base Skill class for all game skills
 */
export class Skill {
    /**
     * Create a new skill
     * @param {Object} config - Skill configuration
     */
    constructor(config = {}) {
        this.config = config;
        this.active = true;
        this.cooldown = config.cooldown || 0;
        this.lastUsed = 0;
    }
    
    /**
     * Called every frame by the entity's tick method
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     */
    tick(deltaTime, owner, targets) {
        if (!this.active) return;
        
        if (this.canUse(deltaTime)) {
            this.use(owner, targets);
        }
    }
    
    /**
     * Check if the skill can be used
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @returns {boolean} Whether the skill can be used
     */
    canUse(deltaTime) {
        if (this.cooldown <= 0) return true;
        
        const now = Date.now();
        return now - this.lastUsed >= this.cooldown;
    }
    
    /**
     * Use the skill
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     */
    use(owner, targets) {
        // Get valid targets
        const validTargets = this.getValidTargets(owner, targets);
        
        if (validTargets.length > 0) {
            // Create effects
            const effects = this.createEffects(owner);
            
            // Apply effects to valid targets
            for (const target of validTargets) {
                for (const effect of effects) {
                    target.applyEffect(effect);
                }
            }
            
            // Update last used time
            if (this.cooldown > 0) {
                this.lastUsed = Date.now();
            }
        }
    }
    
    /**
     * Create effects for this skill
     * @param {Entity} owner - The entity that owns this skill
     * @returns {Array} Array of effects
     */
    createEffects(owner) {
        return [];
    }
    
    /**
     * Get valid targets for this skill
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     * @returns {Array} Array of valid targets
     */
    getValidTargets(owner, targets) {
        return targets.filter(target => target.isActive());
    }
    
    /**
     * Activate the skill
     */
    activate() {
        this.active = true;
    }
    
    /**
     * Deactivate the skill
     */
    deactivate() {
        this.active = false;
    }
}

/**
 * ProximityDamageSkill - Damages entities close to the owner
 */
export class ProximityDamageSkill extends Skill {
    /**
     * Create a new proximity damage skill
     * @param {Object} config - Skill configuration
     */
    constructor(config = {}) {
        super({
            minDamage: botConfig.minDamage / 2,
            maxDamage: botConfig.maxDamage / 2,
            minDistance: botConfig.minDamageDistance,
            maxDistance: botConfig.maxDamageDistance,
            effectManager: null,
            ...config
        });
    }
    
    /**
     * Create damage effects based on distance to targets
     * @param {Entity} owner - The entity that owns this skill
     * @returns {Array} Array of effects
     */
    createEffects(owner) {
        // This skill creates effects per target in getValidTargets
        return [];
    }
    
    /**
     * Get valid targets and create appropriate effects for each
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     * @returns {Array} Array of valid targets
     */
    getValidTargets(owner, targets) {
        const validTargets = [];
        const ownerPos = owner.getPosition();
        
        for (const target of targets) {
            if (!target.isActive()) continue;
            
            const targetPos = target.getPosition();
            const dx = targetPos.x - ownerPos.x;
            const dy = targetPos.y - ownerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const damage = this.calculateDamage(distance);
            
            if (damage > 0) {
                // Create and apply damage effect directly
                const effect = new DamageEffect(damage, owner, 0, {
                    effectManager: this.config.effectManager
                });
                
                target.applyEffect(effect);
                validTargets.push(target);
            }
        }
        
        return validTargets;
    }
    
    /**
     * Calculate damage based on distance
     * @param {number} distance - Distance to target
     * @returns {number} Amount of damage to deal
     */
    calculateDamage(distance) {
        if (distance > this.config.minDistance) return 0;
        
        const t = Math.max(0, Math.min(1, (this.config.minDistance - distance) / 
            (this.config.minDistance - this.config.maxDistance)));
        return this.config.minDamage + t * (this.config.maxDamage - this.config.minDamage);
    }
}

/**
 * RegenerationSkill - Heals the owner over time
 */
export class RegenerationSkill extends Skill {
    /**
     * Create a new regeneration skill
     * @param {Object} config - Skill configuration
     */
    constructor(config = {}) {
        super({
            healAmount: 1,
            interval: 1000,
            ...config
        });
        
        this.cooldown = this.config.interval;
        this.lastUsed = Date.now();
    }
    
    /**
     * Create healing effects
     * @param {Entity} owner - The entity that owns this skill
     * @returns {Array} Array of effects
     */
    createEffects(owner) {
        return [new HealEffect(this.config.healAmount, owner)];
    }
    
    /**
     * Get valid targets (only the owner for this skill)
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     * @returns {Array} Array containing only the owner
     */
    getValidTargets(owner, targets) {
        return [owner];
    }
}

/**
 * ConeAttackSkill - Damages entities in a cone in front of the owner
 */
export class ConeAttackSkill extends Skill {
    /**
     * Create a new cone attack skill
     * @param {Object} config - Skill configuration
     */
    constructor(config = {}) {
        super({
            ...coneAttackConfig,
            ...config
        });
        
        this.isFlashing = false;
        this.flashStartTime = 0;
        
        // Visual component will be created when the skill is first used
        this.graphics = null;
    }
    
    /**
     * Create damage effects
     * @param {Entity} owner - The entity that owns this skill
     * @returns {Array} Array of effects
     */
    createEffects(owner) {
        return [new DamageEffect(this.config.damage, owner, 0, {
            effectManager: this.config.effectManager
        })];
    }
    
    /**
     * Get valid targets (entities in the cone)
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     * @returns {Array} Array of valid targets
     */
    getValidTargets(owner, targets) {
        return targets.filter(target => 
            target.isActive() && this.isPointInCone(owner, target.getPosition())
        );
    }
    
    /**
     * Check if a point is within the cone
     * @param {Entity} owner - The entity that owns this skill
     * @param {Object} point - The point to check {x, y}
     * @returns {boolean} Whether the point is in the cone
     */
    isPointInCone(owner, point) {
        const ownerPos = owner.getPosition();
        const ownerState = owner.getState();
        
        // Get aim direction
        const aimDirection = ownerState.aimDirection;
        
        // Get rotation angle
        const rotation = DIRECTION_ANGLES[aimDirection] || 0;
        
        // Convert point to local coordinates
        const localX = point.x - ownerPos.x;
        const localY = point.y - ownerPos.y;
        
        // Rotate point to account for cone rotation
        const rotatedX = localX * Math.cos(-rotation) - localY * Math.sin(-rotation);
        const rotatedY = localX * Math.sin(-rotation) + localY * Math.cos(-rotation);
        
        // Check if point is within cone
        // 1. Check distance
        const distance = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY);
        if (distance > this.config.coneLength) return false;
        
        // 2. Check angle
        const angle = Math.atan2(rotatedY, rotatedX);
        const halfAngle = this.config.coneAngle / 2;
        return angle >= -halfAngle && angle <= halfAngle;
    }
    
    /**
     * Use the skill
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     */
    use(owner, targets) {
        // Ensure visual component exists
        this.ensureVisualComponent(owner);
        
        // Update cone position and rotation
        this.updateConePosition(owner);
        
        // Start flash effect
        this.startFlash();
        
        // Apply effects to valid targets
        super.use(owner, targets);
        
        console.log(`Applying cone attack to ${targets.length} targets`);
    }
    
    /**
     * Ensure the visual component exists
     * @param {Entity} owner - The entity that owns this skill
     */
    ensureVisualComponent(owner) {
        if (this.graphics) return;
        
        // Create graphics for cone
        this.graphics = new PIXI.Graphics();
        this.updateConeVisual();
        
        // Add to owner's container to move with the owner
        if (owner.container) {
            // Position at center of owner
            const ownerState = owner.getState();
            this.graphics.x = ownerState.size / 2;
            this.graphics.y = ownerState.size / 2;
            
            // Add to owner's container
            owner.container.addChild(this.graphics);
            console.log("Cone visual added to owner container");
        }
    }
    
    /**
     * Update the cone visual
     */
    updateConeVisual() {
        if (!this.graphics) return;
        
        this.graphics.clear();
        
        const alpha = this.isFlashing ? this.config.flashAlpha : this.config.coneAlpha;
        
        // Draw cone shape
        const path = [];
        
        // Start at center point (0,0)
        path.push(0, 0);
        
        const halfAngle = this.config.coneAngle / 2;
        const steps = 20;
        
        for (let i = 0; i <= steps; i++) {
            const angle = -halfAngle + (i / steps) * this.config.coneAngle;
            const x = Math.cos(angle) * this.config.coneLength;
            const y = Math.sin(angle) * this.config.coneLength;
            path.push(x, y);
        }
        
        // Close shape
        path.push(0, 0);
        
        // Fill with color using old PixiJS API (ignore deprecation warnings)
        this.graphics.beginFill(this.config.coneColor, alpha);
        this.graphics.drawPolygon(path);
        this.graphics.endFill();
    }
    
    /**
     * Start the flash effect
     */
    startFlash() {
        this.isFlashing = true;
        this.flashStartTime = Date.now();
        this.updateConeVisual();
        console.log("Cone flash started");
    }
    
    /**
     * Update the flash effect
     */
    updateFlash() {
        if (!this.isFlashing) return;
        
        const now = Date.now();
        if (now - this.flashStartTime >= this.config.flashDuration) {
            this.isFlashing = false;
            this.updateConeVisual();
        }
    }
    
    /**
     * Update the cone position and rotation
     * @param {Entity} owner - The entity that owns this skill
     */
    updateConePosition(owner) {
        if (!this.graphics || !owner.getState) return;
        
        // Get aim direction
        const aimDirection = owner.getState().aimDirection;
        
        // Set rotation based on aim direction
        if (aimDirection in DIRECTION_ANGLES) {
            this.graphics.rotation = DIRECTION_ANGLES[aimDirection];
        }
    }
    
    /**
     * Called every frame by the entity's tick method
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {Entity} owner - The entity that owns this skill
     * @param {Array} targets - Potential targets for this skill
     */
    tick(deltaTime, owner, targets) {
        // Ensure visual component exists
        this.ensureVisualComponent(owner);
        
        // Update flash effect
        this.updateFlash();
        
        // Update cone position and rotation
        this.updateConePosition(owner);
        
        // Call parent tick method
        super.tick(deltaTime, owner, targets);
    }
}
