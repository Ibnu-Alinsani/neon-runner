import { ParallaxLayer } from './ParallaxLayer';

/**
 * StarLayer - Distant stars with random positions and sizes
 */
export class StarLayer extends ParallaxLayer {
    constructor(ctx, speedFactor, color) {
        super(ctx, speedFactor, color);
    }

    /**
     * Generate 100 random stars
     */
    setup() {
        for (let i = 0; i < 150; i++) { // Increased count for wider coverage
            this.elements.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                size: Math.random() * 2 + 1
            });
        }
    }

    /**
     * Render the star at the calculated position
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} posX 
     * @param {object} el 
     */
    drawElement(ctx, posX, el) {
        ctx.beginPath();
        ctx.arc(posX, el.y, el.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
