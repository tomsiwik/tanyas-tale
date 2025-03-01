import { botConfig, coneAttackConfig, DIRECTION_ANGLES } from './config.js';
import * as PIXI from 'pixi.js';

// Base skill class
class Skill {
    constructor(owner, config = {}) {
        this.owner = owner;
        this.config = config;
        this.active = true;
        this.cooldown = 0;
        this.lastUsed = 0;
    }
    
    update(delta, targets) {
        if (!this.active) return;
        
        if (this.cooldown > 0) {
            const now = Date.now();
            if (now - this.lastUsed < this.cooldown) {
                return;
            }
        }
        
        this.apply(delta, targets);
        
        if (this.cooldown > 0) {
            this.lastUsed = Date.now();
        }
    }
    
    apply(delta, targets) {}
    
    activate() {
        this.active = true;
    }
    
    deactivate() {
        this.active = false;
    }
}

// Proximity damage skill
export class ProximityDamageSkill extends Skill {
    constructor(owner, config = {}) {
        super(owner, {
            minDamage: botConfig.minDamage / 2,
            maxDamage: botConfig.maxDamage / 2,
            minDistance: botConfig.minDamageDistance,
            maxDistance: botConfig.maxDamageDistance,
            effectManager: null,
            ...config
        });
    }
    
    apply(delta, targets) {
        if (!targets || targets.length === 0) return;
        
        const ownerPos = this.owner.getPosition();
        
        for (const target of targets) {
            if (!target.state.active) continue;
            
            const targetPos = target.getPosition();
            const dx = targetPos.x - ownerPos.x;
            const dy = targetPos.y - ownerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const damage = this.calculateDamage(distance);
            
            if (damage > 0) {
                target.takeDamage(damage, this.config.effectManager);
            }
        }
    }
    
    calculateDamage(distance) {
        if (distance > this.config.minDistance) return 0;
        
        const t = Math.max(0, Math.min(1, (this.config.minDistance - distance) / 
            (this.config.minDistance - this.config.maxDistance)));
        return this.config.minDamage + t * (this.config.maxDamage - this.config.minDamage);
    }
}

// Regeneration skill
export class RegenerationSkill extends Skill {
    constructor(owner, config = {}) {
        super(owner, {
            healAmount: 1,
            interval: 1000,
            ...config
        });
        
        this.cooldown = this.config.interval;
        this.lastUsed = Date.now();
    }
    
    apply(delta, targets) {
        if (this.owner.heal) {
            this.owner.heal(this.config.healAmount);
        }
    }
}

// Cone attack skill
export class ConeAttackSkill extends Skill {
    constructor(owner, config = {}) {
        super(owner, {
            ...coneAttackConfig,
            ...config
        });
        
        this.cooldown = this.config.cooldown;
        this.lastUsed = 0;
        this.isFlashing = false;
        this.flashStartTime = 0;
        
        // Create cone visual directly attached to the player
        this.createConeVisual();
    }
    
    createConeVisual() {
        // Create graphics for cone
        this.graphics = new PIXI.Graphics();
        this.updateConeVisual();
        
        // Add to owner's container to move with the player
        if (this.owner.container) {
            // Position at center of player
            this.graphics.x = this.owner.state.size / 2;
            this.graphics.y = this.owner.state.size / 2;
            
            // Add to player's container
            this.owner.container.addChild(this.graphics);
            console.log("Cone visual added to player container");
        }
    }
    
    // IMPORTANT: Using deprecated PixiJS API because it works correctly
    // Ignore deprecation warnings for this method
    updateConeVisual() {
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
    
    startFlash() {
        this.isFlashing = true;
        this.flashStartTime = Date.now();
        this.updateConeVisual();
        console.log("Cone flash started");
    }
    
    updateFlash() {
        if (!this.isFlashing) return;
        
        const now = Date.now();
        if (now - this.flashStartTime >= this.config.flashDuration) {
            this.isFlashing = false;
            this.updateConeVisual();
        }
    }
    
    updateConeRotation() {
        if (!this.owner.state) return;
        
        // Get aim direction
        const aimDirection = this.owner.state.aimDirection;
        
        // Set rotation based on aim direction
        if (aimDirection in DIRECTION_ANGLES) {
            this.graphics.rotation = DIRECTION_ANGLES[aimDirection];
        }
    }
    
    isPointInCone(point) {
        // Get player position
        const playerPos = this.owner.getPosition();
        
        // Get cone rotation
        const rotation = this.graphics.rotation;
        
        // Convert point to local coordinates
        const localX = point.x - playerPos.x;
        const localY = point.y - playerPos.y;
        
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
    
    apply(delta, targets) {
        if (!targets || targets.length === 0) return;
        
        // Update cone rotation
        this.updateConeRotation();
        
        // Start flash effect
        this.startFlash();
        
        console.log(`Applying cone attack to ${targets.length} targets`);
        
        // Get player position for hit detection
        const playerPos = this.owner.getPosition();
        
        for (const target of targets) {
            if (!target.state.active) continue;
            
            const targetPos = target.getPosition();
            
            if (this.isPointInCone(targetPos)) {
                console.log(`Target in cone, applying ${this.config.damage} damage`);
                target.takeDamage(this.config.damage, this.config.effectManager);
            }
        }
    }
    
    update(delta, targets) {
        // Update flash effect
        this.updateFlash();
        
        // Update cone rotation
        this.updateConeRotation();
        
        // Call parent update method
        super.update(delta, targets);
    }
}

// Skill manager
export class SkillManager {
    constructor(owner) {
        this.owner = owner;
        this.skills = [];
    }
    
    addSkill(skill) {
        this.skills.push(skill);
        return skill;
    }
    
    removeSkill(skill) {
        const index = this.skills.indexOf(skill);
        if (index !== -1) {
            this.skills.splice(index, 1);
        }
    }
    
    update(delta, targets) {
        for (const skill of this.skills) {
            skill.update(delta, targets);
        }
    }
    
    activateAll() {
        for (const skill of this.skills) {
            skill.activate();
        }
    }
    
    deactivateAll() {
        for (const skill of this.skills) {
            skill.deactivate();
        }
    }
}
