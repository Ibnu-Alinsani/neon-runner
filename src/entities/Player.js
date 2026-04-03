import { Entity } from './Entity';
import { CONSTANTS } from '../utils/Constants';
import { inputHandler, ACTIONS } from '../core/InputHandler';
import { renderer } from '../rendering/Renderer';
import { eventBus } from '../core/EventBus';
import { lerp } from '../utils/Math';

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

        // Slide & Animation
        this.isSliding = false;
        this.originalHeight = HEIGHT;
        this.slideHeight = HEIGHT * CONSTANTS.GAMEPLAY.SLIDE_HEIGHT_FACTOR;
        this.targetHeight = HEIGHT;

        // Visuals
        this.trailTimer = 0;
    }

    /**
     * Handle Jump logic and Gravity
     * @param {number} dt - Fixed Delta Time
     */
    update(dt, isBlockedFromStanding = false) {
        // 1. Input: Slide
        const slideIntent = inputHandler.isActionActive(ACTIONS.SLIDE);
        if (slideIntent && this.onGround) {
            if (!this.isSliding) eventBus.emit('PLAYER_SLIDE_START');
            this.targetHeight = this.slideHeight;
            this.isSliding = true;
        } else if (this.isSliding && (!slideIntent || !isBlockedFromStanding)) {
            eventBus.emit('PLAYER_SLIDE_END');
            this.targetHeight = this.originalHeight;
            this.isSliding = false;
        }

        // 2. Smooth Height Interpolation (Polishing)
        if (this.height !== this.targetHeight) {
            this.height = lerp(this.height, this.targetHeight, 0.2);
            // Lock height if very close
            if (Math.abs(this.height - this.targetHeight) < 0.1) {
                this.height = this.targetHeight;
            }
        }

        // 3. Keep Feet Grounded
        if (this.onGround) {
            const bottomY = this.groundY + this.originalHeight;
            this.y = bottomY - this.height;
        }

        // 4. Input: Jump
        if (inputHandler.isActionJustPressed(ACTIONS.JUMP) && this.jumpCount < this.maxJumps && !this.isSliding) {
            this.velocityY = this.jumpForce;
            this.jumpCount++;
            this.onGround = false;
            eventBus.emit('PLAYER_JUMP', { x: this.x + this.width / 2, y: this.y + this.height });
        }

        // 5. Apply Gravity
        this.velocityY += this.gravity * dt;
        this.y += this.velocityY * dt;

        // 6. Ground Collision
        const floorY = this.groundY + this.originalHeight;
        if (this.y + this.height > floorY) {
            if (!this.onGround) {
                eventBus.emit('PLAYER_LAND', { x: this.x + this.width / 2, y: floorY });
            }
            this.y = floorY - this.height;
            this.velocityY = 0;
            this.onGround = true;
            this.jumpCount = 0;
        }

        // 7. Particle Trail
        if (this.onGround) {
            this.trailTimer += dt;
            if (this.trailTimer > (this.isSliding ? 0.02 : 0.05)) {
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
        
        // Intensity increase while sliding
        renderer.setGlow(this.color, this.isSliding ? 25 : 15);
        
        ctx.fillStyle = this.color;
        
        if (this.isSliding) {
            // Sliding Visual: A wider, thinner rectangle
            ctx.fillRect(this.x - 5, this.y, this.width + 10, this.height);
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + (this.isSliding ? 0 : 5), this.y + 5, 
                        (this.isSliding ? this.width : this.width - 10), 
                        this.height - 10);
        
        ctx.restore();
    }
}
