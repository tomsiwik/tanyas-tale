import { Direction } from './config.js';

/**
 * Animation type constants
 */
export const AnimationType = {
    STANDING: 'standing',
    RUNNING: 'running',
    SHOOTING: 'shooting',
    DUCKING: 'duck',
    CRAWLING: 'crawl',
    DEATH_ZAP: 'death_zap',
    DEATH_EXPLODE: 'death_explode'
};

/**
 * Maps Direction enum values to animation suffix strings
 */
export const DirectionSuffix = {
    [Direction.UP]: 'n',
    [Direction.UP_RIGHT]: 'ne',
    [Direction.RIGHT]: 'e',
    [Direction.DOWN_RIGHT]: 'se',
    [Direction.DOWN]: 's',
    [Direction.DOWN_LEFT]: 'sw',
    [Direction.LEFT]: 'w',
    [Direction.UP_LEFT]: 'nw',
    [Direction.NONE]: 's' // Default to north
};
