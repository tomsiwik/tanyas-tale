# Sprite Animation and Stage Management Guide

This document explains how sprite animations and stage management work in the Tanya's Tale game.

## Sprite Animation System

The game uses PixiJS's built-in animation system with the following components:

1. **SpriteManager**: A utility class that handles sprite creation and animation updates
2. **AnimatedSprite**: PixiJS's built-in class for animated sprites
3. **Spritesheet**: A collection of textures and animation definitions

## How Animations Work

### 1. Creating Animated Sprites

```javascript
// In SpriteManager.js
createSprite(animationKey) {
    // Get textures from the spritesheet
    const textures = this.spritesheet.animations[animationKey];
    
    // Create animated sprite using the textures
    const sprite = new PIXI.AnimatedSprite(textures);
    
    // Configure animation properties
    sprite.animationSpeed = 0.15; // Controls animation speed
    sprite.loop = true; // Enable looping
    
    // Start the animation - PixiJS will handle updates automatically via its ticker
    sprite.play();
    
    // Store the current animation key for reference
    sprite.currentAnimation = animationKey;
    
    return sprite;
}
```

### 2. Adding Sprites to the Stage

The game uses a container-based approach for organizing display objects:

```javascript
// In player.js (constructor)
// Create container for player elements
this.container = new PIXI.Container();
this.container.sortableChildren = true; // Enable z-index sorting

// Add container to stage
app.stage.addChild(this.container);

// Later, when the sprite is created:
this.container.addChild(this.sprite);
```

```javascript
// In bot.js (init method)
// Add to stage if not already added
if (!this.container.parent) {
    stage.addChild(this.container);
}

// Later, when the sprite is created:
this.container.addChild(this.sprite);
```

### 3. Updating Animations

Animations are updated only when the entity's state changes:

```javascript
// In player.js (tick method)
// Only update animation if state changed
if (wasDucking !== this.state.isDucking || 
    prevDirection !== this.state.moveDirection || 
    prevAimDirection !== this.state.aimDirection) {
    this.updateAnimation();
}
```

```javascript
// In bot.js (tick method)
// Only update animation if direction changed
if (prevAimDirection !== newAimDirection) {
    this.state.aimDirection = newAimDirection;
    
    if (this.spritesLoaded && this.sprite) {
        this.updateAnimation();
    }
}
```

## Stage Management Flow

1. **Initialization**:
   - Create a container for the entity
   - Add the container to the stage
   - Create placeholder graphics while sprites load

2. **Sprite Loading**:
   - Load the spritesheet
   - Create animated sprites using SpriteManager
   - Configure sprite properties (scale, anchor, zIndex)
   - Remove placeholder graphics
   - Add the sprite to the container

3. **Animation Updates**:
   - PixiJS's ticker automatically updates the animation frames
   - We only change animations when entity state changes
   - Animation changes are handled by updating the sprite's textures

4. **Position Updates**:
   - Entity positions are updated in the tick method
   - Container positions are updated to match entity positions

## Benefits of This Approach

1. **Performance**: Animations are updated by PixiJS's ticker, not manually on every frame
2. **Organization**: Using containers makes it easy to group related display objects
3. **Flexibility**: Entities can be added to and removed from the stage as needed
4. **Efficiency**: Only changing animations when state changes reduces unnecessary updates

## Example: Complete Lifecycle

1. Create entity container
2. Add container to stage
3. Load spritesheet
4. Create animated sprite
5. Add sprite to container
6. Start animation with sprite.play()
7. Update sprite position in game loop
8. Change animation when entity state changes
9. Remove from stage when no longer needed
