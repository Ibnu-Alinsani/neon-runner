import { CONSTANTS } from '../utils/Constants';

/**
 * Camera - Handles Screen Shake and View Transforms
 */
export class Camera {
    constructor(ctx) {
        this.ctx = ctx;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        
        // Shake settings
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
    }

    /**
     * Trigger a screen shake with decreasing intensity
     * @param {number} intensity - Max vibration pixel offset
     * @param {number} duration - Seconds to shake
     */
    shake(intensity = CONSTANTS.CAMERA.DEFAULT_SHAKE_INTENSITY, 
          duration = CONSTANTS.CAMERA.DEFAULT_SHAKE_DURATION) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    /**
     * Update camera timers and calculate current offsets
     * @param {number} dt - Fixed Delta Time
     */
    update(dt) {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            
            // Calculate current intensity (linear decrease)
            const currentIntensity = (this.shakeTimer / this.shakeDuration) * this.shakeIntensity;
            
            // Random vibration
            this.x = (Math.random() - 0.5) * currentIntensity * 2;
            this.y = (Math.random() - 0.5) * currentIntensity * 2;
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    /**
     * Apply the current camera transform to the context
     */
    apply() {
        this.ctx.save();
        
        // Translate for shake and zoom
        // Note: Zoom is applied from center (optional refinement for later)
        if (this.zoom !== 1) {
            const centerX = CONSTANTS.RESOLUTION.WIDTH / 2;
            const centerY = CONSTANTS.RESOLUTION.HEIGHT / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(this.zoom, this.zoom);
            this.ctx.translate(-centerX, -centerY);
        }
        
        this.ctx.translate(this.x, this.y);
    }

    /**
     * Restore the context state after drawing
     */
    restore() {
        this.ctx.restore();
    }
}
