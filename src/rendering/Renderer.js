import { CONSTANTS } from '../utils/Constants';

/**
 * Renderer - Handles Canvas scaling and rendering context
 */
class Renderer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Logical resolution (default, will be updated by resize)
        this.width = 900;
        this.height = 500;

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. SET PHYSICAL DIMENSIONS (High-DPI)
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        // 2. SET LOGICAL DIMENSIONS
        // Fixed Height (500) | Fluid Width (Depends on Ratio)
        this.height = 500;
        this.width = (width / height) * 500;

        // 3. SCALE THE CONTEXT
        const scale = (height * dpr) / 500;
        this.ctx.scale(scale, scale);
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
