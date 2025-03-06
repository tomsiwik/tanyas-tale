import { describe, it, expect, beforeEach } from 'vitest';
import { FeatureFlags } from './feature-flags';

describe('FeatureFlags', () => {
    // Save original state
    const originalFlags = { ...FeatureFlags };
    
    // Reset flags before each test
    beforeEach(() => {
        Object.assign(FeatureFlags, originalFlags);
    });

    it('should have position component disabled by default', () => {
        expect(FeatureFlags.USE_POSITION_COMPONENT).toBe(false);
    });

    it('should allow enabling position component', () => {
        FeatureFlags.USE_POSITION_COMPONENT = true;
        expect(FeatureFlags.USE_POSITION_COMPONENT).toBe(true);
    });

    it('should maintain other flags when modifying one', () => {
        const originalMovement = FeatureFlags.USE_MOVEMENT_COMPONENT;
        FeatureFlags.USE_POSITION_COMPONENT = true;
        expect(FeatureFlags.USE_MOVEMENT_COMPONENT).toBe(originalMovement);
    });
});
