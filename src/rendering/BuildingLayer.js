import { ParallaxLayer } from './ParallaxLayer';

/**
 * BuildingLayer - Silhouetted neon buildings with various heights
 */
export class BuildingLayer extends ParallaxLayer {
    constructor(ctx, speedFactor, color) {
        super(ctx, speedFactor, color);
    }

    /**
     * Generate buildings across the screen
     */
    setup() {
        let currentX = 0;
        while (currentX < this.width * 2) {
            const w = 50 + Math.random() * 100;
            const h = 50 + Math.random() * 200;
            this.elements.push({ x: currentX, w, h });
            currentX += w + 20 + Math.random() * 50;
        }
    }

    /**
     * Render the building at the calculated position
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} posX 
     * @param {object} el 
     */
    drawElement(ctx, posX, el) {
        ctx.fillRect(posX, this.height - el.h - 20, el.w, el.h);
    }
}
