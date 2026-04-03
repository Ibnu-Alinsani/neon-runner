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
     * Render all active particles with global composition for glow
     */
    draw() {
        this.ctx.save();
        
        // Additive blending for that intense neon glow effect
        this.ctx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (p.active) {
                const alpha = p.life / p.maxLife;
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha;
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.restore();
    }
}
