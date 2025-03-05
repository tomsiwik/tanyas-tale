# Animation System Explanation

## Animation Types in the Sprite Atlas

The sprite atlas (`sprite_atlas.json`) contains several types of animations for different character states and directions:

1. **Standing Animations**: Single-frame animations for characters standing still
   - Example: `standing_s` (standing facing south)

2. **Running Animations**: Multi-frame animations (6 frames) for characters in motion
   - Example: `running_s` (running south) uses frames "e7 0032.png" through "e7 0037.png"

3. **Shooting Animations**: Multi-frame animations (7 frames) for characters shooting
   - Example: `shooting_s` (shooting south) uses frames "e7 0084.png" through "e7 0090.png"

## Current Animation Implementation

### Player Animation

The player currently uses the `running_s` animation:

```javascript
// In player.js - loadSprites method
console.log('Creating sprite with running_s animation');
this.sprite = this.spriteManager.createSprite('running_s');

// In player.js - getAnimationKey method
getAnimationKey() {
    // Always use running_s animation for simplicity
    return 'running_s';
}
```

### Bot Animation

The bot currently uses the `shooting_s` animation:

```javascript
// In bot.js - init method
console.log('Creating bot sprite with shooting_s animation');
this.sprite = this.spriteManager.createSprite('shooting_s');

// In bot.js - getAnimationKey method
getAnimationKey() {
    // Always use shooting_s animation for simplicity
    return 'shooting_s';
}
```

## How PixiJS Handles the Animation

PixiJS's `AnimatedSprite` class handles the animation automatically once it's created and `play()` is called:

```javascript
// In SpriteManager.js - createSprite method
const sprite = new PIXI.AnimatedSprite(textures);
sprite.animationSpeed = 0.15; // Controls animation speed
sprite.loop = true; // Enable looping
sprite.play(); // Start the animation - PixiJS will handle updates automatically
```

The key points about how PixiJS handles animations:

1. **Automatic Frame Updates**: Once `play()` is called, PixiJS automatically updates the frames based on the `animationSpeed` property.

2. **Ticker Integration**: PixiJS uses its internal ticker system to update animations, which is synchronized with the game loop.

3. **No Manual Frame Updates Needed**: You don't need to manually update the animation frames in your game loop - PixiJS handles this for you.

## Simplified Animation System

The current implementation has been simplified to:

1. Always use a specific animation for each entity type (running_s for player, shooting_s for bot)
2. Let PixiJS handle the animation updates automatically
3. Only change animations when entity state changes (which doesn't happen in the simplified version)

This approach follows PixiJS best practices by leveraging its built-in animation system rather than manually updating frames.

## Why Fixed Animations?

The code has been simplified to use fixed animations (`running_s` for player, `shooting_s` for bot) regardless of the entity's state or direction. This was done to:

1. Simplify the animation logic
2. Ensure animations are always playing
3. Focus on getting the core animation system working before adding complexity

In a more complete implementation, you would select different animations based on the entity's state (standing, running, shooting) and direction (n, ne, e, se, s, sw, w, nw).
