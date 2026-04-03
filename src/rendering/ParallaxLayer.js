import { renderer } from './Renderer';

/**
 * Base ParallaxLayer - Handles general movement and looping logic
 */
export class ParallaxLayer {
    constructor(ctx, speedFactor, color) {
        this.ctx = ctx;
        this.speedFactor = speedFactor;
        this.color = color;
        this.elements = [];

        // Wide-field initial bounds (Covering any potential screen)
        this.worldWidth = 2000;
        this.worldHeight = 500;

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
        const { width } = renderer;
        const offset = performance.now() * this.speedFactor;
        
        this.ctx.save();
        this.ctx.fillStyle = this.color;
        
        this.elements.forEach(el => {
            // Dynamic wrap-around based on current screen width
            let posX = (el.x - offset) % width;
            if (posX < 0) posX += width;
            
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
