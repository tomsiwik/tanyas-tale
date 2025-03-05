export enum AnimationType {
    STANDING = 'standing',
    RUNNING = 'running',
    SHOOTING = 'shooting',
    DUCKING = 'duck',
    CRAWLING = 'crawl',
    DEATH_ZAP = 'death_zap',
    DEATH_EXPLODE = 'death_explode'
}

export enum DirectionSuffix {
    NORTH = 'n',
    NORTH_EAST = 'ne',
    EAST = 'e',
    SOUTH_EAST = 'se',
    SOUTH = 's',
    SOUTH_WEST = 'sw',
    WEST = 'w',
    NORTH_WEST = 'nw'
}

export const DEFAULT_ANIMATION_SPEED = 0.1;
export const RUNNING_ANIMATION_SPEED = 0.15;
export const SHOOTING_ANIMATION_SPEED = 0.2;
