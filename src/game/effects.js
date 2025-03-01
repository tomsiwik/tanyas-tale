import * as PIXI from 'pixi.js';
import { botConfig } from './config.js';

// Object pool for efficient object reuse
class ObjectPool {
    constructor(objectFactory, initialSize = 20) {
        this.factory = objectFactory;
        this.pool = [];
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }
    
    get() {
        // Return an object from the pool or create a new one if empty
        return this.pool.length > 0 ? this.pool.pop() : this.factory();
    }
    
    release(object) {
        // Return object to the pool for reuse
        this.pool.push(object);
    }
    
    // Pre-allocate more objects if needed
    preAllocate(count) {
        for (let i = 0; i < count; i++) {
            this.pool.push(this.factory());
        }
    }
}

// Death effect (corpse) that appears when a bot dies
export class DeathEffect {
    constructor() {
        // Create container
        this.container = new PIXI.Container();
        
        // Create sprite for the death effect
        this.sprite = new PIXI.Graphics()
            .rect(0, 0, botConfig.size, botConfig.size)
            .fill(0x000000); // Start as black
            
        this.container.addChild(this.sprite);
        
        // Initially inactive
        this.container.visible = false;
        this.active = false;
        
        // Animation state
        this.phase = 'none'; // 'black', 'fade', 'none'
        this.timer = 0;
    }
    
    // Initialize with position
    init(x, y, stage) {
        this.container.x = x;
        this.container.y = y;
        this.container.alpha = 1;
        this.container.visible = true;
        this.active = true;
        this.phase = 'black';
        this.timer = 0;
        
        // Add to stage if not already added
        if (!this.container.parent) {
            stage.addChild(this.container);
        }
    }
    
    // Update animation
    update() {
        if (!this.active) return false;
        
        this.timer++;
        
        // Handle black phase (2 seconds)
        if (this.phase === 'black') {
            if (this.timer >= botConfig.blackDuration) {
                this.phase = 'fade';
                this.timer = 0;
            }
        }
        // Handle fade phase (1 second)
        else if (this.phase === 'fade') {
            // Fade out over time
            const fadeProgress = Math.min(1, this.timer / botConfig.fadeDuration);
            this.container.alpha = 1 - fadeProgress;
            
            // Check if fade animation is complete
            if (this.timer >= botConfig.fadeDuration) {
                this.reset();
                return true; // Animation complete
            }
        }
        
        return false; // Animation still in progress
    }
    
    // Reset for reuse
    reset() {
        this.container.visible = false;
        this.active = false;
        this.phase = 'none';
        this.timer = 0;
    }
}

// Manager for death effects with object pooling
export class EffectManager {
    constructor(app) {
        this.app = app;
        
        // Create object pool for death effects
        this.deathEffectPool = new ObjectPool(() => new DeathEffect());
        
        // Active effects
        this.activeEffects = [];
    }
    
    // Create a death effect at the specified position
    createDeathEffect(x, y) {
        // Get effect from pool
        const effect = this.deathEffectPool.get();
        
        // Initialize effect
        effect.init(x, y, this.app.stage);
        
        // Add to active effects
        this.activeEffects.push(effect);
    }
    
    // Update all active effects
    update() {
        // Update effects and collect completed ones
        const completed = [];
        
        for (let i = 0; i < this.activeEffects.length; i++) {
            const effect = this.activeEffects[i];
            if (effect.update()) {
                completed.push(i);
            }
        }
        
        // Remove completed effects (in reverse order to avoid index issues)
        for (let i = completed.length - 1; i >= 0; i--) {
            const index = completed[i];
            const effect = this.activeEffects[index];
            
            // Return to pool
            this.deathEffectPool.release(effect);
            
            // Remove from active list
            this.activeEffects.splice(index, 1);
        }
    }
    
    // Pre-allocate effects for performance
    preAllocate(count) {
        this.deathEffectPool.preAllocate(count);
    }
}
