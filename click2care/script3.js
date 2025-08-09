// RETRO PATIENT MONITOR v3.0 - PIXEL DASHBOARD EDITION
// Enhanced Medical Device Simulator with Original Dashboard Layout + Retro Aesthetics

class RetroPatientMonitor {
    constructor() {
        // System State
        this.isPoweredOn = false;
        this.isMonitoring = false;
        this.isDarkTheme = true;
        this.systemStartTime = null;
        this.uptime = 0;
        
        // Patient Vitals
        this.currentBPM = 0;
        this.breathQuality = 0;
        this.patientMood = 'NEUTRAL';
        this.isPatientAlive = true;
        
        // Heart Rate Monitoring
        this.heartbeats = [];
        this.measurementStartTime = null;
        this.bpmDecayInterval = null;
        this.inactivityTimer = null;
        this.lastInputTime = 0;
        
        // Microphone System
        this.microphoneEnabled = false;
        this.mediaStream = null;
        this.audioAnalyser = null;
        this.micSensitivity = 0.35; // Reduced sensitivity
        this.breathHistory = [];
        
        // Canvas Elements
        this.ecgCanvas = null;
        this.ecgContext = null;
        this.ecgData = [];
        this.ecgIndex = 0;
        
        // Audio System
        this.audioContext = null;
        this.isAudioEnabled = false;
        
        // Intervals
        this.uptimeInterval = null;
        this.monitoringBeepInterval = null;
        this.ecgAnimationInterval = null;
        this.aiUpdateInterval = null;
        
        // AI Messages
        this.aiMessages = [
            'SYSTEM READY_',
            'AWAITING INPUT..._',
            'POWER ON TO BEGIN_',
            'MONITORING_',
            'ANALYZING DATA..._',
            'PROCESSING VITALS..._',
            'CALCULATING BPM..._',
            'BREATH ANALYSIS..._',
            'GENERATING REPORT..._',
            'DIAGNOSIS COMPLETE_'
        ];
        this.currentAIIndex = 0;
        
        this.initialize();
    }

    initialize() {
        this.setupAudio();
        this.setupCanvas();
        this.setupEventListeners();
        this.updateDateTime();
        this.startSystemTime();
        this.startAIUpdates();
        this.initializeDisplays();
        
        console.log('=================================');
        console.log('RETRO PATIENT MONITOR v3.0');
        console.log('PIXEL DASHBOARD EDITION');
        console.log('=================================');
        console.log('STATUS: INITIALIZED');
        console.log('POWER: OFF');
        console.log('=================================');
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isAudioEnabled = true;
            console.log('AUDIO SYSTEM: ONLINE');
        } catch (error) {
            console.warn('AUDIO SYSTEM: OFFLINE');
            this.isAudioEnabled = false;
        }
    }

    setupCanvas() {
        this.ecgCanvas = document.getElementById('ecgCanvas');
        if (this.ecgCanvas) {
            this.ecgContext = this.ecgCanvas.getContext('2d');
            this.initializeECG();
        }
    }

    initializeECG() {
        if (!this.ecgContext) return;
        
        const canvas = this.ecgCanvas;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        this.ecgData = new Array(canvas.width).fill(canvas.height / 2);
        this.drawECG();
        
        // Start baseline animation
        this.ecgAnimationInterval = setInterval(() => {
            this.animateECGBaseline();
        }, 50);
    }

    drawECG() {
        if (!this.ecgContext) return;

        const ctx = this.ecgContext;
        const canvas = this.ecgCanvas;

        // Clear canvas with CRT background
        ctx.fillStyle = '#000800';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw ECG line
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 4;
        ctx.beginPath();

        for (let i = 0; i < this.ecgData.length - 1; i++) {
            if (i === 0) {
                ctx.moveTo(i, this.ecgData[i]);
            } else {
                ctx.lineTo(i, this.ecgData[i]);
            }
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    animateECGBaseline() {
        if (!this.isPoweredOn) return;

        // Shift data left
        this.ecgData.shift();
        
        // Add new baseline point with subtle noise
        const baseline = this.ecgCanvas.height / 2;
        const noise = (Math.random() - 0.5) * 3;
        this.ecgData.push(baseline + noise);

        this.drawECG();
    }

    addECGSpike() {
        if (!this.ecgContext) return;

        const spikeHeight = 60;
        const spikeWidth = 15;
        const baseline = this.ecgCanvas.height / 2;

        // Create realistic ECG spike pattern
        for (let i = 0; i < spikeWidth; i++) {
            const progress = i / spikeWidth;
            let y = baseline;

            if (progress < 0.1) {
                // P wave
                y = baseline - (spikeHeight * 0.2 * (progress / 0.1));
            } else if (progress < 0.3) {
                // QRS complex start
                y = baseline - spikeHeight * ((progress - 0.1) / 0.2);
            } else if (progress < 0.5) {
                // QRS peak
                y = baseline - spikeHeight + (spikeHeight * 1.8 * ((progress - 0.3) / 0.2));
            } else if (progress < 0.7) {
                // QRS end
                y = baseline + (spikeHeight * 0.3) - (spikeHeight * 0.3 * ((progress - 0.5) / 0.2));
            } else {
                // T wave
                y = baseline + (spikeHeight * 0.15 * (1 - ((progress - 0.7) / 0.3)));
            }

            if (this.ecgData.length > spikeWidth) {
                this.ecgData[this.ecgData.length - spikeWidth + i] = y;
            }
        }

        this.drawECG();
    }

    setupEventListeners() {
        // Power Button
        const powerBtn = document.querySelector('.power-btn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => this.togglePower());
        }

        // Theme Toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Navigation Items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Control Buttons
        const startBtn = document.querySelector('.start-btn');
        const resetBtn = document.querySelector('.reset-btn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.toggleMonitoring());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSystem());

        // ECG Canvas for heartbeat simulation
        if (this.ecgCanvas) {
            this.ecgCanvas.addEventListener('click', () => this.simulateHeartbeat());
        }

        // Combined Heart + Mood Card (Section 2) click handler
        const combinedCard = document.getElementById('heartCombinedCard');
        if (combinedCard) {
            combinedCard.addEventListener('click', (e) => {
                if (e.target && e.target.closest && e.target.closest('button')) return;
                this.simulateHeartbeat();
            });
        }

        // Microphone Toggle
        const micToggle = document.getElementById('micToggle');
        if (micToggle) {
            micToggle.addEventListener('click', () => this.toggleMicrophone());
        }

        // Breath extra controls
        const breathStart = document.querySelector('.breath-start');
        const breathStop = document.querySelector('.breath-stop');
        if (breathStart) {
            breathStart.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.isPoweredOn) return;
                if (!this.microphoneEnabled) {
                    this.toggleMicrophone();
                }
            });
        }
        if (breathStop) {
            breathStop.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.isPoweredOn) return;
                if (this.microphoneEnabled) {
                    this.toggleMicrophone();
                }
            });
        }

        // Vital Cards
        const vitalCards = document.querySelectorAll('.vital-card');
        vitalCards.forEach(card => {
            card.addEventListener('click', () => this.handleVitalCardClick(card));
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Window resize
        window.addEventListener('resize', () => {
            if (this.ecgCanvas) {
                setTimeout(() => this.initializeECG(), 100);
            }
        });
    }

    // Power System
    togglePower() {
        this.isPoweredOn = !this.isPoweredOn;
        
        const powerBtn = document.querySelector('.power-btn');
        const powerLed = document.querySelector('.power-led');
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        if (this.isPoweredOn) {
            // Power ON
            powerBtn.classList.add('active');
            powerLed.classList.add('active');
            statusText.textContent = 'SYSTEM ONLINE';
            statusDot.classList.remove('critical');
            
            this.systemStartTime = Date.now();
            this.playSound('power_on');
            this.updateDiagnosis('SYSTEM BOOT COMPLETE_');
            this.startMonitoringBeeps();
            
            console.log('POWER: ON');
        } else {
            // Power OFF
            powerBtn.classList.remove('active');
            powerLed.classList.remove('active');
            statusText.textContent = 'SYSTEM OFFLINE';
            statusDot.classList.add('critical');
            
            this.stopAllMonitoring();
            this.resetDisplays();
            this.playSound('power_off');
            this.updateDiagnosis('SYSTEM SHUTDOWN_');
            
            console.log('POWER: OFF');
        }
    }

    // Theme System
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        // For retro theme, we'll just add a subtle color shift
        document.body.classList.toggle('amber-theme', !this.isDarkTheme);
        
        const themeBtn = document.querySelector('.theme-toggle .btn-led');
        if (themeBtn) {
            themeBtn.classList.toggle('active', !this.isDarkTheme);
        }
        
        this.playSound('toggle');
        console.log(`THEME: ${this.isDarkTheme ? 'GREEN' : 'AMBER'}`);
    }

    // Navigation System
    handleNavigation(e) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const section = e.currentTarget.getAttribute('data-tooltip');
        
        // Update diagnosis based on navigation
        switch(section) {
            case 'DASHBOARD':
                this.updateDiagnosis('DASHBOARD ACTIVE_');
                break;
            case 'HEART MONITOR':
                this.updateDiagnosis('HEART MONITOR MODE_');
                break;
            case 'BREATH ANALYSIS':
                this.updateDiagnosis('BREATH ANALYSIS MODE_');
                break;
            case 'PATIENT RECORDS':
                this.updateDiagnosis('PATIENT RECORDS_');
                break;
            case 'SETTINGS':
                this.updateDiagnosis('SYSTEM SETTINGS_');
                break;
            case 'POWER':
                this.togglePower();
                return;
        }
        
        this.playSound('nav_click');
        console.log(`NAVIGATION: ${section}`);
    }

    // Heart Rate Monitoring
    simulateHeartbeat() {
        if (!this.isPoweredOn) return;
        
        const now = Date.now();
        this.lastInputTime = now;
        this.isPatientAlive = true;
        
        // Record heartbeat
        this.heartbeats.push(now);
        
        // Keep only recent heartbeats (last 30 seconds)
        const cutoff = now - 30000;
        this.heartbeats = this.heartbeats.filter(beat => beat > cutoff);
        
        // Calculate BPM
        this.calculateBPM();
        
        // Visual and audio feedback
        this.addECGSpike();
        this.animateHeartIcon();
        this.hideAlert();
        this.playSound('heartbeat');
        this.updateDiagnosis('HEARTBEAT DETECTED_');
        
        console.log(`HEARTBEAT: ${this.heartbeats.length} beats recorded`);
    }

    calculateBPM() {
        if (this.heartbeats.length < 2) {
            this.currentBPM = 0;
            this.updateBPMDisplay();
            return;
        }

        const now = Date.now();
        const recentBeats = this.heartbeats.filter(beat => now - beat < 15000); // Last 15 seconds
        
        if (recentBeats.length < 2) {
            this.currentBPM = 0;
        } else {
            // Calculate intervals between consecutive beats
            const intervals = [];
            for (let i = 1; i < recentBeats.length; i++) {
                intervals.push(recentBeats[i] - recentBeats[i - 1]);
            }
            
            // Use median interval for more accurate BPM
            intervals.sort((a, b) => a - b);
            const medianInterval = intervals[Math.floor(intervals.length / 2)];
            
            this.currentBPM = Math.round((60 * 1000) / medianInterval);
            
            // Clamp to realistic range
            this.currentBPM = Math.max(30, Math.min(200, this.currentBPM));
        }
        
        this.updateBPMDisplay();
        this.updateMoodFromBPM();
    }

    updateBPMDisplay() {
        // Update main BPM display
        const bpmValue = document.getElementById('bpmValue');
        const heartRate = document.getElementById('heartRate');
        const heartStatus = document.getElementById('heartStatus');
        
        const displayValue = this.currentBPM > 0 ? this.currentBPM : '--';
        
        if (bpmValue) bpmValue.textContent = displayValue;
        if (heartRate) heartRate.textContent = displayValue;
        
        // Update status
        if (heartStatus) {
            if (this.currentBPM === 0) {
                heartStatus.textContent = 'WAITING...';
            } else if (this.currentBPM > 100) {
                heartStatus.textContent = 'ELEVATED';
            } else if (this.currentBPM < 60) {
                heartStatus.textContent = 'LOW';
            } else {
                heartStatus.textContent = 'NORMAL';
            }
        }
        
        // Update heart rate bars
        this.updateVitalBars('.bpm-card .bar', this.currentBPM, 120);
    }

    animateHeartIcon() {
        const heartIcon = document.querySelector('.heart-beat-pixel');
        if (heartIcon) {
            heartIcon.style.animation = 'none';
            heartIcon.offsetHeight; // Trigger reflow
            heartIcon.style.animation = 'heartbeat-pulse 0.5s ease-in-out';
        }
    }

    // Monitoring System
    toggleMonitoring() {
        if (!this.isPoweredOn) {
            this.showAlert('SYSTEM ERROR', 'POWER MUST BE ON TO START MONITORING');
            return;
        }
        
        this.isMonitoring = !this.isMonitoring;
        
        const startBtn = document.querySelector('.start-btn');
        
        if (this.isMonitoring) {
            startBtn.classList.add('active');
            startBtn.querySelector('.btn-text').textContent = 'STOP';
            this.startMonitoring();
        } else {
            startBtn.classList.remove('active');
            startBtn.querySelector('.btn-text').textContent = 'START';
            this.stopMonitoring();
        }
    }

    startMonitoring() {
        this.measurementStartTime = Date.now();
        this.lastInputTime = Date.now();
        
        // Start BPM decay monitoring
        this.bpmDecayInterval = setInterval(() => {
            this.updateBPMDecay();
        }, 1000);
        
        // Start inactivity monitoring
        this.checkInactivity();
        
        this.updateDiagnosis('MONITORING ACTIVE_');
        this.playSound('start');
        
        console.log('MONITORING: STARTED');
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.bpmDecayInterval) {
            clearInterval(this.bpmDecayInterval);
            this.bpmDecayInterval = null;
        }
        
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        this.updateDiagnosis('MONITORING STOPPED_');
        this.playSound('stop');
        
        console.log('MONITORING: STOPPED');
    }

    updateBPMDecay() {
        if (!this.isMonitoring || !this.isPoweredOn) return;
        
        const timeSinceLastInput = Date.now() - this.lastInputTime;
        
        // If no input for more than 3 seconds, start BPM decay
        if (timeSinceLastInput > 3000 && this.currentBPM > 0) {
            this.currentBPM = Math.max(0, this.currentBPM - 2);
            this.updateBPMDisplay();
            
            // If BPM reaches 0, patient is critical
            if (this.currentBPM === 0 && this.isPatientAlive) {
                this.triggerPatientCritical();
            }
        }
    }

    checkInactivity() {
        if (!this.isMonitoring || !this.isPoweredOn) return;
        
        this.inactivityTimer = setTimeout(() => {
            const timeSinceLastInput = Date.now() - this.lastInputTime;
            
            // If no input for 5 seconds, trigger alert
            if (timeSinceLastInput >= 5000 && this.isPatientAlive) {
                this.triggerPatientCritical();
            } else {
                this.checkInactivity(); // Check again
            }
        }, 1000);
    }

    triggerPatientCritical() {
        if (!this.isPatientAlive) return;
        
        this.isPatientAlive = false;
        this.currentBPM = 0;
        this.patientMood = 'CRITICAL';
        
        this.showAlert('PATIENT CRITICAL', 'NO VITAL SIGNS DETECTED');
        this.showAlert();
        this.playSound('alarm');
        this.updateBPMDisplay();
        this.updateMoodDisplay();
        this.updateDiagnosis('PATIENT CRITICAL_');
        
        console.log('ALERT: PATIENT CRITICAL');
    }

    // Microphone System
    async toggleMicrophone() {
        if (!this.isPoweredOn) return;
        
        this.microphoneEnabled = !this.microphoneEnabled;
        
        const micBtn = document.getElementById('micToggle');
        const micLed = micBtn.querySelector('.btn-led');
        const breathStatus = document.getElementById('breathStatus');
        
        if (this.microphoneEnabled) {
            try {
                await this.initializeMicrophone();
                micBtn.querySelector('.btn-text').textContent = 'MIC ON';
                micLed.classList.add('active');
                breathStatus.textContent = 'LISTENING';
                this.playSound('toggle_on');
                console.log('MICROPHONE: ENABLED');
            } catch (error) {
                this.microphoneEnabled = false;
                micBtn.querySelector('.btn-text').textContent = 'MIC ERR';
                breathStatus.textContent = 'ACCESS DENIED';
                this.playSound('error');
                console.error('MICROPHONE: ACCESS DENIED');
            }
        } else {
            this.stopMicrophone();
            micBtn.querySelector('.btn-text').textContent = 'MIC OFF';
            micLed.classList.remove('active');
            breathStatus.textContent = 'NO INPUT DETECTED';
            this.playSound('toggle_off');
            console.log('MICROPHONE: DISABLED');
        }
    }

    async initializeMicrophone() {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
            }
        });

        this.audioAnalyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        source.connect(this.audioAnalyser);

        this.audioAnalyser.fftSize = 512;
        this.audioAnalyser.smoothingTimeConstant = 0.8;

        this.startBreathAnalysis();
    }

    startBreathAnalysis() {
        if (!this.microphoneEnabled || !this.audioAnalyser) return;

        const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

        const analyzeAudio = () => {
            if (!this.microphoneEnabled || !this.isPoweredOn) return;

            this.audioAnalyser.getByteFrequencyData(dataArray);

            // Calculate audio level with improved noise filtering
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const threshold = 40; // Increased threshold for better noise reduction
            const normalizedLevel = Math.max(0, (average - threshold) / (120 - threshold));

            // Only register significant audio levels
            if (normalizedLevel > this.micSensitivity) {
                this.breathQuality = Math.min(100, Math.floor(normalizedLevel * 100));
                this.lastInputTime = Date.now(); // Reset inactivity timer
                this.isPatientAlive = true;
                this.hideAlert();
                this.updateBreathDisplay();
                this.updateDiagnosis('BREATH DETECTED_');
            } else {
                // Gradual decrease
                this.breathQuality = Math.max(0, this.breathQuality - 1);
                this.updateBreathDisplay();
            }

            requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();
    }

    updateBreathDisplay() {
        const breathQuality = document.getElementById('breathQuality');
        const breathStatus = document.getElementById('breathStatus');
        const breathRecognition = document.getElementById('breathRecognition');
        const breathCanvas = document.getElementById('breathCanvas');
        
        const displayValue = this.breathQuality > 0 ? this.breathQuality : '--';
        
        if (breathQuality) breathQuality.textContent = displayValue;
        
        // Update status
        if (breathStatus) {
            if (this.breathQuality === 0) {
                breathStatus.textContent = 'NO INPUT DETECTED';
            } else if (this.breathQuality > 80) {
                breathStatus.textContent = 'EXCELLENT';
            } else if (this.breathQuality > 60) {
                breathStatus.textContent = 'GOOD';
            } else if (this.breathQuality > 40) {
                breathStatus.textContent = 'FAIR';
            } else {
                breathStatus.textContent = 'WEAK';
            }
        }
        
        // Simple recognition text
        if (breathRecognition) {
            if (this.microphoneEnabled && this.breathQuality > 0) {
                breathRecognition.textContent = 'RECOGNITION: BREATH';
            } else if (this.microphoneEnabled) {
                breathRecognition.textContent = 'RECOGNITION: SILENCE';
            } else {
                breathRecognition.textContent = 'RECOGNITION: --';
            }
        }

        // Update breath mini graph
        if (breathCanvas) {
            const ctx = breathCanvas.getContext('2d');
            const width = breathCanvas.width = breathCanvas.offsetWidth || breathCanvas.width;
            const height = breathCanvas.height = breathCanvas.offsetHeight || breathCanvas.height;

            // push history and clamp
            this.breathHistory.push(Math.max(0, Math.min(100, this.breathQuality)));
            if (this.breathHistory.length > width) {
                this.breathHistory.shift();
            }

            ctx.fillStyle = '#000800';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#0080ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#0080ff';
            ctx.shadowBlur = 4;
            ctx.beginPath();

            const len = this.breathHistory.length;
            for (let i = 0; i < len; i++) {
                const x = i;
                const y = height - (this.breathHistory[i] / 100) * height;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Update breath bars
        this.updateVitalBars('.breath-card .bar', this.breathQuality, 100);
    }

    stopMicrophone() {
        this.microphoneEnabled = false;

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        this.breathQuality = 0;
        this.updateBreathDisplay();
    }

    // Mood System
    updateMoodFromBPM() {
        const moodValue = document.getElementById('moodValue');
        const moodStatus = document.getElementById('moodStatus');
        const moodIcon = document.getElementById('moodIcon');
        
        if (!this.isPatientAlive) {
            this.patientMood = 'CRITICAL';
            if (moodIcon) moodIcon.className = 'pixel-face critical';
        } else if (this.currentBPM > 100) {
            this.patientMood = 'STRESSED';
            if (moodIcon) moodIcon.className = 'pixel-face stressed';
        } else if (this.currentBPM > 80) {
            this.patientMood = 'ALERT';
            if (moodIcon) moodIcon.className = 'pixel-face alert';
        } else if (this.currentBPM > 60) {
            this.patientMood = 'CALM';
            if (moodIcon) moodIcon.className = 'pixel-face calm';
        } else if (this.currentBPM > 0) {
            this.patientMood = 'RELAXED';
            if (moodIcon) moodIcon.className = 'pixel-face relaxed';
        } else {
            this.patientMood = 'NEUTRAL';
            if (moodIcon) moodIcon.className = 'pixel-face neutral';
        }
        
        if (moodValue) moodValue.textContent = this.patientMood;
        if (moodStatus) moodStatus.textContent = 'BASED ON VITALS';
        
        this.updateMoodBars();
    }

    updateMoodBars() {
        const goodBar = document.querySelector('.mood-bar.good');
        const okBar = document.querySelector('.mood-bar.ok');
        const badBar = document.querySelector('.mood-bar.bad');
        
        // Reset all bars
        [goodBar, okBar, badBar].forEach(bar => {
            if (bar) bar.classList.remove('active');
        });
        
        // Activate based on mood
        switch (this.patientMood) {
            case 'CALM':
            case 'RELAXED':
                if (goodBar) goodBar.classList.add('active');
                break;
            case 'ALERT':
            case 'NEUTRAL':
                if (okBar) okBar.classList.add('active');
                break;
            case 'STRESSED':
            case 'CRITICAL':
                if (badBar) badBar.classList.add('active');
                break;
        }
    }

    updateMoodDisplay() {
        this.updateMoodFromBPM();
    }

    // Utility Functions
    updateVitalBars(selector, value, maxValue) {
        const bars = document.querySelectorAll(selector);
        const percentage = Math.min(100, (value / maxValue) * 100);
        const activeBars = Math.ceil((percentage / 100) * bars.length);
        
        bars.forEach((bar, index) => {
            if (index < activeBars) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    handleVitalCardClick(card) {
        // Add visual feedback
        card.style.transform = 'translateY(-4px) scale(1.02)';
        
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
        
        this.playSound('click');
        
        const cardType = card.className.split(' ')[1].replace('-card', '');
        console.log(`VITAL CARD: ${cardType.toUpperCase()} CLICKED`);
    }

    // System Functions
    resetSystem() {
        this.stopAllMonitoring();
        this.heartbeats = [];
        this.currentBPM = 0;
        this.breathQuality = 0;
        this.patientMood = 'NEUTRAL';
        this.isPatientAlive = true;
        
        this.resetDisplays();
        this.hideAlert();
        this.updateDiagnosis('SYSTEM RESET COMPLETE_');
        this.playSound('reset');
        
        console.log('SYSTEM: RESET');
    }

    stopAllMonitoring() {
        this.isMonitoring = false;
        
        if (this.bpmDecayInterval) {
            clearInterval(this.bpmDecayInterval);
            this.bpmDecayInterval = null;
        }
        
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        this.stopMicrophone();
        
        // Reset start button
        const startBtn = document.querySelector('.start-btn');
        if (startBtn) {
            startBtn.classList.remove('active');
            startBtn.querySelector('.btn-text').textContent = 'START';
        }
    }

    resetDisplays() {
        // Reset all vital displays
        this.updateBPMDisplay();
        this.updateBreathDisplay();
        this.updateMoodDisplay();
        
        // Reset all bars
        const allBars = document.querySelectorAll('.bar');
        allBars.forEach(bar => bar.classList.remove('active'));
        
        const moodBars = document.querySelectorAll('.mood-bar');
        moodBars.forEach(bar => bar.classList.remove('active'));
    }

    // AI System
    startAIUpdates() {
        this.aiUpdateInterval = setInterval(() => {
            if (this.isPoweredOn) {
                this.updateAIMessage();
            }
        }, 4000);
    }

    updateAIMessage() {
        this.currentAIIndex = (this.currentAIIndex + 1) % this.aiMessages.length;
        const message = this.aiMessages[this.currentAIIndex];
        this.updateDiagnosis(message);
    }

    updateDiagnosis(message) {
        const diagnosisText = document.getElementById('diagnosisText');
        if (diagnosisText) {
            diagnosisText.textContent = message;
        }
    }

    // Time System
    startSystemTime() {
        this.uptimeInterval = setInterval(() => {
            this.updateDateTime();
            this.updateUptime();
        }, 1000);
    }

    updateDateTime() {
        const dateElement = document.querySelector('.date');
        if (dateElement) {
            const now = new Date();
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            dateElement.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
        }
    }

    updateUptime() {
        if (!this.isPoweredOn || !this.systemStartTime) {
            this.uptime = 0;
        } else {
            this.uptime = Date.now() - this.systemStartTime;
        }
        
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            const hours = Math.floor(this.uptime / 3600000);
            const minutes = Math.floor((this.uptime % 3600000) / 60000);
            const seconds = Math.floor((this.uptime % 60000) / 1000);
            
            const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            uptimeElement.textContent = uptimeString;
        }
    }

    startMonitoringBeeps() {
        if (this.monitoringBeepInterval) {
            clearInterval(this.monitoringBeepInterval);
        }
        
        this.monitoringBeepInterval = setInterval(() => {
            if (this.isPoweredOn && this.isPatientAlive) {
                this.playSound('monitoring_beep');
            }
        }, 3000);
    }

    initializeDisplays() {
        this.resetDisplays();
        this.updateDiagnosis('SYSTEM READY_');
    }

    // Alert System
    showAlert(title = 'SYSTEM ALERT', message = 'CRITICAL ERROR DETECTED') {
        const modal = document.getElementById('alertModal');
        const alertText = document.getElementById('alertText');
        const alertSection = document.querySelector('.alert-section');
        
        if (modal && alertText) {
            alertText.textContent = message;
            modal.classList.remove('hidden');
        }
        
        if (alertSection) {
            alertSection.classList.remove('hidden');
        }
    }

    hideAlert() {
        const modal = document.getElementById('alertModal');
        const alertSection = document.querySelector('.alert-section');
        
        if (modal) {
            modal.classList.add('hidden');
        }
        
        if (alertSection) {
            alertSection.classList.add('hidden');
        }
    }

    // Audio System
    playSound(type) {
        if (!this.isAudioEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        let frequency, duration, volume;

        switch (type) {
            case 'heartbeat':
                frequency = 200;
                duration = 0.1;
                volume = 0.1;
                break;
            case 'power_on':
                frequency = 440;
                duration = 0.3;
                volume = 0.15;
                break;
            case 'power_off':
                frequency = 220;
                duration = 0.4;
                volume = 0.15;
                break;
            case 'start':
                frequency = 660;
                duration = 0.2;
                volume = 0.1;
                break;
            case 'stop':
                frequency = 330;
                duration = 0.3;
                volume = 0.1;
                break;
            case 'reset':
                frequency = 880;
                duration = 0.2;
                volume = 0.1;
                break;
            case 'alarm':
                frequency = 1760;
                duration = 0.5;
                volume = 0.2;
                break;
            case 'toggle':
                frequency = 550;
                duration = 0.1;
                volume = 0.08;
                break;
            case 'toggle_on':
                frequency = 660;
                duration = 0.1;
                volume = 0.08;
                break;
            case 'toggle_off':
                frequency = 330;
                duration = 0.1;
                volume = 0.08;
                break;
            case 'nav_click':
                frequency = 880;
                duration = 0.05;
                volume = 0.06;
                break;
            case 'click':
                frequency = 1100;
                duration = 0.05;
                volume = 0.05;
                break;
            case 'monitoring_beep':
                frequency = 1320;
                duration = 0.03;
                volume = 0.04;
                break;
            case 'error':
                frequency = 150;
                duration = 0.3;
                volume = 0.15;
                break;
            default:
                return;
        }

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Keyboard Shortcuts
    handleKeyboard(event) {
        switch (event.key) {
            case 'F1':
                event.preventDefault();
                this.showHelp();
                break;
            case 'F2':
                event.preventDefault();
                this.saveData();
                break;
            case 'Escape':
                event.preventDefault();
                this.emergencyStop();
                break;
            case ' ':
                if (this.isPoweredOn) {
                    event.preventDefault();
                    this.simulateHeartbeat();
                }
                break;
            case 'p':
            case 'P':
                event.preventDefault();
                this.togglePower();
                break;
            case 'm':
            case 'M':
                if (this.isPoweredOn) {
                    event.preventDefault();
                    this.toggleMicrophone();
                }
                break;
        }
    }

    showHelp() {
        this.showAlert('SYSTEM HELP', 'SPACE: HEARTBEAT | P: POWER | M: MIC | F2: SAVE | ESC: EMERGENCY');
    }

    saveData() {
        const data = {
            timestamp: new Date().toISOString(),
            bpm: this.currentBPM,
            breathQuality: this.breathQuality,
            mood: this.patientMood,
            uptime: this.uptime
        };
        
        console.log('DATA SAVED:', data);
        this.updateDiagnosis('DATA SAVED TO MEMORY_');
        this.playSound('toggle_on');
    }

    emergencyStop() {
        this.stopAllMonitoring();
        this.showAlert('EMERGENCY STOP', 'ALL MONITORING STOPPED');
        this.playSound('alarm');
        this.updateDiagnosis('EMERGENCY STOP ACTIVATED_');
        console.log('EMERGENCY: STOP ACTIVATED');
    }
}

// Global Functions
function closeAlert() {
    if (window.retroMonitor) {
        window.retroMonitor.hideAlert();
    }
}

function acknowledgeAlert() {
    if (window.retroMonitor) {
        window.retroMonitor.hideAlert();
        window.retroMonitor.playSound('toggle_on');
    }
}

// Initialize Monitor
document.addEventListener('DOMContentLoaded', () => {
    const monitor = new RetroPatientMonitor();
    window.retroMonitor = monitor;
    
    console.log('RETRO PATIENT MONITOR v3.0 READY');
    console.log('CONTROLS:');
    console.log('- P: POWER ON/OFF');
    console.log('- SPACE: HEARTBEAT');
    console.log('- M: MICROPHONE TOGGLE');
    console.log('- F1: HELP | F2: SAVE | ESC: EMERGENCY');
});

// Global Utility Functions
window.simulateHeartRate = (bpm) => {
    if (window.retroMonitor && window.retroMonitor.isPoweredOn) {
        const interval = 60000 / bpm;
        let count = 0;
        const maxBeats = 10;
        
        const beatInterval = setInterval(() => {
            window.retroMonitor.simulateHeartbeat();
            count++;
            
            if (count >= maxBeats) {
                clearInterval(beatInterval);
                console.log(`SIMULATED ${maxBeats} BEATS AT ${bpm} BPM`);
            }
        }, interval);
    } else {
        console.log('SYSTEM MUST BE POWERED ON');
    }
};

window.getSystemStatus = () => {
    if (window.retroMonitor) {
        const monitor = window.retroMonitor;
        console.log('=== RETRO MONITOR STATUS ===');
        console.log(`POWER: ${monitor.isPoweredOn ? 'ON' : 'OFF'}`);
        console.log(`MONITORING: ${monitor.isMonitoring ? 'ACTIVE' : 'INACTIVE'}`);
        console.log(`BPM: ${monitor.currentBPM}`);
        console.log(`BREATH: ${monitor.breathQuality}%`);
        console.log(`MOOD: ${monitor.patientMood}`);
        console.log(`MICROPHONE: ${monitor.microphoneEnabled ? 'ON' : 'OFF'}`);
        console.log(`HEARTBEATS: ${monitor.heartbeats.length}`);
        console.log('==========================');
    }
}; 