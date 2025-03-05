import { Tanya, TanyaConfig } from './tanya';
import { Infantry, InfantryConfig } from './infantry';
import { Dog, DogConfig } from './dog';
import { Point } from '../../interfaces/types';
import { DamageType } from '../../interfaces/attackable';

export * from './tanya';
export * from './infantry';
export * from './dog';

export type CharacterType = 'tanya' | 'infantry' | 'dog';

export interface CharacterFactoryConfig {
    position: Point;
    isBot?: boolean;
}

interface TanyaFactoryConfig extends CharacterFactoryConfig {
    type: 'tanya';
}

interface InfantryFactoryConfig extends CharacterFactoryConfig {
    type: 'infantry';
}

interface DogFactoryConfig extends CharacterFactoryConfig {
    type: 'dog';
}

export type CreateCharacterConfig = 
    | TanyaFactoryConfig 
    | InfantryFactoryConfig 
    | DogFactoryConfig;

/**
 * Create a character with default configuration based on type
 */
// Default configurations for each character type
const DEFAULT_TANYA_CONFIG: Omit<TanyaConfig, 'position'> = {
    attackDamage: 25,
    attackSpeed: 2, // 2 shots per second
    health: {
        maxHealth: 100,
        damageResistance: {
            [DamageType.PHYSICAL]: 0.2,
            [DamageType.EXPLOSIVE]: 0.1
        }
    },
    movement: {
        baseSpeed: 5,
        acceleration: 20,
        deceleration: 10,
        maxSpeed: 8
    },
    animation: {
        spritesheet: null!, // Will be set by game
        defaultAnimation: 'standing_s'
    }
};

const DEFAULT_INFANTRY_CONFIG: Omit<InfantryConfig, 'position'> = {
    attackDamage: 15,
    attackSpeed: 1.5, // 1.5 shots per second
    health: {
        maxHealth: 50,
        damageResistance: {
            [DamageType.PHYSICAL]: 0.1,
            [DamageType.EXPLOSIVE]: 0.05
        }
    },
    movement: {
        baseSpeed: 4,
        acceleration: 15,
        deceleration: 8,
        maxSpeed: 6
    },
    animation: {
        spritesheet: null!, // Will be set by game
        defaultAnimation: 'standing_s'
    }
};

const DEFAULT_DOG_CONFIG: Omit<DogConfig, 'position'> = {
    biteDamage: 10,
    biteSpeed: 3, // 3 bites per second
    health: {
        maxHealth: 30,
        damageResistance: {
            [DamageType.PHYSICAL]: 0.05,
            [DamageType.EXPLOSIVE]: 0.02
        }
    },
    movement: {
        baseSpeed: 7,
        acceleration: 25,
        deceleration: 15,
        maxSpeed: 10
    },
    animation: {
        spritesheet: null!, // Will be set by game
        defaultAnimation: 'standing_s'
    }
};

export function createCharacter(config: CreateCharacterConfig): Tanya | Infantry | Dog {
    switch (config.type) {
        case 'tanya':
            return new Tanya({
                ...DEFAULT_TANYA_CONFIG,
                position: config.position
            });

        case 'infantry':
            return new Infantry({
                ...DEFAULT_INFANTRY_CONFIG,
                position: config.position
            });

        case 'dog':
            return new Dog({
                ...DEFAULT_DOG_CONFIG,
                position: config.position
            });
    }
}

/**
 * Type guard to check if a character is a Tanya instance
 */
export function isTanya(character: Tanya | Infantry | Dog): character is Tanya {
    return character instanceof Tanya;
}

/**
 * Type guard to check if a character is an Infantry instance
 */
export function isInfantry(character: Tanya | Infantry | Dog): character is Infantry {
    return character instanceof Infantry;
}

/**
 * Type guard to check if a character is a Dog instance
 */
export function isDog(character: Tanya | Infantry | Dog): character is Dog {
    return character instanceof Dog;
}
