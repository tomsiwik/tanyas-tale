import { describe, it, expect } from 'vitest';
import { Game } from './main.js';

describe('Game', () => {
    it('should initialize with default state', () => {
        const game = new Game();
        expect(game.entities).toEqual([]);
        expect(game.player).toBeNull();
        expect(game.botManager).toBeNull();
        expect(game.effectManager).toBeNull();
        expect(game.ui).toBeNull();
    });
});
