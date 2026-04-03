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
import { lerpColor, hexToRgba } from '../utils/Math';
import { audioManager } from './AudioManager';

/**
 * Engine - The Central Authority for the game.
 * Implements a Fixed Time-Step Game Loop.
 */
class Engine {
    constructor() {
        this.ctx = renderer.ctx;
        this.state = 'MENU';
        this.score = 0;
        
        // Persistence
        this.highScore = parseInt(localStorage.getItem(CONSTANTS.GAMEPLAY.STORAGE_KEY)) || 0;
        
        // Dynamic Difficulty
        this.gameSpeed = CONSTANTS.OBSTACLE.START_SPEED;
        this.speedFactor = 1.0;
        
        // Timing
        this.lastTime = performance.now();
        this.accumulatedTime = 0;
        this.fixedDeltaTime = 1 / 60;

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

        // Progression & Rhythms
        this.currentLevel = CONSTANTS.LEVELS[0];
        this.themeColor = CONSTANTS.COLORS.NEON_BLUE;
        this.nearMissedObstacles = new Set();
        
        this.patterns = [
            [1000, 'GROUND', 40], 
            [1200, 'GROUND', 50], 
            [1500, 'HIGH', 10],   
            [1200, 'FLYING', 30], 
            [1000, 'GROUND', 40], 
            [2000, 'HIGH', 10],   
            [800, 'GROUND', 30], 
            [800, 'GROUND', 30], 
            [1500, 'FLYING', 40]
        ];
        this.patternIndex = 0;

        // Register Event Listeners
        eventBus.on('PLAYER_JUMP', (pos) => {
            this.particles.emit(pos.x, pos.y, this.themeColor, 10, 0.5, this.gameSpeed);
        });
        eventBus.on('PLAYER_LAND', (pos) => {
            this.particles.emit(pos.x, pos.y, this.themeColor, 15, 0.8, this.gameSpeed);
            this.camera.shake(5, 0.2); 
        });
        eventBus.on('PLAYER_TRAIL', (pos) => {
            this.particles.emit(pos.x, pos.y, this.themeColor, 1, 0.2, this.gameSpeed);
        });

        // UI Overlays
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameoverOverlay = document.getElementById('gameover-overlay');
        this.hud = document.getElementById('hud');
        this.scoreVal = document.getElementById('score-val');
        this.bestVal = document.getElementById('best-val');
        this.finalScore = document.getElementById('final-score');

        this.init();
    }

    init() {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const muteBtn = document.getElementById('mute-btn');
        const muteIcon = document.getElementById('mute-icon');

        const onStart = (e) => {
            e.preventDefault();
            e.target.blur();
            this.start();
        };

        const onMute = (e) => {
            e.preventDefault();
            e.target.blur();
            const isMuted = audioManager.masterMute.gain.value === 0;
            if (isMuted) {
                audioManager.masterMute.gain.value = 1.0;
                muteIcon.textContent = '🔊';
            } else {
                audioManager.masterMute.gain.value = 0;
                muteIcon.textContent = '🔇';
            }
        };

        // Click & Touch Support for all UI
        startBtn.addEventListener('click', onStart);
        startBtn.addEventListener('touchstart', onStart, { passive: false });
        
        restartBtn.addEventListener('click', onStart);
        restartBtn.addEventListener('touchstart', onStart, { passive: false });

        muteBtn.addEventListener('click', onMute);
        muteBtn.addEventListener('touchstart', onMute, { passive: false });

        // Initial high score display
        if (this.bestVal) this.bestVal.textContent = Math.floor(this.highScore);

        requestAnimationFrame((t) => this.loop(t));
    }

    start() {
        this.state = 'PLAYING';
        this.score = 0;
        this.gameSpeed = CONSTANTS.OBSTACLE.START_SPEED;
        this.speedFactor = 1.0;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = CONSTANTS.OBSTACLE.INITIAL_INTERVAL;
        this.player = new Player();
        
        // Update High Score Display
        if (this.bestVal) this.bestVal.textContent = Math.floor(this.highScore);

        this.menuOverlay.classList.add('hidden');
        this.gameoverOverlay.classList.add('hidden');
        this.hud.classList.remove('hidden');

        eventBus.emit('GAME_START');
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.saveHighScore();
        this.gameoverOverlay.classList.remove('hidden');
        this.finalScore.textContent = `SCORE: ${Math.floor(this.score)}`;
        this.hud.classList.add('hidden');
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(CONSTANTS.GAMEPLAY.STORAGE_KEY, Math.floor(this.highScore));
        }
    }

    loop(currentTime) {
        const frameTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.accumulatedTime += Math.min(frameTime, 0.25);

        while (this.accumulatedTime >= this.fixedDeltaTime) {
            if (this.state === 'PLAYING') {
                this.update(this.fixedDeltaTime);
            }
            this.camera.update(this.fixedDeltaTime);
            this.particles.update(this.fixedDeltaTime);
            inputHandler.postUpdate();
            this.accumulatedTime -= this.fixedDeltaTime;
        }

        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // 1. Safe-Exit Logic
        const isBlocked = this.obstacles.some(obs => 
            obs.type === CONSTANTS.OBSTACLE.TYPES.HIGH &&
            this.player.x < obs.x + obs.width &&
            this.player.x + this.player.width > obs.x
        );

        this.player.update(dt, isBlocked);

        // 2. Obstacle Spawning
        this.obstacleTimer += dt * 1000;
        if (this.obstacleTimer > this.obstacleInterval) {
            this.spawnFromPattern();
            this.obstacleTimer = 0;
        }

        // 3. Obstacle Updates & Collision & Near-Miss
        this.obstacles.forEach((obs, index) => {
            obs.update(dt, this.gameSpeed);
            
            if (this.player.collidesWith(obs)) {
                this.camera.shake(15, 0.5); 
                this.particles.emit(this.player.x + 20, this.player.y + 20, CONSTANTS.COLORS.NEON_RED, 30, 2, this.gameSpeed);
                eventBus.emit('COLLISION');
                this.gameOver();
            }

            if (this.state === 'PLAYING' && !this.nearMissedObstacles.has(obs)) {
                const dist = this.getDistance(this.player, obs);
                if (dist < CONSTANTS.GAMEPLAY.NEAR_MISS_THRESHOLD) {
                    this.handleNearMiss(obs);
                }
            }

            if (obs.x + obs.width < 0) {
                this.obstacles.splice(index, 1);
                this.nearMissedObstacles.delete(obs);
                this.score += 10;
            }
        });

        // 4. Progression & Score
        this.updateProgression(dt);
        this.score += dt * (5 * this.speedFactor);
        this.scoreVal.textContent = Math.floor(this.score);

        // Real-time High Score Update
        if (this.score > this.highScore) {
            this.highScore = this.score;
            if (this.bestVal) this.bestVal.textContent = Math.floor(this.highScore);
            eventBus.emit('NEW_RECORD');
        }
    }

    handleNearMiss(obs) {
        this.nearMissedObstacles.add(obs);
        this.score += CONSTANTS.GAMEPLAY.NEAR_MISS_BONUS;
        this.camera.shake(3, 0.1);
        this.particles.emit(this.player.x + this.player.width, this.player.y, '#fff', 5, 0.3, this.gameSpeed);
        eventBus.emit('NEAR_MISS');
    }

    getDistance(p, o) {
        const dx = Math.max(p.x - (o.x + o.width), o.x - (p.x + p.width), 0);
        const dy = Math.max(p.y - (o.y + o.height), o.y - (p.y + p.height), 0);
        return Math.sqrt(dx*dx + dy*dy);
    }

    updateProgression(dt) {
        const { START_SPEED, MAX_SPEED } = CONSTANTS.OBSTACLE;
        
        // Find the current level based on score
        const nextLevel = [...CONSTANTS.LEVELS].reverse().find(lvl => this.score >= lvl.score);
        
        if (nextLevel && nextLevel !== this.currentLevel) {
            this.currentLevel = nextLevel;
            // Visual feedback for level jump (Cinematic "Gear Shift")
            this.camera.shake(10, 0.4);
            // Flash effect could be implemented via a temporary overlay if needed
        }

        // Target Speed is now fixed per level (The "Velvet Stage" logic)
        const targetSpeed = Math.min(MAX_SPEED, this.currentLevel.targetSpeed);
        
        // Smoothly glide into the target speed (interpolated for kehalusan)
        this.gameSpeed = this.gameSpeed + (targetSpeed - this.gameSpeed) * 0.01;
        this.speedFactor = this.gameSpeed / START_SPEED;

        // Continuous Arrangement Factor for smooth musical evolution
        let arrangementFactor = 0;
        if (this.score < 700) {
            arrangementFactor = this.score / 700;
        } else if (this.score < 2100) {
            arrangementFactor = 1 + (this.score - 700) / 1400;
        } else {
            arrangementFactor = 2.0;
        }

        // Sync Audio Tempo & Evolution Intensity
        audioManager.setSpeed(this.speedFactor, arrangementFactor);
        
        // Smooth Color/UI Transition
        if (this.themeColor !== this.currentLevel.color) {
            this.themeColor = lerpColor(this.themeColor, this.currentLevel.color, 0.02);
            this.player.color = this.themeColor;
            this.backgroundLayers[1].color = hexToRgba(this.themeColor, 0.08); 
            document.documentElement.style.setProperty('--current-theme', this.themeColor);
        }
    }

    spawnFromPattern() {
        const [interval, type, height] = this.patterns[this.patternIndex];
        this.obstacles.push(new Obstacle(renderer.width, height, type));
        
        this.obstacleInterval = interval / (this.speedFactor * 0.8);
        this.patternIndex = (this.patternIndex + 1) % this.patterns.length;
    }

    draw() {
        renderer.clear();
        
        // --- KINETIC FOV STRETCH ---
        // Dynamically stretch coordinates horizontally based on speed
        const stretchFactor = 1 + Math.max(0, (this.gameSpeed - 400) * 0.0001);
        const { ctx, width, height } = renderer;
        
        ctx.save();
        // Scale around the center of the screen
        ctx.translate(width / 2, height / 2);
        ctx.scale(stretchFactor, 1);
        ctx.translate(-width / 2, -height / 2);

        this.camera.apply();
        this.backgroundLayers.forEach(layer => layer.draw());
        this.drawGrid();

        if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
            this.player.draw(this.ctx);
            this.obstacles.forEach(obs => obs.draw(this.ctx));
            this.particles.draw(this.gameSpeed);
        }

        if (this.gameSpeed > 700) {
            this.drawSpeedStreaks();
        }
        
        this.camera.restore();
        ctx.restore(); // Restore FOV Stretch
    }

    drawSpeedStreaks() {
        const { ctx, width, height } = renderer;
        const intensity = Math.min(1, (this.gameSpeed - 700) / 300);
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = intensity * 0.4;
        ctx.lineWidth = 1;
        const lineCount = Math.floor(intensity * 15);
        for (let i = 0; i < lineCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const len = 20 + Math.random() * 60;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
        }
        ctx.restore();
    }

    drawGrid() {
        const { ctx, width, height } = renderer;
        ctx.save();
        ctx.strokeStyle = this.themeColor;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;
        const spacing = 40;
        const offset = (performance.now() * (this.gameSpeed / 1000)) % spacing;
        for (let x = -offset; x < width; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += spacing) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
        ctx.restore();
    }
}

export const engine = new Engine();
