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
    size: 32, // Pixel-sized square
    color: 0xff0000, // Normal color (red)
    duckColor: 0x8B0000, // Duck color (dark red)
    speed: 4, // Base speed for 24fps
    duckSpeedMultiplier: 0.5, // Half speed when ducking
    innerSize: 8, // 8x8 (1/4 of player size)
    innerColor: 0xffff00 // Yellow for visibility
};
