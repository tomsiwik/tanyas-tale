# Strategy for Improving Pixel Movement

## Current Issues
1. Movement sometimes gets stuck in corners
2. Movement doesn't feel like a true pixel game (too smooth)
3. Need to implement a 2x2 pixel grid system

## Proposed Strategy

### 1. Grid-Based Movement
- Implement a grid-based movement system where the player snaps to a 2x2 pixel grid
- This will create the authentic "chunky" pixel game feel
- Will prevent sub-pixel positioning that can cause corner sticking

### 2. Input Handling Improvements
- Simplify input handling to prevent conflicting directions
- Add priority to movement directions (e.g., last key pressed takes precedence)
- Clear movement state when changing directions

### 3. Implementation Steps
1. Update config to define grid size (2x2 pixels)
2. Modify player movement to snap to grid positions
3. Improve input handler to track last pressed key
4. Fix corner movement by ensuring clean state transitions

This approach follows pixel game best practices by:
- Using grid-based movement instead of continuous movement
- Implementing clear input priority
- Avoiding diagonal movement conflicts
- Maintaining pixel-perfect positioning
