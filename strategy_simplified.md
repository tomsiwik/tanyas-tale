# Simplified Architecture Strategy

## Current Issues
1. Too many if/else statements in movement logic
2. Separate handling for horizontal and vertical movement
3. Complex state management with multiple counters
4. Redundant calculations and checks
5. Overly complex input handling

## Simplified Architecture

### 1. State-Based Player
- Use a simple state object to represent player state
- States: position, direction, isDucking, aim
- No separate horizontal/vertical handling
- Single update method that applies state changes

### 2. Direction Enum
- Replace string-based directions with numeric enum
- Use bitwise operations for faster direction checks
- Combine movement and aim into a single direction concept

### 3. Lookup Tables
- Replace if/else chains with lookup tables
- Direction → Position mapping
- Input → Direction mapping
- Single table lookup instead of multiple conditionals

### 4. Simplified Input
- Track only current input state, not history
- Use a simple input map (key → action)
- No need for last key tracking or complex priority

### 5. Efficient PixiJS Usage
- Use PixiJS's built-in ticker for consistent updates
- Leverage Container for grouping related objects
- Minimize Graphics redraws

## Implementation Plan

### 1. Create Direction Enum
```javascript
const Direction = {
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
```

### 2. Simplified Player State
```javascript
class PlayerState {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.moveDirection = Direction.NONE;
    this.aimDirection = Direction.NONE;
    this.isDucking = false;
  }
}
```

### 3. Position Lookup Table
```javascript
const POSITION_LOOKUP = {
  [Direction.NONE]: { x: -999, y: -999 },
  [Direction.UP]: { x: 12, y: 0 },
  [Direction.UP_RIGHT]: { x: 24, y: 0 },
  [Direction.RIGHT]: { x: 24, y: 12 },
  // etc.
};
```

### 4. Simplified Input Handler
```javascript
class InputHandler {
  constructor() {
    this.keyState = new Set();
    this.duckToggle = false;
    
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    window.addEventListener('blur', this.reset.bind(this));
  }
  
  handleKeyDown(e) {
    this.keyState.add(e.key);
    if (e.key === 'Shift' && !e.repeat) {
      this.duckToggle = !this.duckToggle;
    }
  }
  
  handleKeyUp(e) {
    this.keyState.delete(e.key);
  }
  
  reset() {
    this.keyState.clear();
  }
  
  getDirection() {
    let dir = Direction.NONE;
    if (this.keyState.has('ArrowUp') || this.keyState.has('w')) dir |= Direction.UP;
    if (this.keyState.has('ArrowRight') || this.keyState.has('d')) dir |= Direction.RIGHT;
    if (this.keyState.has('ArrowDown') || this.keyState.has('s')) dir |= Direction.DOWN;
    if (this.keyState.has('ArrowLeft') || this.keyState.has('a')) dir |= Direction.LEFT;
    return dir;
  }
  
  isDucking() {
    return this.duckToggle;
  }
}
```

### 5. Simplified Player Update
```javascript
update() {
  // Get current direction from input
  const direction = input.getDirection();
  
  // Update player state
  this.state.moveDirection = direction;
  this.state.isDucking = input.isDucking();
  
  // Apply movement based on direction
  const speed = this.state.isDucking ? playerConfig.speed * 0.5 : playerConfig.speed;
  
  if (direction & Direction.LEFT) this.state.x -= speed;
  if (direction & Direction.RIGHT) this.state.x += speed;
  if (direction & Direction.UP) this.state.y -= speed;
  if (direction & Direction.DOWN) this.state.y += speed;
  
  // Update position
  this.container.x = Math.floor(this.state.x);
  this.container.y = Math.floor(this.state.y);
  
  // Update aim direction and indicator position
  this.updateAim();
}
```

This simplified architecture will:
1. Reduce code complexity
2. Improve performance with fewer conditionals
3. Make the code more maintainable
4. Provide the same functionality with less code
