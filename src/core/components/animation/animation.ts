import * as PIXI from 'pixi.js';
import { Component, BaseEntity } from '../../entities/base/entity';
import { Animateable, AnimationConfig, AnimationEffect } from '../../interfaces/animateable';
import { Point } from '../../interfaces/types';

export interface AnimationComponentConfig {
    spritesheet: PIXI.Spritesheet;
    defaultAnimation?: string;
    defaultSpeed?: number;
}

/**
 * Component that handles sprite animations
 */
export class AnimationComponent extends Component implements Animateable {
    private sprite: PIXI.AnimatedSprite | null = null;
    private currentAnimation: string | null = null;
    private effects: AnimationEffect[] = [];
    private animations: Map<string, PIXI.Texture[]> = new Map();

    constructor(
        entity: BaseEntity,
        private config: AnimationComponentConfig
    ) {
        super(entity);
        this.loadAnimations();
        
        if (config.defaultAnimation && this.hasAnimation(config.defaultAnimation)) {
            this.playAnimation({
                key: config.defaultAnimation,
                speed: config.defaultSpeed
            });
        }
    }

    /**
     * Load animations from spritesheet
     */
    private loadAnimations(): void {
        // Store all animations from the spritesheet
        for (const [key, textures] of Object.entries(this.config.spritesheet.animations)) {
            this.animations.set(key, textures);
        }
    }

    /**
     * Update animations and effects
     */
    update(deltaTime: number): void {
        // Update animation effects
        this.updateAnimations(deltaTime);
    }

    /**
     * Play a specific animation
     */
    playAnimation(config: AnimationConfig): void {
        if (!this.hasAnimation(config.key)) {
            console.error(`Animation "${config.key}" not found`);
            return;
        }

        // Only change animation if it's different
        if (this.currentAnimation === config.key) return;

        const textures = this.animations.get(config.key)!;
        
        if (!this.sprite) {
            // Create new sprite
            this.sprite = new PIXI.AnimatedSprite(textures);
            this.sprite.anchor.set(0.5);
        } else {
            // Update existing sprite
            this.sprite.textures = textures;
        }

        // Configure animation
        this.sprite.animationSpeed = config.speed ?? 0.1;
        this.sprite.loop = config.loop ?? true;

        // Start animation
        this.sprite.gotoAndPlay(0);
        this.currentAnimation = config.key;
    }

    /**
     * Stop the current animation
     */
    stopAnimation(): void {
        if (this.sprite) {
            this.sprite.stop();
        }
    }

    /**
     * Get the current animation key
     */
    getCurrentAnimation(): string | null {
        return this.currentAnimation;
    }

    /**
     * Add a temporary animation effect
     */
    addEffect(effect: AnimationEffect): void {
        this.effects.push(effect);
    }

    /**
     * Update all animations and effects
     */
    updateAnimations(deltaTime: number): void {
        // Update and filter completed effects
        this.effects = this.effects.filter(effect => {
            effect.update(deltaTime);
            if (effect.isFinished()) {
                effect.destroy();
                return false;
            }
            return true;
        });
    }

    /**
     * Check if a specific animation exists
     */
    hasAnimation(key: string): boolean {
        return this.animations.has(key);
    }

    /**
     * Get the sprite for rendering
     */
    getSprite(): PIXI.AnimatedSprite | null {
        return this.sprite;
    }

    /**
     * Set sprite position
     */
    setPosition(position: Point): void {
        if (this.sprite) {
            this.sprite.position.set(position.x, position.y);
        }
    }

    /**
     * Set sprite rotation
     */
    setRotation(rotation: number): void {
        if (this.sprite) {
            this.sprite.rotation = rotation;
        }
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.sprite?.destroy();
        this.effects.forEach(effect => effect.destroy());
        this.effects = [];
    }
}
