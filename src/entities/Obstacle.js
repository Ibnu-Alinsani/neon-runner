import { Entity } from './Entity';
import { CONSTANTS } from '../utils/Constants';
import { renderer } from '../rendering/Renderer';

/**
 * Obstacle Entity - Moving from right to left
 */
export class Obstacle extends Entity {
    constructor(startX, height, type = CONSTANTS.OBSTACLE.TYPES.GROUND) {
        const { WIDTH, COLOR, START_SPEED } = CONSTANTS.OBSTACLE;
        
        // Default ground position
        const groundLevel = CONSTANTS.RESOLUTION.HEIGHT - CONSTANTS.PLAYER.GROUND_MARGIN;
        let y = groundLevel - height;
        
        // Adjust Y based on type
        if (type === CONSTANTS.OBSTACLE.TYPES.FLYING) {
            // Right in the double-jump path
            y = groundLevel - 180 - height;
        } else if (type === CONSTANTS.OBSTACLE.TYPES.HIGH) {
            // Top-hanging hazard (Slide under this)
            y = groundLevel - 150; 
        }

        super(startX, y, WIDTH, height, COLOR);
        
        this.type = type;
    }

    /**
     * Move obstacle based on global speed
     * @param {number} dt - Fixed Delta Time
     * @param {number} gameSpeed - Central game speed
     */
    update(dt, gameSpeed) {
        this.x -= gameSpeed * dt;
    }

    /**
     * Render obstacle with type-specific visuals
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();
        
        switch (this.type) {
            case CONSTANTS.OBSTACLE.TYPES.HIGH:
                // HANGING HAZARD: Looks like a laser or electric wire
                renderer.setGlow(this.color, 15);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, 10); // Thin bar
                // Dangling visual elements
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y);
                ctx.lineTo(this.x + this.width/2, 0); // Connect to top
                ctx.stroke();
                
                // CRITICAL: Reset line dash to prevent leakage
                ctx.setLineDash([]);
                renderer.disableGlow();
                break;

            case CONSTANTS.OBSTACLE.TYPES.FLYING:
                // DRONE/SHARD: Smaller and more aggressive
                renderer.setGlow(this.color, 10);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.height/2);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.fill();
                break;

            default:
                // GROUND: Solid block
                renderer.setGlow(this.color, 10);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}
