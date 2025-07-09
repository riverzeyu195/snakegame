document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    
    // Game variables
    let snake = [];
    let food = {};
    let specialFood = null;
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameRunning = false;
    let gamePaused = false;
    let gameInterval;
    let gameSpeed = 100; // Default speed (medium difficulty)
    let gridSize = 20; // Size of each grid cell
    let gridWidth = Math.floor(canvas.width / gridSize);
    let gridHeight = Math.floor(canvas.height / gridSize);
    let countdown = 3;
    let countdownInterval;
    let specialFoodTimer;
    let specialFoodChance = 0.1; // 10% chance of special food appearing
    let specialFoodDuration = 10000; // 10 seconds
    let specialFoodPoints = 5;
    let powerUpActive = false;
    let powerUpType = null;
    let powerUpTimer;
    
    // Enhanced game features
    let scoreAnimation = { active: false, value: 0, opacity: 1 };
    let soundEnabled = true;
    let musicStyle = localStorage.getItem('snakeGameMusicStyle') || 'energetic'; // off, peaceful, energetic, retro
    let musicVolume = parseFloat(localStorage.getItem('snakeGameMusicVolume')) || 0.3;
    let gameStats = {
        gamesPlayed: parseInt(localStorage.getItem('snakeGamesPlayed')) || 0,
        totalScore: parseInt(localStorage.getItem('snakeTotalScore')) || 0,
        powerUpsCollected: parseInt(localStorage.getItem('snakePowerUpsCollected')) || 0
    };
    
    // Enhanced Audio System with Background Music
    let audioContext;
    let backgroundMusic = null;
    let musicGainNode = null;
    
    // Initialize audio context with error handling
    function initAudioContext() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            return false;
        }
    }
    
    const audioSupported = initAudioContext();
    
    function playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!soundEnabled || !audioSupported) return;
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }
    
    // Multi-style background music system
    function createBackgroundMusic() {
        if (!audioSupported || !soundEnabled || musicStyle === 'off') return;
        
        try {
            musicGainNode = audioContext.createGain();
            musicGainNode.connect(audioContext.destination);
            musicGainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime);
            
            backgroundMusic = { playing: true };
            
            switch(musicStyle) {
                case 'peaceful':
                    playPeacefulMusic();
                    break;
                case 'energetic':
                    playEnergeticMusic();
                    break;
                case 'retro':
                    playRetroMusic();
                    break;
                default:
                    return;
            }
        } catch (error) {
            console.warn('Error creating background music:', error);
        }
    }
    
    // Peaceful music style - deeply relaxing and meditative with rich progressions
    function playPeacefulMusic() {
        const peacefulProgressions = [
            // Progression 1: Classic peaceful sequence
            {
                chords: [
                    [174.61, 220.00, 261.63, 329.63], // F-A-C-E (Fmaj7)
                    [196.00, 246.94, 293.66, 369.99], // G-B-D-F# (Gmaj7)
                    [164.81, 207.65, 246.94, 311.13], // E-G#-B-D# (Emaj7)
                    [146.83, 185.00, 220.00, 277.18]  // D-F#-A-C# (Dmaj7)
                ],
                durations: [8, 6, 7, 9],
                pauses: [2, 1.5, 2.5, 3]
            },
            // Progression 2: Ambient floating sequence
            {
                chords: [
                    [130.81, 164.81, 196.00, 246.94], // C-E-G-B (Cmaj7)
                    [146.83, 185.00, 220.00, 261.63], // D-F#-A-C (D7)
                    [123.47, 155.56, 185.00, 233.08], // B-D#-F#-A# (Bmaj7)
                    [110.00, 138.59, 164.81, 207.65]  // A-C#-E-G# (Amaj7)
                ],
                durations: [7, 8, 6, 10],
                pauses: [1.8, 2.2, 1.5, 2.8]
            }
        ];
        
        let progressionIndex = 0;
        let chordIndex = 0;
        let isPlaying = false;
        
        function playPeacefulChord() {
            if (!soundEnabled || !backgroundMusic || isPlaying || musicStyle !== 'peaceful') return;
            
            isPlaying = true;
            const currentProgression = peacefulProgressions[progressionIndex];
            const currentChord = currentProgression.chords[chordIndex];
            const duration = currentProgression.durations[chordIndex];
            const pause = currentProgression.pauses[chordIndex];
            
            const oscillators = [];
            const gainNodes = [];
            
            // Create rich, layered chord with subtle variations
            currentChord.forEach((frequency, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(musicGainNode);
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                
                // Vary oscillator types for richer texture
                oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
                
                // Dynamic volume envelope with subtle variations
                const baseVolume = (0.012 - (index * 0.002)) * (0.8 + Math.random() * 0.4);
                const attackTime = 2 + Math.random() * 2;
                const sustainTime = duration * 0.6;
                const releaseTime = duration * 0.4;
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(baseVolume, audioContext.currentTime + attackTime);
                gainNode.gain.linearRampToValueAtTime(baseVolume * 0.8, audioContext.currentTime + attackTime + sustainTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration + 0.5);
                
                oscillators.push(oscillator);
                gainNodes.push(gainNode);
            });
            
            // Add subtle ambient pad layer
            if (Math.random() > 0.6) {
                const padOsc = audioContext.createOscillator();
                const padGain = audioContext.createGain();
                
                padOsc.connect(padGain);
                padGain.connect(musicGainNode);
                padOsc.frequency.setValueAtTime(currentChord[0] * 0.5, audioContext.currentTime);
                padOsc.type = 'sine';
                
                padGain.gain.setValueAtTime(0, audioContext.currentTime);
                padGain.gain.linearRampToValueAtTime(0.005, audioContext.currentTime + 4);
                padGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
                
                padOsc.start(audioContext.currentTime);
                padOsc.stop(audioContext.currentTime + duration);
            }
            
            chordIndex = (chordIndex + 1) % currentProgression.chords.length;
            if (chordIndex === 0) {
                progressionIndex = (progressionIndex + 1) % peacefulProgressions.length;
            }
            
            if (backgroundMusic) {
                setTimeout(() => {
                    isPlaying = false;
                    setTimeout(playPeacefulChord, pause * 1000);
                }, duration * 1000);
            }
        }
        
        playPeacefulChord();
    }
    
    // Energetic music style - dynamic, high-energy with varied musical elements
    function playEnergeticMusic() {
        const energeticSequences = [
            // Sequence 1: Driving electronic melody
            {
                melody: [523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 1046.50, 880.00],
                harmony: [261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 523.25, 440.00],
                rhythm: [0.2, 0.15, 0.25, 0.15, 0.3, 0.2, 0.4, 0.25],
                intensity: 1.0
            },
            // Sequence 2: Pulsing bass-heavy pattern
            {
                melody: [440.00, 554.37, 440.00, 698.46, 554.37, 880.00, 698.46, 1108.73],
                harmony: [220.00, 277.18, 220.00, 349.23, 277.18, 440.00, 349.23, 554.37],
                rhythm: [0.18, 0.12, 0.18, 0.22, 0.15, 0.28, 0.2, 0.35],
                intensity: 1.2
            },
            // Sequence 3: Ascending power progression
            {
                melody: [349.23, 440.00, 523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51],
                harmony: [174.61, 220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25],
                rhythm: [0.15, 0.15, 0.2, 0.2, 0.25, 0.25, 0.3, 0.4],
                intensity: 1.4
            },
            // Sequence 4: Syncopated rhythm pattern
            {
                melody: [659.25, 523.25, 880.00, 659.25, 1046.50, 783.99, 1318.51, 880.00],
                harmony: [329.63, 261.63, 440.00, 329.63, 523.25, 392.00, 659.25, 440.00],
                rhythm: [0.12, 0.08, 0.16, 0.12, 0.24, 0.16, 0.32, 0.2],
                intensity: 1.1
            }
        ];
        
        let sequenceIndex = 0;
        let noteIndex = 0;
        let isPlaying = false;
        let beatCount = 0;
        
        function playEnergeticNote() {
            if (!soundEnabled || !backgroundMusic || isPlaying || musicStyle !== 'energetic') return;
            
            isPlaying = true;
            const currentSequence = energeticSequences[sequenceIndex];
            const melodyFreq = currentSequence.melody[noteIndex];
            const harmonyFreq = currentSequence.harmony[noteIndex];
            const duration = currentSequence.rhythm[noteIndex];
            const intensity = currentSequence.intensity;
            
            // Create layered, dynamic sound
            const melodyOsc = audioContext.createOscillator();
            const harmonyOsc = audioContext.createOscillator();
            const bassOsc = audioContext.createOscillator();
            const melodyGain = audioContext.createGain();
            const harmonyGain = audioContext.createGain();
            const bassGain = audioContext.createGain();
            
            // Melody line - main driving force
            melodyOsc.connect(melodyGain);
            melodyGain.connect(musicGainNode);
            melodyOsc.frequency.setValueAtTime(melodyFreq, audioContext.currentTime);
            melodyOsc.type = beatCount % 4 === 0 ? 'sawtooth' : 'square'; // Vary timbre
            
            // Harmony line - adds richness
            harmonyOsc.connect(harmonyGain);
            harmonyGain.connect(musicGainNode);
            harmonyOsc.frequency.setValueAtTime(harmonyFreq, audioContext.currentTime);
            harmonyOsc.type = 'triangle';
            
            // Bass line - adds power on strong beats
            if (beatCount % 2 === 0) {
                bassOsc.connect(bassGain);
                bassGain.connect(musicGainNode);
                bassOsc.frequency.setValueAtTime(melodyFreq * 0.25, audioContext.currentTime);
                bassOsc.type = 'sine';
            }
            
            // Dynamic volume envelopes with intensity variations
            const melodyVol = (0.02 + (intensity - 1) * 0.01) * (0.8 + Math.random() * 0.4);
            const harmonyVol = melodyVol * 0.6;
            const bassVol = melodyVol * 0.8;
            
            // Punchy attack with varied decay
            const attackTime = 0.005 + Math.random() * 0.01;
            const decayTime = duration * (0.6 + Math.random() * 0.3);
            
            melodyGain.gain.setValueAtTime(0, audioContext.currentTime);
            melodyGain.gain.linearRampToValueAtTime(melodyVol, audioContext.currentTime + attackTime);
            melodyGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + decayTime);
            
            harmonyGain.gain.setValueAtTime(0, audioContext.currentTime);
            harmonyGain.gain.linearRampToValueAtTime(harmonyVol, audioContext.currentTime + attackTime * 1.5);
            harmonyGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + decayTime);
            
            if (beatCount % 2 === 0) {
                bassGain.gain.setValueAtTime(0, audioContext.currentTime);
                bassGain.gain.linearRampToValueAtTime(bassVol, audioContext.currentTime + attackTime * 0.5);
                bassGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + decayTime * 0.7);
            }
            
            // Start and stop oscillators
            melodyOsc.start(audioContext.currentTime);
            melodyOsc.stop(audioContext.currentTime + duration + 0.1);
            harmonyOsc.start(audioContext.currentTime);
            harmonyOsc.stop(audioContext.currentTime + duration + 0.1);
            
            if (beatCount % 2 === 0) {
                bassOsc.start(audioContext.currentTime);
                bassOsc.stop(audioContext.currentTime + duration + 0.1);
            }
            
            // Add occasional percussion-like accent
            if (beatCount % 8 === 0 && Math.random() > 0.5) {
                const accentOsc = audioContext.createOscillator();
                const accentGain = audioContext.createGain();
                
                accentOsc.connect(accentGain);
                accentGain.connect(musicGainNode);
                accentOsc.frequency.setValueAtTime(melodyFreq * 2, audioContext.currentTime);
                accentOsc.type = 'square';
                
                accentGain.gain.setValueAtTime(0, audioContext.currentTime);
                accentGain.gain.linearRampToValueAtTime(0.015, audioContext.currentTime + 0.002);
                accentGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
                
                accentOsc.start(audioContext.currentTime);
                accentOsc.stop(audioContext.currentTime + 0.06);
            }
            
            noteIndex = (noteIndex + 1) % currentSequence.melody.length;
            beatCount++;
            
            if (noteIndex === 0) {
                sequenceIndex = (sequenceIndex + 1) % energeticSequences.length;
                // Add brief pause between sequences for musical phrasing
                if (backgroundMusic) {
                    setTimeout(() => {
                        isPlaying = false;
                        setTimeout(playEnergeticNote, 200);
                    }, duration * 1000);
                    return;
                }
            }
            
            if (backgroundMusic) {
                setTimeout(() => {
                    isPlaying = false;
                    setTimeout(playEnergeticNote, 30 + Math.random() * 40); // Slight timing variations
                }, duration * 1000);
            }
        }
        
        playEnergeticNote();
    }
    
    // Retro music style - classic 8-bit arcade sounds
    function playRetroMusic() {
        const retroThemes = [
            // Theme 1: Classic arcade melody
            {
                lead: [523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 880.00, 1046.50],
                bass: [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 440.00, 523.25],
                rhythm: [0.3, 0.2, 0.25, 0.4, 0.25, 0.2, 0.35, 0.5],
                style: 'classic'
            },
            // Theme 2: Bouncy platformer style
            {
                lead: [440.00, 554.37, 440.00, 659.25, 554.37, 783.99, 659.25, 880.00],
                bass: [220.00, 277.18, 220.00, 329.63, 277.18, 392.00, 329.63, 440.00],
                rhythm: [0.2, 0.15, 0.2, 0.25, 0.15, 0.3, 0.25, 0.4],
                style: 'bouncy'
            },
            // Theme 3: Space shooter melody
            {
                lead: [659.25, 880.00, 1046.50, 880.00, 1174.66, 1046.50, 1318.51, 1174.66],
                bass: [164.81, 220.00, 261.63, 220.00, 293.66, 261.63, 329.63, 293.66],
                rhythm: [0.25, 0.25, 0.3, 0.2, 0.35, 0.3, 0.4, 0.35],
                style: 'space'
            },
            // Theme 4: Power-up sequence
            {
                lead: [349.23, 440.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98],
                bass: [174.61, 220.00, 261.63, 329.63, 392.00, 523.25, 659.25, 783.99],
                rhythm: [0.18, 0.18, 0.22, 0.22, 0.28, 0.32, 0.38, 0.6],
                style: 'powerup'
            }
        ];
        
        let themeIndex = 0;
        let noteIndex = 0;
        let isPlaying = false;
        let cycleCount = 0;
        
        function playRetroNote() {
            if (!soundEnabled || !backgroundMusic || isPlaying || musicStyle !== 'retro') return;
            
            isPlaying = true;
            const currentTheme = retroThemes[themeIndex];
            const leadFreq = currentTheme.lead[noteIndex];
            const bassFreq = currentTheme.bass[noteIndex];
            const duration = currentTheme.rhythm[noteIndex];
            const style = currentTheme.style;
            
            // Create authentic 8-bit sound layers
            const leadOsc = audioContext.createOscillator();
            const bassOsc = audioContext.createOscillator();
            const leadGain = audioContext.createGain();
            const bassGain = audioContext.createGain();
            
            // Lead channel - main melody
            leadOsc.connect(leadGain);
            leadGain.connect(musicGainNode);
            leadOsc.frequency.setValueAtTime(leadFreq, audioContext.currentTime);
            leadOsc.type = 'square'; // Classic 8-bit square wave
            
            // Bass channel - rhythmic foundation
            bassOsc.connect(bassGain);
            bassGain.connect(musicGainNode);
            bassOsc.frequency.setValueAtTime(bassFreq, audioContext.currentTime);
            bassOsc.type = noteIndex % 2 === 0 ? 'square' : 'triangle'; // Vary bass texture
            
            // Style-specific volume and envelope adjustments
            let leadVol = 0.025;
            let bassVol = 0.015;
            let attackTime = 0.01;
            let decayRate = 1.0;
            
            switch (style) {
                case 'classic':
                    leadVol = 0.025;
                    bassVol = 0.012;
                    attackTime = 0.015;
                    break;
                case 'bouncy':
                    leadVol = 0.03;
                    bassVol = 0.018;
                    attackTime = 0.005;
                    decayRate = 1.2;
                    break;
                case 'space':
                    leadVol = 0.022;
                    bassVol = 0.01;
                    attackTime = 0.02;
                    decayRate = 0.8;
                    break;
                case 'powerup':
                    leadVol = 0.028 + (noteIndex / currentTheme.lead.length) * 0.01;
                    bassVol = 0.016;
                    attackTime = 0.008;
                    decayRate = 1.1;
                    break;
            }
            
            // Apply 8-bit style envelopes
            leadGain.gain.setValueAtTime(0, audioContext.currentTime);
            leadGain.gain.linearRampToValueAtTime(leadVol, audioContext.currentTime + attackTime);
            leadGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration * decayRate);
            
            bassGain.gain.setValueAtTime(0, audioContext.currentTime);
            bassGain.gain.linearRampToValueAtTime(bassVol, audioContext.currentTime + attackTime * 1.5);
            bassGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration * decayRate * 0.8);
            
            // Add occasional pulse width modulation effect for authenticity
            if (style === 'space' && noteIndex % 4 === 0) {
                const pwmOsc = audioContext.createOscillator();
                const pwmGain = audioContext.createGain();
                
                pwmOsc.connect(pwmGain);
                pwmGain.connect(musicGainNode);
                pwmOsc.frequency.setValueAtTime(leadFreq * 0.5, audioContext.currentTime);
                pwmOsc.type = 'sawtooth';
                
                pwmGain.gain.setValueAtTime(0, audioContext.currentTime);
                pwmGain.gain.linearRampToValueAtTime(0.008, audioContext.currentTime + 0.01);
                pwmGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration * 0.6);
                
                pwmOsc.start(audioContext.currentTime);
                pwmOsc.stop(audioContext.currentTime + duration + 0.1);
            }
            
            // Add arpeggio effect for bouncy style
            if (style === 'bouncy' && noteIndex % 3 === 0) {
                const arpeggioFreqs = [leadFreq, leadFreq * 1.25, leadFreq * 1.5];
                arpeggioFreqs.forEach((freq, i) => {
                    const arpOsc = audioContext.createOscillator();
                    const arpGain = audioContext.createGain();
                    
                    arpOsc.connect(arpGain);
                    arpGain.connect(musicGainNode);
                    arpOsc.frequency.setValueAtTime(freq, audioContext.currentTime);
                    arpOsc.type = 'square';
                    
                    const startTime = audioContext.currentTime + i * 0.03;
                    arpGain.gain.setValueAtTime(0, startTime);
                    arpGain.gain.linearRampToValueAtTime(0.008, startTime + 0.005);
                    arpGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
                    
                    arpOsc.start(startTime);
                    arpOsc.stop(startTime + 0.09);
                });
            }
            
            leadOsc.start(audioContext.currentTime);
            leadOsc.stop(audioContext.currentTime + duration + 0.1);
            bassOsc.start(audioContext.currentTime);
            bassOsc.stop(audioContext.currentTime + duration + 0.1);
            
            noteIndex = (noteIndex + 1) % currentTheme.lead.length;
            
            if (noteIndex === 0) {
                themeIndex = (themeIndex + 1) % retroThemes.length;
                cycleCount++;
                
                // Add longer pause between themes for musical structure
                if (backgroundMusic) {
                    setTimeout(() => {
                        isPlaying = false;
                        setTimeout(playRetroNote, 300 + Math.random() * 200);
                    }, duration * 1000);
                    return;
                }
            }
            
            if (backgroundMusic) {
                setTimeout(() => {
                    isPlaying = false;
                    // Vary timing slightly for more organic feel
                    const baseDelay = style === 'bouncy' ? 80 : 120;
                    setTimeout(playRetroNote, baseDelay + Math.random() * 40);
                }, duration * 1000);
            }
        }
        
        playRetroNote();
    }
    
    function stopBackgroundMusic() {
        if (backgroundMusic) {
            backgroundMusic.playing = false;
            backgroundMusic = null;
        }
        if (musicGainNode) {
            musicGainNode.gain.setValueAtTime(0, audioContext.currentTime);
        }
    }
    
    const sounds = {
        eat: () => playSound(800, 0.1, 'sine', 0.15),
        powerUp: () => playSound(1200, 0.2, 'square', 0.12),
        gameOver: () => {
            playSound(200, 0.5, 'sawtooth', 0.08);
            setTimeout(() => playSound(150, 0.5, 'sawtooth', 0.08), 200);
        },
        countdown: () => playSound(600, 0.1, 'sine', 0.1),
        start: () => playSound(1000, 0.15, 'triangle', 0.12)
    };
    
    // Power-up types
    const powerUpTypes = [
        {
            name: 'speed',
            color: '#00FF00',
            duration: 5000,
            timeLeft: 5000,
            effect: function() {
                const originalSpeed = gameSpeed;
                gameSpeed = gameSpeed / 2;
                return function() {
                    gameSpeed = originalSpeed;
                };
            }
        },
        {
            name: 'shield',
            color: '#0000FF',
            duration: 5000,
            timeLeft: 5000,
            effect: function() {
                // Shield power-up doesn't need to override checkCollision
                // The collision detection already checks for shield in the main function
                return function() {
                    // No reset needed since we don't override anything
                };
            }
        },
        {
            name: 'ghost',
            color: '#AAAAAA',
            duration: 5000,
            timeLeft: 5000,
            effect: function() {
                return function() {};
            }
        }
    ];
    
    // Particle system for visual effects
    let particles = [];
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    const countdownElement = document.getElementById('countdown');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreElement = document.getElementById('final-score');
    const modalHighScoreElement = document.getElementById('modal-high-score');
    const newHighScoreElement = document.getElementById('new-high-score');
    const restartBtn = document.getElementById('restart-btn');
    const pauseModal = document.getElementById('pause-modal');
    const resumeBtn = document.getElementById('resume-btn');
    
    // Mobile controls
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const soundToggle = document.getElementById('sound-toggle');
    
    // Update high score display
    highScoreElement.textContent = highScore;
    
    // Load sound setting
    const savedSoundSetting = localStorage.getItem('snakeSoundEnabled');
    if (savedSoundSetting !== null) {
        soundEnabled = savedSoundSetting === 'true';
    }
    
    // Update sound toggle button
    if (soundEnabled) {
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i> Sound: ON';
        soundToggle.classList.remove('muted');
    } else {
        soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i> Sound: OFF';
        soundToggle.classList.add('muted');
    }
    

    
    // Initialize game
    function initGame() {
        // Reset game state
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        generateFood();
        specialFood = null;
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        gameRunning = false;
        gamePaused = false;
        clearInterval(gameInterval);
        clearInterval(specialFoodTimer);
        clearTimeout(powerUpTimer);
        powerUpActive = false;
        powerUpType = null;
        particles = [];
        
        // Power-ups are reset, collision detection will use the main checkCollision function
        
        // Reset UI
        pauseBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        gameOverModal.classList.remove('active');
        pauseModal.classList.remove('active');
        
        // Set game speed based on difficulty
        const difficulty = difficultySelect.value;
        switch(difficulty) {
            case 'easy':
                gameSpeed = 120;
                break;
            case 'medium':
                gameSpeed = 100;
                break;
            case 'hard':
                gameSpeed = 80;
                break;
        }
        
        // Draw initial game state
        drawGame();
    }
    
    // Generate food at random position
    function generateFood() {
        // Generate random position that's not occupied by the snake
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
        
        food = position;
        
        // Chance to generate special food
        if (!specialFood && Math.random() < specialFoodChance) {
            generateSpecialFood();
        }
    }
    
    // Generate special food
    function generateSpecialFood() {
        // Generate random position that's not occupied by the snake or regular food
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (
            snake.some(segment => segment.x === position.x && segment.y === position.y) ||
            (food.x === position.x && food.y === position.y)
        );
        
        // Randomly select a power-up type
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        specialFood = {
            ...position,
            type: randomPowerUp.name,
            color: randomPowerUp.color,
            points: specialFoodPoints,
            pulseDirection: 1,
            pulseValue: 0.8
        };
        
        // Set timer for special food to disappear
        clearInterval(specialFoodTimer);
        specialFoodTimer = setTimeout(() => {
            specialFood = null;
        }, specialFoodDuration);
    }
    
    // Start countdown before game begins
    function startCountdown() {
        countdown = 3;
        countdownElement.textContent = countdown;
        countdownElement.style.display = 'flex';
        
        // Play countdown sound
        sounds.countdown();
        
        countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
                sounds.start(); // Play start sound
                startGame();
            } else {
                countdownElement.textContent = countdown;
                sounds.countdown(); // Play countdown sound
            }
        }, 1000);
    }
    
    // Start the game
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            pauseBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-redo"></i> Restart';
            
            // Set game speed based on difficulty for better balance
            const difficulty = difficultySelect.value;
            switch(difficulty) {
                case 'easy':
                    gameSpeed = 180; // Slower for beginners
                    break;
                case 'medium':
                    gameSpeed = 120; // Moderate speed
                    break;
                case 'hard':
                    gameSpeed = 80; // Faster for challenge
                    break;
            }
            
            // Start background music
            createBackgroundMusic();
            
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        pauseBtn.disabled = true;
        
        // Stop background music
        stopBackgroundMusic();
        
        // Play game over sound
        sounds.gameOver();
        
        // Update game statistics
        gameStats.gamesPlayed++;
        gameStats.totalScore += score;
        localStorage.setItem('snakeGamesPlayed', gameStats.gamesPlayed);
        localStorage.setItem('snakeTotalScore', gameStats.totalScore);
        
        // Check if we have a new high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
            newHighScoreElement.style.display = 'block';
        } else {
            newHighScoreElement.style.display = 'none';
        }
        
        // Update modal
        finalScoreElement.textContent = score;
        modalHighScoreElement.textContent = highScore;
        
        // Add stats to modal
        const avgScore = Math.round(gameStats.totalScore / gameStats.gamesPlayed);
        const statsHTML = `
            <div class="stats-details">
                <p>Games Played: ${gameStats.gamesPlayed}</p>
                <p>Average Score: ${avgScore}</p>
                <p>Power-ups Collected: ${gameStats.powerUpsCollected}</p>
            </div>
        `;
        
        // Add stats to modal if element exists
        const statsContainer = document.querySelector('.stats-details');
        if (statsContainer) {
            statsContainer.innerHTML = statsHTML;
        } else if (document.querySelector('.modal-content')) {
            document.querySelector('.modal-content').insertAdjacentHTML('beforeend', statsHTML);
        }
        
        gameOverModal.classList.add('active');
        
        // Create explosion particles
        createExplosion(snake[0].x * gridSize + gridSize/2, snake[0].y * gridSize + gridSize/2, 30, '#FF3366');
    }
    
    // Create particles for explosion effect
    function createExplosion(x, y, particleCount, color) {
        for (let i = 0; i < particleCount; i++) {
            const speed = 2 + Math.random() * 3;
            const angle = Math.random() * Math.PI * 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 3,
                color: color,
                alpha: 1,
                decay: 0.01 + Math.random() * 0.02
                });
        }
    }
    
    // Update particles
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    
    // Update score animation
    function updateScoreAnimation() {
        if (scoreAnimation.active) {
            scoreAnimation.yOffset -= 2;
            scoreAnimation.opacity -= 0.02;
            
            if (scoreAnimation.opacity <= 0) {
                scoreAnimation.active = false;
            }
        }
    }
    
    // Draw particles
    function drawParticles() {
        ctx.save();
        for (const p of particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    
    // Main game loop
    function gameLoop() {
        if (!gameRunning || gamePaused) return;
        
        // Update snake position
        updateSnake();
        
        // Check for collisions
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Check if snake eats food
        checkFood();
        
        // Update power-up timer if active
        if (powerUpActive && powerUpType) {
            powerUpType.timeLeft -= gameSpeed;
            if (powerUpType.timeLeft <= 0) {
                deactivatePowerUp();
            }
        }
        
        // Update special food pulse effect
        if (specialFood) {
            specialFood.pulseValue += 0.05 * specialFood.pulseDirection;
            if (specialFood.pulseValue >= 1.2) {
                specialFood.pulseDirection = -1;
            } else if (specialFood.pulseValue <= 0.8) {
                specialFood.pulseDirection = 1;
            }
        }
        
        // Update particles
        updateParticles();
        
        // Update score animation
        updateScoreAnimation();
        
        // Draw updated game state
        drawGame();
    }
    
    // Update snake position
    function updateSnake() {
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = {x: snake[0].x, y: snake[0].y};
        switch(direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Handle wall wrapping for all difficulties with visual effect
        let wrapped = false;
        if (head.x < 0) {
            head.x = gridWidth - 1;
            wrapped = true;
        }
        if (head.x >= gridWidth) {
            head.x = 0;
            wrapped = true;
        }
        if (head.y < 0) {
            head.y = gridHeight - 1;
            wrapped = true;
        }
        if (head.y >= gridHeight) {
            head.y = 0;
            wrapped = true;
        }
        
        // Create wrap effect particles
        if (wrapped) {
            createExplosion(head.x * gridSize + gridSize/2, head.y * gridSize + gridSize/2, 8, '#00FFDD');
        }
        
        // Add new head to snake
        snake.unshift(head);
        
        // Remove tail unless food was eaten
        if (!(head.x === food.x && head.y === food.y) && 
            !(specialFood && head.x === specialFood.x && head.y === specialFood.y)) {
            snake.pop();
        }
    }
    
    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Check self collision (skip the head)
        // Shield power-up protects against self-collision
        if (!(powerUpActive && powerUpType && powerUpType.name === 'shield')) {
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Check if snake eats food
    function checkFood() {
        const head = snake[0];
        
        // Check regular food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score++;
            scoreElement.textContent = score;
            
            // Play sound effect
            sounds.eat();
            
            // Animate score
            animateScore(1, head.x, head.y);
            
            // Generate new food
            generateFood();
            
            // Create particles at food location
            createExplosion(head.x * gridSize + gridSize/2, head.y * gridSize + gridSize/2, 10, '#FF3366');
        }
        
        // Check special food
        if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
            // Increase score
            score += specialFood.points;
            scoreElement.textContent = score;
            
            // Play power-up sound
            sounds.powerUp();
            
            // Animate score
            animateScore(specialFood.points, head.x, head.y);
            
            // Update stats
            gameStats.powerUpsCollected++;
            localStorage.setItem('snakePowerUpsCollected', gameStats.powerUpsCollected);
            
            // Activate power-up
            activatePowerUp(specialFood.type);
            
            // Create particles at special food location
            createExplosion(head.x * gridSize + gridSize/2, head.y * gridSize + gridSize/2, 20, specialFood.color);
            
            // Remove special food
            specialFood = null;
            clearInterval(specialFoodTimer);
        }
    }
    
    // Animate score popup
    function animateScore(points, x, y) {
        scoreAnimation = {
            active: true,
            value: points > 1 ? `+${points}` : '+1',
            x: x * gridSize + gridSize/2,
            y: y * gridSize,
            opacity: 1,
            yOffset: 0
        };
    }
    
    // Activate power-up
    function activatePowerUp(powerUpName) {
        // Find the power-up type
        const powerUp = powerUpTypes.find(p => p.name === powerUpName);
        if (!powerUp) return;
        
        // Deactivate current power-up if active
        if (powerUpActive && powerUpType) {
            deactivatePowerUp();
        }
        
        // Clone the power-up to avoid modifying the original
        powerUpType = JSON.parse(JSON.stringify(powerUp));
        
        // Apply power-up effect
        const resetEffect = powerUp.effect();
        powerUpActive = true;
        
        // Set timer to deactivate power-up
        clearTimeout(powerUpTimer);
        powerUpTimer = setTimeout(() => {
            if (resetEffect) resetEffect();
            powerUpActive = false;
            powerUpType = null;
        }, powerUp.duration);
    }
    
    // Deactivate power-up
    function deactivatePowerUp() {
        if (!powerUpActive || !powerUpType) return;
        
        // Find the original power-up type to get the reset function
        const originalPowerUp = powerUpTypes.find(p => p.name === powerUpType.name);
        if (originalPowerUp) {
            const resetEffect = originalPowerUp.effect();
            if (resetEffect) resetEffect();
        }
        
        powerUpActive = false;
        powerUpType = null;
        clearTimeout(powerUpTimer);
    }
    
    // Draw game
    function drawGame() {
        try {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw particles
            drawParticles();
            
            // Create pulsating background effect
            const now = Date.now();
            const pulseValue = 0.5 + 0.2 * Math.sin(now / 1000);
            const gradientRadius = canvas.width * (0.8 + 0.2 * pulseValue);
            
            // Create dynamic center point for gradient
            const centerOffsetX = 20 * Math.sin(now / 2000);
            const centerOffsetY = 20 * Math.cos(now / 1800);
            
            // Create radial gradient for background
            const gradient = ctx.createRadialGradient(
                canvas.width / 2 + centerOffsetX, canvas.height / 2 + centerOffsetY, 0,
                canvas.width / 2 + centerOffsetX, canvas.height / 2 + centerOffsetY, gradientRadius
            );
            
            // Dynamic color stops based on time
            const hue1 = (now / 50) % 360;
            const hue2 = (hue1 + 180) % 360;
            
            gradient.addColorStop(0, `hsla(${hue1}, 70%, 15%, 1)`);
            gradient.addColorStop(1, `hsla(${hue2}, 70%, 5%, 1)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid with pulsating opacity
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + 0.05 * Math.sin(now / 1000)})`;
            ctx.lineWidth = 0.5;
            
            // Draw vertical grid lines
            for (let x = 0; x <= canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Draw horizontal grid lines
            for (let y = 0; y <= canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Draw food with glow effect
            ctx.save();
            const foodGlow = ctx.createRadialGradient(
                food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, 0,
                food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize
            );
            foodGlow.addColorStop(0, '#FF3366');
            foodGlow.addColorStop(1, 'rgba(255, 51, 102, 0)');
            
            ctx.fillStyle = foodGlow;
            ctx.fillRect(
                food.x * gridSize - gridSize / 2, 
                food.y * gridSize - gridSize / 2, 
                gridSize * 2, 
                gridSize * 2
            );
            
            ctx.fillStyle = '#FF3366';
            ctx.beginPath();
            ctx.arc(
                food.x * gridSize + gridSize / 2,
                food.y * gridSize + gridSize / 2,
                gridSize / 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
            
            // Draw special food with pulsating effect if it exists
            if (specialFood) {
                ctx.save();
                
                // Create pulsating glow
                const specialFoodGlow = ctx.createRadialGradient(
                    specialFood.x * gridSize + gridSize / 2, specialFood.y * gridSize + gridSize / 2, 0,
                    specialFood.x * gridSize + gridSize / 2, specialFood.y * gridSize + gridSize / 2, gridSize * 1.5
                );
                specialFoodGlow.addColorStop(0, specialFood.color);
                specialFoodGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = specialFoodGlow;
                ctx.globalAlpha = 0.7;
                ctx.fillRect(
                    specialFood.x * gridSize - gridSize, 
                    specialFood.y * gridSize - gridSize, 
                    gridSize * 3, 
                    gridSize * 3
                );
                
                // Calculate pulsating size and position
                const indicatorSize = (gridSize / 3) * specialFood.pulseValue;
                const indicatorOffset = (gridSize - indicatorSize) / 2;
                
                // Draw circular power-up indicator
                ctx.fillStyle = specialFood.color;
                ctx.beginPath();
                ctx.arc(
                    (specialFood.x * gridSize) + (gridSize / 2),
                    (specialFood.y * gridSize) + (gridSize / 2),
                    indicatorSize / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            }
            
            // Draw snake
            for (let i = 0; i < snake.length; i++) {
                const segment = snake[i];
                
                // Determine segment color (head is different)
                let segmentColor;
                if (i === 0) {
                    // Head color - use power-up color if active
                    segmentColor = powerUpActive && powerUpType ? powerUpType.color : '#00FFDD';
                } else {
                    // Body segments - gradient from head color to darker shade
                    const headColor = powerUpActive && powerUpType ? powerUpType.color : '#00FFDD';
                    const tailColor = '#00CCBB';
                    const ratio = i / snake.length;
                    
                    // Create gradient between head and tail colors
                    const r1 = parseInt(headColor.slice(1, 3), 16);
                    const g1 = parseInt(headColor.slice(3, 5), 16);
                    const b1 = parseInt(headColor.slice(5, 7), 16);
                    
                    const r2 = parseInt(tailColor.slice(1, 3), 16);
                    const g2 = parseInt(tailColor.slice(3, 5), 16);
                    const b2 = parseInt(tailColor.slice(5, 7), 16);
                    
                    const r = Math.floor(r1 + (r2 - r1) * ratio);
                    const g = Math.floor(g1 + (g2 - g1) * ratio);
                    const b = Math.floor(b1 + (b2 - b1) * ratio);
                    
                    segmentColor = `rgb(${r}, ${g}, ${b})`;
                }
                
                // Draw segment with glow effect
                ctx.save();
                
                // Add glow effect for head or if power-up is active
                if (i === 0 || (powerUpActive && powerUpType)) {
                    const glowColor = i === 0 ? segmentColor : powerUpType.color;
                    const glowRadius = i === 0 ? gridSize * 1.2 : gridSize * 0.8;
                    
                    const glow = ctx.createRadialGradient(
                        segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, 0,
                        segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, glowRadius
                    );
                    glow.addColorStop(0, glowColor);
                    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    
                    ctx.fillStyle = glow;
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(
                        segment.x * gridSize - gridSize / 2, 
                        segment.y * gridSize - gridSize / 2, 
                        gridSize * 2, 
                        gridSize * 2
                    );
                }
                
                // Draw segment
                ctx.fillStyle = segmentColor;
                ctx.globalAlpha = 1;
                
                // Head is slightly larger and rounded
                if (i === 0) {
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2,
                        segment.y * gridSize + gridSize / 2,
                        gridSize / 2 * 0.9, // Slightly smaller than grid for spacing
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    
                    // Add eyes to head
                    ctx.fillStyle = '#000';
                    
                    // Position eyes based on direction
                    let eyeOffsetX1, eyeOffsetY1, eyeOffsetX2, eyeOffsetY2;
                    switch(direction) {
                        case 'up':
                            eyeOffsetX1 = -gridSize / 5;
                            eyeOffsetY1 = -gridSize / 8;
                            eyeOffsetX2 = gridSize / 5;
                            eyeOffsetY2 = -gridSize / 8;
                            break;
                        case 'down':
                            eyeOffsetX1 = -gridSize / 5;
                            eyeOffsetY1 = gridSize / 8;
                            eyeOffsetX2 = gridSize / 5;
                            eyeOffsetY2 = gridSize / 8;
                            break;
                        case 'left':
                            eyeOffsetX1 = -gridSize / 8;
                            eyeOffsetY1 = -gridSize / 5;
                            eyeOffsetX2 = -gridSize / 8;
                            eyeOffsetY2 = gridSize / 5;
                            break;
                        case 'right':
                            eyeOffsetX1 = gridSize / 8;
                            eyeOffsetY1 = -gridSize / 5;
                            eyeOffsetX2 = gridSize / 8;
                            eyeOffsetY2 = gridSize / 5;
                            break;
                    }
                    
                    // Draw eyes
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 + eyeOffsetX1,
                        segment.y * gridSize + gridSize / 2 + eyeOffsetY1,
                        gridSize / 10,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.arc(
                        segment.x * gridSize + gridSize / 2 + eyeOffsetX2,
                        segment.y * gridSize + gridSize / 2 + eyeOffsetY2,
                        gridSize / 10,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else {
                    // Body segments are slightly smaller rounded squares
                    const segmentSize = gridSize * 0.8;
                    const offset = (gridSize - segmentSize) / 2;
                    
                    ctx.beginPath();
                    ctx.roundRect(
                        segment.x * gridSize + offset,
                        segment.y * gridSize + offset,
                        segmentSize,
                        segmentSize,
                        segmentSize / 4
                    );
                    ctx.fill();
                }
                
                ctx.restore();
            }
            
            // Draw power-up timer if active with enhanced visual effect
            if (powerUpActive && powerUpType) {
                const powerUp = powerUpTypes.find(p => p.name === powerUpType.name);
                
                // Save context
                ctx.save();
                
                // Create gradient for timer bar
                const timerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                timerGradient.addColorStop(0, powerUp.color);
                timerGradient.addColorStop(0.5, '#FFFFFF');
                timerGradient.addColorStop(1, powerUp.color);
                
                // Draw timer bar with pulsating effect
                ctx.fillStyle = timerGradient;
                ctx.globalAlpha = 0.3 + (0.1 * Math.sin(Date.now() / 200)); // Subtle pulsating effect
                ctx.fillRect(0, canvas.height - 10, canvas.width * (powerUp.timeLeft / powerUp.duration), 10);
                ctx.restore();
                
                // Draw shield timer display if shield is active
                if (powerUpType.name === 'shield') {
                    ctx.save();
                    
                    // Calculate remaining time in seconds
                    const remainingSeconds = Math.ceil(powerUpType.timeLeft / 1000);
                    
                    // Draw shield icon and timer text
                    ctx.font = 'bold 24px Arial';
                    ctx.fillStyle = '#0088FF';
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    ctx.textAlign = 'center';
                    
                    const shieldText = `🛡️ ${remainingSeconds}s`;
                    const x = canvas.width / 2;
                    const y = 40;
                    
                    // Add glow effect
                    ctx.shadowColor = '#0088FF';
                    ctx.shadowBlur = 10;
                    
                    ctx.strokeText(shieldText, x, y);
                    ctx.fillText(shieldText, x, y);
                    
                    ctx.restore();
                }
            }
            
            // Draw score animation
            if (scoreAnimation.active) {
                ctx.save();
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.globalAlpha = scoreAnimation.opacity;
                
                const x = scoreAnimation.x;
                const y = scoreAnimation.y + scoreAnimation.yOffset;
                
                ctx.strokeText(scoreAnimation.value, x, y);
                ctx.fillText(scoreAnimation.value, x, y);
                ctx.restore();
            }
        } catch (error) {
            console.error('Error in drawGame:', error);
        }
    }
    
    // Pause game
    function pauseGame() {
        if (!gameRunning || gamePaused) return;
        
        clearInterval(gameInterval);
        gamePaused = true;
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        pauseModal.classList.add('active');
        
        // Pause background music
        stopBackgroundMusic();
    }

    // Resume game
    function resumeGame() {
        if (!gameRunning || !gamePaused) return;
        
        gameInterval = setInterval(gameLoop, gameSpeed);
        gamePaused = false;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        pauseModal.classList.remove('active');
        
        // Resume background music
        createBackgroundMusic();
    }

    // Function to ensure audio context is running
    function ensureAudioContext() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    // Music control elements
    const musicStyleSelect = document.getElementById('musicStyleSelect');
    const musicVolumeSlider = document.getElementById('musicVolumeSlider');
    const volumeDisplay = document.getElementById('volumeDisplay');
    
    // Initialize music controls
    if (musicStyleSelect) {
        musicStyleSelect.value = musicStyle;
    }
    if (musicVolumeSlider) {
        musicVolumeSlider.value = musicVolume;
    }
    if (volumeDisplay) {
        volumeDisplay.textContent = Math.round(musicVolume * 100) + '%';
    }
    
    // Event listeners
    startBtn.addEventListener('click', function() {
        ensureAudioContext(); // Resume audio context on user interaction
        if (!gameRunning) {
            initGame();
            startCountdown();
        } else {
            // If game is running, restart it
            clearInterval(gameInterval);
            clearInterval(countdownInterval);
            stopBackgroundMusic(); // Stop music when restarting
            initGame();
            startCountdown();
        }
    });

    pauseBtn.addEventListener('click', function() {
        ensureAudioContext();
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });

    restartBtn.addEventListener('click', function() {
        ensureAudioContext();
        stopBackgroundMusic(); // Stop music when restarting from game over
        gameOverModal.classList.remove('active');
        initGame();
        startCountdown();
    });
    
    resumeBtn.addEventListener('click', function() {
        ensureAudioContext();
        resumeGame();
    });
    
    // Music style selector
    if (musicStyleSelect) {
        musicStyleSelect.addEventListener('change', function() {
            ensureAudioContext();
            musicStyle = musicStyleSelect.value;
             localStorage.setItem('snakeGameMusicStyle', musicStyle);
            
            // Restart music with new style if game is running
            if (gameRunning && !gamePaused && soundEnabled) {
                stopBackgroundMusic();
                if (musicStyle !== 'off') {
                    setTimeout(() => createBackgroundMusic(), 100);
                }
            }
        });
    }
    
    // Music volume slider
    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener('input', function() {
            musicVolume = parseFloat(musicVolumeSlider.value);
            if (volumeDisplay) {
                volumeDisplay.textContent = Math.round(musicVolume * 100) + '%';
            }
            localStorage.setItem('snakeGameMusicVolume', musicVolume);
            
            // Update volume if music is playing
            if (musicGainNode) {
                musicGainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime);
            }
        });
    }

    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        // Prevent default action for arrow keys to avoid scrolling
        if ([37, 38, 39, 40, 32, 80].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        ensureAudioContext(); // Resume audio context on keyboard interaction
        
        // Only process direction changes if game is running and not paused
        if (gameRunning && !gamePaused) {
            switch(e.keyCode) {
                // Arrow Up or W
                case 38:
                case 87:
                    if (direction !== 'down') nextDirection = 'up';
                    break;
                // Arrow Down or S
                case 40:
                case 83:
                    if (direction !== 'up') nextDirection = 'down';
                    break;
                // Arrow Left or A
                case 37:
                case 65:
                    if (direction !== 'right') nextDirection = 'left';
                    break;
                // Arrow Right or D
                case 39:
                case 68:
                    if (direction !== 'left') nextDirection = 'right';
                    break;
            }
        }
    
        // Space or P to pause/resume
        if (e.keyCode === 32 || e.keyCode === 80) {
            if (gameRunning) {
                if (gamePaused) {
                    resumeGame();
                } else {
                    pauseGame();
                }
            }
        }
    });

    // Mobile controls
    upBtn.addEventListener('click', function() {
        if (gameRunning && !gamePaused && direction !== 'down') {
            nextDirection = 'up';
        }
    });
    
    downBtn.addEventListener('click', function() {
        if (gameRunning && !gamePaused && direction !== 'up') {
            nextDirection = 'down';
        }
    });
    
    leftBtn.addEventListener('click', function() {
        if (gameRunning && !gamePaused && direction !== 'right') {
            nextDirection = 'left';
        }
    });
    
    rightBtn.addEventListener('click', function() {
        if (gameRunning && !gamePaused && direction !== 'left') {
            nextDirection = 'right';
        }
    });
    
    // Sound toggle
    soundToggle.addEventListener('click', function() {
        ensureAudioContext();
        soundEnabled = !soundEnabled;
        localStorage.setItem('snakeSoundEnabled', soundEnabled);
        
        if (soundEnabled) {
            soundToggle.innerHTML = '<i class="fas fa-volume-up"></i> Sound: ON';
            soundToggle.classList.remove('muted');
        } else {
            soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i> Sound: OFF';
            soundToggle.classList.add('muted');
        }
    });
    


    // Handle window resize
    window.addEventListener('resize', function() {
        // Only adjust if game is running
        if (gameRunning) {
            const oldGridSize = gridSize;
            
            // Recalculate grid size based on new window dimensions
            // This is a simplified approach - you might want to add more sophisticated resizing logic
            const maxWidth = Math.min(window.innerWidth - 40, 400);
            const maxHeight = Math.min(window.innerHeight - 200, 400);
            
            canvas.width = maxWidth;
            canvas.height = maxHeight;
            
            // Adjust grid size to maintain similar gameplay experience
            const newGridSize = Math.floor(Math.min(maxWidth, maxHeight) / 20);
            
            // Only adjust if grid size has changed
            if (newGridSize !== oldGridSize) {
                adjustGameElementsForNewGrid(oldGridSize, newGridSize);
                gridSize = newGridSize;
                
                // Redraw game
                drawGame();
            }
        }
    });

    // Function to adjust game elements when grid size changes
    function adjustGameElementsForNewGrid(oldGridSize, newGridSize) {
        // Calculate the ratio between old and new grid sizes
        const ratio = newGridSize / oldGridSize;
        
        // Adjust snake positions
        for (let segment of snake) {
            segment.x = Math.floor(segment.x * ratio);
            segment.y = Math.floor(segment.y * ratio);
        }
        
        // Adjust food position
        food.x = Math.floor(food.x * ratio);
        food.y = Math.floor(food.y * ratio);
        
        // Adjust special food position if it exists
        if (specialFood) {
            specialFood.x = Math.floor(specialFood.x * ratio);
            specialFood.y = Math.floor(specialFood.y * ratio);
        }
        
        // Recalculate grid width and height based on new grid size
        gridWidth = Math.floor(canvas.width / newGridSize);
        gridHeight = Math.floor(canvas.height / newGridSize);
        
        console.log(`Grid adjusted: oldSize=${oldGridSize}, newSize=${newGridSize}, new dimensions: ${gridWidth}x${gridHeight}`);
    }
    
    // Initialize game on page load
    initGame();
});