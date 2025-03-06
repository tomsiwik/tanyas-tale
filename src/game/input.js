import { Direction } from './config.js';

class InputHandler {
    constructor() {
        // Use a Set to track pressed keys
        this.keyState = new Set();
        
        // Duck state (toggle)
        this.duckToggle = false;
        this.shiftJustPressed = false;
        
        // Mouse position
        this.mouseX = 0;
        this.mouseY = 0;

        // Set up event listeners
        globalThis.addEventListener('keydown', this.handleKeyDown.bind(this));
        globalThis.addEventListener('keyup', this.handleKeyUp.bind(this));
        globalThis.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Add blur event to reset keys when window loses focus
        globalThis.addEventListener('blur', this.reset.bind(this));
    }

    reset() {
        // Reset all key states when window loses focus
        this.keyState.clear();
        this.shiftJustPressed = false;
    }

    handleKeyDown(e) {
        // Add key to pressed keys set
        this.keyState.add(e.key);
        
        // Toggle duck state on Shift press (without repeat)
        if (e.key === 'Shift' && !e.repeat && !this.shiftJustPressed) {
            this.shiftJustPressed = true;
            this.duckToggle = !this.duckToggle;
            
            // Reset shift pressed flag after a short delay
            setTimeout(() => {
                this.shiftJustPressed = false;
            }, 200);
        }
    }

    handleKeyUp(e) {
        // Remove key from pressed keys set
        this.keyState.delete(e.key);
    }

    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    // Get movement direction using bitwise operations
    getDirection() {
        let dir = Direction.NONE;
        
        // Build direction using bitwise OR
        if (this.keyState.has('ArrowUp') || this.keyState.has('w')) dir |= Direction.UP;
        if (this.keyState.has('ArrowRight') || this.keyState.has('d')) dir |= Direction.RIGHT;
        if (this.keyState.has('ArrowDown') || this.keyState.has('s')) dir |= Direction.DOWN;
        if (this.keyState.has('ArrowLeft') || this.keyState.has('a')) dir |= Direction.LEFT;
        
        return dir;
    }

    isDucking() {
        return this.duckToggle;
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
}

// Single instance for the entire game
export const input = new InputHandler();
