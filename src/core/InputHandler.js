/**
 * InputHandler - Command Pattern for input abstraction
 */
export const ACTIONS = {
    JUMP: 'JUMP',
    SLIDE: 'SLIDE',
    PAUSE: 'PAUSE',
    RESTART: 'RESTART'
};

class InputHandler {
    constructor() {
        this.keys = {};
        this.lastKeys = {};
        
        // Define key mappings (Could be dynamic later)
        this.keyMap = {
            'Space': ACTIONS.JUMP,
            'ArrowUp': ACTIONS.JUMP,
            'KeyW': ACTIONS.JUMP,
            'ArrowDown': ACTIONS.SLIDE,
            'KeyS': ACTIONS.SLIDE,
            'Escape': ACTIONS.PAUSE,
            'KeyR': ACTIONS.RESTART
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        // Prevent default browser behavior for game keys
        if (this.keyMap[e.code]) {
            e.preventDefault();
        }
        this.keys[e.code] = true;
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    /**
     * Check if an action is currently ACTIVE (key is held down)
     * @param {string} action - Action from ACTIONS enum
     * @returns {boolean}
     */
    isActionActive(action) {
        return Object.keys(this.keyMap).some(key => 
            this.keyMap[key] === action && this.keys[key]
        );
    }

    /**
     * Check if an action was JUST PRESSED (tapped)
     * @param {string} action - Action from ACTIONS enum
     * @returns {boolean}
     */
    isActionJustPressed(action) {
        return Object.keys(this.keyMap).some(key => 
            this.keyMap[key] === action && this.keys[key] && !this.lastKeys[key]
        );
    }

    /**
     * Called at the end of the update loop to store the current keys
     */
    postUpdate() {
        this.lastKeys = { ...this.keys };
    }
}

export const inputHandler = new InputHandler();
