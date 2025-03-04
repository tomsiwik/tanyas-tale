import * as PIXI from 'pixi.js';
import { AnimationState } from './AnimationState.js';

/**
 * Manages sprite animations for game entities using a sprite atlas
 */
export class SpriteManager {
    /**
     * Create a new sprite manager
     * @param {PIXI.Spritesheet} spriteSheet - The sprite sheet object
     */
    constructor(spriteSheet) {
        this.spriteSheet = spriteSheet;
        this.animations = spriteSheet.animations;
        this.fallbackMap = this.createFallbackMap();
    }

    /**
     * Create a mapping of animation fallbacks
     * @returns {Object} Mapping of animation fallbacks
     */
    createFallbackMap() {
        return {
            'standing': 'idle',
            'ducking': 'standing',
            'duck_moving': 'running',
            'shooting': 'standing',
            'death_explode': 'running',
            'death_zap': 'running'
        };
    }

    /**
     * Get animation textures for the current animation state
     * @param {AnimationState} state - Current animation state
     * @returns {Array<PIXI.Texture>} Array of textures for the animation
     */
    getAnimationTextures(state) {
        // Try to get the current animation
        let textures = this.animations[state.currentAnimation];
        
        // If not found, try the fallback
        if (!textures && this.fallbackMap[state.currentAnimation]) {
            textures = this.animations[this.fallbackMap[state.currentAnimation]];
        }
        
        // If still not found, try 'running' as final fallback
        if (!textures) {
            textures = this.animations['running'];
        }

        if (!textures) {
            console.warn(`No animation found for ${state.currentAnimation}`);
            return [];
        }

        return textures;
    }

    /**
     * Create a sprite with the appropriate animation
     * @param {AnimationState} state - Initial animation state
     * @returns {Promise<PIXI.AnimatedSprite>} Promise that resolves to an animated sprite
     */
    async createSprite(state = new AnimationState()) {
        // Get textures for the animation
        const textures = this.getAnimationTextures(state);
        
        // Create animated sprite
        let sprite;
        if (textures && textures.length > 0) {
            sprite = new PIXI.AnimatedSprite(textures);
        } else {
            console.error('No textures found for animation!');
            return null;
        }
        
        // Configure sprite
        sprite.animationSpeed = 0.15; // Adjust speed as needed
        sprite.anchor.set(0.5);
        
        // Ensure proper transparency
        for (const texture of textures) {
            // Set texture to use nearest neighbor scaling for pixel art
            if (texture.source) {
                texture.source.scaleMode = 'nearest';
            }
        }
        
        // Set sprite to be fully opaque but with transparency
        sprite.alpha = 1;
        
        // Start animation if it has multiple frames
        if (textures.length > 1) {
            sprite.play();
        }
        
        return sprite;
    }

    /**
     * Update a sprite's animation based on current state
     * @param {PIXI.AnimatedSprite} sprite - The sprite to update
     * @param {AnimationState} state - Current animation state
     */
    async updateSprite(sprite, state) {
        // Get textures for the animation
        const textures = this.getAnimationTextures(state);
        
        // Ensure proper transparency
        for (const texture of textures) {
            // Set texture to use nearest neighbor scaling for pixel art
            if (texture.source) {
                texture.source.scaleMode = 'nearest';
            }
        }
        
        // Only update if the animation has changed
        if (sprite.textures !== textures) {
            // Save current animation progress
            const currentProgress = sprite.currentFrame / Math.max(1, sprite.textures.length);
            
            // Update textures
            sprite.textures = textures;
            
            // Set appropriate frame based on progress
            if (textures.length > 1) {
                sprite.gotoAndPlay(Math.floor(currentProgress * textures.length));
            } else {
                sprite.gotoAndStop(0);
            }
        }
    }
}
