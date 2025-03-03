import * as PIXI from 'pixi.js';
import { Direction } from './config.js';

/**
 * Manages sprite animations for game entities using a sprite atlas
 */
export class SpriteManager {
    /**
     * Create a new sprite manager
     * @param {string} basePath - Base path to the sprite images (not used with atlas)
     */
    constructor(basePath = '/assets/sprites/') {
        this.atlasPath = '/assets/atlas/sprite_atlas.json';
        this.spriteSheet = null;
        this.textures = {};
        this.animations = {};
        this.directionMap = this.createDirectionMap();
        this.isLoaded = false;
    }

    /**
     * Create a mapping between Direction enum and sprite frame indices
     * @returns {Object} Mapping between Direction enum and sprite indices
     */
    createDirectionMap() {
        return {
            // Standing animations (0000-0007)
            // Reversed to match the correct direction
            standing: {
                [Direction.UP]: 0,            // North (0000)
                [Direction.UP_RIGHT]: 7,      // North-West (0007) - reversed
                [Direction.RIGHT]: 6,         // West (0006) - reversed
                [Direction.DOWN_RIGHT]: 5,    // South-West (0005) - reversed
                [Direction.DOWN]: 4,          // South (0004)
                [Direction.DOWN_LEFT]: 3,     // South-East (0003) - reversed
                [Direction.LEFT]: 2,          // East (0002) - reversed
                [Direction.UP_LEFT]: 1,       // North-East (0001) - reversed
                [Direction.NONE]: 0           // Default to North
            },
            // Running animations (0008-0055)
            // Each direction has 6 frames, starting from index 8
            // Reversed to match the correct direction
            running: {
                [Direction.UP]: { start: 8, frames: 6 },            // North (0008-0013)
                [Direction.UP_RIGHT]: { start: 50, frames: 6 },     // North-West (0050-0055) - reversed
                [Direction.RIGHT]: { start: 44, frames: 6 },        // West (0044-0049) - reversed
                [Direction.DOWN_RIGHT]: { start: 38, frames: 6 },   // South-West (0038-0043) - reversed
                [Direction.DOWN]: { start: 32, frames: 6 },         // South (0032-0037)
                [Direction.DOWN_LEFT]: { start: 26, frames: 6 },    // South-East (0026-0031) - reversed
                [Direction.LEFT]: { start: 20, frames: 6 },         // East (0020-0025) - reversed
                [Direction.UP_LEFT]: { start: 14, frames: 6 },      // North-East (0014-0019) - reversed
                [Direction.NONE]: { start: 8, frames: 6 }           // Default to North
            }
        };
    }

    /**
     * Load the sprite atlas and create textures
     * @returns {Promise} Promise that resolves when the atlas is loaded
     */
    async loadAtlas() {
        if (this.isLoaded) {
            return true;
        }

        try {
            console.log(`Loading sprite atlas: ${this.atlasPath}`);
            
            // Load the sprite atlas
            const atlas = await PIXI.Assets.load(this.atlasPath);
            this.spriteSheet = atlas;
            
            // Store all textures from the atlas
            for (const frameName in atlas.textures) {
                // Extract the frame number from the name (e.g., "e7_0000" -> "0000")
                const frameNumber = frameName.split('_')[1];
                this.textures[frameNumber] = atlas.textures[frameName];
            }
            
            // Create animations from the loaded textures
            this.createAnimations();
            
            this.isLoaded = true;
            console.log('Sprite atlas loaded successfully');
            return true;
        } catch (error) {
            console.error(`Failed to load sprite atlas: ${error}`);
            throw error;
        }
    }

    /**
     * Create animations from loaded textures
     */
    createAnimations() {
        // Create standing animations
        const standingMap = this.directionMap.standing;
        for (const direction in standingMap) {
            const index = standingMap[direction];
            const key = index.toString().padStart(4, '0');
            
            if (this.textures[key]) {
                this.animations[`standing_${direction}`] = [this.textures[key]];
            }
        }
        
        // Create running animations
        const runningMap = this.directionMap.running;
        for (const direction in runningMap) {
            const { start, frames } = runningMap[direction];
            const textures = [];
            
            for (let i = 0; i < frames; i++) {
                const index = (start + i).toString().padStart(4, '0');
                if (this.textures[index]) {
                    textures.push(this.textures[index]);
                }
            }
            
            if (textures.length > 0) {
                this.animations[`running_${direction}`] = textures;
            }
        }
    }

    /**
     * Get animation textures for a specific direction and movement state
     * @param {number} direction - Direction enum value
     * @param {boolean} isMoving - Whether the entity is moving
     * @returns {Array<PIXI.Texture>} Array of textures for the animation
     */
    getAnimationTextures(direction, isMoving) {
        const state = isMoving ? 'running' : 'standing';
        const animationKey = `${state}_${direction}`;
        
        // Use the animation if it exists, otherwise use a default
        return this.animations[animationKey] || 
               this.animations[`${state}_${Direction.NONE}`] ||
               [this.textures['0000']]; // Fallback to first frame
    }

    /**
     * Create a sprite with the appropriate animation
     * @param {number} direction - Direction enum value
     * @param {boolean} isMoving - Whether the entity is moving
     * @returns {Promise<PIXI.AnimatedSprite>} Promise that resolves to an animated sprite
     */
    async createSprite(direction = Direction.NONE, isMoving = false) {
        // Load the atlas if not already loaded
        await this.loadAtlas();
        
        // Get textures for the animation
        const textures = this.getAnimationTextures(direction, isMoving);
        
        // Create animated sprite
        const sprite = new PIXI.AnimatedSprite(textures);
        
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
        // Load the atlas if not already loaded
        await this.loadAtlas();
        
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
