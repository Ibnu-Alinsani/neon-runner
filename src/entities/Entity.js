/**
 * Base Entity - The foundation for all objects in the game
 */
export class Entity {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isActive = true;
    }

    /**
     * Update logic (override in subclass)
     * @param {number} dt - Delta time
     */
    update(dt) {
        // Implement in subclass
    }

    /**
     * Render logic (override in subclass)
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        // Implement in subclass
    }

    /**
     * Simple AABB Collision Detection
     * @param {Entity} other 
     * @returns {boolean}
     */
    collidesWith(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}
