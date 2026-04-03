/**
 * NEON RUNNER - Native JS Game Engine
 * ----------------------------------
 * This engine demonstrates the core principles of game development:
 * 1. The Game Loop (Update & Draw)
 * 2. Delta Time (Frame-rate independence)
 * 3. Physics & Collision Detection
 * 4. State Management
 */

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Logical resolution (independent of CSS size)
        this.canvas.width = 900;
        this.canvas.height = 500;

        // Game State
        this.state = 'MENU'; // MENU, PLAYING, GAMEOVER
        this.score = 0;
        this.lastTime = 0;
        this.deltaTime = 0;

        // Entites
        this.player = null;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 1500; // ms between obstacles

        // DOM Elements
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameoverOverlay = document.getElementById('gameover-overlay');
        this.hud = document.getElementById('hud');
        this.scoreVal = document.getElementById('score-val');
        this.finalScore = document.getElementById('final-score');

        // Bind Events
        document.getElementById('start-btn').addEventListener('click', (e) => {
            e.target.blur();
            this.start();
        });
        document.getElementById('restart-btn').addEventListener('click', (e) => {
            e.target.blur();
            this.start();
        });

        // Input Handling
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // Start the engine loop
        requestAnimationFrame((time) => this.loop(time));
    }

    start() {
        this.state = 'PLAYING';
        this.score = 0;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.player = new Player(this);

        // UI Updates
        this.menuOverlay.classList.add('hidden');
        this.gameoverOverlay.classList.add('hidden');
        this.hud.classList.remove('hidden');
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.gameoverOverlay.classList.remove('hidden');
        this.finalScore.textContent = `SCORE: ${Math.floor(this.score)}`;
        this.hud.classList.add('hidden');
    }

    /**
     * The Heartbeat: requestAnimationFrame ensures smooth 60fps
     * @param {number} time - Current timestamp from browser
     */
    loop(time) {
        // Calculate Delta Time (Time passed since last frame in seconds)
        // Corrects movement speed regardless of monitor Refresh Rate (Hz)
        this.deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.state === 'PLAYING') {
            this.update();
        }

        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        // 1. Update Player
        this.player.update(this.deltaTime, this.keys);

        // 2. Manage Obstacles
        this.obstacleTimer += this.deltaTime * 1000;
        if (this.obstacleTimer > this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
            // Gradually increase difficulty
            this.obstacleInterval = Math.max(600, this.obstacleInterval - 10);
        }

        // 3. Update & Clean up obstacles
        this.obstacles.forEach((obs, index) => {
            obs.update(this.deltaTime);

            // Collision Detection (AABB)
            if (this.checkCollision(this.player, obs)) {
                this.gameOver();
            }

            // Remove if off screen
            if (obs.x + obs.width < 0) {
                this.obstacles.splice(index, 1);
                this.score += 10;
                this.scoreVal.textContent = Math.floor(this.score);
            }
        });

        // 4. Update Score (Survival bonus)
        this.score += this.deltaTime * 5;
        this.scoreVal.textContent = Math.floor(this.score);
    }

    draw() {
        // Clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Background Grid (Esthetic)
        this.drawGrid();

        if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
            // Draw Player
            this.player.draw(this.ctx);

            // Draw Obstacles
            this.obstacles.forEach(obs => obs.draw(this.ctx));
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
        this.ctx.lineWidth = 1;
        const spacing = 40;
        const offset = (performance.now() / 50) % spacing;

        for (let x = -offset; x < this.canvas.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    spawnObstacle() {
        const height = 30 + Math.random() * 60;
        this.obstacles.push(new Obstacle(this.canvas.width, height));
    }

    checkCollision(player, obs) {
        return (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        );
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 40;
        this.x = 100;
        this.y = this.game.canvas.height - this.height - 20;

        // Physics
        this.velocityY = 0;
        this.gravity = 1500; // Pixels per second^2
        this.jumpForce = -600;
        this.onGround = true;
        this.groundY = this.game.canvas.height - this.height - 20;

        // Visuals
        this.color = '#00f3ff';
    }

    update(dt, keys) {
        // Input: Jump
        if ((keys['Space'] || keys['ArrowUp']) && this.onGround) {
            console.log("Jump");

            this.velocityY = this.jumpForce;
            this.onGround = false;
        }

        // Apply Gravity
        this.velocityY += this.gravity * dt;
        this.y += this.velocityY * dt;

        // Ground Collision
        if (this.y > this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.onGround = true;
        }
    }

    draw(ctx) {
        ctx.save();
        // Neon Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Draw Player Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Highlight
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);

        ctx.restore();
    }
}

class Obstacle {
    constructor(startX, height) {
        this.width = 30;
        this.height = height;
        this.x = startX;
        this.y = 500 - height - 20; // Bound to ground
        this.speed = 350; // Pixels per second
        this.color = '#ff007f';
    }

    update(dt) {
        this.x -= this.speed * dt;
        // Increase speed slightly over time
        this.speed += 0.1;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Warning outline
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
    new GameEngine();
});
