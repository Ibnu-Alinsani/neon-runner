/**
 * Neon Runner - Global Constants
 */
export const CONSTANTS = {
    // Virtual resolution (Internal coordinate system)
    RESOLUTION: {
        WIDTH: 900,
        HEIGHT: 500
    },

    // Physics
    PHYSICS: {
        GRAVITY: 1500,
        JUMP_FORCE: -600,
        MAX_JUMPS: 2
    },

    // Entity Settings
    PLAYER: {
        WIDTH: 40,
        HEIGHT: 40,
        START_X: 100,
        GROUND_MARGIN: 20,
        COLOR: '#00f3ff'
    },

    OBSTACLE: {
        WIDTH: 30,
        MIN_HEIGHT: 30,
        MAX_HEIGHT: 120,
        TYPES: {
            GROUND: 'GROUND',
            FLYING: 'FLYING',
            HIGH: 'HIGH'
        },
        START_SPEED: 250,
        SPEED_EXPONENT: 0.45, // Smoother growth
        SPEED_MULT: 15,
        MAX_SPEED: 1000,
        INITIAL_INTERVAL: 2000,
        MIN_INTERVAL: 400,
        COLOR: '#ff007f'
    },

    // Gameplay Logic
    GAMEPLAY: {
        NEAR_MISS_THRESHOLD: 15, // Pixels
        NEAR_MISS_BONUS: 25,
        SLIDE_HEIGHT_FACTOR: 0.5 // Hitbox shrinks to 50% height
    },

    // Level Progression (Score based)
    LEVELS: [
        { score: 0, color: '#00f3ff', label: 'CYBER' },
        { score: 1000, color: '#ff00ff', label: 'NEURAL' },
        { score: 3000, color: '#00ff7f', label: 'VOID' }
    ],

    // Visual FX Settings
    PARTICLES: {
        MAX_COUNT: 200,
        DEFAULT_LIFE: 0.8,
        DEFAULT_SIZE: 3,
        SPEED_RANGE: 150
    },

    CAMERA: {
        DEFAULT_SHAKE_INTENSITY: 5,
        DEFAULT_SHAKE_DURATION: 0.3
    },

    // Colors (Neon Palette)
    COLORS: {
        NEON_BLUE: '#00f3ff',
        NEON_PINK: '#ff007f',
        NEON_TEAL: '#a7ffeb',
        NEON_RED: '#ff3e3e',
        BG_GRID: 'rgba(0, 243, 255, 0.05)',
        STARS: '#ffffff'
    }
};
