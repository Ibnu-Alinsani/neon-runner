import { CONSTANTS } from '../utils/Constants';

/**
 * ParticleSystem - High-performance Object-Pooled particle engine
 */
export class ParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.pool = [];
        this.maxParticles = CONSTANTS.PARTICLES.MAX_COUNT;
        
        // Pre-allocate the pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.pool.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                life: 0,
                maxLife: 0,
                color: '#fff',
                size: 0,
                active: false
            });
        }
    }

    /**
     * Emit a burst of particles from a specific point
     * @param {number} x - Origin X
     * @param {number} y - Origin Y
     * @param {string} color - Hex/RGB color
     * @param {number} count - Number of particles to spawn
     * @param {number} speedMult - Speed multiplier (for variations)
     * @param {number} gameSpeed - Current game momentum
     */
    emit(x, y, color, count = 10, speedMult = 1.0, gameSpeed = 0) {
        let spawned = 0;
        const speedFactor = gameSpeed / 250; // Reference to start speed
        const range = CONSTANTS.PARTICLES.SPEED_RANGE * speedMult;

        for (let i = 0; i < this.maxParticles && spawned < count; i++) {
            const p = this.pool[i];
            if (!p.active) {
                p.active = true;
                p.x = x;
                p.y = y;
                
                // PHYSICS: Outward burst + Heavy wind drag based on gameSpeed
                // vx is biased heavily to the left as gameSpeed increases
                p.vx = ((Math.random() - 0.5) * range) - (gameSpeed * 0.8 * Math.random());
                p.vy = (Math.random() - 0.5) * range;
                
                // LIFESPAN: Shorter lifespan at high speeds for "whipped away" look
                p.life = (CONSTANTS.PARTICLES.DEFAULT_LIFE / speedFactor) * (0.5 + Math.random() * 0.5);
                p.maxLife = p.life;
                
                p.color = color;
                p.size = CONSTANTS.PARTICLES.DEFAULT_SIZE * (0.5 + Math.random() * 0.5);
                spawned++;
            }
        }
    }

    /**
     * Update all active particles using delta time
     * @param {number} dt - Fixed Delta Time
     */
    update(dt) {
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (p.active) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                
                // Add minor gravity to particles for natural feel
                p.vy += 300 * dt;
                
                p.life -= dt;
                if (p.life <= 0) {
                    p.active = false;
                }
            }
        }
    }

    /**
     * Render all active particles with Kinetic Elasticity (Streaks)
     * @param {number} gameSpeed - Current game velocity for stretching
     */
    draw(gameSpeed = 0) {
        const { ctx } = this;
        ctx.save();
        
        // Additive blending for that intense neon glow effect
        ctx.globalCompositeOperation = 'lighter';
        
        const stretchMult = Math.min(1.5, Math.max(1, (gameSpeed / 400))); // Dynamic stretch factor

        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (p.active) {
                const alpha = Math.max(0, p.life / p.maxLife);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                
                // --- KINETIC STRETCH (Elasticity) ---
                // If moving fast, draw as a streak/line
                const streakLength = Math.abs(p.vx * 0.05) * stretchMult;
                
                if (streakLength > 5) {
                    ctx.beginPath();
                    ctx.lineWidth = p.size * 1.5;
                    ctx.strokeStyle = p.color;
                    ctx.lineCap = 'round';
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - (p.vx * 0.02 * stretchMult), p.y);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        ctx.restore();
    }
}
