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
    // Zoom and pixel settings
    zoom: 1, // No zoom (1x) for half visual size
    pixelSize: 1, // Base pixel size
    
    // Player settings
    size: 32, // 32 logical pixels (will display as 32px with 1x zoom)
    color: 0xff0000, // Normal color (red)
    duckColor: 0x8B0000, // Duck color (dark red)
    
    // Movement settings
    moveDelay: 1, // Minimal delay for maximum responsiveness
    speed: 4, // 4 logical pixels per step for faster movement
    duckSpeedMultiplier: 1, // No speed reduction when ducking
    
    // Direction indicator
    innerSize: 8, // 8 logical pixels
    innerColor: 0xffff00 // Yellow for visibility
};
