import { CONSTANTS } from '../utils/Constants';
import { eventBus } from './EventBus';

/**
 * AudioManager - "Audio Ignition Edition"
 * Implements:
 * - Forced Context Resume (Browser compliance)
 * - Robust Pre-fetch & Decode Sync
 * - Master Mute Barrier Management
 */
class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.compressor = null;
        this.sidechainGain = null;
        this.masterMute = null;
        this.isInitialized = false;

        // BGM State
        this.bgmBuffer = null;
        this.bgmSource = null;
        this.bgmUrl = 'audio/bgm.mp3'; 
        
        this.speedFactor = 1.0;
        this.arrangementFactor = 0;

        // Start pre-fetching immediately
        this.bgmPromise = this.preFetchBGM();

        // Register listeners IMMEDIATELY (Always ready to catch signals)
        this.setupEventListeners();
    }

    async preFetchBGM() {
        try {
            const response = await fetch(this.bgmUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.arrayBuffer();
        } catch (err) {
            console.error('[Audio] Pre-fetch failed:', err);
            return null;
        }
    }

    async init() {
        // If we are already initializing, return the existing promise
        if (this.initPromise) return this.initPromise;
        
        this.initPromise = (async () => {
            if (this.isInitialized) return;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            // Ensure context starts
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
                console.log('[Audio] Context Resumed (Init)');
            }

            // 1. FINAL BARRIER
            this.masterMute = this.ctx.createGain();
            this.masterMute.gain.value = 1.0;
            this.masterMute.connect(this.ctx.destination);

            // 2. MIXING CHAIN
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
            this.compressor.connect(this.masterMute);

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = CONSTANTS.AUDIO.VOLUME;
            this.masterGain.connect(this.compressor);
            
            this.sidechainGain = this.ctx.createGain();
            this.sidechainGain.connect(this.masterGain);
            
            this.isInitialized = true;

            // Decode the pre-fetched buffer
            const arrayBuffer = await this.bgmPromise;
            if (arrayBuffer) {
                try {
                    this.bgmBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                    console.log('[Audio] BGM Decoded & Ready');
                } catch (err) {
                    console.error('[Audio] Decoding failed:', err);
                }
            }
        })();

        return this.initPromise;
    }

    setSpeed(factor, arrangementFactor = 0) {
        this.speedFactor = factor;
        this.arrangementFactor = arrangementFactor;
        if (this.bgmSource) {
            this.bgmSource.playbackRate.setTargetAtTime(1.0 + (factor - 1.0) * 0.25, this.ctx.currentTime, 0.5);
        }
    }

    setupEventListeners() {
        eventBus.on('PLAYER_JUMP', () => { if(this.isInitialized) this.playOneShot(440, 'sawtooth', 0.1, 0.15); });
        eventBus.on('PLAYER_LAND', () => { if(this.isInitialized) this.playOneShot(100, 'sine', 0.15, 0.3); });
        eventBus.on('NEAR_MISS', () => { if(this.isInitialized) this.playWessSound(); });
        eventBus.on('COLLISION', () => this.stopAllSounds());
        eventBus.on('GAME_START', async () => {
            // This now triggers the initialization on the first user click
            await this.init();
            
            if (this.bgmBuffer) {
                this.playBGM();
            }
        });
    }

    async playBGM() {
        if (!this.isInitialized || !this.bgmBuffer) return;
        
        // Force context resume again (Crucial for mobile/Safari compliance)
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
            console.log('[Audio] Context Resumed (Play)');
        }

        // Authority Kill existing
        if (this.bgmSource) {
            try { this.bgmSource.stop(); } catch(e) {}
        }

        // Open Master Mute Barrier
        this.masterMute.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterMute.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.1);
        console.log('[Audio] Master Mute Opened');

        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = this.bgmBuffer;
        this.bgmSource.loop = true;
        
        this.bgmSource.connect(this.sidechainGain);
        this.bgmSource.playbackRate.value = 1.0 + (this.speedFactor - 1.0) * 0.25;
        
        this.bgmSource.start(0);
        console.log('[Audio] BGM Source Started');
    }

    stopAllSounds() {
        if (!this.isInitialized) return;
        
        // Authority Mute
        this.masterMute.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterMute.gain.setValueAtTime(0, this.ctx.currentTime);

        if (this.bgmSource) {
            try { this.bgmSource.stop(); } catch(e) {}
        }
        
        // Crash SFX (Outside sidechain)
        this.playNoise(0.5, 0.8);
    }

    playWessSound() {
        if (!this.isInitialized) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, time);
        osc.frequency.exponentialRampToValueAtTime(3000, time + 0.4);
        g.gain.setValueAtTime(0.2, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        osc.connect(g); g.connect(this.masterGain);
        osc.start(time); osc.stop(time + 0.5);
    }

    playOneShot(freq, type, duration, vol) {
        if (!this.isInitialized) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, time);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.connect(g); g.connect(this.masterGain);
        osc.start(time); osc.stop(time + duration + 0.1);
    }

    playNoise(vol, duration) {
        if (!this.isInitialized) return;
        const time = this.ctx.currentTime;
        const g = this.ctx.createGain();
        const noise = this.createNoiseBufferNode(duration);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + duration);
        noise.connect(g); g.connect(this.masterGain); 
        noise.start(time); noise.stop(time + duration + 0.1);
    }

    createNoiseBufferNode(duration) {
        const size = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
        const node = this.ctx.createBufferSource();
        node.buffer = buffer;
        return node;
    }
}
export const audioManager = new AudioManager();
