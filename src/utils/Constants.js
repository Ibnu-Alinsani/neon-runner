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
        MAX_HEIGHT: 90,
        START_SPEED: 350,
        SPEED_INCREMENT: 0.1,
        INITIAL_INTERVAL: 2000,
        MIN_INTERVAL: 600,
        INTERVAL_DECREMENT: 10,
        COLOR: '#ff007f'
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
