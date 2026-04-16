        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gameContainer = document.getElementById('gameContainer');

        // ─── Haptic feedback helper ────────────────────────────────────────
        function haptic(pattern) {
            try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
        }

        // ─── Orientation lock (portrait preferred) ─────────────────────────
        (function tryOrientationLock() {
            try {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('portrait').catch(() => {});
                }
            } catch (e) {}
        })();

        // Responsive canvas – uses visualViewport when available for accurate
        // dimensions on notched/zoomed mobile browsers
        function resizeCanvas() {
            const vvp = window.visualViewport;
            const w = vvp ? Math.round(vvp.width)  : window.innerWidth;
            const h = vvp ? Math.round(vvp.height) : window.innerHeight;
            canvas.width  = w > 600 ? 600 : w;
            canvas.height = h;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', resizeCanvas);
        }

        // Difficulty settings
        const difficultySettings = {
            easy: {
                gravity: 0.25,
                lift: -5,
                pipeSpeed: 2,
                pipeGap: 250,
                pipeFrequency: 110,
                streakThreshold: 8,
                label: 'EASY'
            },
            normal: {
                gravity: 0.35,
                lift: -5,
                pipeSpeed: 3,
                pipeGap: 210,
                pipeFrequency: 90,
                streakThreshold: 5,
                label: 'NORMAL'
            },
            hard: {
                gravity: 0.42,
                lift: -5.5,
                pipeSpeed: 4,
                pipeGap: 180,
                pipeFrequency: 75,
                streakThreshold: 3,
                label: 'HARD'
            },
            insane: {
                gravity: 0.5,
                lift: -6,
                pipeSpeed: 5,
                pipeGap: 150,
                pipeFrequency: 60,
                streakThreshold: 2,
                label: 'INSANE'
            }
        };

        // ─── Power-up system ──────────────────────────────────────────────
        const powerUps = [];
        let basePipeSpeed = 3;
        let baseGravity = 0.35;
        let pointMultiplier = 1;

        const powerUpTypes = {
            shield: {
                color: '#4da6ff',
                icon: 'shield',
                duration: Infinity,
                effect: 'Survive 1 collision',
                glowColor: 'rgba(77, 166, 255, 0.4)'
            },
            powbomb: {
                color: '#ff4500',
                icon: 'explosion',
                duration: Infinity,
                effect: 'Clear all pipes!',
                glowColor: 'rgba(255, 69, 0, 0.5)'
            },
            doublepoints: {
                color: '#ffd700',
                icon: 'star',
                duration: 15000,
                effect: 'Score x2',
                glowColor: 'rgba(255, 215, 0, 0.3)'
            }
        };

        // ─── Bird Skins System ─────────────────────────────────────────────
        const birdSkins = {
            classic: {
                name: 'Classic',
                unlocked: true,
                draw: function() {
                    // Original orange bird
                    const bodyGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, bird.radius);
                    bodyGrad.addColorStop(0, '#ffaa00');
                    bodyGrad.addColorStop(0.5, '#ff6b00');
                    bodyGrad.addColorStop(1, '#cc3300');
                    ctx.fillStyle = bodyGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.save();
                    ctx.translate(-4, 4);
                    ctx.rotate(bird.wingRotation);
                    ctx.fillStyle = 'rgba(200, 60, 0, 0.7)';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = '#ffcc00';
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.fill();
                }
            },
            void: {
                name: 'Void',
                unlocked: true,
                draw: function() {
                    // All black with purple glow
                    let glowColor = 'rgba(128, 0, 255, ';
                    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.radius * 1.8);
                    glowGrad.addColorStop(0, glowColor + '0.5)');
                    glowGrad.addColorStop(1, glowColor + '0)');
                    ctx.fillStyle = glowGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius * 1.8, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.save();
                    ctx.translate(-4, 4);
                    ctx.rotate(bird.wingRotation);
                    ctx.fillStyle = 'rgba(80, 0, 160, 0.9)';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = '#800080';
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.fill();
                }
            },
            inferno: {
                name: 'Inferno',
                unlocked: true,
                draw: function() {
                    // Red to yellow gradient
                    const bodyGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, bird.radius);
                    bodyGrad.addColorStop(0, '#ffff00');
                    bodyGrad.addColorStop(0.5, '#ff4400');
                    bodyGrad.addColorStop(1, '#cc0000');
                    ctx.fillStyle = bodyGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.save();
                    ctx.translate(-4, 4);
                    ctx.rotate(bird.wingRotation);
                    ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.fill();
                }
            },
            ghost: {
                name: 'Ghost',
                unlocked: true,
                draw: function() {
                    // White with transparency
                    const bodyGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, bird.radius);
                    bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    bodyGrad.addColorStop(0.5, 'rgba(200, 200, 200, 0.7)');
                    bodyGrad.addColorStop(1, 'rgba(150, 150, 150, 0.5)');
                    ctx.fillStyle = bodyGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.save();
                    ctx.translate(-4, 4);
                    ctx.rotate(bird.wingRotation);
                    ctx.fillStyle = 'rgba(180, 180, 180, 0.6)';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.fill();
                }
            },
            neon: {
                name: 'Neon',
                unlocked: true,
                draw: function() {
                    // Cyan/purple outline glow
                    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.radius * 2);
                    glowGrad.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
                    glowGrad.addColorStop(0.5, 'rgba(128, 0, 255, 0.3)');
                    glowGrad.addColorStop(1, 'rgba(128, 0, 255, 0)');
                    ctx.fillStyle = glowGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius * 2, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(0, 100, 100, 0.6)';
                    ctx.fill();

                    ctx.save();
                    ctx.translate(-4, 4);
                    ctx.rotate(bird.wingRotation);
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();

                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.stroke();
                }
            },
            skeleton: {
                name: 'Skeleton',
                unlocked: true,
                draw: function() {
                    // White skull
                    ctx.fillStyle = '#ffffcc';
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Eye sockets
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(5, -5, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(10, -5, 3.5, 0, Math.PI * 2);
                    ctx.fill();

                    // Nose hole (triangle)
                    ctx.beginPath();
                    ctx.moveTo(7.5, -1);
                    ctx.lineTo(5.5, 2);
                    ctx.lineTo(9.5, 2);
                    ctx.closePath();
                    ctx.fill();

                    // Teeth
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1;
                    for (let i = 0; i < 5; i++) {
                        ctx.beginPath();
                        ctx.moveTo(5 + i * 3, 4);
                        ctx.lineTo(5 + i * 3, 6);
                        ctx.stroke();
                    }

                    ctx.fillStyle = '#ffffcc';
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.fill();
                }
            },
            metal: {
                name: 'Metal',
                unlocked: true,
                draw: function() {
                    // Gray/silver with shine
                    const bodyGrad = ctx.createRadialGradient(-5, -6, 1, 0, 0, bird.radius);
                    bodyGrad.addColorStop(0, '#e8e8e8');
                    bodyGrad.addColorStop(0.4, '#c0c0c0');
                    bodyGrad.addColorStop(1, '#808080');
                    ctx.fillStyle = bodyGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Shine reflection
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.arc(-4, -6, 4, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.save();
                    ctx.translate(-4, 4);
                    ctx.rotate(bird.wingRotation);
                    ctx.fillStyle = 'rgba(160, 160, 160, 0.8)';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.fill();
                }
            },
            cosmic: {
                name: 'Cosmic',
                unlocked: true,
                draw: function() {
                    // Starfield pattern
                    const bodyGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, bird.radius);
                    bodyGrad.addColorStop(0, '#0033ff');
                    bodyGrad.addColorStop(0.5, '#000066');
                    bodyGrad.addColorStop(1, '#000033');
                    ctx.fillStyle = bodyGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw stars
                    ctx.fillStyle = '#ffff00';
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const x = Math.cos(angle) * 7;
                        const y = Math.sin(angle) * 7;
                        ctx.beginPath();
                        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    ctx.save();
                    ctx.translate(-4, 4);
                    ctx.rotate(bird.wingRotation);
                    ctx.fillStyle = 'rgba(0, 50, 150, 0.7)';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = '#00ffff';
                    ctx.beginPath();
                    ctx.moveTo(bird.radius - 2, -2);
                    ctx.lineTo(bird.radius + 7, 0);
                    ctx.lineTo(bird.radius - 2, 3);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        };

        // Game objects
        const game = {
            score: 0,
            highScore: localStorage.getItem('flappyBirdHighScore') || 0,
            gameOver: false,
            started: false,
            difficulty: 'normal',
            streak: 0,
            maxStreak: localStorage.getItem('flappyBirdMaxStreak') || 0,
            activePowerUps: {
                shield: null,
                powbomb: null,
                doublepoints: null
            },
            invulnerable: false,
            invulnerabilityTimer: 0,
            soundEnabled: localStorage.getItem('flappyBirdSoundEnabled') !== 'false' ? true : false,
            selectedSkin: localStorage.getItem('selectedBirdSkin') || 'classic'
        };

        const bird = {
            x: canvas.width * 0.2,
            y: canvas.height / 2,
            radius: 15,
            velocity: 0,
            gravity: 0.35,
            lift: -5,
            color: '#ff6b00',
            rotation: 0,      // radians; 0 = flat, positive = nose-down
            // Visual feedback animations
            wingRotation: 0,
            wingFlapFrame: 0,
            eyeBlinkTimer: 0,
            eyeBlinkDuration: 150,
            eyeBlinkInterval: 3000,
            nextBlink: Math.random() * 3000,
            powerUpFlashTimer: 0,
            powerUpFlashDuration: 300,
            trailParticles: [],
            eyeWidthMultiplier: 1.0
        };

        const pipes = [];
        let pipeGap = 210;
        const pipeWidth = 50;
        let pipeCounter = 0;
        let pipeSpeed = 3;
        let pipeFrequency = 90;
        const version = '0.7.0';

        // ─── XP & Level System ────────────────────────────────────────────
        // Level thresholds: how much TOTAL XP to reach each level
        const XP_LEVELS = [
            0,      // Level 1
            100,    // Level 2
            250,    // Level 3
            450,    // Level 4
            700,    // Level 5
            1000,   // Level 6
            1400,   // Level 7
            1900,   // Level 8
            2500,   // Level 9
            3200,   // Level 10
            4000,   // Level 11
            4900,   // Level 12
            5900,   // Level 13
            7000,   // Level 14
            8200,   // Level 15
            9500,   // Level 16  -- (levels 17-20 are beyond, handled below)
            10000,  // Level 17 (placeholder, handled as max+increment)
            10800,  // Level 18
            11700,  // Level 19
            12700   // Level 20
        ];
        const MAX_LEVEL = 20;

        // Level color schemes: Sunset → Dusk → Night → Cosmic Space
        const LEVEL_COLOR_SCHEMES = {
            // Levels 1-5: Burning Sunset (Red/Orange)
            1: { bg: ['#4a1a00', '#3d0a00', '#2d0a00'], pipe: ['#550000', '#8b0000', '#aa1100', '#7a0000'], ground: '#4a1a00', accent: '#ff6b00' },
            2: { bg: ['#5a2010', '#4a1008', '#3d0a00'], pipe: ['#661100', '#9b1000', '#bb2200', '#8a0800'], ground: '#5a1f10', accent: '#ff7a00' },
            3: { bg: ['#6a2818', '#5a1810', '#4a0a08'], pipe: ['#772200', '#ab2000', '#cc3300', '#9a1800'], ground: '#6a2818', accent: '#ff8800' },
            4: { bg: ['#7a3020', '#6a2018', '#5a1010'], pipe: ['#883300', '#bb3000', '#dd4400', '#aa2800'], ground: '#7a2f20', accent: '#ff9600' },
            5: { bg: ['#8a3828', '#7a2820', '#6a1818'], pipe: ['#994400', '#cc4000', '#ee5500', '#bb3800'], ground: '#8a3828', accent: '#ffa400' },

            // Levels 6-10: Twilight Dusk (Purple/Crimson)
            6: { bg: ['#6a2040', '#5a1530', '#4a0a20'], pipe: ['#771155', '#bb3388', '#dd55aa', '#aa2277'], ground: '#6a1f40', accent: '#ff55aa' },
            7: { bg: ['#7a2450', '#6a1840', '#5a0a30'], pipe: ['#882266', '#cc4499', '#ee77bb', '#bb3388'], ground: '#7a2350', accent: '#ff66bb' },
            8: { bg: ['#8a2860', '#7a1c50', '#6a0a40'], pipe: ['#993377', '#dd55aa', '#ff99cc', '#cc4499'], ground: '#8a2860', accent: '#ff77cc' },
            9: { bg: ['#7a1848', '#6a0f38', '#5a0028'], pipe: ['#8a1155', '#cc2288', '#ff44bb', '#bb1166'], ground: '#7a1748', accent: '#ff55aa' },
            10: { bg: ['#6a0f40', '#5a0830', '#4a0020'], pipe: ['#7a0a4d', '#bb1177', '#ee33aa', '#aa0066'], ground: '#6a0e40', accent: '#ff0099' },

            // Levels 11-15: Night Sky (Deep Blue)
            11: { bg: ['#1a2a4a', '#0a1a3a', '#000a2a'], pipe: ['#1a4477', '#2a66bb', '#4488ee', '#1a5588'], ground: '#0a1a30', accent: '#4488ff' },
            12: { bg: ['#0a2a5a', '#001a4a', '#000a3a'], pipe: ['#0a4488', '#1a77dd', '#3399ff', '#0a66aa'], ground: '#001a40', accent: '#3399ff' },
            13: { bg: ['#001a6a', '#000a5a', '#00004a'], pipe: ['#004499', '#1a88ee', '#22aaff', '#006699'], ground: '#000a50', accent: '#22aaff' },
            14: { bg: ['#0a1a7a', '#000a6a', '#00005a'], pipe: ['#0055aa', '#1a99ff', '#33bbff', '#0077cc'], ground: '#000a60', accent: '#33bbff' },
            15: { bg: ['#0a0a8a', '#00008a', '#00007a'], pipe: ['#0055bb', '#1aaa11', '#44ccff', '#0088dd'], ground: '#000070', accent: '#44ccff' },

            // Levels 16-20: Cosmic Space (Cyan/Purple/Stars)
            16: { bg: ['#0a3a8a', '#001a7a', '#00006a'], pipe: ['#00aadd', '#00ddff', '#66ffff', '#00bbee'], ground: '#0a2a6a', accent: '#00ffff' },
            17: { bg: ['#1a2a9a', '#0a1a8a', '#00007a'], pipe: ['#0099ee', '#00ccff', '#55eeff', '#00aadd'], ground: '#0a1a7a', accent: '#00ffff' },
            18: { bg: ['#2a1a9a', '#1a0a8a', '#0a007a'], pipe: ['#6600ff', '#9933ff', '#bb66ff', '#8800ff'], ground: '#1a0a6a', accent: '#bb66ff' },
            19: { bg: ['#3a1aaa', '#2a0a9a', '#1a008a'], pipe: ['#7700ff', '#aa44ff', '#cc88ff', '#9900ff'], ground: '#2a0a7a', accent: '#cc88ff' },
            20: { bg: ['#4a2abb', '#3a1aaa', '#2a0a9a'], pipe: ['#8844ff', '#bb77ff', '#dd99ff', '#aa55ff'], ground: '#3a1a8a', accent: '#ff00ff' }
        };

        // Which skins unlock at each level (skin key => required level)
        const SKIN_LEVEL_REQUIREMENTS = {
            classic:  1,
            void:     2,
            inferno:  4,
            ghost:    6,
            neon:     8,
            skeleton: 10,
            metal:    12,
            cosmic:   15
        };

        const xpManager = {
            totalXP: parseInt(localStorage.getItem('stats.totalXP') || '0', 10),
            currentLevel: parseInt(localStorage.getItem('stats.currentLevel') || '1', 10),
            runXP: 0,   // XP earned this run (not yet committed to total)

            getLevelForXP(xp) {
                let level = 1;
                for (let i = 1; i < XP_LEVELS.length; i++) {
                    if (xp >= XP_LEVELS[i]) level = i + 1;
                    else break;
                }
                return Math.min(level, MAX_LEVEL);
            },

            getXPForLevel(level) {
                if (level <= 1) return 0;
                return XP_LEVELS[Math.min(level - 1, XP_LEVELS.length - 1)];
            },

            getNextLevelXP(level) {
                if (level >= MAX_LEVEL) return XP_LEVELS[XP_LEVELS.length - 1];
                return XP_LEVELS[Math.min(level, XP_LEVELS.length - 1)];
            },

            isSkinUnlocked(skinKey) {
                const req = SKIN_LEVEL_REQUIREMENTS[skinKey] || 1;
                return this.currentLevel >= req;
            },

            addXP(amount) {
                const multiplier = game.activePowerUps && game.activePowerUps.doublepoints ? 2 : 1;
                const gained = amount * multiplier;
                this.runXP += gained;
                return gained;
            },

            commitRunXP() {
                const oldLevel = this.currentLevel;
                this.totalXP += this.runXP;
                this.runXP = 0;
                const newLevel = this.getLevelForXP(this.totalXP);
                this.currentLevel = newLevel;
                localStorage.setItem('stats.totalXP', this.totalXP);
                localStorage.setItem('stats.currentLevel', this.currentLevel);
                return { oldLevel, newLevel };
            },

            // Call during gameplay (preview XP without committing)
            getPreviewXP() {
                return this.totalXP + this.runXP;
            },

            resetRunXP() {
                this.runXP = 0;
            }
        };

        // ─── XP Bar UI Update ─────────────────────────────────────────────
        function updateXPBar() {
            const previewXP = xpManager.getPreviewXP();
            const level = xpManager.getLevelForXP(previewXP);
            const levelXP = xpManager.getXPForLevel(level);
            const nextXP = xpManager.getNextLevelXP(level);
            const progressXP = previewXP - levelXP;
            const rangeXP = nextXP - levelXP;
            const pct = level >= MAX_LEVEL ? 100 : Math.min(100, (progressXP / rangeXP) * 100);

            document.getElementById('xpLevelLabel').textContent = 'Lv.' + level;
            document.getElementById('xpBarFill').style.width = pct + '%';

            if (level >= MAX_LEVEL) {
                document.getElementById('xpProgressText').textContent = 'MAX LEVEL';
            } else {
                document.getElementById('xpProgressText').textContent = progressXP + ' / ' + rangeXP + ' XP';
            }
        }

        // ─── Show floating XP text ────────────────────────────────────────
        function showXPFloat(amount) {
            const container = document.getElementById('gameContainer');
            const el = document.createElement('div');
            el.className = 'xp-float';
            const multi = (game.activePowerUps && game.activePowerUps.doublepoints) ? ' (x2!)' : '';
            el.textContent = '+' + amount + ' XP' + multi;
            // Position near right side, random vertical offset
            el.style.right = '25px';
            el.style.top = (140 + Math.random() * 40) + 'px';
            container.appendChild(el);
            setTimeout(() => el.remove(), 1300);
        }

        // ─── Level-Up Popup & Confetti ────────────────────────────────────
        let confettiParticles = [];
        let confettiAnimId = null;

        function spawnConfetti(canvas) {
            const colors = ['#ffcc00', '#ff6b00', '#ff4500', '#fff', '#ff8c00', '#ffff00'];
            confettiParticles = [];
            for (let i = 0; i < 120; i++) {
                confettiParticles.push({
                    x: Math.random() * canvas.width,
                    y: -10 - Math.random() * 40,
                    w: 8 + Math.random() * 8,
                    h: 5 + Math.random() * 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 4,
                    vy: 2 + Math.random() * 4,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.2,
                    life: 1.0
                });
            }
        }

        function animateConfetti(canvas, ctx2d) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            let anyAlive = false;
            for (const p of confettiParticles) {
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.rotSpeed;
                p.life -= 0.008;
                if (p.life <= 0) continue;
                anyAlive = true;
                ctx2d.save();
                ctx2d.globalAlpha = Math.max(0, p.life);
                ctx2d.translate(p.x, p.y);
                ctx2d.rotate(p.rot);
                ctx2d.fillStyle = p.color;
                ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx2d.restore();
            }
            if (anyAlive) {
                confettiAnimId = requestAnimationFrame(() => animateConfetti(canvas, ctx2d));
            } else {
                ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        function showLevelUpPopup(newLevel) {
            const overlay = document.getElementById('levelupOverlay');
            const popup = document.getElementById('levelupPopup');
            const levelText = document.getElementById('levelupLevelText');
            const unlockEl = document.getElementById('levelupUnlock');
            const confCanvas = document.getElementById('confettiCanvas');
            const confCtx = confCanvas.getContext('2d');

            confCanvas.width = overlay.offsetWidth || window.innerWidth;
            confCanvas.height = overlay.offsetHeight || window.innerHeight;

            levelText.textContent = 'Level ' + newLevel;

            // Check if a skin was unlocked at this level
            const unlockedSkin = Object.entries(SKIN_LEVEL_REQUIREMENTS)
                .find(([key, req]) => req === newLevel);
            if (unlockedSkin) {
                const skinName = birdSkins[unlockedSkin[0]] ? birdSkins[unlockedSkin[0]].name : unlockedSkin[0];
                unlockEl.textContent = '\u{1F513} Unlocked: ' + skinName + ' Skin!';
                unlockEl.classList.add('visible');
            } else {
                unlockEl.classList.remove('visible');
            }

            overlay.classList.add('active');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => { popup.classList.add('show'); });
            });

            // Play level-up sound
            playAudioBuffer('levelUp');

            spawnConfetti(confCanvas);
            if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
            animateConfetti(confCanvas, confCtx);

            setTimeout(() => {
                popup.classList.remove('show');
                setTimeout(() => {
                    overlay.classList.remove('active');
                    confettiParticles = [];
                    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
                    confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
                }, 400);
            }, 3000);
        }

        // ─── Award XP helper (called from game events) ───────────────────
        // streakCount: current streak count (for 5-pipe bonus)
        let lastStreakBonusAt = 0;  // track last streak multiple that got bonus

        function awardXP(reason, streakCount) {
            let amount = 0;
            if (reason === 'pipe') {
                amount = 1;
            } else if (reason === 'powerup') {
                amount = 5;
            } else if (reason === 'streak5' && streakCount % 5 === 0 && streakCount !== lastStreakBonusAt) {
                amount = 10;
                lastStreakBonusAt = streakCount;
            }
            if (amount === 0) return;
            const gained = xpManager.addXP(amount);
            showXPFloat(gained);
            updateXPBar();
        }


        // ─── Death sequence state ──────────────────────────────────────────
        const deathSequence = {
            active: false,
            startTime: 0,
            duration: 1200, // 1.2 seconds total death animation
            birdRotation: 0,
            birdSpinSpeed: 0.18,
            slowMotionDuration: 200, // 0.2s slow-mo on collision
            slowMotionActive: false,
            slowMotionFactor: 1.0, // 1.0 = normal, 0.2 = slow-mo
            screenTint: 0,
            screenTintTarget: 0,
            screenTintSpeed: 0.035,
            screenTintMaxOpacity: 0.6,
            deadTextAlpha: 0,
            deadTextScale: 0,
            deadTextAppearTime: 150, // ms before "DEAD" shows
            collisionX: 0,
            collisionY: 0,
            collisionPipeX: 0,
            showDeadText: false,
            birdBlinkIntensity: 0,
            trailParticleRate: 0.5
        };
        let scrollOffset = 0;

        // ─── Stats tracking system ─────────────────────────────────────────
        const statsManager = {
            // Initialize stats from localStorage
            stats: {
                allTimeHigh: localStorage.getItem('stats.allTimeHigh') || 0,
                bestStreak: localStorage.getItem('stats.bestStreak') || 0,
                gamesPlayed: localStorage.getItem('stats.gamesPlayed') || 0,
                totalPipes: localStorage.getItem('stats.totalPipes') || 0,
                powerUpCounts: JSON.parse(localStorage.getItem('stats.powerUpCounts') || '{"shield":0,"powbomb":0,"doublepoints":0}'),
                runs: JSON.parse(localStorage.getItem('stats.runs') || '[]')
            },

            // Per-run tracking
            currentRun: {
                bestStreak: 0,
                powerUpsCollected: {
                    shield: 0,
                    powbomb: 0,
                    doublepoints: 0
                },
                totalPipesCleared: 0,
                difficulty: 'normal',
                timestamp: null,
                finalScore: 0
            },

            recordPowerUpCollection(type) {
                this.currentRun.powerUpsCollected[type]++;
                this.stats.powerUpCounts[type]++;
                this.savePowerUpCounts();
            },

            recordPipeCleared() {
                this.currentRun.totalPipesCleared++;
                this.stats.totalPipes++;
                this.saveTotalPipes();
            },

            recordStreakUpdate(streak) {
                if (streak > this.currentRun.bestStreak) {
                    this.currentRun.bestStreak = streak;
                }
                if (streak > this.stats.bestStreak) {
                    this.stats.bestStreak = streak;
                    this.saveBestStreak();
                }
            },

            startNewRun(difficulty) {
                this.currentRun = {
                    bestStreak: 0,
                    powerUpsCollected: {
                        shield: 0,
                        powbomb: 0,
                        doublepoints: 0
                    },
                    totalPipesCleared: 0,
                    difficulty: difficulty,
                    timestamp: new Date().toISOString(),
                    finalScore: 0
                };
            },

            endRun(finalScore) {
                this.currentRun.finalScore = finalScore;
                this.stats.gamesPlayed++;

                // Update all-time high
                if (finalScore > this.stats.allTimeHigh) {
                    this.stats.allTimeHigh = finalScore;
                    this.saveAllTimeHigh();
                }

                // Save run to history (keep last 5)
                this.stats.runs.unshift({
                    score: finalScore,
                    bestStreak: this.currentRun.bestStreak,
                    pipesCleared: this.currentRun.totalPipesCleared,
                    powerUps: {...this.currentRun.powerUpsCollected},
                    difficulty: this.currentRun.difficulty,
                    timestamp: this.currentRun.timestamp
                });
                if (this.stats.runs.length > 5) {
                    this.stats.runs = this.stats.runs.slice(0, 5);
                }

                this.saveGamesPlayed();
                this.saveRuns();
            },

            // Persistence methods
            saveAllTimeHigh() {
                localStorage.setItem('stats.allTimeHigh', this.stats.allTimeHigh);
            },
            saveBestStreak() {
                localStorage.setItem('stats.bestStreak', this.stats.bestStreak);
            },
            saveGamesPlayed() {
                localStorage.setItem('stats.gamesPlayed', this.stats.gamesPlayed);
            },
            saveTotalPipes() {
                localStorage.setItem('stats.totalPipes', this.stats.totalPipes);
            },
            savePowerUpCounts() {
                localStorage.setItem('stats.powerUpCounts', JSON.stringify(this.stats.powerUpCounts));
            },
            saveRuns() {
                localStorage.setItem('stats.runs', JSON.stringify(this.stats.runs));
            },

            // Format display methods
            getMostUsedPowerUp() {
                let mostUsed = 'shield';
                let maxCount = this.stats.powerUpCounts.shield;
                if (this.stats.powerUpCounts.powbomb > maxCount) {
                    mostUsed = 'powbomb';
                    maxCount = this.stats.powerUpCounts.powbomb;
                }
                if (this.stats.powerUpCounts.doublepoints > maxCount) {
                    mostUsed = 'doublepoints';
                    maxCount = this.stats.powerUpCounts.doublepoints;
                }
                return { type: mostUsed, count: maxCount };
            },

            getStreakMessage() {
                const streak = this.currentRun.bestStreak;
                if (streak > 0) {
                    return `Best streak this run: ${streak} pipes`;
                }
                return '';
            },

            getPowerUpMessage() {
                const total = this.currentRun.powerUpsCollected.shield +
                             this.currentRun.powerUpsCollected.powbomb +
                             this.currentRun.powerUpsCollected.doublepoints;
                if (total > 0) {
                    return `Nice! You collected ${total} power-up${total !== 1 ? 's' : ''}`;
                }
                return '';
            },

            getPersonalBestMessage() {
                if (this.currentRun.finalScore > this.stats.allTimeHigh * 0.95 && this.currentRun.finalScore !== this.stats.allTimeHigh) {
                    return '⭐ Personal best incoming!';
                }
                if (this.currentRun.finalScore === this.stats.allTimeHigh && this.stats.gamesPlayed > 1) {
                    return '🔥 Matched your personal best!';
                }
                return '';
            }
        };

        // ─── Particle system ───────────────────────────────────────────────
        const particles = [];

        function spawnPipeParticles(x, y) {
            const count = 6 + Math.floor(Math.random() * 3); // 6-8
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
                const speed = 2.5 + Math.random() * 3;
                const colors = ['#ff6b00', '#ff4500', '#ff8c00', '#ff2200', '#ffaa00'];
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1, // slight upward bias
                    life: 1.0,
                    decay: 0.025 + Math.random() * 0.02,
                    radius: 3 + Math.random() * 4,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        }


        function spawnDeathTrailParticles(x, y) {
            // Dramatic fall trail during death sequence
            const count = 12 + Math.floor(Math.random() * 8);
            const colors = ['#ff2200', '#ff4500', '#ff6b00', '#ff8c00', '#ffaa00', '#ffcc00'];
            for (let i = 0; i < count; i++) {
                const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 0.8; // mostly downward
                const speed = 1 + Math.random() * 2.5;
                particles.push({
                    x: x + (Math.random() - 0.5) * 15,
                    y: y,
                    vx: Math.cos(angle) * speed * (Math.random() - 0.5),
                    vy: Math.sin(angle) * speed + 1,
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.015,
                    radius: 2 + Math.random() * 3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    isDeathTrail: true
                });
            }
        }

        function spawnPipeCrackParticles(x, y) {
            // Shattered pipe pieces on collision
            const count = 16 + Math.floor(Math.random() * 12);
            const colors = ['#550000', '#8b0000', '#aa1100', '#ff4500', '#ff6b00'];
            for (let i = 0; i < count; i++) {
                const angle = Math.PI * 2 * Math.random();
                const speed = 2 + Math.random() * 6;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.5,
                    life: 1.0,
                    decay: 0.015 + Math.random() * 0.01,
                    radius: 4 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.3
                });
            }
        }

        function updateParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12; // gentle gravity
                p.life -= p.decay;
                if (p.rotation !== undefined) {
                    p.rotation += p.rotationSpeed;
                }
                if (p.life <= 0) particles.splice(i, 1);
            }
        }

        function drawParticles() {
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }

        // ─── Jump ring / visual feedback ───────────────────────────────────
        const jumpRings = [];

        function spawnJumpRing() {
            jumpRings.push({
                x: bird.x,
                y: bird.y,
                radius: bird.radius,
                life: 1.0
            });
        }

        function updateJumpRings() {
            for (let i = jumpRings.length - 1; i >= 0; i--) {
                const r = jumpRings[i];
                r.radius += 2.5;
                r.life -= 0.07;
                if (r.life <= 0) jumpRings.splice(i, 1);
            }
        }

        function drawJumpRings() {
            jumpRings.forEach(r => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, r.life * 0.7);
                ctx.strokeStyle = '#ff8c00';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#ff6b00';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            });
        }

        // ─── Screen shake ──────────────────────────────────────────────────
        const shake = {
            intensity: 0,
            duration: 0,
            offsetX: 0,
            offsetY: 0
        };

        function triggerShake(intensity = 5, duration = 15) {
            shake.intensity = intensity;
            shake.duration = duration;
        }

        function triggerExplosionShake(intensity = 8, duration = 12) {
            shake.intensity = intensity;
            shake.duration = duration;
        }

        function updateShake() {
            if (shake.duration > 0) {
                // Optimize: only apply X offset for snappier performance
                shake.offsetX = (Math.random() - 0.5) * shake.intensity;
                shake.offsetY = 0;
                shake.duration--;
                shake.intensity *= 0.9; // dampen
            } else {
                shake.offsetX = 0;
                shake.offsetY = 0;
            }
        }

        // ─── Audio ────────────────────────────────────────────────────────
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffers = {};
        const audioSources = [];
        let audioInitialized = false;

        // Audio file mapping
        const audioFiles = {
            jump: 'sounds/jump.mp3',
            score: 'sounds/score.mp3',
            gameOver: 'sounds/game-over.mp3',
            powerUp: 'sounds/power-up.mp3',
            shield: 'sounds/shield.mp3',
            powBomb: 'sounds/pow-bomb.mp3',
            menuMusic: 'sounds/menu-music.mp3',
            levelUp: 'sounds/levelup.mp3',
            startHint: 'sounds/start-hint.mp3'
        };

        // Ensure audio context is ready
        async function ensureAudioContext() {
            try {
                if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                    console.log('[AUDIO] Context resumed');
                }
            } catch (e) {
                console.error('[AUDIO] Failed to resume context:', e);
            }
        }

        // Load an audio file and decode it
        async function loadAudioFile(key, filename) {
            try {
                await ensureAudioContext();
                const response = await fetch(filename);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                audioBuffers[key] = audioBuffer;
                console.log(`[AUDIO] ✓ Loaded ${key}`);
            } catch (e) {
                console.error(`[AUDIO] ✗ Failed to load ${key} (${filename}):`, e.message);
            }
        }

        // Initialize: Load all essential audio files
        async function initializeAudio() {
            if (audioInitialized) {
                console.log('[AUDIO] Already initialized');
                return;
            }
            console.log('[AUDIO] Starting initialization...');
            await ensureAudioContext();

            // Load all sounds in parallel
            await Promise.all([
                loadAudioFile('jump', audioFiles.jump),
                loadAudioFile('score', audioFiles.score),
                loadAudioFile('gameOver', audioFiles.gameOver),
                loadAudioFile('menuMusic', audioFiles.menuMusic),
                loadAudioFile('powerUp', audioFiles.powerUp),
                loadAudioFile('shield', audioFiles.shield),
                loadAudioFile('powBomb', audioFiles.powBomb),
                loadAudioFile('levelUp', audioFiles.levelUp),
                loadAudioFile('startHint', audioFiles.startHint)
            ]);
            audioInitialized = true;
            console.log('[AUDIO] ✓ Initialization complete');
        }

        // Play an audio buffer
        function playAudioBuffer(key) {
            if (!game.soundEnabled) return;
            if (!audioBuffers[key]) {
                // Audio not loaded yet - try loading on demand
                if (!audioInitialized) {
                    console.log(`[AUDIO] Audio not ready, loading ${key}...`);
                    loadAudioFile(key, audioFiles[key]);
                }
                return;
            }

            try {
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffers[key];
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
                source.connect(gain);
                gain.connect(audioCtx.destination);
                source.start(0);
                audioSources.push(source);
                // Clean up sources after they finish
                source.onended = () => {
                    audioSources.splice(audioSources.indexOf(source), 1);
                };
            } catch (e) {
                console.error(`[AUDIO] Error playing ${key}:`, e.message);
            }
        }

        function jumpSound() {
            playAudioBuffer('jump');
        }

        function scoreSound() {
            playAudioBuffer('score');
        }

        function gameOverSound() {
            playAudioBuffer('gameOver');
        }

        function collectPowerUpSound() {
            playAudioBuffer('powerUp');
        }

        function shieldBlockSound() {
            playAudioBuffer('shield');
        }

        function playPowSound() {
            playAudioBuffer('powBomb');
        }

        let screenFlash = {
            active: false,
            duration: 0,
            maxDuration: 100
        };

        function triggerScreenFlash() {
            screenFlash.active = true;
            screenFlash.duration = screenFlash.maxDuration;
        }

        let musicPlaying = false;
        let musicLoopTimeout = null;

        function playMelodySequence() {
            if (!game.soundEnabled || !audioBuffers['menuMusic']) {
                musicPlaying = false;
                return;
            }

            // Play the menu music
            playAudioBuffer('menuMusic');

            // Schedule to loop (menu-music.mp3 is ~4 seconds)
            if (musicPlaying) {
                musicLoopTimeout = setTimeout(() => {
                    if (musicPlaying) playMelodySequence();
                }, 3800); // Slightly before it ends to avoid gaps
            }
        }

        function playStartMusic() {
            if (musicPlaying) return;
            musicPlaying = true;
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(() => {
                    if (musicPlaying) playMelodySequence();
                });
            } else {
                playMelodySequence();
            }
        }

        function stopStartMusic() {
            musicPlaying = false;
            if (musicLoopTimeout) {
                clearTimeout(musicLoopTimeout);
                musicLoopTimeout = null;
            }
        }

        // ─── Message queue system for popups ──────────────────────────────
        const popupManager = {
            queue: [],
            currentPopup: null,
            isProcessing: false,

            enqueue(type, message, duration) {
                this.queue.push({ type, message, duration });
                this.process();
            },

            process() {
                if (this.isProcessing || this.queue.length === 0) return;

                // Filter queue to ensure streak messages have priority
                // Remove motivational if streak is waiting
                const hasStreak = this.queue.some(m => m.type === 'streak');
                if (hasStreak) {
                    this.queue = this.queue.filter(m => m.type === 'streak' || m.type === 'active');
                }

                const next = this.queue.shift();
                if (!next) return;

                this.show(next.type, next.message, next.duration);
            },

            show(type, message, duration) {
                this.isProcessing = true;
                const popupId = type === 'streak' ? 'comboPopup' : 'motivationPopup';
                const popup = document.getElementById(popupId);

                // Update DOM without blocking
                requestAnimationFrame(() => {
                    popup.textContent = message;
                    popup.style.display = 'block';
                    popup.classList.remove('disappear');
                });

                // Schedule hide operation
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        popup.classList.add('disappear');
                    });
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            popup.style.display = 'none';
                            this.isProcessing = false;
                            this.process();
                        });
                    }, 200);
                }, duration);
            }
        };

        // ─── Motivational messages ─────────────────────────────────────────
        const motivationalMessages = [
            '\uD83D\uDD25 INSANE! \uD83D\uDD25',
            '\u2620\uFE0F UNSTOPPABLE \u2620\uFE0F',
            '\uD83D\uDC80 LEGEND! \uD83D\uDC80',
            '\uD83C\uDF2A\uFE0F APOCALYPTIC! \uD83C\uDF2A\uFE0F',
            '\u26A1 BEAST MODE \u26A1',
            '\uD83D\uDD25 DOMINATING! \uD83D\uDD25',
            '\uD83D\uDCA5 DESTRUCTIVE! \uD83D\uDCA5',
            '\uD83D\uDC51 SURVIVOR \uD83D\uDC51',
            '\uD83C\uDFAF FLAWLESS! \uD83C\uDFAF',
            '\uD83C\uDF2A\uFE0F ON FIRE! \uD83C\uDF2A\uFE0F'
        ];

        function showMotivation() {
            const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
            popupManager.enqueue('motivational', message, 2000);
        }

        // ─── Combo/Streak system ──────────────────────────────────────────
        const streakMessages = [
            '🔥 x2 COMBO!',
            '⚡ x3 COMBO!!',
            '💥 x5 COMBO!!!',
            '🌪️ x7 MEGA!!',
            '☠️ x10 APOCALYPTIC!!',
            '🔥 STREAK ON FIRE!'
        ];

        function updateStreakDisplay() {
            document.getElementById('streakCount').textContent = game.streak;
        }

        function showComboPopup(multiplier) {
            const message = streakMessages[Math.min(streakMessages.length - 1, Math.floor(multiplier / 2))];
            popupManager.enqueue('streak', message, 1500);
        }

        function addToStreak() {
            const streakThreshold = difficultySettings[game.difficulty].streakThreshold;
            game.streak++;

            if (game.streak > game.maxStreak) {
                game.maxStreak = game.streak;
                localStorage.setItem('flappyBirdMaxStreak', game.maxStreak);
            }

            // Track streak in stats
            statsManager.recordStreakUpdate(game.streak);
            // Track pipe cleared in stats
            statsManager.recordPipeCleared();

            updateStreakDisplay();

            if (game.streak % streakThreshold === 0) {
                showComboPopup(game.streak);
                playAudioBuffer('powerUp');
            }
        }

        function resetStreak() {
            game.streak = 0;
            updateStreakDisplay();
        }

        // ─── Power-up management ──────────────────────────────────────────
        function spawnPowerUp(x, y) {
            const types = ['shield', 'powbomb', 'doublepoints'];
            const type = types[Math.floor(Math.random() * types.length)];
            powerUps.push({
                x: x,
                y: y,
                type: type,
                collected: false,
                spawnTime: Date.now(),
                lifetime: 15000, // 15 seconds before disappear
                rotation: 0
            });
        }

        function activatePowerUp(type) {
            const now = Date.now();
            game.activePowerUps[type] = {
                startTime: now,
                duration: powerUpTypes[type].duration
            };

            // Record power-up collection in stats
            statsManager.recordPowerUpCollection(type);

            // Visual feedback: white flash on bird
            bird.powerUpFlashTimer = bird.powerUpFlashDuration;

            if (type === 'shield') {
                // Shield shows visual indicator on bird
            } else if (type === 'powbomb') {
                // POW-Bomb: clear all active pipes + eyes widen effect
                bird.eyeWidthMultiplier = 2.0; // Eyes widen
                setTimeout(() => {
                    bird.eyeWidthMultiplier = 1.0;
                }, 300);
                playPowSound();
                triggerScreenFlash();
                triggerExplosionShake();
                spawnExplosionParticles();
                pipes.length = 0; // Clear all pipes
                // Immediately remove powbomb from active powerups (instantaneous effect)
                game.activePowerUps[type] = null;
                updatePowerUpDisplay();
                return;
            } else if (type === 'doublepoints') {
                pointMultiplier = 2;
                updateMultiplierDisplay();
            }

            collectPowerUpSound();
            updatePowerUpDisplay();
        }

        function deactivatePowerUp(type) {
            if (type === 'powbomb') {
                // POW-Bomb has no deactivation (instantaneous effect)
            } else if (type === 'doublepoints') {
                pointMultiplier = 1;
                updateMultiplierDisplay();
            }
            game.activePowerUps[type] = null;
            updatePowerUpDisplay();
        }

        let powerUpDisplayCache = {};

        function updatePowerUpDisplay() {
            const display = document.getElementById('powerUpDisplay');
            const currentState = {};

            // Build new state
            Object.keys(game.activePowerUps).forEach(type => {
                const active = game.activePowerUps[type];
                if (!active) return;

                let timeRemaining = 'ACTIVE';
                if (active.duration !== Infinity) {
                    const elapsed = Date.now() - active.startTime;
                    const remaining = Math.ceil((active.duration - elapsed) / 1000);
                    timeRemaining = `${remaining}s`;
                }
                currentState[type] = timeRemaining;
            });

            // Simple state comparison (avoid expensive JSON.stringify)
            let stateChanged = Object.keys(currentState).length !== Object.keys(powerUpDisplayCache).length;
            if (!stateChanged) {
                for (let type in currentState) {
                    if (currentState[type] !== powerUpDisplayCache[type]) {
                        stateChanged = true;
                        break;
                    }
                }
            }

            powerUpDisplayCache = currentState;

            // Only update DOM if changes detected
            if (!stateChanged && display.children.length > 0) {
                return;
            }

            // Clear and rebuild (only when needed)
            display.innerHTML = '';
            Object.keys(currentState).forEach(type => {
                const timeRemaining = currentState[type];
                const element = document.createElement('div');
                element.className = `power-up-item ${type}`;

                // Flash when about to expire (< 3 seconds)
                if (timeRemaining !== 'ACTIVE') {
                    const remaining = parseInt(timeRemaining);
                    if (remaining <= 3 && remaining > 0) {
                        element.classList.add('expiring');
                    }
                }

                const icon = getIconSymbol(type);
                element.textContent = `${icon} ${powerUpTypes[type].effect} - ${timeRemaining}`;
                display.appendChild(element);
            });
        }

        function updateMultiplierDisplay() {
            const display = document.getElementById('multiplierDisplay');
            const multiplier = document.getElementById('multiplier');
            if (pointMultiplier > 1) {
                display.style.display = 'block';
                multiplier.textContent = pointMultiplier;
            } else {
                display.style.display = 'none';
            }
        }

        function getIconSymbol(type) {
            switch (type) {
                case 'shield': return '🛡️';
                case 'powbomb': return '💥';
                case 'doublepoints': return '⭐';
                default: return '✨';
            }
        }

        function updateActivePowerUps() {
            const now = Date.now();

            Object.keys(game.activePowerUps).forEach(type => {
                const active = game.activePowerUps[type];
                if (!active) return;

                // Check if duration expired (but not shield, which is Infinity)
                if (active.duration !== Infinity) {
                    const elapsed = now - active.startTime;
                    if (elapsed >= active.duration) {
                        deactivatePowerUp(type);
                    }
                }
            });

            updatePowerUpDisplay();
        }

        function spawnPowerUpParticles(x, y, type) {
            const count = 12;
            const color = powerUpTypes[type].color;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
                const speed = 2 + Math.random() * 3;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1,
                    life: 1.0,
                    decay: 0.03 + Math.random() * 0.02,
                    radius: 2 + Math.random() * 3,
                    color: color
                });
            }
        }

        function spawnExplosionParticles() {
            const count = 24;
            const colors = ['#ff4500', '#ff6b00', '#ff8c00', '#ffaa00', '#ff2200'];
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
                const speed = 3 + Math.random() * 5;
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.5,
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.015,
                    radius: 4 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        }

        // ─── Draw power-ups ────────────────────────────────────────────────
        function drawPowerUps() {
            powerUps.forEach((pu, index) => {
                if (pu.collected) return;

                const elapsed = Date.now() - pu.spawnTime;
                const alpha = elapsed < pu.lifetime * 0.7 ? 1.0 : 0.3 + (1 - (elapsed / pu.lifetime)) * 0.7;

                if (alpha <= 0.1) return;

                pu.rotation += 0.08;
                const size = 75;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(pu.x, pu.y);
                ctx.rotate(pu.rotation);

                // Glow effect
                const glowColor = powerUpTypes[pu.type].glowColor;
                const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.8);
                glowGrad.addColorStop(0, glowColor);
                glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
                ctx.fill();

                // Draw power-up icon based on type
                if (pu.type === 'shield') {
                    drawShieldIcon(0, 0, size * 0.5);
                } else if (pu.type === 'powbomb') {
                    drawBombIcon(0, 0, size * 0.5);
                } else if (pu.type === 'doublepoints') {
                    drawStarIcon(0, 0, size * 0.5);
                }

                ctx.restore();
            });
        }

        function drawShieldIcon(x, y, size) {
            ctx.save();
            ctx.translate(x, y);
            ctx.strokeStyle = '#4da6ff';
            ctx.fillStyle = 'rgba(77, 166, 255, 0.3)';
            ctx.lineWidth = 3;

            // Shield shape
            ctx.beginPath();
            ctx.moveTo(-size * 0.3, -size * 0.5);
            ctx.lineTo(size * 0.3, -size * 0.5);
            ctx.lineTo(size * 0.35, size * 0.2);
            ctx.bezierCurveTo(size * 0.3, size * 0.4, 0, size * 0.5, -size * 0.35, size * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        function drawBombIcon(x, y, size) {
            ctx.save();
            ctx.translate(x, y);
            ctx.fillStyle = '#ff4500';
            ctx.strokeStyle = '#ff6b00';
            ctx.lineWidth = 2;

            // Main bomb sphere
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
            grad.addColorStop(0, '#ff6b00');
            grad.addColorStop(1, '#cc3300');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, size * 0.1, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Fuse (curved line)
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, size * 0.1 - size * 0.4);
            ctx.quadraticCurveTo(size * 0.15, -size * 0.3, size * 0.2, -size * 0.5);
            ctx.stroke();

            // Spark at fuse tip
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(size * 0.2, -size * 0.5, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        function drawStarIcon(x, y, size) {
            ctx.save();
            ctx.translate(x, y);
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#ffff99';
            ctx.lineWidth = 2;

            // Draw 5-pointed star
            const points = 5;
            const outerRadius = size * 0.5;
            const innerRadius = size * 0.22;

            ctx.beginPath();
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        // ─── Bird trail particle system ────────────────────────────────────
        function updateBirdTrail() {
            // Spawn trail particles when bird is moving fast enough
            if (Math.abs(bird.velocity) > 3) {
                const particle = {
                    x: bird.x - Math.cos(bird.rotation) * bird.radius * 0.8,
                    y: bird.y - Math.sin(bird.rotation) * bird.radius * 0.8,
                    vx: -Math.cos(bird.rotation) * 2,
                    vy: -Math.sin(bird.rotation) * 2,
                    life: 1.0,
                    maxLife: 0.4
                };
                bird.trailParticles.push(particle);
            }

            // Update particles
            for (let i = bird.trailParticles.length - 1; i >= 0; i--) {
                const p = bird.trailParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.maxLife * 0.05;
                p.vy += 0.1; // gravity

                if (p.life <= 0) {
                    bird.trailParticles.splice(i, 1);
                }
            }

            // Limit particle count
            if (bird.trailParticles.length > 30) {
                bird.trailParticles.shift();
            }
        }

        function drawBirdTrail() {
            bird.trailParticles.forEach(p => {
                const alpha = p.life / p.maxLife;
                ctx.globalAlpha = alpha * 0.4;
                ctx.fillStyle = '#ff9900';
                ctx.beginPath();
                ctx.arc(p.x - bird.x, p.y - bird.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        // ─── Draw bird (with rotation) ─────────────────────────────────────
        function drawBird() {
            // Target rotation: clamp velocity-based tilt between -30deg and +70deg
            const targetRotation = Math.max(-0.52, Math.min(1.22, bird.velocity * 0.065));
            // Smooth interpolation
            bird.rotation += (targetRotation - bird.rotation) * 0.18;

            // Update wing flapping animation (continuous)
            bird.wingFlapFrame = (bird.wingFlapFrame + 0.12) % (Math.PI * 2);
            bird.wingRotation = Math.sin(bird.wingFlapFrame) * 0.3;

            // Update eye blink
            bird.nextBlink -= 16.67; // ~60fps
            if (bird.nextBlink <= 0) {
                bird.eyeBlinkTimer = bird.eyeBlinkDuration;
                bird.nextBlink = bird.eyeBlinkInterval + Math.random() * 2000;
            }
            if (bird.eyeBlinkTimer > 0) {
                bird.eyeBlinkTimer -= 16.67;
            }
            const blinkAmount = Math.max(0, 1 - bird.eyeBlinkTimer / (bird.eyeBlinkDuration * 0.5));

            // Update power-up flash
            if (bird.powerUpFlashTimer > 0) {
                bird.powerUpFlashTimer -= 16.67;
            }

            // Update trail particles
            updateBirdTrail();

            ctx.save();
            ctx.translate(bird.x, bird.y);
            ctx.rotate(bird.rotation);

            // Draw trail effect if moving fast
            drawBirdTrail();

            // Body glow - enhanced when power-ups active
            let glowIntensity = 0.35;
            let glowColor = 'rgba(255, 140, 0, ';
            if (game.activePowerUps.shield) {
                glowIntensity = 0.5;
                glowColor = 'rgba(77, 166, 255, ';
            } else if (game.activePowerUps.doublepoints) {
                glowIntensity = 0.45;
                glowColor = 'rgba(255, 200, 0, ';
            }

            const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.radius * 1.8);
            glowGrad.addColorStop(0, glowColor + glowIntensity + ')');
            glowGrad.addColorStop(1, glowColor + '0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, bird.radius * 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Power-up collection flash (white overlay)
            if (bird.powerUpFlashTimer > 0) {
                const flashAlpha = (bird.powerUpFlashTimer / bird.powerUpFlashDuration) * 0.6;
                ctx.globalAlpha = flashAlpha;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, bird.radius * 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Draw the selected skin
            const selectedSkin = birdSkins[game.selectedSkin] || birdSkins.classic;
            selectedSkin.draw();

            // Eye with blink and width modulation (applies to all skins)
            const eyeRadius = 4 * (0.6 + blinkAmount * 0.4);
            const eyeWidth = 4 * bird.eyeWidthMultiplier * (0.6 + blinkAmount * 0.4);
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(6, -5, eyeWidth, eyeRadius, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye highlight (only when not blinking)
            if (blinkAmount > 0.1) {
                ctx.fillStyle = '#fff';
                const highlightRadius = 1.5 * blinkAmount;
                ctx.beginPath();
                ctx.arc(7, -6, highlightRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Shield overlay if active
            if (game.activePowerUps.shield) {
                ctx.globalAlpha = 0.6;
                const shieldGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.radius * 2.2);
                shieldGrad.addColorStop(0, 'rgba(77, 166, 255, 0.4)');
                shieldGrad.addColorStop(1, 'rgba(77, 166, 255, 0)');
                ctx.fillStyle = shieldGrad;
                ctx.beginPath();
                ctx.arc(0, 0, bird.radius * 2.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = 1;
                ctx.strokeStyle = '#4da6ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, bird.radius * 1.5, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Invulnerability glow (pulsing cyan/bright blue)
            if (game.invulnerable) {
                const pulseIntensity = 0.5 + Math.sin((1000 - game.invulnerabilityTimer) / 150) * 0.5;
                ctx.globalAlpha = pulseIntensity * 0.7;

                const invulnGrad = ctx.createRadialGradient(0, 0, bird.radius * 0.8, 0, 0, bird.radius * 2.5);
                invulnGrad.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                invulnGrad.addColorStop(0.5, 'rgba(0, 200, 255, 0.4)');
                invulnGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');
                ctx.fillStyle = invulnGrad;
                ctx.beginPath();
                ctx.arc(0, 0, bird.radius * 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Outer pulsing ring
                ctx.globalAlpha = pulseIntensity * 0.5;
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, 0, bird.radius * 2, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }

        // ─── Draw pipes (with 3-D depth effect) ───────────────────────────
        function drawPipes() {
            // Get current level's color scheme
            const currentLevel = xpManager.currentLevel;
            const colors = LEVEL_COLOR_SCHEMES[currentLevel] || LEVEL_COLOR_SCHEMES[1];
            const pipeColors = colors.pipe;

            pipes.forEach(pipe => {
                const px = pipe.x;
                const pw = pipeWidth;

                // ── Top pipe ──────────────────────────────────────────────
                // Main body — side-lit gradient for 3-D look
                const topGrad = ctx.createLinearGradient(px, 0, px + pw, 0);
                topGrad.addColorStop(0,    pipeColors[0]);
                topGrad.addColorStop(0.15, pipeColors[1]);
                topGrad.addColorStop(0.45, pipeColors[2]);
                topGrad.addColorStop(0.7,  pipeColors[3]);
                topGrad.addColorStop(1,    pipeColors[0]);
                ctx.fillStyle = topGrad;
                ctx.fillRect(px, 0, pw, pipe.top - 8);

                // Vertical highlight stripe
                ctx.fillStyle = 'rgba(255,200,100,0.12)';
                ctx.fillRect(px + pw * 0.25, 0, pw * 0.2, pipe.top - 8);

                // Rivet marks every ~40px
                ctx.fillStyle = 'rgba(255,150,100,0.25)';
                for (let ry = 30; ry < pipe.top - 16; ry += 40) {
                    ctx.beginPath();
                    ctx.arc(px + pw * 0.25, ry, 2.5, 0, Math.PI * 2);
                    ctx.arc(px + pw * 0.75, ry, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Rim cap
                ctx.fillStyle = pipeColors[2];
                ctx.fillRect(px - 4, pipe.top - 12, pw + 8, 12);
                // Rim bevel top edge
                ctx.fillStyle = colors.accent;
                ctx.fillRect(px - 4, pipe.top - 12, pw + 8, 3);
                // Rim inner shadow
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(px - 4, pipe.top - 3, pw + 8, 3);

                // ── Bottom pipe ───────────────────────────────────────────
                const botGrad = ctx.createLinearGradient(px, pipe.bottom, px + pw, pipe.bottom);
                botGrad.addColorStop(0,    pipeColors[0]);
                botGrad.addColorStop(0.15, pipeColors[1]);
                botGrad.addColorStop(0.45, pipeColors[2]);
                botGrad.addColorStop(0.7,  pipeColors[3]);
                botGrad.addColorStop(1,    pipeColors[0]);
                ctx.fillStyle = botGrad;
                ctx.fillRect(px, pipe.bottom + 12, pw, canvas.height - pipe.bottom);

                // Vertical highlight stripe
                ctx.fillStyle = 'rgba(255,80,0,0.12)';
                ctx.fillRect(px + pw * 0.25, pipe.bottom + 12, pw * 0.2, canvas.height - pipe.bottom);

                // Rivet marks
                ctx.fillStyle = 'rgba(255,60,0,0.25)';
                for (let ry = pipe.bottom + 30; ry < canvas.height - 10; ry += 40) {
                    ctx.beginPath();
                    ctx.arc(px + pw * 0.25, ry, 2.5, 0, Math.PI * 2);
                    ctx.arc(px + pw * 0.75, ry, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Rim cap
                ctx.fillStyle = '#cc2200';
                ctx.fillRect(px - 4, pipe.bottom, pw + 8, 12);
                // Rim bevel bottom edge
                ctx.fillStyle = '#ff6b00';
                ctx.fillRect(px - 4, pipe.bottom + 9, pw + 8, 3);
                // Rim inner shadow
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(px - 4, pipe.bottom, pw + 8, 3);
            });
        }

        // ─── Draw background ───────────────────────────────────────────────
        function drawBackground() {
            // Get current level's color scheme
            const currentLevel = xpManager.currentLevel;
            const colors = LEVEL_COLOR_SCHEMES[currentLevel] || LEVEL_COLOR_SCHEMES[1];

            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, colors.bg[0]);
            skyGradient.addColorStop(0.5, colors.bg[1]);
            skyGradient.addColorStop(1, colors.bg[2]);
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const groundY = canvas.height * 0.85;
            ctx.fillStyle = colors.ground;
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

            ctx.strokeStyle = 'rgba(255, 107, 0, 0.2)';
            ctx.lineWidth = 1;
            for (let i = -1; i < 3; i++) {
                const x = (i * 60 + scrollOffset) % canvas.width;
                ctx.beginPath();
                ctx.moveTo(x, groundY);
                ctx.lineTo(x + 30, groundY - 10);
                ctx.stroke();
            }

            ctx.fillStyle = 'rgba(255, 107, 0, 0.1)';
            for (let i = 0; i < 5; i++) {
                const x = (i * 120 + scrollOffset * 0.5) % canvas.width;
                ctx.beginPath();
                ctx.arc(x, canvas.height * 0.4, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ─── Score flash ───────────────────────────────────────────────────
        function flashScore() {
            const el = document.getElementById('scoreDisplay');
            el.classList.remove('flash');
            // Force reflow so re-adding the class re-triggers animation
            void el.offsetWidth;
            el.classList.add('flash');
        }

        // ─── Update ────────────────────────────────────────────────────────
        function update() {
            if (game.gameOver || !game.started) return;

            scrollOffset += 1;

            // Bird physics
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;

            // Update invulnerability timer
            if (game.invulnerable) {
                game.invulnerabilityTimer -= 16; // ~60fps, ~16ms per frame
                if (game.invulnerabilityTimer <= 0) {
                    game.invulnerable = false;
                    game.invulnerabilityTimer = 0;
                }
            }

            // Update rings & particles & power-ups
            updateJumpRings();
            updateParticles();
            updateActivePowerUps();

            // Generate pipes
            pipeCounter++;
            if (pipeCounter > pipeFrequency) {
                const gapStart = Math.random() * (canvas.height - pipeGap - 50) + 25;
                const pipe = {
                    x: canvas.width,
                    top: gapStart,
                    bottom: gapStart + pipeGap,
                    scored: false
                };
                pipes.push(pipe);

                // Spawn power-up in the gap with rare chance (5-10%)
                if (Math.random() < 0.075) {
                    const powerUpY = gapStart + pipeGap / 2;
                    spawnPowerUp(canvas.width, powerUpY);
                }

                pipeCounter = 0;
            }

            // Update pipes
            pipes.forEach((pipe, index) => {
                pipe.x -= pipeSpeed;

                if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
                    pipe.scored = true;
                    game.score += pointMultiplier;
                    addToStreak();
                    awardXP('pipe');
                    awardXP('streak5', game.streak);
                    document.getElementById('score').textContent = game.score;
                    scoreSound();
                    flashScore();
                    haptic(30); // subtle haptic on each point scored
                    // Burst particles at the gap midpoint beside the bird
                    spawnPipeParticles(bird.x, pipe.top + pipeGap / 2);

                    if (game.score % 10 === 0) showMotivation();
                }

                if (pipe.x + pipeWidth < 0) pipes.splice(index, 1);
            });

            // Update power-ups
            powerUps.forEach((pu, index) => {
                pu.x -= pipeSpeed;
                const elapsed = Date.now() - pu.spawnTime;

                if (elapsed > pu.lifetime) {
                    powerUps.splice(index, 1);
                    return;
                }

                // Check proximity to bird for collection (no collision needed)
                const dx = pu.x - bird.x;
                const dy = pu.y - bird.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < bird.radius + 40 && !pu.collected) {
                    pu.collected = true;
                    spawnPowerUpParticles(pu.x, pu.y, pu.type);
                    activatePowerUp(pu.type);
                    awardXP('powerup');
                }

                if (pu.x + 50 < 0) powerUps.splice(index, 1);
            });

            // Boundary collision
            if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
                // Skip collision if invulnerable
                if (game.invulnerable) return;

                // Check if shield is active
                if (game.activePowerUps.shield) {
                    shieldBlockSound();
                    spawnPowerUpParticles(bird.x, bird.y, 'shield');
                    deactivatePowerUp('shield');
                    triggerShake(9, 20);
                    // Activate invulnerability period
                    game.invulnerable = true;
                    game.invulnerabilityTimer = 1000;
                    return;
                }
                // Boundary hit - dramatic collision
                if (!deathSequence.active) {
                    deathSequence.active = true;
                    deathSequence.startTime = Date.now();
                    deathSequence.collisionX = bird.x;
                    deathSequence.collisionY = bird.y;
                    triggerShake(15, 30);
                    for (let i = 0; i < 2; i++) {
                        spawnDeathTrailParticles(bird.x, bird.y);
                    }
                    triggerScreenFlash();
                }
                endGame();
                return;
            }

            // Pipe collision
            pipes.forEach(pipe => {
                if (
                    bird.x + bird.radius > pipe.x &&
                    bird.x - bird.radius < pipe.x + pipeWidth &&
                    (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.bottom)
                ) {
                    // Skip collision if invulnerable
                    if (game.invulnerable) return;

                    triggerShake(9, 20);

                    // Check if shield is active
                    if (game.activePowerUps.shield) {
                        shieldBlockSound();
                        spawnPowerUpParticles(bird.x, bird.y, 'shield');
                        deactivatePowerUp('shield');
                        // Activate invulnerability period
                        game.invulnerable = true;
                        game.invulnerabilityTimer = 1000;
                        return;
                    }

                    // Initiate death sequence with dramatic collision effects
                    if (!deathSequence.active) {
                        deathSequence.active = true;
                        deathSequence.startTime = Date.now();
                        deathSequence.collisionX = bird.x;
                        deathSequence.collisionY = bird.y;
                        deathSequence.collisionPipeX = pipe.x + pipeWidth / 2;
                        // Massive initial shake
                        triggerShake(15, 30);
                        // Spawn heavy particle explosion at pipe hit point
                        spawnPipeCrackParticles(pipe.x + pipeWidth / 2, bird.y);
                        spawnPipeCrackParticles(pipe.x + pipeWidth / 2, bird.y);
                        // Bird collision burst
                        for (let i = 0; i < 3; i++) {
                            spawnDeathTrailParticles(bird.x, bird.y);
                        }
                        // Screen flash impact
                        triggerScreenFlash();
                    }
                    endGame();
                }
            });
        }

        // ─── Draw ──────────────────────────────────────────────────────────
        function draw() {
            updateShake();

            ctx.save();
            ctx.translate(shake.offsetX, shake.offsetY);

            drawBackground();
            drawParticles();
            drawPipes();
            drawPowerUps();
            drawJumpRings();
            updateDeathSequence();
            drawDeathSequence();
            drawBird();

            ctx.fillStyle = '#ff6b00';
            ctx.font = '14px Arial';
            ctx.fillText('v' + version, 10, 25);

            ctx.restore();

            // Draw screen flash effect
            if (screenFlash.active) {
                const flashAlpha = screenFlash.duration / screenFlash.maxDuration;
                ctx.save();
                ctx.globalAlpha = flashAlpha * 0.6;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                screenFlash.duration -= 16; // ~60fps
                if (screenFlash.duration <= 0) {
                    screenFlash.active = false;
                }
            }
        }

        // ─── Game loop ─────────────────────────────────────────────────────
        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }


        // ─── Update death sequence ───────────────────────────────────────
        function updateDeathSequence() {
            if (!deathSequence.active) return;

            const elapsed = Date.now() - deathSequence.startTime;
            const progress = Math.min(1, elapsed / deathSequence.duration);

            // PHASE 1: Slow-motion (first 200ms)
            if (elapsed < deathSequence.slowMotionDuration) {
                deathSequence.slowMotionActive = true;
                deathSequence.slowMotionFactor = 0.2; // Heavy slow-mo
            } else {
                // Gradually recover to normal speed
                const recoveryProgress = (elapsed - deathSequence.slowMotionDuration) / 400;
                deathSequence.slowMotionFactor = 0.2 + Math.min(1, recoveryProgress) * 0.8;
            }

            // Bird tumble rotation - accelerating spin
            deathSequence.birdRotation += deathSequence.birdSpinSpeed * deathSequence.slowMotionFactor;

            // Red blink intensity (peaks early, fades)
            const blinkPhase = Math.min(1, elapsed / 300);
            deathSequence.birdBlinkIntensity = Math.sin(blinkPhase * Math.PI * 3) * (1 - blinkPhase * 0.5);

            // Screen tint fade in - more dramatic
            if (progress < 0.6) {
                deathSequence.screenTintTarget = progress * deathSequence.screenTintMaxOpacity;
            } else {
                // Hold tint then fade to game-over
                deathSequence.screenTintTarget = deathSequence.screenTintMaxOpacity * (1 - (progress - 0.6) * 0.5);
            }
            deathSequence.screenTint += (deathSequence.screenTintTarget - deathSequence.screenTint) * deathSequence.screenTintSpeed;

            // "DEAD" text appearance - pop in at midway
            const deadTextProgress = (elapsed - deathSequence.deadTextAppearTime) / 200;
            if (deadTextProgress >= 0) {
                deathSequence.showDeadText = true;
                deathSequence.deadTextAlpha = Math.min(1, deadTextProgress);
                // Pop-in scale effect
                deathSequence.deadTextScale = 0.3 + deathSequence.deadTextAlpha * 0.7;
                if (deadTextProgress > 0.5) {
                    deathSequence.deadTextScale = 1 + Math.sin((deadTextProgress - 0.5) * Math.PI) * 0.15;
                }
            }

            // Spawn death trail particles - higher rate at start, tapers off
            const trailIntensity = Math.max(0.1, 1 - progress * 1.5);
            if (progress < 0.65 && Math.random() < 0.7 * trailIntensity) {
                spawnDeathTrailParticles(bird.x, bird.y);
            }

            // Stop after duration
            if (progress >= 1) {
                deathSequence.active = false;
                deathSequence.slowMotionActive = false;
            }
        }

        function drawDeathSequence() {
            if (!deathSequence.active) return;

            // Save bird rotation state
            const originalRotation = bird.rotation;
            bird.rotation = deathSequence.birdRotation;

            // Draw bird with enhanced red collision blink
            ctx.save();
            ctx.translate(bird.x, bird.y);
            ctx.rotate(bird.rotation);

            // Red collision flash - intense, then fading
            const blinkAlpha = Math.max(0, deathSequence.birdBlinkIntensity);
            ctx.globalAlpha = blinkAlpha * 0.8;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(0, 0, bird.radius * 1.3, 0, Math.PI * 2);
            ctx.fill();

            // Intense glow on first impact
            ctx.globalAlpha = blinkAlpha * 0.5;
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(0, 0, bird.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
            bird.rotation = originalRotation;

            // Screen red/dark tint overlay - more dramatic
            if (deathSequence.screenTint > 0) {
                ctx.save();
                // Red tint (damage effect)
                ctx.globalAlpha = deathSequence.screenTint * 0.8;
                ctx.fillStyle = '#dd0000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Dark overlay on top
                ctx.globalAlpha = deathSequence.screenTint * 0.4;
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            // "DEAD" text with dramatic pop-in and glow
            if (deathSequence.showDeadText && deathSequence.deadTextAlpha > 0) {
                ctx.save();
                ctx.globalAlpha = deathSequence.deadTextAlpha;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(deathSequence.deadTextScale, deathSequence.deadTextScale);

                // Text glow effect
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 30;
                ctx.fillStyle = '#ff0000';
                ctx.font = 'bold 140px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('DEAD', 0, 0);

                // Secondary glow
                ctx.globalAlpha = deathSequence.deadTextAlpha * 0.6;
                ctx.shadowColor = '#ff6b00';
                ctx.shadowBlur = 50;
                ctx.strokeStyle = '#ff6b00';
                ctx.lineWidth = 4;
                ctx.strokeText('DEAD', 0, 0);

                // Outline
                ctx.globalAlpha = deathSequence.deadTextAlpha;
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 2;
                ctx.strokeText('DEAD', 0, 0);

                ctx.restore();
            }
        }

        // ─── End game ──────────────────────────────────────────────────────
        function endGame() {
            if (game.gameOver) return; // guard against double-trigger
            game.gameOver = true;
            resetStreak();

            // Reset invulnerability
            game.invulnerable = false;
            game.invulnerabilityTimer = 0;

            // Reset all active power-ups
            Object.keys(game.activePowerUps).forEach(type => {
                if (game.activePowerUps[type]) {
                    deactivatePowerUp(type);
                }
            });

            // Clear power-ups array
            powerUps.length = 0;
            pointMultiplier = 1;
            updateMultiplierDisplay();

            gameOverSound();
            haptic([40, 30, 80, 30, 120]); // strong haptic pattern on game over

            // Record run statistics
            statsManager.endRun(game.score);

            // Commit XP and check for level-up
            lastStreakBonusAt = 0;
            const xpResult = xpManager.commitRunXP();
            updateXPBar();
            if (xpResult.newLevel > xpResult.oldLevel) {
                setTimeout(() => showLevelUpPopup(xpResult.newLevel), 800);
            }

            const screen = document.getElementById('gameOverScreen');
            screen.style.display = 'block';
            // Trigger CSS fade-in on next frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => { screen.classList.add('visible'); });
            });

            // Show customize button on game over (will show difficulty selector on restart)
            document.getElementById('customizeBtn').classList.add('visible');
            document.getElementById('soundToggle').classList.add('visible');

            document.getElementById('finalScore').textContent = game.score;

            if (game.score > game.highScore) {
                game.highScore = game.score;
                localStorage.setItem('flappyBirdHighScore', game.highScore);
            }
            document.getElementById('highScore').textContent = game.highScore;

            // Display run-specific stats
            displayRunStats();

            playStartMusic();
        }

        // ─── Display run stats on game over screen ─────────────────────────
        function displayRunStats() {
            const streakMsg = statsManager.getStreakMessage();
            const powerUpMsg = statsManager.getPowerUpMessage();
            const personalBestMsg = statsManager.getPersonalBestMessage();
            const pipeMsg = statsManager.currentRun.totalPipesCleared > 0 ?
                `Pipes cleared: ${statsManager.currentRun.totalPipesCleared}` : '';

            document.getElementById('streakMessage').textContent = streakMsg;
            document.getElementById('powerUpMessage').textContent = powerUpMsg;
            document.getElementById('personalBestMessage').textContent = personalBestMsg;
            document.getElementById('pipeMessage').textContent = pipeMsg;
        }

        // ─── Difficulty selection ──────────────────────────────────────────
        function selectDifficulty(difficulty) {
            game.difficulty = difficulty;
            const settings = difficultySettings[difficulty];

            // Apply difficulty settings
            bird.gravity = settings.gravity;
            baseGravity = settings.gravity;
            bird.lift = settings.lift;
            pipeSpeed = settings.pipeSpeed;
            basePipeSpeed = settings.pipeSpeed;
            pipeGap = settings.pipeGap;
            pipeFrequency = settings.pipeFrequency;

            // Start new run tracking
            statsManager.startNewRun(difficulty);

            // Hide difficulty selector and customize button, start the game immediately
            document.getElementById('difficultySelector').style.display = 'none';
            document.getElementById('customizeBtn').classList.remove('visible');
            document.getElementById('soundToggle').classList.remove('visible');
            stopStartMusic();
            game.started = true;

            // Highlight selected difficulty
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.difficulty === difficulty) {
                    btn.classList.add('selected');
                }
            });
        }

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectDifficulty(btn.dataset.difficulty);
            });
        });

        // ─── Sound toggle ──────────────────────────────────────────────────
        function toggleSound() {
            game.soundEnabled = !game.soundEnabled;
            localStorage.setItem('flappyBirdSoundEnabled', game.soundEnabled);
            updateSoundButtonUI();
        }

        function updateSoundButtonUI() {
            const btn = document.getElementById('soundToggle');
            btn.textContent = game.soundEnabled ? '🔊' : '🔇';
            btn.classList.toggle('muted', !game.soundEnabled);
        }

        document.getElementById('soundToggle').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSound();
        });

        // ─── Touch feedback ripple ──────────────────────────────────────
        function createRipple(event) {
            const button = event.target.closest('.difficulty-btn');
            if (!button) return;

            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        }

        document.addEventListener('click', createRipple);

        // ─── Mobile touch feedback system ──────────────────────────────────
        let isTouchDevice = () => {
            return (('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0));
        };

        // Disable hover states on touch devices via body class
        if (isTouchDevice()) {
            document.body.classList.add('touch-device');
        }

        // ─── Controls ──────────────────────────────────────────────────────
        document.addEventListener('click', fly);
        document.addEventListener('touchstart', fly, { passive: false });

        let lastTapTime = 0;
        const tapDebounceDelay = 100;

        function fly(e) {
            if (e.target.closest('.sound-toggle') || e.target.closest('.difficulty-btn') || e.target.closest('.customize-btn')) {
                return;
            }

            const now = Date.now();
            if (now - lastTapTime < tapDebounceDelay) {
                return;
            }
            lastTapTime = now;

            e.preventDefault();

            if (game.gameOver) {
                location.reload();
                return;
            }

            if (game.started) {
                bird.velocity = bird.lift;
                jumpSound();
                spawnJumpRing();
                haptic(18); // light haptic pulse on each flap

                // Visual tap feedback on mobile
                if (e.touches) {
                    const touch = e.touches[0];
                    createTapFeedback(touch.clientX, touch.clientY);
                }
            }
        }

        function createTapFeedback(x, y) {
            const feedback = document.createElement('div');
            feedback.style.position = 'fixed';
            feedback.style.left = (x - 20) + 'px';
            feedback.style.top = (y - 20) + 'px';
            feedback.style.width = '40px';
            feedback.style.height = '40px';
            feedback.style.borderRadius = '50%';
            feedback.style.background = 'rgba(255, 107, 0, 0.6)';
            feedback.style.pointerEvents = 'none';
            feedback.style.zIndex = '999';
            feedback.style.animation = 'rippleAnimation 0.6s ease-out forwards';
            feedback.style.boxShadow = '0 0 20px rgba(255, 107, 0, 0.5)';
            document.body.appendChild(feedback);

            setTimeout(() => feedback.remove(), 600);
        }

        // ─── Enhanced touch feedback on all interactive elements ────────────
        function addTouchFeedback(element) {
            element.addEventListener('touchstart', (e) => {
                element.style.transition = 'all 0.08s ease-out';
                element.style.opacity = '0.85';
                element.style.transform = 'scale(0.96)';
            }, { passive: true });

            element.addEventListener('touchend', (e) => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            }, { passive: true });

            element.addEventListener('touchcancel', (e) => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            }, { passive: true });
        }

        // Apply touch feedback to interactive elements
        document.querySelectorAll('.difficulty-btn, .customize-btn, .sound-toggle, .skin-card').forEach(el => {
            addTouchFeedback(el);
        });

        // ─── Stats Overlay System ──────────────────────────────────────────
        let statsOverlayOpen = false;

        function updateStatsDisplay() {
            document.getElementById('statsCurrentScore').textContent = game.score;
            document.getElementById('statsCurrentStreak').textContent = game.streak;
            document.getElementById('statsCurrentPipes').textContent = statsManager.currentRun.totalPipesCleared;
            document.getElementById('statsAllTimeBest').textContent = statsManager.stats.allTimeHigh;
            document.getElementById('statsAllTimeStreak').textContent = statsManager.stats.bestStreak;
            document.getElementById('statsGamesPlayed').textContent = statsManager.stats.gamesPlayed;
            document.getElementById('statsAllTimePipes').textContent = statsManager.stats.totalPipes;
        }

        function toggleStatsOverlay() {
            statsOverlayOpen = !statsOverlayOpen;
            const overlay = document.getElementById('statsOverlay');
            if (statsOverlayOpen) {
                updateStatsDisplay();
                overlay.classList.add('visible');
            } else {
                overlay.classList.remove('visible');
            }
        }

        // Close stats overlay on click
        document.getElementById('statsOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'statsOverlay') {
                toggleStatsOverlay();
            }
        });

        // ─── Keyboard Controls ────────────────────────────────────────────
        document.addEventListener('keydown', (e) => {
            // SPACE or UP ARROW to fly
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();

                if (game.gameOver) {
                    location.reload();
                    return;
                }

                if (game.started) {
                    bird.velocity = bird.lift;
                    jumpSound();
                    spawnJumpRing();
                }
            }
            // ESC to close customize overlay first, then stats overlay
            else if (e.code === 'Escape') {
                e.preventDefault();
                if (customizeOverlayOpen) {
                    toggleCustomizeOverlay();
                } else {
                    toggleStatsOverlay();
                }
            }
            // R to restart from game-over screen
            else if (e.code === 'KeyR' && game.gameOver) {
                e.preventDefault();
                location.reload();
            }
            // Arrow keys for difficulty selection (Tab navigation)
            else if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
                const selector = document.getElementById('difficultySelector');
                if (selector && selector.style.display !== 'none') {
                    const buttons = Array.from(document.querySelectorAll('.difficulty-btn'));
                    const focused = document.activeElement;
                    const focusedIndex = buttons.indexOf(focused);

                    if (focusedIndex !== -1) {
                        let nextIndex = focusedIndex + (e.code === 'ArrowRight' ? 1 : -1);
                        if (nextIndex < 0) nextIndex = buttons.length - 1;
                        if (nextIndex >= buttons.length) nextIndex = 0;
                        buttons[nextIndex].focus();
                    } else if (buttons.length > 0) {
                        buttons[0].focus();
                    }
                }
            }
            // Enter to select difficulty
            else if (e.code === 'Enter') {
                const selector = document.getElementById('difficultySelector');
                if (selector && selector.style.display !== 'none') {
                    const focused = document.activeElement;
                    if (focused.classList.contains('difficulty-btn')) {
                        selectDifficulty(focused.dataset.difficulty);
                    }
                }
            }
        });

        // ─── Bird Customization Menu ──────────────────────────────────────
        let customizeOverlayOpen = false;

        function toggleCustomizeOverlay() {
            customizeOverlayOpen = !customizeOverlayOpen;
            const overlay = document.getElementById('customizeOverlay');
            if (customizeOverlayOpen) {
                overlay.classList.add('visible');
                renderSkinsGrid();
            } else {
                overlay.classList.remove('visible');
            }
        }

        // ─── Draw a skin preview to a given 2D context (bypasses global ctx) ─
        function drawSkinToContext(skinKey, pCtx, b) {
            const r = b.radius;
            const wr = b.wingRotation;

            if (skinKey === 'classic') {
                const g = pCtx.createRadialGradient(-3,-4,2,0,0,r);
                g.addColorStop(0,'#ffaa00'); g.addColorStop(0.5,'#ff6b00'); g.addColorStop(1,'#cc3300');
                pCtx.fillStyle = g; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
                pCtx.save(); pCtx.translate(-4,4); pCtx.rotate(wr);
                pCtx.fillStyle='rgba(200,60,0,0.7)'; pCtx.beginPath(); pCtx.ellipse(0,0,8,5,-0.4,0,Math.PI*2); pCtx.fill(); pCtx.restore();
                pCtx.fillStyle='#ffcc00'; pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.fill();
            } else if (skinKey === 'void') {
                const g = pCtx.createRadialGradient(0,0,0,0,0,r*1.8);
                g.addColorStop(0,'rgba(128,0,255,0.5)'); g.addColorStop(1,'rgba(128,0,255,0)');
                pCtx.fillStyle=g; pCtx.beginPath(); pCtx.arc(0,0,r*1.8,0,Math.PI*2); pCtx.fill();
                pCtx.fillStyle='#000'; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
                pCtx.save(); pCtx.translate(-4,4); pCtx.rotate(wr);
                pCtx.fillStyle='rgba(80,0,160,0.9)'; pCtx.beginPath(); pCtx.ellipse(0,0,8,5,-0.4,0,Math.PI*2); pCtx.fill(); pCtx.restore();
                pCtx.fillStyle='#800080'; pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.fill();
            } else if (skinKey === 'inferno') {
                const g = pCtx.createRadialGradient(-3,-4,2,0,0,r);
                g.addColorStop(0,'#ffff00'); g.addColorStop(0.5,'#ff4400'); g.addColorStop(1,'#cc0000');
                pCtx.fillStyle=g; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
                pCtx.save(); pCtx.translate(-4,4); pCtx.rotate(wr);
                pCtx.fillStyle='rgba(255,100,0,0.8)'; pCtx.beginPath(); pCtx.ellipse(0,0,8,5,-0.4,0,Math.PI*2); pCtx.fill(); pCtx.restore();
                pCtx.fillStyle='#ffff00'; pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.fill();
            } else if (skinKey === 'ghost') {
                const g = pCtx.createRadialGradient(-3,-4,2,0,0,r);
                g.addColorStop(0,'rgba(255,255,255,0.9)'); g.addColorStop(0.5,'rgba(200,200,200,0.7)'); g.addColorStop(1,'rgba(150,150,150,0.5)');
                pCtx.fillStyle=g; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
                pCtx.save(); pCtx.translate(-4,4); pCtx.rotate(wr);
                pCtx.fillStyle='rgba(180,180,180,0.6)'; pCtx.beginPath(); pCtx.ellipse(0,0,8,5,-0.4,0,Math.PI*2); pCtx.fill(); pCtx.restore();
                pCtx.fillStyle='rgba(100,100,100,0.8)'; pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.fill();
            } else if (skinKey === 'neon') {
                const g = pCtx.createRadialGradient(0,0,0,0,0,r*2);
                g.addColorStop(0,'rgba(0,255,255,0.6)'); g.addColorStop(0.5,'rgba(128,0,255,0.3)'); g.addColorStop(1,'rgba(128,0,255,0)');
                pCtx.fillStyle=g; pCtx.beginPath(); pCtx.arc(0,0,r*2,0,Math.PI*2); pCtx.fill();
                pCtx.strokeStyle='#00ffff'; pCtx.lineWidth=2;
                pCtx.fillStyle='rgba(0,100,100,0.6)'; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill(); pCtx.stroke();
                pCtx.save(); pCtx.translate(-4,4); pCtx.rotate(wr);
                pCtx.strokeStyle='#00ffff'; pCtx.lineWidth=1;
                pCtx.beginPath(); pCtx.ellipse(0,0,8,5,-0.4,0,Math.PI*2); pCtx.stroke(); pCtx.restore();
                pCtx.strokeStyle='#00ffff'; pCtx.lineWidth=2;
                pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.stroke();
            } else if (skinKey === 'skeleton') {
                pCtx.fillStyle='#ffffcc'; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
                pCtx.fillStyle='#000';
                pCtx.beginPath(); pCtx.arc(5,-5,3.5,0,Math.PI*2); pCtx.fill();
                pCtx.beginPath(); pCtx.arc(10,-5,3.5,0,Math.PI*2); pCtx.fill();
                pCtx.beginPath(); pCtx.moveTo(7.5,-1); pCtx.lineTo(5.5,2); pCtx.lineTo(9.5,2); pCtx.closePath(); pCtx.fill();
                pCtx.strokeStyle='#000'; pCtx.lineWidth=1;
                for (let i=0;i<5;i++) { pCtx.beginPath(); pCtx.moveTo(5+i*3,4); pCtx.lineTo(5+i*3,6); pCtx.stroke(); }
                pCtx.fillStyle='#ffffcc'; pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.fill();
            } else if (skinKey === 'metal') {
                const g = pCtx.createRadialGradient(-5,-6,1,0,0,r);
                g.addColorStop(0,'#e8e8e8'); g.addColorStop(0.4,'#c0c0c0'); g.addColorStop(1,'#808080');
                pCtx.fillStyle=g; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
                pCtx.fillStyle='rgba(255,255,255,0.5)'; pCtx.beginPath(); pCtx.arc(-4,-6,4,0,Math.PI*2); pCtx.fill();
                pCtx.save(); pCtx.translate(-4,4); pCtx.rotate(wr);
                pCtx.fillStyle='rgba(160,160,160,0.8)'; pCtx.beginPath(); pCtx.ellipse(0,0,8,5,-0.4,0,Math.PI*2); pCtx.fill(); pCtx.restore();
                pCtx.fillStyle='#ffd700'; pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.fill();
            } else if (skinKey === 'cosmic') {
                const g = pCtx.createRadialGradient(-3,-4,2,0,0,r);
                g.addColorStop(0,'#0033ff'); g.addColorStop(0.5,'#000066'); g.addColorStop(1,'#000033');
                pCtx.fillStyle=g; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
                pCtx.fillStyle='#ffff00';
                for (let i=0;i<8;i++) {
                    const a=(i/8)*Math.PI*2; pCtx.beginPath(); pCtx.arc(Math.cos(a)*7,Math.sin(a)*7,1.5,0,Math.PI*2); pCtx.fill();
                }
                pCtx.save(); pCtx.translate(-4,4); pCtx.rotate(wr);
                pCtx.fillStyle='rgba(0,50,150,0.7)'; pCtx.beginPath(); pCtx.ellipse(0,0,8,5,-0.4,0,Math.PI*2); pCtx.fill(); pCtx.restore();
                pCtx.fillStyle='#00ffff'; pCtx.beginPath(); pCtx.moveTo(r-2,-2); pCtx.lineTo(r+7,0); pCtx.lineTo(r-2,3); pCtx.closePath(); pCtx.fill();
            } else {
                pCtx.fillStyle='#ff6b00'; pCtx.beginPath(); pCtx.arc(0,0,r,0,Math.PI*2); pCtx.fill();
            }
            // Eye (all skins)
            pCtx.fillStyle='#000'; pCtx.beginPath(); pCtx.ellipse(6,-5,4,4,0,0,Math.PI*2); pCtx.fill();
            pCtx.fillStyle='#fff'; pCtx.beginPath(); pCtx.arc(7,-6,1.5,0,Math.PI*2); pCtx.fill();
        }

        function renderSkinsGrid() {
            const skinsGrid = document.getElementById('skinsGrid');
            skinsGrid.innerHTML = '';

            Object.entries(birdSkins).forEach(([skinKey, skinData]) => {
                const card = document.createElement('div');
                card.className = 'skin-card';
                if (game.selectedSkin === skinKey) {
                    card.classList.add('selected');
                }

                // Add touch feedback
                addTouchFeedback(card);

                // Canvas preview — uses drawSkinToContext (own pCtx, not global ctx)
                const preview = document.createElement('canvas');
                preview.className = 'skin-preview';
                preview.width = 120;
                preview.height = 90;
                preview.style.pointerEvents = 'auto';
                preview.style.cursor = 'pointer';

                const pCtx = preview.getContext('2d');
                pCtx.fillStyle = '#0d0000';
                pCtx.fillRect(0, 0, 120, 90);

                // Temporarily set up bird preview params
                const savedRadius = bird.radius;
                const savedWingRot = bird.wingRotation;
                const savedVelocity = bird.velocity;
                bird.radius = 18;
                bird.wingRotation = 0.2;
                bird.velocity = 0;

                pCtx.save();
                pCtx.translate(60, 45);
                drawSkinToContext(skinKey, pCtx, bird);
                pCtx.restore();

                bird.radius = savedRadius;
                bird.wingRotation = savedWingRot;
                bird.velocity = savedVelocity;

                card.appendChild(preview);

                const nameEl = document.createElement('div');
                nameEl.className = 'skin-name';
                nameEl.textContent = skinData.name;
                card.appendChild(nameEl);

                const badge = document.createElement('div');
                const isUnlocked = xpManager.isSkinUnlocked(skinKey);
                if (isUnlocked) {
                    badge.className = 'skin-badge free';
                    badge.textContent = 'FREE';
                } else {
                    badge.className = 'skin-badge';
                    const req = SKIN_LEVEL_REQUIREMENTS[skinKey] || 1;
                    badge.textContent = `Lv. ${req}`;
                    badge.style.background = 'rgba(128, 128, 128, 0.6)';
                    badge.style.borderColor = 'rgba(128, 128, 128, 0.8)';
                }
                card.appendChild(badge);

                const selectedCheck = document.createElement('div');
                selectedCheck.className = 'selected-check';
                selectedCheck.textContent = 'SELECTED';
                card.appendChild(selectedCheck);

                // Disable click if locked
                if (!isUnlocked) {
                    card.style.opacity = '0.6';
                    card.style.cursor = 'not-allowed';
                    card.classList.add('locked-skin');
                }

                // Select skin on click or touchend (iPhone)
                function doSelectSkin(e) {
                    console.log('[SKIN-CLICK] Clicked on skin card:', skinKey);
                    e.preventDefault();
                    e.stopPropagation();
                    selectBirdSkin(skinKey);
                }
                // Ensure card pointer-events are enabled
                card.style.pointerEvents = 'auto';
                card.addEventListener('click', doSelectSkin, { capture: false });
                card.addEventListener('touchend', doSelectSkin, { passive: false, capture: false });
                // Also add mousedown as backup for mobile/touch devices
                card.addEventListener('touchstart', (e) => {
                    console.log('[SKIN-TOUCH] Touch started on skin card:', skinKey);
                }, { passive: true });

                skinsGrid.appendChild(card);
            });
        }

        function selectBirdSkin(skinKey) {
            console.log('[SELECTSKN] selectBirdSkin called with:', skinKey);
            // Check if skin is unlocked
            if (!xpManager.isSkinUnlocked(skinKey)) {
                const req = SKIN_LEVEL_REQUIREMENTS[skinKey] || 1;
                console.log('[SELECTSKN] Skin locked - required level:', req);
                showLockMessage(skinKey, req);
                return;
            }

            console.log('[SELECTSKN] Setting game.selectedSkin to:', skinKey);
            game.selectedSkin = skinKey;
            console.log('[SELECTSKN] Setting localStorage selectedBirdSkin to:', skinKey);
            localStorage.setItem('selectedBirdSkin', skinKey);
            console.log('[SELECTSKN] customizeOverlayOpen:', customizeOverlayOpen);

            // Update the skins grid display to show new selection
            if (customizeOverlayOpen) {
                console.log('[SELECTSKN] Re-rendering skins grid to update selection');
                renderSkinsGrid();
            }

            // Close overlay → returns user to difficulty selector
            if (customizeOverlayOpen) {
                console.log('[SELECTSKN] Closing overlay');
                setTimeout(() => {
                    toggleCustomizeOverlay();
                }, 100);
            }
            console.log('[SELECTSKN] Final game.selectedSkin:', game.selectedSkin);
        }

        function showLockMessage(skinKey, requiredLevel) {
            // Create temporary locked message
            const lockMsg = document.createElement('div');
            lockMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: #ffcc00;
                padding: 20px 30px;
                border-radius: 8px;
                z-index: 9999;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: bold;
                text-align: center;
                border: 2px solid #ffcc00;
                box-shadow: 0 0 20px rgba(255, 200, 0, 0.5);
                pointer-events: none;
            `;

            const skinName = birdSkins[skinKey]?.name || skinKey;
            lockMsg.textContent = `LOCKED\n${skinName} - Level ${requiredLevel} required`;
            lockMsg.style.whiteSpace = 'pre-wrap';

            document.body.appendChild(lockMsg);

            // Remove after 2 seconds
            setTimeout(() => {
                lockMsg.remove();
            }, 2000);
        }

        document.getElementById('customizeBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCustomizeOverlay();
        });

        // X close button — click + touchend for iPhone reliability
        (function() {
            const closeBtn = document.getElementById('customizeCloseBtn');
            function handleClose(e) {
                e.preventDefault();
                e.stopPropagation();
                if (customizeOverlayOpen) {
                    toggleCustomizeOverlay();
                }
            }
            closeBtn.addEventListener('click', handleClose);
            closeBtn.addEventListener('touchend', handleClose, { passive: false });
        })();

        // Tap on backdrop closes overlay
        document.getElementById('customizeOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'customizeOverlay') {
                toggleCustomizeOverlay();
            }
        });
        document.getElementById('customizeOverlay').addEventListener('touchend', (e) => {
            if (e.target.id === 'customizeOverlay') {
                e.preventDefault();
                toggleCustomizeOverlay();
            }
        }, { passive: false });

        // ─── Boot ──────────────────────────────────────────────────────────
        console.log('[BOOT] Initial game.selectedSkin:', game.selectedSkin);
        console.log('[BOOT] localStorage selectedBirdSkin:', localStorage.getItem('selectedBirdSkin'));
        console.log('[BOOT] xpManager.currentLevel:', xpManager.currentLevel);
        // Validate saved skin — if locked due to level, revert to classic
        if (!xpManager.isSkinUnlocked(game.selectedSkin)) {
            console.log('[BOOT] Skin not unlocked, reverting to classic');
            game.selectedSkin = 'classic';
            localStorage.setItem('selectedBirdSkin', 'classic');
        }
        console.log('[BOOT] Final game.selectedSkin:', game.selectedSkin);

        gameLoop();

        // Initialize audio system and play menu music
        setTimeout(async () => {
            await initializeAudio();
            playStartMusic();
        }, 100);
        document.getElementById('highScore').textContent = game.highScore;
        updateStreakDisplay();
        updateSoundButtonUI();
        updateXPBar();

        // Show customize button on page load (difficulty selector is visible)
        document.getElementById('customizeBtn').classList.add('visible');
        document.getElementById('soundToggle').classList.add('visible');
