import { CONSTANTS } from '../utils/Constants';

/**
 * Base ParallaxLayer - Handles general movement and looping logic
 */
export class ParallaxLayer {
    constructor(ctx, speedFactor, color) {
        this.ctx = ctx;
        this.speedFactor = speedFactor;
        this.color = color;
        this.width = CONSTANTS.RESOLUTION.WIDTH;
        this.height = CONSTANTS.RESOLUTION.HEIGHT;
        this.elements = [];

        // Setup individual elements (to be overridden by subclasses)
        this.setup();
    }

    /**
     * Set up random elements once during construction
     */
    setup() {
        // Implement in subclass
    }

    /**
     * Render the layer with parallax movement
     */
    draw() {
        const offset = performance.now() * this.speedFactor;
        
        this.ctx.save();
        this.ctx.fillStyle = this.color;
        
        this.elements.forEach(el => {
            // Logika bungkus (wrap-around)
            let posX = (el.x - offset) % this.width;
            if (posX < 0) posX += this.width;
            
            this.drawElement(this.ctx, posX, el);
        });

        this.ctx.restore();
    }

    /**
     * Helper to draw a specific element type (to be overridden)
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} posX 
     * @param {object} el 
     */
    drawElement(ctx, posX, el) {
        // Implement in subclass
    }
}
