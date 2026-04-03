import { CONSTANTS } from '../utils/Constants';
import { renderer } from '../rendering/Renderer';
import { inputHandler } from './InputHandler';
import { eventBus } from './EventBus';
import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { StarLayer } from '../rendering/StarLayer';
import { BuildingLayer } from '../rendering/BuildingLayer';
import { ParticleSystem } from '../fx/ParticleSystem';
import { Camera } from '../fx/Camera';

/**
 * Engine - The Central Authority for the game.
 * Implements a Fixed Time-Step Game Loop.
 */
class Engine {
    constructor() {
        this.ctx = renderer.ctx;
        this.state = 'MENU';
        this.score = 0;
        
        // Timing
        this.lastTime = performance.now();
        this.accumulatedTime = 0;
        this.fixedDeltaTime = 1 / 60; // 60Hz logic

        // Game Entities
        this.player = null;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = CONSTANTS.OBSTACLE.INITIAL_INTERVAL;

        // Visual Systems
        this.particles = new ParticleSystem(this.ctx);
        this.camera = new Camera(this.ctx);

        // Background Layers
        this.backgroundLayers = [
            new StarLayer(this.ctx, 0.05, CONSTANTS.COLORS.STARS),
            new BuildingLayer(this.ctx, 0.15, CONSTANTS.COLORS.BG_GRID)
        ];

        // Register Event Listeners
        eventBus.on('PLAYER_JUMP', (pos) => {
            this.particles.emit(pos.x, pos.y, CONSTANTS.COLORS.NEON_BLUE, 10, 0.5);
        });
        eventBus.on('PLAYER_LAND', (pos) => {
            this.particles.emit(pos.x, pos.y, CONSTANTS.COLORS.NEON_BLUE, 15, 0.8);
            this.camera.shake(5, 0.2); // Subtle landing shake
        });
        eventBus.on('PLAYER_TRAIL', (pos) => {
            this.particles.emit(pos.x, pos.y, CONSTANTS.COLORS.NEON_BLUE, 1, 0.2);
        });

        // UI Overlays
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameoverOverlay = document.getElementById('gameover-overlay');
        this.hud = document.getElementById('hud');
        this.scoreVal = document.getElementById('score-val');
        this.finalScore = document.getElementById('final-score');

        this.init();
    }

    init() {
        document.getElementById('start-btn').addEventListener('click', (e) => {
            e.target.blur();
            this.start();
        });
        document.getElementById('restart-btn').addEventListener('click', (e) => {
            e.target.blur();
            this.start();
        });

        requestAnimationFrame((t) => this.loop(t));
    }

    start() {
        this.state = 'PLAYING';
        this.score = 0;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = CONSTANTS.OBSTACLE.INITIAL_INTERVAL;
        this.player = new Player();
        
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
     * Fixed Time-Step Game Loop
     */
    loop(currentTime) {
        const frameTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Avoid "Spiral of Death" on slow devices
        this.accumulatedTime += Math.min(frameTime, 0.25);

        // Update logic in fixed steps
        while (this.accumulatedTime >= this.fixedDeltaTime) {
            if (this.state === 'PLAYING') {
                this.update(this.fixedDeltaTime);
            }
            this.camera.update(this.fixedDeltaTime);
            this.particles.update(this.fixedDeltaTime);
            inputHandler.postUpdate();
            this.accumulatedTime -= this.fixedDeltaTime;
        }

        // Always render at the monitor's refresh rate
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.player.update(dt);

        // Obstacle Spawning
        this.obstacleTimer += dt * 1000;
        if (this.obstacleTimer > this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
            this.obstacleInterval = Math.max(CONSTANTS.OBSTACLE.MIN_INTERVAL, 
                                           this.obstacleInterval - CONSTANTS.OBSTACLE.INTERVAL_DECREMENT);
        }

        // Obstacle Updates & Collision
        this.obstacles.forEach((obs, index) => {
            obs.update(dt);
            
            if (this.player.collidesWith(obs)) {
                this.camera.shake(15, 0.5); // Intense shake on crash
                this.particles.emit(this.player.x + 20, this.player.y + 20, CONSTANTS.COLORS.NEON_RED, 30, 2);
                this.gameOver();
            }

            if (obs.x + obs.width < 0) {
                this.obstacles.splice(index, 1);
                this.score += 10;
            }
        });

        this.score += dt * 5;
        this.scoreVal.textContent = Math.floor(this.score);
    }

    draw() {
        renderer.clear();
        
        this.camera.apply();

        // Draw Parallax
        this.backgroundLayers.forEach(layer => layer.draw());

        // Draw Grid
        this.drawGrid();

        if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
            this.player.draw(this.ctx);
            this.obstacles.forEach(obs => obs.draw(this.ctx));
            this.particles.draw();
        }

        this.camera.restore();
    }

    drawGrid() {
        const { ctx, width, height } = renderer;
        ctx.save();
        ctx.strokeStyle = CONSTANTS.COLORS.BG_GRID;
        ctx.lineWidth = 1;
        const spacing = 40;
        const offset = (performance.now() / 50) % spacing;

        for (let x = -offset; x < width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    spawnObstacle() {
        const h = CONSTANTS.OBSTACLE.MIN_HEIGHT + Math.random() * (CONSTANTS.OBSTACLE.MAX_HEIGHT - CONSTANTS.OBSTACLE.MIN_HEIGHT);
        this.obstacles.push(new Obstacle(renderer.width, h));
    }
}

export const engine = new Engine();
