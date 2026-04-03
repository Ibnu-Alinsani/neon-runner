import { Entity } from './Entity';
import { CONSTANTS } from '../utils/Constants';
import { inputHandler, ACTIONS } from '../core/InputHandler';
import { renderer } from '../rendering/Renderer';
import { eventBus } from '../core/EventBus';

/**
 * Player Entity - Handles Jump, Slide, and Physics
 */
export class Player extends Entity {
    constructor() {
        const { WIDTH, HEIGHT, START_X, GROUND_MARGIN, COLOR } = CONSTANTS.PLAYER;
        super(START_X, CONSTANTS.RESOLUTION.HEIGHT - HEIGHT - GROUND_MARGIN, WIDTH, HEIGHT, COLOR);
        
        // Physics
        this.velocityY = 0;
        this.gravity = CONSTANTS.PHYSICS.GRAVITY;
        this.jumpForce = CONSTANTS.PHYSICS.JUMP_FORCE;
        this.maxJumps = CONSTANTS.PHYSICS.MAX_JUMPS;
        this.jumpCount = 0;
        
        this.groundY = CONSTANTS.RESOLUTION.HEIGHT - HEIGHT - GROUND_MARGIN;
        this.onGround = true;

        // Visuals
        this.trailTimer = 0;
    }

    /**
     * Handle Jump logic and Gravity
     * @param {number} dt - Fixed Delta Time
     */
    update(dt) {
        // Input Handling using Command Pattern
        if (inputHandler.isActionJustPressed(ACTIONS.JUMP) && this.jumpCount < this.maxJumps) {
            this.velocityY = this.jumpForce;
            this.jumpCount++;
            this.onGround = false;

            // Emit Jump particles
            eventBus.emit('PLAYER_JUMP', { x: this.x + this.width / 2, y: this.y + this.height });
        }

        // Apply Gravity
        this.velocityY += this.gravity * dt;
        this.y += this.velocityY * dt;

        // Ground Collision
        if (this.y > this.groundY) {
            // Signal landing if we were airborne
            if (!this.onGround) {
                eventBus.emit('PLAYER_LAND', { x: this.x + this.width / 2, y: this.groundY + this.height });
            }

            this.y = this.groundY;
            this.velocityY = 0;
            this.onGround = true;
            this.jumpCount = 0;
        }

        // Particle Trail while on ground
        if (this.onGround) {
            this.trailTimer += dt;
            if (this.trailTimer > 0.05) {
                eventBus.emit('PLAYER_TRAIL', { x: this.x, y: this.y + this.height });
                this.trailTimer = 0;
            }
        }
    }

    /**
     * Render the player with Neon Glow
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();
        
        // Use the professional renderer glow styling
        renderer.setGlow(this.color, 15);
        
        // Draw Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add neon highlight
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        
        ctx.restore();
    }
}
