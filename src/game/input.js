class InputHandler {
    constructor() {
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
        
        this.duckState = false;
        this.mouseX = 0;
        this.mouseY = 0;

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleKeyDown(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = true;
        }
        // Toggle duck state on Shift press
        if (e.key === 'Shift' && !e.repeat) {
            this.duckState = !this.duckState;
        }
    }

    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = false;
        }
    }

    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    isPressed(key) {
        return this.keys[key];
    }

    isMovingLeft() {
        return this.keys.ArrowLeft || this.keys.a;
    }

    isMovingRight() {
        return this.keys.ArrowRight || this.keys.d;
    }

    isMovingUp() {
        return this.keys.ArrowUp || this.keys.w;
    }

    isMovingDown() {
        return this.keys.ArrowDown || this.keys.s;
    }

    isDucking() {
        return this.duckState;
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
}

export const input = new InputHandler();
