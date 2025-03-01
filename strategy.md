# Tanya's Tale - Game Strategy

## Pixel Movement Strategy

### Current Issues
1. Movement sometimes gets stuck in corners
2. Movement doesn't feel like a true pixel game (too smooth)
3. Need to implement a 2x2 pixel grid system

### Proposed Strategy

#### 1. Grid-Based Movement
- Implement a grid-based movement system where the player snaps to a 2x2 pixel grid
- This will create the authentic "chunky" pixel game feel
- Will prevent sub-pixel positioning that can cause corner sticking

#### 2. Input Handling Improvements
- Simplify input handling to prevent conflicting directions
- Add priority to movement directions (e.g., last key pressed takes precedence)
- Clear movement state when changing directions

#### 3. Implementation Steps
1. Update config to define grid size (2x2 pixels)
2. Modify player movement to snap to grid positions
3. Improve input handler to track last pressed key
4. Fix corner movement by ensuring clean state transitions

This approach follows pixel game best practices by:
- Using grid-based movement instead of continuous movement
- Implementing clear input priority
- Avoiding diagonal movement conflicts
- Maintaining pixel-perfect positioning

## Skill System Implementation

### Current Implementation
- Added a flexible skill system for both player and bots
- Skills are modular and can be added/removed from entities
- Each skill has its own update logic and targeting

### Player Skills
1. **Proximity Damage Skill**
   - Damages bots that come close to the player
   - Damage scales based on distance (more damage when closer)
   - Current configuration: 0.5-5 damage (half the original strength)
   - Can be easily modified or replaced with other skills

2. **Cone Attack Skill**
   - Creates a cone-shaped attack in the direction the player is aiming
   - Shows a transparent yellow cone visual to indicate the attack area
   - Flashes slightly every second when it activates
   - Damages all bots within the cone hitbox (20 damage per hit)
   - Has a 1-second cooldown between attacks

### Bot Skills
1. **Regeneration Skill**
   - Heals the bot by 1 HP per second
   - Uses cooldown system for timed healing
   - Provides sustainability in combat

### Skill System Architecture
- Base Skill class with common functionality
- SkillManager to handle multiple skills per entity
- Cooldown and activation state management
- Frame-rate independent updates

### Future Skill Ideas
- Area of effect damage
- Temporary speed boosts
- Shield/invulnerability
- Projectile attacks
- Status effects (slow, stun, etc.)

## Performance Optimizations

### Object Pooling
- Implemented object pooling for bots and effects
- Minimizes garbage collection and memory allocation
- Pre-allocation of frequently used objects
- Efficient reuse of entities

### Death Effects
- Separated death animation from bot lifecycle
- Death effects show a black square for 2 seconds
- After 2 seconds, they fade away over 1 second
- Managed by a dedicated EffectManager

### Collision System
- Improved collision detection using distance calculations
- Bots maintain minimum distance from the player
- Bots avoid overlapping with other bots
- Uses vector-based repulsion for natural movement

### Visual Effects
- Cone Attack skill shows a transparent yellow cone
- The cone flashes brighter when the skill activates
- The cone rotates to match the player's aim direction
- Efficient rendering using PixiJS Graphics
