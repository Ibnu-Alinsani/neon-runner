import { Entity } from './Entity';
import { CONSTANTS } from '../utils/Constants';
import { renderer } from '../rendering/Renderer';

/**
 * Obstacle Entity - Moving from right to left
 */
export class Obstacle extends Entity {
    constructor(startX, height) {
        const { WIDTH, COLOR, START_SPEED } = CONSTANTS.OBSTACLE;
        super(startX, CONSTANTS.RESOLUTION.HEIGHT - height - CONSTANTS.PLAYER.GROUND_MARGIN, WIDTH, height, COLOR);
        
        this.speed = START_SPEED;
    }

    /**
     * Move obstacle and update speed
     * @param {number} dt - Fixed Delta Time
     */
    update(dt) {
        this.x -= this.speed * dt;
        // Increase speed slightly over time (using global constant)
        this.speed += CONSTANTS.OBSTACLE.SPEED_INCREMENT;
    }

    /**
     * Render obstacle with Neon Glow
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();
        
        renderer.setGlow(this.color, 10);
        
        // Draw Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Warning pattern (Neon Dash)
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}
