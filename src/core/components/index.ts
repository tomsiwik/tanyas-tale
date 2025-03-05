export * from './animation/animation';
export * from './automation/automation';
export * from './health/health';
export * from './movement/movement';
export * from './position/position';
export * from './skills/skill';

// Component types
export type ComponentType = 
    | 'animation'
    | 'automation'
    | 'health'
    | 'movement'
    | 'position'
    | 'skills';

// Component keys for consistent access
export const ComponentKeys: Record<ComponentType, string> = {
    animation: 'animation',
    automation: 'automation',
    health: 'health',
    movement: 'movement',
    position: 'position',
    skills: 'skills'
} as const;
