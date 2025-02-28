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
    }
};

export const playerConfig = {
    // Player settings
    size: 32, // 32 logical pixels
    color: 0xff0000, // Normal color (red)
    duckColor: 0x8B0000, // Duck color (dark red)
    
    // Movement settings
    speed: 4, // 4 pixels per step for fast movement
    duckSpeedMultiplier: 0.5, // Half speed when ducking
    
    // Direction indicator
    innerSize: 8, // 8 logical pixels
    innerColor: 0xffff00 // Yellow for visibility
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
