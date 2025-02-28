class InputHandler {
    constructor() {
        // Key state tracking
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            'a': false,
            'd': false,
            'w': false,
            's': false,
        };
        
        // Track the last pressed direction key for movement priority
        this.lastHorizontalKey = null;
        this.lastVerticalKey = null;
        
        // Duck state (toggle)
        this.duckState = false;
        this.shiftJustPressed = false;
        
        // Mouse position
        this.mouseX = 0;
        this.mouseY = 0;

        // Set up event listeners
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Add blur event to reset keys when window loses focus
        window.addEventListener('blur', () => this.resetAllKeys());
    }

    resetAllKeys() {
        // Reset all key states when window loses focus
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
        this.lastHorizontalKey = null;
        this.lastVerticalKey = null;
        this.shiftJustPressed = false;
    }

    handleKeyDown(e) {
        // Update key state
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = true;
            
            // Update last pressed key for movement priority
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.lastHorizontalKey = e.key;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                this.lastHorizontalKey = e.key;
            } else if (e.key === 'ArrowUp' || e.key === 'w') {
                this.lastVerticalKey = e.key;
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                this.lastVerticalKey = e.key;
            }
        }
        
        // Toggle duck state on Shift press (without repeat)
        if (e.key === 'Shift' && !e.repeat && !this.shiftJustPressed) {
            this.shiftJustPressed = true;
            this.duckState = !this.duckState;
            
            // Reset shift pressed flag after a short delay
            setTimeout(() => {
                this.shiftJustPressed = false;
            }, 200);
        }
    }

    handleKeyUp(e) {
        // Update key state
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = false;
            
            // Clear last pressed key if it was this one
            if ((e.key === 'ArrowLeft' || e.key === 'a') && this.lastHorizontalKey === e.key) {
                // Set to the other key if it's still pressed
                if (this.keys.ArrowLeft) this.lastHorizontalKey = 'ArrowLeft';
                else if (this.keys.a) this.lastHorizontalKey = 'a';
                else if (this.keys.ArrowRight) this.lastHorizontalKey = 'ArrowRight';
                else if (this.keys.d) this.lastHorizontalKey = 'd';
                else this.lastHorizontalKey = null;
            } 
            else if ((e.key === 'ArrowRight' || e.key === 'd') && this.lastHorizontalKey === e.key) {
                if (this.keys.ArrowRight) this.lastHorizontalKey = 'ArrowRight';
                else if (this.keys.d) this.lastHorizontalKey = 'd';
                else if (this.keys.ArrowLeft) this.lastHorizontalKey = 'ArrowLeft';
                else if (this.keys.a) this.lastHorizontalKey = 'a';
                else this.lastHorizontalKey = null;
            }
            else if ((e.key === 'ArrowUp' || e.key === 'w') && this.lastVerticalKey === e.key) {
                if (this.keys.ArrowUp) this.lastVerticalKey = 'ArrowUp';
                else if (this.keys.w) this.lastVerticalKey = 'w';
                else if (this.keys.ArrowDown) this.lastVerticalKey = 'ArrowDown';
                else if (this.keys.s) this.lastVerticalKey = 's';
                else this.lastVerticalKey = null;
            }
            else if ((e.key === 'ArrowDown' || e.key === 's') && this.lastVerticalKey === e.key) {
                if (this.keys.ArrowDown) this.lastVerticalKey = 'ArrowDown';
                else if (this.keys.s) this.lastVerticalKey = 's';
                else if (this.keys.ArrowUp) this.lastVerticalKey = 'ArrowUp';
                else if (this.keys.w) this.lastVerticalKey = 'w';
                else this.lastVerticalKey = null;
            }
        }
    }

    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    // Movement direction methods with priority handling
    isMovingLeft() {
        // Check if left is the last horizontal direction pressed
        return this.lastHorizontalKey === 'ArrowLeft' || this.lastHorizontalKey === 'a';
    }

    isMovingRight() {
        // Check if right is the last horizontal direction pressed
        return this.lastHorizontalKey === 'ArrowRight' || this.lastHorizontalKey === 'd';
    }

    isMovingUp() {
        // Check if up is the last vertical direction pressed
        return this.lastVerticalKey === 'ArrowUp' || this.lastVerticalKey === 'w';
    }

    isMovingDown() {
        // Check if down is the last vertical direction pressed
        return this.lastVerticalKey === 'ArrowDown' || this.lastVerticalKey === 's';
    }

    isDucking() {
        return this.duckState;
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
}

export const input = new InputHandler();
