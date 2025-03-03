export const config = {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    resizeTo: window,
    eventMode: 'auto',
    eventFeatures: {
        move: true,
        globalMove: true,
    },
    fps: 60 // Target FPS for calculations
};

// Grid system for positioning
export const gridConfig = {
    cellSize: 40, // Size of each grid cell
    padding: 4,   // Padding between entities in the same cell
};

export const playerConfig = {
    // Player settings
    size: 32, // 32 logical pixels
    color: 0xff0000, // Normal color (red)
    duckColor: 0x8B0000, // Duck color (dark red)
    
    // Movement settings
    speed: 2, // 2 pixels per step (halved from 4)
    duckSpeedMultiplier: 0.5, // Half speed when ducking
    
    // Direction indicator
    innerSize: 8, // 8 logical pixels
    innerColor: 0xffff00, // Yellow for visibility
    
    // Health settings
    maxHealth: 100,
    healthBarWidth: 32, // Same as player size
    healthBarHeight: 4,
    healthBarOffset: 8, // Distance above player
    healthBarBgColor: 0x333333, // Dark gray
    healthBarFillColor: 0x00ff00, // Green
    healthBarBorderColor: 0xffffff, // White
    healthBarBorderThickness: 1
};

export const botConfig = {
    // Bot settings
    size: 32, // 32 logical pixels
    color: 0x800080, // Purple color
    
    // Movement settings
    speed: 1.5, // Slower than player
    
    // Health settings
    maxHealth: 100,
    healthBarWidth: 32, // Same as bot size
    healthBarHeight: 4,
    healthBarOffset: 8, // Distance above bot
    healthBarBgColor: 0x333333, // Dark gray
    healthBarFillColor: 0xff0000, // Red
    healthBarBorderColor: 0xffffff, // White
    healthBarBorderThickness: 1,
    
    // Damage settings
    minDamage: 1, // Damage when far away
    maxDamage: 10, // Damage when close
    minDamageDistance: 300, // Distance for min damage
    maxDamageDistance: 50, // Distance for max damage
    
    // Collision settings
    minDistanceToPlayer: 40, // Minimum distance to player (prevents overlap)
    minDistanceToBot: 36, // Minimum distance to other bots
    
    // Spawn settings
    spawnCount: 10, // Number of bots to spawn
    spawnMargin: 100, // Distance outside screen to spawn
    
    // Direction indicator (aim)
    innerSize: 8, // 8 logical pixels
    innerColor: 0x00ffff, // Cyan for visibility
    
    // Death animation
    blackDuration: 2 * 60, // 2 seconds at 60fps
    fadeDuration: 1 * 60,  // 1 second at 60fps
};

// Cone attack skill configuration
export const coneAttackConfig = {
    // Visual settings
    coneLength: 400, // Length of the cone
    coneAngle: Math.PI / 3, // 60 degrees in radians
    coneColor: 0xffffff, // White color
    coneAlpha: 0.25, // More transparent for normal state
    flashAlpha: 0.95, // More prominent flash
    
    // Gameplay settings
    damage: 40, // Doubled damage (was 20)
    cooldown: 1000, // 1 second cooldown
    
    // Flash animation
    flashDuration: 200, // Flash duration in ms
};

// Direction enum using bitwise flags for efficient checks
export const Direction = {
    NONE: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 4,
    LEFT: 8,
    // Diagonals are combinations
    UP_RIGHT: 3,   // UP | RIGHT
    DOWN_RIGHT: 6, // DOWN | RIGHT
    DOWN_LEFT: 12, // DOWN | LEFT
    UP_LEFT: 9     // UP | LEFT
};

// Position lookup table for inner square based on aim direction
export const AIM_POSITIONS = {
    [Direction.NONE]: { x: -999, y: -999 }, // Hidden
    [Direction.UP]: { x: 12, y: 0 },        // North
    [Direction.UP_RIGHT]: { x: 24, y: 0 },  // Northeast
    [Direction.RIGHT]: { x: 24, y: 12 },    // East
    [Direction.DOWN_RIGHT]: { x: 24, y: 24 }, // Southeast
    [Direction.DOWN]: { x: 12, y: 24 },     // South
    [Direction.DOWN_LEFT]: { x: 0, y: 24 }, // Southwest
    [Direction.LEFT]: { x: 0, y: 12 },      // West
    [Direction.UP_LEFT]: { x: 0, y: 0 }     // Northwest
};

// Direction to angle mapping (in radians)
export const DIRECTION_ANGLES = {
    [Direction.NONE]: 0,
    [Direction.RIGHT]: 0,
    [Direction.DOWN_RIGHT]: Math.PI / 4,
    [Direction.DOWN]: Math.PI / 2,
    [Direction.DOWN_LEFT]: 3 * Math.PI / 4,
    [Direction.LEFT]: Math.PI,
    [Direction.UP_LEFT]: 5 * Math.PI / 4,
    [Direction.UP]: 3 * Math.PI / 2,
    [Direction.UP_RIGHT]: 7 * Math.PI / 4
};

// UI configuration
export const uiConfig = {
    // Crosshair
    crosshair: {
        size: 24,         // Increased size for better visibility
        thickness: 3,     // Increased thickness
        gap: 6,           // Increased gap
        color: 0xffffff,  // White color
        alpha: 1.0        // Fully opaque
    },
    
    // Experience bar
    expBar: {
        width: 0.9,       // 90% of screen width
        height: 16,       // Increased height for better visibility
        padding: 20,      // Padding from top/sides
        backgroundColor: 0x333333,  // Dark gray background
        fillColor: 0x00ff00,        // Green fill
        borderColor: 0xffffff,      // White border
        borderThickness: 1,         // Border thickness
        textColor: 0xffffff,        // White text
        fontSize: 14,               // Increased font size
        fontFamily: 'Pixelify Sans', // Pixel font
        startLevel: 1               // Starting level
    },
    
    // Time bar (20 min countdown)
    timeBar: {
        width: 0.9,       // 90% of screen width
        height: 16,       // Increased height for better visibility
        padding: 20,      // Padding from bottom/sides
        backgroundColor: 0x333333,  // Dark gray background
        fillColor: 0x0088ff,        // Blue fill
        borderColor: 0xffffff,      // White border
        borderThickness: 1,         // Border thickness
        textColor: 0xffffff,        // White text
        fontSize: 14,               // Increased font size
        fontFamily: 'Pixelify Sans', // Pixel font
        totalTime: 20 * 60 * 1000   // 20 minutes in milliseconds
    }
};
