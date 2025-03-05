import * as PIXI from 'pixi.js';

/**
 * Manages sprite animations using spritesheets
 */
export class SpriteManager {
    constructor(spritesheet) {
        this.spritesheet = spritesheet;
        this.animationData = null;
    }

    /**
     * Initialize the spritesheet
     */
    async initialize() {
        // Parse the spritesheet to prepare animations
        await this.spritesheet.parse();
        
        // Get the animation data from the spritesheet
        this.animationData = this.spritesheet.data.animations;
        
        // Log available animations for debugging
        console.log('Available animations:', Object.keys(this.spritesheet.animations));
    }

    /**
     * Create a sprite with the specified animation
     * @param {string} animationKey - Key for the animation to use
     * @returns {PIXI.AnimatedSprite} The created sprite
     */
    createSprite(animationKey) {
        if (!this.spritesheet.animations[animationKey]) {
            console.error(`Animation "${animationKey}" not found in spritesheet`);
            return null;
        }

        // Get textures from the spritesheet
        const textures = this.spritesheet.animations[animationKey];
        
        // Create animated sprite using the textures
        const sprite = new PIXI.AnimatedSprite(textures);
        
        // Configure animation properties
        sprite.animationSpeed = 0.15; // Controls animation speed (frames per update)
        sprite.loop = true; // Enable looping
        
        // Start the animation - PixiJS will handle updates automatically via its ticker
        sprite.play();
        
        // Store the current animation key for reference
        sprite.currentAnimation = animationKey;
        
        return sprite;
    }

    /**
     * Update a sprite's animation if needed
     * @param {PIXI.AnimatedSprite} sprite - The sprite to update
     * @param {string} animationKey - Key for the new animation
     */
    updateAnimation(sprite, animationKey) {
        // Only change animation if it's different from the current one
        if (sprite.currentAnimation !== animationKey) {
            if (!this.spritesheet.animations[animationKey]) {
                console.error(`Animation "${animationKey}" not found in spritesheet`);
                return;
            }
            
            // Get the frames for the new animation
            const frames = this.spritesheet.animations[animationKey];
            
            // Update the sprite's textures with the new animation frames
            sprite.textures = frames;
            
            // Update tracking
            sprite.currentAnimation = animationKey;
            
            // Reset and play the animation
            sprite.gotoAndPlay(0);
        }
    }
}
