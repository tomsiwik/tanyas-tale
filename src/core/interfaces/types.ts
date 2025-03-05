export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export enum Direction {
    NONE = 'NONE',
    UP = 'UP',
    UP_RIGHT = 'UP_RIGHT',
    RIGHT = 'RIGHT',
    DOWN_RIGHT = 'DOWN_RIGHT',
    DOWN = 'DOWN',
    DOWN_LEFT = 'DOWN_LEFT',
    LEFT = 'LEFT',
    UP_LEFT = 'UP_LEFT'
}

export interface Entity {
    getPosition(): Point;
    isActive(): boolean;
    tick(deltaTime: number): void;
}
