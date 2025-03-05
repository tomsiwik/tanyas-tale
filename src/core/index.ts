// Base entities
export * from './entities/base/entity';
export * from './entities/base/character';

// Characters
export * from './entities/characters';

// Components
export * from './components';

// Interfaces
export * from './interfaces';

// Constants
export * from './constants/animation';

// Feature flags
export * from './feature-flags';

// Types
export type {
    Point,
    Size,
    Direction,
    Entity
} from './interfaces/types';

export type {
    AnimationConfig,
    AnimationEffect,
    Animateable
} from './interfaces/animateable';

export type {
    DamageInfo,
    DamageType,
    Attackable
} from './interfaces/attackable';

export type {
    AIState,
    AIBehavior,
    AIConfig,
    Automatable
} from './interfaces/automatable';

export type {
    SkillTarget,
    SkillEffect,
    SkillConfig,
    Skillable
} from './interfaces/skillable';

export type {
    Moveable
} from './interfaces/moveable';

// Component types
export type {
    AnimationComponentConfig,
    AutomationComponentConfig,
    HealthConfig,
    MovementConfig,
    SkillComponentConfig,
    ComponentType
} from './components';

// Character types
export type {
    TanyaConfig,
    InfantryConfig,
    DogConfig,
    CharacterType,
    CharacterFactoryConfig,
    CreateCharacterConfig
} from './entities/characters';

export type { CharacterConfig } from './entities/base/character';
