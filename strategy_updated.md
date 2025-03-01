# Tanya's Tale - Game Architecture

## Overview

Tanya's Tale is a bullet-hell roguelike game built with PixiJS. The game features a player character that must survive against waves of enemies (bots) that spawn from outside the screen and move towards the player.

## Core Components

### Game Loop

The main game loop is managed by PixiJS's ticker system. Each frame, the following updates occur:
- Player position and state are updated
- Bot positions and states are updated
- Skills are applied
- UI elements are updated
- Death effects are processed

### Entity System

#### Player
- Represented by a red square with a yellow direction indicator
- Controlled by keyboard (WASD/arrows) for movement
- Mouse controls aiming direction
- Has a health bar and can take damage
- Has skills that affect nearby bots

#### Bots
- Represented by purple squares with cyan direction indicators
- Spawn from outside the screen edges
- Move towards the player
- Have health bars and can take damage
- Die when health reaches zero, spawning a death effect
- Have skills (like regeneration)

### Object Pooling

To optimize performance, especially for large numbers of entities:
- Bots are pooled and reused when they die
- Death effects are pooled and reused when animations complete
- This minimizes garbage collection and memory allocation during gameplay

### Skill System

The skill system provides a flexible way to add behaviors to entities:

#### Base Skill Class
- Handles common functionality like cooldowns and activation state
- Provides an interface for specific skill implementations

#### Skill Manager
- Manages multiple skills for an entity
- Updates all skills each frame
- Provides methods to add/remove skills

#### Implemented Skills
1. **Proximity Damage Skill** (Player)
   - Damages bots that come close to the player
   - Damage scales based on distance (more damage when closer)
   - Current configuration: 0.5-5 damage (half the original strength)

2. **Regeneration Skill** (Bots)
   - Heals the bot by 1 HP per second
   - Uses cooldown system for timed healing

3. **Cone Attack Skill** (Player)
   - Creates a cone-shaped attack in the direction the player is aiming
   - Shows a transparent yellow cone visual to indicate the attack area
   - Flashes slightly every second when it activates
   - Damages all bots within the cone hitbox (20 damage per hit)
   - Has a 1-second cooldown between attacks

### Visual Effects

#### Death Effects
- When a bot dies, it's replaced with a death effect
- Death effect shows a black square for 2 seconds
- After 2 seconds, it fades away over 1 second
- Managed by a dedicated EffectManager

#### Skill Visuals
- Cone Attack skill shows a transparent yellow cone
- The cone flashes brighter when the skill activates
- The cone rotates to match the player's aim direction

### Collision System

- Entities have collision detection based on distance
- Bots maintain minimum distance from the player
- Bots avoid overlapping with other bots
- Uses vector-based repulsion for natural movement

## Technical Implementation

### Object-Oriented Design

The codebase follows object-oriented principles:
- Classes encapsulate related functionality
- Inheritance is used for common behaviors
- Composition is used for flexible entity construction

### Performance Optimizations

- Object pooling for entities and effects
- Efficient collision detection using distance calculations
- Frame-rate independent updates
- Pre-allocation of frequently used objects

### Extensibility

The architecture is designed for easy extension:
- New skills can be added by extending the Skill class
- New entity types can be created with their own behaviors
- Visual effects can be expanded with new effect types

## Future Enhancements

The current architecture supports several potential enhancements:
- Additional skill types (area effects, buffs, debuffs)
- More complex enemy behaviors
- Projectile systems
- Power-ups and collectibles
- Level progression
- Score and achievement systems

## File Structure

```
src/
├── main.js                 # Main entry point
├── game/
│   ├── config.js           # Game configuration
│   ├── input.js            # Input handling
│   ├── player.js           # Player implementation
│   ├── bot.js              # Bot implementation
│   ├── effects.js          # Visual effects
│   ├── skills.js           # Skill system
│   └── ui.js               # User interface
```

## Current State

The game currently features:
- Player movement and aiming
- Bot spawning and AI
- Health system for player and bots
- Skill system with multiple skills:
  - Proximity damage (passive area damage)
  - Cone attack (directional area damage)
  - Regeneration (healing over time)
- Death effects with animation
- UI elements (health bars, experience bar, time bar)
- Object pooling for performance
