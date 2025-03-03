import * as PIXI from 'pixi.js';
import { Direction } from './config.js';

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
        this.directionMap = this.createDirectionMap();
    }

    /**
     * Create a mapping between Direction enum and sprite frame indices
     * @returns {Object} Mapping between Direction enum and sprite indices
     */
    createDirectionMap() {
        return {
            [Direction.UP]: 'n',
            [Direction.UP_RIGHT]: 'ne',
            [Direction.RIGHT]: 'e',
            [Direction.DOWN_RIGHT]: 'se',
            [Direction.DOWN]: 's',
            [Direction.DOWN_LEFT]: 'sw',
            [Direction.LEFT]: 'w',
            [Direction.UP_LEFT]: 'nw',
            [Direction.NONE]: 'n'
        };
    }

    /**
     * Get animation textures for a specific direction and movement state
     * @param {number} direction - Direction enum value
     * @param {boolean} isMoving - Whether the entity is moving
     * @returns {Array<PIXI.Texture>} Array of textures for the animation
     */
    getAnimationTextures(direction, isMoving) {
        const state = isMoving ? 'running' : 'standing';
        const animationKey = `${state}_${this.directionMap[direction]}`;

        // Use the animation if it exists, otherwise use a default
        if (this.animations[animationKey]) {
            return this.animations[animationKey];
        } else {
            console.warn(`Animation ${animationKey} not found!`);
            return [];
        }
    }

    /**
     * Create a sprite with the appropriate animation
     * @param {number} direction - Direction enum value
     * @param {boolean} isMoving - Whether the entity is moving
     * @returns {Promise<PIXI.AnimatedSprite>} Promise that resolves to an animated sprite
     */
    async createSprite(direction = Direction.NONE, isMoving = false) {
        // Get textures for the animation
        const textures = this.getAnimationTextures(direction, isMoving);
        console.log('textures', textures);
        
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
     * Update a sprite's animation based on direction and movement
     * @param {PIXI.AnimatedSprite} sprite - The sprite to update
     * @param {number} direction - Direction enum value
     * @param {boolean} isMoving - Whether the entity is moving
     */
    async updateSprite(sprite, direction = Direction.NONE, isMoving = false) {
        // Get textures for the animation
        const textures = this.getAnimationTextures(direction, isMoving);
        
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
