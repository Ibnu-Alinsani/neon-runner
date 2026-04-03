import { CONSTANTS } from '../utils/Constants';

/**
 * Renderer - Handles Canvas scaling and rendering context
 */
class Renderer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Logical resolution
        this.width = CONSTANTS.RESOLUTION.WIDTH;
        this.height = CONSTANTS.RESOLUTION.HEIGHT;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Auto-scaling logic (Maintain Aspect Ratio)
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        const scale = Math.min(width / this.width, height / this.height);

        this.canvas.style.width = `${this.width * scale}px`;
        this.canvas.style.height = `${this.height * scale}px`;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Set the global neon glow style
     * @param {string} color - Glow color
     * @param {number} blur - Glow amount
     */
    setGlow(color, blur = 15) {
        this.ctx.shadowBlur = blur;
        this.ctx.shadowColor = color;
    }

    /**
     * Disable the neon glow
     */
    disableGlow() {
        this.ctx.shadowBlur = 0;
    }
}

export const renderer = new Renderer();
export const ctx = renderer.ctx;
