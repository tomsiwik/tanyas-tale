import { Point } from './types';

export interface AnimationConfig {
    key: string;
    speed?: number;
    loop?: boolean;
}

export interface AnimationEffect {
    /**
     * Start the animation effect at a specific position
     */
    start(position: Point): void;

    /**
     * Update the animation effect
     */
    update(deltaTime: number): void;

    /**
     * Check if the animation effect is complete
     */
    isFinished(): boolean;

    /**
     * Clean up any resources used by the effect
     */
    destroy(): void;
}

export interface Animateable {
    /**
     * Play a specific animation
     */
    playAnimation(config: AnimationConfig): void;

    /**
     * Stop the current animation
     */
    stopAnimation(): void;

    /**
     * Get the current animation key
     */
    getCurrentAnimation(): string | null;

    /**
     * Add a temporary animation effect
     */
    addEffect(effect: AnimationEffect): void;

    /**
     * Update all animations and effects
     */
    updateAnimations(deltaTime: number): void;

    /**
     * Check if a specific animation exists
     */
    hasAnimation(key: string): boolean;
}
