
// Enhanced Medical Device Simulator with Original Dashboard Layout + Retro Aesthetics

class RetroPatientMonitor {
    // ============================================================================
    // CONSTANTS - System Configuration
    // ============================================================================
    
    // BPM Configuration
    static BPM_MIN = 30;
    static BPM_MAX = 200;
    static BPM_DECAY_RATE = 2;
    static BPM_GLOBAL_DECAY_RATE = 3;
    static BPM_INACTIVITY_THRESHOLD = 3000; // 3 seconds
    static BPM_GLOBAL_THRESHOLD = 5000; // 5 seconds
    static BPM_CALCULATION_WINDOW = 15000; // 15 seconds for BPM calculation
    
    // Breath Configuration
    static BREATH_WEAK_THRESHOLD = 20;
    static BREATH_INACTIVITY_THRESHOLD = 5000; // 5 seconds
    static BREATH_AUDIO_THRESHOLD = 40;
    static BREATH_AUDIO_MAX = 120;
    
    // Session Configuration
    static HEART_TEST_DURATION = 15000; // 15 seconds
    static BREATH_TEST_DURATION = 10000; // 10 seconds
    static SESSION_ANALYSIS_DELAY = 3000; // 3 seconds
    
    // Session Countdown Configuration
    static COUNTDOWN_UPDATE_INTERVAL = 100; // 100ms for smooth countdown
    static SESSION_START_DELAY = 2000; // 2 seconds delay before starting tests
    
    // Diagnosis Score Thresholds
    static DIAGNOSIS_VERY_LOW = 30; // "You are almost over"
    static DIAGNOSIS_LOW = 60; // "You have [X] days left"
    static DIAGNOSIS_AVERAGE = 80; // "Take care of your health"
    // Above 80 = "You have time left"
    
    // Audio Configuration
    static MIC_SENSITIVITY = 0.35;
    static AUDIO_FFT_SIZE = 512;
    static AUDIO_SMOOTHING = 0.8;
    
    // UI Update Intervals
    static AI_UPDATE_INTERVAL = 4000;
    static MONITORING_BEEP_INTERVAL = 3000;
    static ECG_ANIMATION_INTERVAL = 50;
    static UPTIME_UPDATE_INTERVAL = 1000;
    static BPM_DECAY_INTERVAL = 1000;
    static GLOBAL_DECAY_INTERVAL = 1000;
    
    // ECG Configuration
    static ECG_SPIKE_HEIGHT = 60;
    static ECG_SPIKE_WIDTH = 15;
    
    // ============================================================================
    // CLASS STRUCTURE MAP
    // ============================================================================
    // 1. Constructor & Initialization
    // 2. System State Management (Power, Theme, Navigation)
    // 3. Heart Rate Monitoring (BPM, ECG, Decay)
    // 4. Breath Analysis (Microphone, Audio Processing)
    // 5. Mood System (Patient State)
    // 6. Session Management (Guided Tests)
    // 7. UI Updates (Displays, Bars, Alerts)
    // 8. Audio System (Sounds, Feedback)
    // 9. Utility Functions (Helpers, Cleanup)
    // 10. Event Handlers (Keyboard, Mouse)
    
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
        this.lastHeartbeatTime = 0;
        this.lastBreathTime = 0;
        this.globalDecayInterval = null;
        
        // Microphone System
        this.microphoneEnabled = false;
        this.mediaStream = null;
        this.audioAnalyser = null;
        this.micSensitivity = RetroPatientMonitor.MIC_SENSITIVITY;
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
        this.sessionActive = false;
        this.sessionTimers = { heart: null, breath: null, analyze: null };
        this.sessionPhotoDataUrl = null;
        this.currentSession = null;
        this.heartSamples = [];
        this.breathSamples = [];
        this.heartSampleInterval = null;
        this.breathSampleInterval = null;
        
        // Enhanced Session Management
        this.sessionPhase = 'idle'; // 'idle', 'heart', 'breath', 'analysis'
        this.countdownTimer = null;
        this.countdownInterval = null;
        this.sessionStartTime = null;
        this.testPhaseStartTime = null;
        this.inputsDisabled = false;
        
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

    // ============================================================================
    // 1. INITIALIZATION & SETUP
    // ============================================================================
    
    /**
     * Initialize all system components and start background processes
     */
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

    /**
     * Centralized vital input registration - updates all relevant timestamps
     * @param {string} type - Type of vital input ('heart', 'breath', 'general')
     */
    registerVitalInput(type) {
        const now = Date.now();
        this.lastInputTime = now;
        
        switch (type) {
            case 'heart':
                this.lastHeartbeatTime = now;
                break;
            case 'breath':
                this.lastBreathTime = now;
                break;
        }
        
        // Reset patient state when any vital is detected
        this.isPatientAlive = true;
        this.hideAlert();
    }

    /**
     * Centralized feedback system - plays appropriate sound for different events
     * @param {string} type - Type of feedback ('success', 'warning', 'error', 'info')
     */
    playFeedback(type) {
        const soundMap = {
            'success': 'toggle_on',
            'warning': 'toggle',
            'error': 'error',
            'info': 'click',
            'critical': 'alarm'
        };
        
        this.playSound(soundMap[type] || 'click');
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
        }, RetroPatientMonitor.ECG_ANIMATION_INTERVAL);
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

    /**
     * Add realistic ECG spike pattern to the display
     */
    addECGSpike() {
        if (!this.ecgContext) return;

        const spikeHeight = RetroPatientMonitor.ECG_SPIKE_HEIGHT;
        const spikeWidth = RetroPatientMonitor.ECG_SPIKE_WIDTH;
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
            this.ecgCanvas.addEventListener('click', (e) => {
                // Prevent bubbling to combined card to avoid double heartbeats
                e.stopPropagation();
                this.simulateHeartbeat();
            });
        }

        // Diagnosis actions
        const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
        const photoUpload = document.getElementById('photoUpload');
        const printDeathCert = document.getElementById('printDeathCert');
        if (uploadPhotoBtn && photoUpload) {
            uploadPhotoBtn.addEventListener('click', () => photoUpload.click());
            photoUpload.addEventListener('change', (e) => this.handlePhotoUpload(e));
        }
        if (printDeathCert) {
            printDeathCert.addEventListener('click', () => this.printCertificate());
        }

        // Combined Heart + Mood Card (Section 2) click handler
        const combinedCard = document.getElementById('heartCombinedCard');
        if (combinedCard) {
            combinedCard.addEventListener('click', (e) => {
                if (e.target && e.target.closest && e.target.closest('button')) return;
                // Ignore clicks originating from ECG area; canvas already handles it
                if (e.target.closest && (e.target.closest('.crt-screen') || e.target.closest('#ecgCanvas'))) return;
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

    // ============================================================================
    // 2. SYSTEM STATE MANAGEMENT
    // ============================================================================
    
    /**
     * Toggle system power state and handle all related UI updates
     */
    togglePower() {
        this.isPoweredOn = !this.isPoweredOn;
        
        const powerBtn = document.querySelector('.power-btn');
        const powerLed = document.querySelector('.power-led');
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        if (this.isPoweredOn) {
            // Power ON sequence
            powerBtn.classList.add('active');
            powerLed.classList.add('active');
            statusText.textContent = 'SYSTEM ONLINE';
            statusDot.classList.remove('critical');
            
            this.systemStartTime = Date.now();
            this.playFeedback('success');
            this.updateDiagnosis('SYSTEM BOOT COMPLETE_');
            this.startMonitoringBeeps();
            
            // Start enhanced session workflow
            this.startEnhancedSession();
            
            console.log('POWER: ON');
        } else {
            // Power OFF sequence
            powerBtn.classList.remove('active');
            powerLed.classList.remove('active');
            statusText.textContent = 'SYSTEM OFFLINE';
            statusDot.classList.add('critical');
            
            this.stopAllMonitoring();
            this.resetDisplays();
            this.playFeedback('warning');
            this.updateDiagnosis('SYSTEM SHUTDOWN_');
            this.endSessionTimers();
            
            console.log('POWER: OFF');
        }
    }

    /**
     * Toggle between dark and amber themes
     */
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        
        // For retro theme, we'll just add a subtle color shift
        document.body.classList.toggle('amber-theme', !this.isDarkTheme);
        
        const themeBtn = document.querySelector('.theme-toggle .btn-led');
        if (themeBtn) {
            themeBtn.classList.toggle('active', !this.isDarkTheme);
        }
        
        this.playFeedback('info');
        console.log(`THEME: ${this.isDarkTheme ? 'GREEN' : 'AMBER'}`);
    }

    /**
     * Handle navigation item clicks and update system state
     * @param {Event} e - Click event
     */
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
                this.viewPatientRecords();
                return;
            case 'SETTINGS':
                this.updateDiagnosis('SYSTEM SETTINGS_');
                break;
            case 'POWER':
                this.togglePower();
                return;
        }
        
        this.playFeedback('info');
        console.log(`NAVIGATION: ${section}`);
    }

    // ============================================================================
    // 3. HEART RATE MONITORING
    // ============================================================================
    
    /**
     * Simulate a heartbeat event - records beat, updates BPM, and provides feedback
     */
    simulateHeartbeat() {
        if (!this.isPoweredOn) return;
        
        // Check if inputs are disabled or not in heart phase
        if (this.inputsDisabled || (this.sessionActive && this.sessionPhase !== 'heart')) {
            this.playFeedback('warning');
            return;
        }
        
        const now = Date.now();
        
        // Register vital input using centralized helper
        this.registerVitalInput('heart');
        
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
        this.playFeedback('success');
        this.updateDiagnosis('HEARTBEAT DETECTED_');
        
        console.log(`HEARTBEAT: ${this.heartbeats.length} beats recorded`);
    }

    /**
     * Calculate BPM from recent heartbeat data using median interval method
     */
    calculateBPM() {
        if (this.heartbeats.length < 2) {
            this.currentBPM = 0;
            this.updateBPMDisplay();
            return;
        }

        const now = Date.now();
        const recentBeats = this.heartbeats.filter(beat => 
            now - beat < RetroPatientMonitor.BPM_CALCULATION_WINDOW
        );
        
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
            
            // Clamp to realistic range using constants
            this.currentBPM = Math.max(RetroPatientMonitor.BPM_MIN, 
                                     Math.min(RetroPatientMonitor.BPM_MAX, this.currentBPM));
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

    /**
     * Toggle monitoring state with power validation and UI updates
     */
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

    /**
     * Start monitoring system with all necessary intervals and timers
     */
    startMonitoring() {
        this.measurementStartTime = Date.now();
        this.registerVitalInput('general'); // Initialize timestamps
        
        // Start unified BPM decay monitoring
        this.bpmDecayInterval = setInterval(() => {
            this.updateBPMDecay();
        }, RetroPatientMonitor.BPM_DECAY_INTERVAL);
        
        // Start inactivity monitoring
        this.checkInactivity();
        
        this.updateDiagnosis('MONITORING ACTIVE_');
        this.playFeedback('success');
        
        console.log('MONITORING: STARTED');
    }

    /**
     * Stop monitoring system and clean up all timers
     */
    stopMonitoring() {
        this.isMonitoring = false;
        this.cleanupMonitoringTimers();
        
        this.updateDiagnosis('MONITORING STOPPED_');
        this.playFeedback('warning');
        
        console.log('MONITORING: STOPPED');
    }

    /**
     * Centralized cleanup helper for all monitoring timers and intervals
     */
    cleanupMonitoringTimers() {
        // Clear BPM decay interval
        if (this.bpmDecayInterval) {
            clearInterval(this.bpmDecayInterval);
            this.bpmDecayInterval = null;
        }
        
        // Clear global decay interval
        if (this.globalDecayInterval) {
            clearInterval(this.globalDecayInterval);
            this.globalDecayInterval = null;
        }
        
        // Clear inactivity timer
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        // Clear session timers
        Object.values(this.sessionTimers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        this.sessionTimers = { heart: null, breath: null, analyze: null };
        
        // Clear enhanced session timers
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
            this.countdownTimer = null;
        }
        
        // Clear sample intervals
        if (this.heartSampleInterval) {
            clearInterval(this.heartSampleInterval);
            this.heartSampleInterval = null;
        }
        if (this.breathSampleInterval) {
            clearInterval(this.breathSampleInterval);
            this.breathSampleInterval = null;
        }
    }

    /**
     * Unified BPM decay system - combines both decay mechanisms into one coordinated system
     * Handles both inactivity-based decay and global system decay
     */
    updateBPMDecay() {
        if (!this.isMonitoring || !this.isPoweredOn) return;
        
        const now = Date.now();
        const timeSinceLastInput = now - this.lastInputTime;
        const timeSinceLastHeartbeat = now - this.lastHeartbeatTime;
        
        let decayApplied = false;
        
        // Primary decay: No input for 3 seconds
        if (timeSinceLastInput > RetroPatientMonitor.BPM_INACTIVITY_THRESHOLD && this.currentBPM > 0) {
            this.currentBPM = Math.max(0, this.currentBPM - RetroPatientMonitor.BPM_DECAY_RATE);
            decayApplied = true;
        }
        
        // Secondary decay: No heartbeat for 5 seconds (only if primary didn't apply)
        if (!decayApplied && timeSinceLastHeartbeat > RetroPatientMonitor.BPM_GLOBAL_THRESHOLD && this.currentBPM > 0) {
            this.currentBPM = Math.max(0, this.currentBPM - RetroPatientMonitor.BPM_GLOBAL_DECAY_RATE);
            decayApplied = true;
        }
        
        // Update display if decay was applied
        if (decayApplied) {
            this.updateBPMDisplay();
            
            // Check for critical condition
            if (this.currentBPM === 0 && this.isPatientAlive) {
                this.triggerPatientCritical();
            }
        }
        
        // Breath inactivity check (separate from BPM decay)
        this.checkBreathInactivity(now);
    }

    /**
     * Check for breath inactivity and trigger alerts
     * @param {number} now - Current timestamp
     */
    checkBreathInactivity(now) {
        if (!this.microphoneEnabled || !this.isPatientAlive) return;
        
        const timeSinceLastInput = now - this.lastInputTime;
        const isBreathWeak = this.breathQuality <= RetroPatientMonitor.BREATH_WEAK_THRESHOLD;
        const isInactive = timeSinceLastInput > RetroPatientMonitor.BREATH_INACTIVITY_THRESHOLD;
        
        if (isBreathWeak && isInactive) {
            this.showAlert('BREATH ALERT', 'WEAK OR NO BREATH DETECTED');
            this.playFeedback('critical');
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

    /**
     * Trigger critical patient state - ensures only one trigger per event
     */
    triggerPatientCritical() {
        // Prevent multiple triggers for the same critical event
        if (!this.isPatientAlive) return;
        
        // Set critical state
        this.isPatientAlive = false;
        this.currentBPM = 0;
        this.patientMood = 'CRITICAL';
        
        // Show alert and provide feedback
        this.showAlert('PATIENT CRITICAL', 'NO VITAL SIGNS DETECTED');
        this.playFeedback('critical');
        
        // Update displays
        this.updateBPMDisplay();
        this.updateMoodDisplay();
        this.updateDiagnosis('PATIENT CRITICAL_');
        
        console.log('ALERT: PATIENT CRITICAL');
    }

    // ============================================================================
    // 4. BREATH ANALYSIS
    // ============================================================================
    
    /**
     * Toggle microphone state and handle audio stream initialization
     */
    async toggleMicrophone() {
        if (!this.isPoweredOn) return;
        
        // Check if inputs are disabled or not in breath phase
        if (this.inputsDisabled || (this.sessionActive && this.sessionPhase !== 'breath')) {
            this.playFeedback('warning');
            return;
        }
        
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
                this.playFeedback('success');
                console.log('MICROPHONE: ENABLED');
            } catch (error) {
                this.microphoneEnabled = false;
                micBtn.querySelector('.btn-text').textContent = 'MIC ERR';
                breathStatus.textContent = 'ACCESS DENIED';
                this.playFeedback('error');
                console.error('MICROPHONE: ACCESS DENIED');
            }
        } else {
            this.stopMicrophone();
            micBtn.querySelector('.btn-text').textContent = 'MIC OFF';
            micLed.classList.remove('active');
            breathStatus.textContent = 'NO INPUT DETECTED';
            this.playFeedback('warning');
            console.log('MICROPHONE: DISABLED');
        }
    }

    /**
     * Initialize microphone audio stream and analyzer
     */
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

        // Configure analyzer using constants
        this.audioAnalyser.fftSize = RetroPatientMonitor.AUDIO_FFT_SIZE;
        this.audioAnalyser.smoothingTimeConstant = RetroPatientMonitor.AUDIO_SMOOTHING;

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
            const threshold = RetroPatientMonitor.BREATH_AUDIO_THRESHOLD;
            const maxLevel = RetroPatientMonitor.BREATH_AUDIO_MAX;
            const normalizedLevel = Math.max(0, (average - threshold) / (maxLevel - threshold));

            // Only register significant audio levels
            if (normalizedLevel > this.micSensitivity) {
                this.breathQuality = Math.min(100, Math.floor(normalizedLevel * 100));
                
                // Register vital input using centralized helper
                this.registerVitalInput('breath');
                
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

    /**
     * Handle vital card click with visual and audio feedback
     * @param {HTMLElement} card - The clicked vital card element
     */
    handleVitalCardClick(card) {
        // Add visual feedback
        card.style.transform = 'translateY(-4px) scale(1.02)';
        
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
        
        this.playFeedback('info');
        
        const cardType = card.className.split(' ')[1].replace('-card', '');
        console.log(`VITAL CARD: ${cardType.toUpperCase()} CLICKED`);
    }

    // ============================================================================
    // 9. SYSTEM UTILITIES & CLEANUP
    // ============================================================================
    
    /**
     * Reset all system state to initial values
     */
    resetSystem() {
        this.stopAllMonitoring();
        
        // Reset vital data
        this.heartbeats = [];
        this.currentBPM = 0;
        this.breathQuality = 0;
        this.patientMood = 'NEUTRAL';
        this.isPatientAlive = true;
        
        // Reset displays and UI
        this.resetDisplays();
        this.hideAlert();
        this.updateDiagnosis('SYSTEM RESET COMPLETE_');
        this.playFeedback('success');
        
        console.log('SYSTEM: RESET');
    }

    /**
     * Stop all monitoring and clean up all system resources
     */
    stopAllMonitoring() {
        this.isMonitoring = false;
        
        // Use centralized cleanup helper
        this.cleanupMonitoringTimers();
        
        // Stop microphone
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

    // ============================================================================
    // 8. AI SYSTEM
    // ============================================================================
    
    /**
     * Start AI message rotation system
     */
    startAIUpdates() {
        this.aiUpdateInterval = setInterval(() => {
            if (this.isPoweredOn) {
                this.updateAIMessage();
            }
        }, RetroPatientMonitor.AI_UPDATE_INTERVAL);
    }

    // ============================================================================
    // 6. SESSION MANAGEMENT
    // ============================================================================
    
    /**
     * Start a new guided test session with heart and breath analysis
     */
    startGuidedSession() {
        // Initialize new session object
        this.currentSession = {
            id: Date.now().toString(),
            heartScore: 0,
            breathScore: 0,
            finalScore: 0,
            resultMessage: ''
        };
        
        this.sessionActive = true;
        this.heartSamples = [];
        this.breathSamples = [];
        
        this.showToast('TEST SESSION', 'Start Heart Test – Place your finger on the sensor');
        this.updateDiagnosis('SESSION: HEART TEST STARTED_');
        
        // Start heart test with configured duration
        this.beginHeartSampling(RetroPatientMonitor.HEART_TEST_DURATION);
    }

    /**
     * Begin heart rate sampling for session analysis
     * @param {number} durationMs - Duration of sampling in milliseconds
     */
    beginHeartSampling(durationMs) {
        // Clear any existing interval
        if (this.heartSampleInterval) clearInterval(this.heartSampleInterval);
        
        // Collect BPM samples every second
        this.heartSampleInterval = setInterval(() => {
            if (this.currentBPM > 0) this.heartSamples.push(this.currentBPM);
        }, 1000);
        
        // Set completion timer
        this.sessionTimers.heart = setTimeout(() => {
            clearInterval(this.heartSampleInterval);
            this.heartSampleInterval = null;
            this.currentSession.heartScore = this.computeHeartScore();
            
            // Show heart test completion alert
            this.hideAlert();
            this.showAlert('HEART TEST COMPLETE', `Heart test over. Score: ${this.currentSession.heartScore}`);
            this.playFeedback('success');
            
            // Start breath test after short delay (no need to disable inputs)
            setTimeout(() => {
                this.startBreathTestPhase();
            }, 2000);
        }, durationMs);
    }

    /**
     * Begin breath quality sampling for session analysis
     * @param {number} durationMs - Duration of sampling in milliseconds
     */
    beginBreathSampling(durationMs) {
        // Clear any existing interval
        if (this.breathSampleInterval) clearInterval(this.breathSampleInterval);
        
        // Collect breath samples every second
        this.breathSampleInterval = setInterval(() => {
            if (this.breathQuality > 0) this.breathSamples.push(this.breathQuality);
        }, 1000);
        
        // Set completion timer
        this.sessionTimers.breath = setTimeout(() => {
            clearInterval(this.breathSampleInterval);
            this.breathSampleInterval = null;
            this.currentSession.breathScore = this.computeBreathScore();
            
            // Show breath test completion alert
            this.hideAlert();
            this.showAlert('BREATH TEST COMPLETE', `Breath test over. Score: ${this.currentSession.breathScore}`);
            this.playFeedback('success');
            
            // Complete session analysis after short delay
            setTimeout(() => {
                this.finishEnhancedSessionScoring();
            }, 2000);
        }, durationMs);
    }

    computeHeartScore() {
        if (!this.heartSamples.length) return 0;
        // Favor normal zone 60-100 by mapping to 0-60
        const last = this.heartSamples[this.heartSamples.length - 1];
        let score = 0;
        if (last >= 60 && last <= 100) score = 60;
        else if (last > 100) score = Math.max(20, 60 - (last - 100));
        else if (last > 0 && last < 60) score = Math.max(10, last - 20);
        return Math.max(0, Math.min(60, score));
    }

    computeBreathScore() {
        if (!this.breathSamples.length) return 0;
        // Average breath quality mapped to 0-40
        const avg = Math.round(this.breathSamples.reduce((a,b)=>a+b,0) / this.breathSamples.length);
        return Math.max(0, Math.min(40, Math.floor(avg * 0.4)));
    }

    finishSessionScoring() {
        const heartScore = this.currentSession.heartScore;
        const breathScore = this.currentSession.breathScore;
        const finalScore = heartScore + breathScore;
        this.currentSession.finalScore = finalScore;
        let resultMessage = '';
        if (finalScore < 30) resultMessage = 'Critical – Less than 50 days left';
        else if (finalScore < 60) resultMessage = 'Moderate – Keep improving';
        else resultMessage = 'Safe – Plenty of time left';
        this.currentSession.resultMessage = resultMessage;
        this.persistSession(this.currentSession);
        this.renderSessionResult(this.currentSession);
        this.sessionActive = false;
    }

    /**
     * Enhanced session scoring with new diagnosis logic
     */
    finishEnhancedSessionScoring() {
        const heartScore = this.currentSession.heartScore;
        const breathScore = this.currentSession.breathScore;
        const finalScore = heartScore + breathScore;
        this.currentSession.finalScore = finalScore;
        
        // Store samples in session data
        this.currentSession.heartSamples = [...this.heartSamples];
        this.currentSession.breathSamples = [...this.breathSamples];
        
        // New diagnosis logic based on combined score
        let resultMessage = '';
        let daysLeft = 0;
        
        if (finalScore < RetroPatientMonitor.DIAGNOSIS_VERY_LOW) {
            resultMessage = 'You are almost over.';
            daysLeft = Math.max(1, Math.floor(finalScore / 2));
        } else if (finalScore < RetroPatientMonitor.DIAGNOSIS_LOW) {
            daysLeft = Math.max(30, 120 - finalScore);
            resultMessage = `You have ${daysLeft} days left.`;
        } else if (finalScore < RetroPatientMonitor.DIAGNOSIS_AVERAGE) {
            resultMessage = 'Take care of your health.';
            daysLeft = 365;
        } else {
            resultMessage = 'You have time left.';
            daysLeft = 1000;
        }
        
        this.currentSession.resultMessage = resultMessage;
        this.currentSession.daysLeft = daysLeft;
        
        // Save session to localStorage
        this.persistSession(this.currentSession);
        
        // Show final diagnosis alert with better formatting
        this.hideAlert();
        const alertMessage = `Heart Score: ${this.currentSession.heartScore}/60
Breath Score: ${this.currentSession.breathScore}/40
Final Score: ${finalScore}/100

${resultMessage}`;
        this.showAlert('DIAGNOSIS COMPLETE', alertMessage);
        this.playFeedback('info');
        
        // Update diagnosis display
        this.renderEnhancedSessionResult(this.currentSession);
        
        // Reset session state
        this.sessionActive = false;
        this.sessionPhase = 'idle';
        this.enableInputs();
        
        // Remove phase indicators
        const heartCard = document.querySelector('.heart-card');
        const breathCard = document.querySelector('.breath-card');
        if (heartCard) {
            heartCard.classList.remove('disabled', 'active-phase');
        }
        if (breathCard) {
            breathCard.classList.remove('disabled', 'active-phase');
        }
        
        // Reset status display
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'SYSTEM ONLINE';
        }
    }
    
    /**
     * Render enhanced session results with detailed information
     * @param {Object} session - Session data object
     */
    renderEnhancedSessionResult(session) {
        // Create a more readable and formatted result display
        const diagnosisText = `SESSION RESULTS:
HEART SCORE: ${session.heartScore}/60
BREATH SCORE: ${session.breathScore}/40
FINAL SCORE: ${session.finalScore}/100
DIAGNOSIS: ${session.resultMessage.toUpperCase()}_`;
        this.updateDiagnosis(diagnosisText);
    }
    
    /**
     * View patient records from localStorage
     */
    viewPatientRecords() {
        try {
            const key = 'lifeTestSessions';
            const sessions = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (sessions.length === 0) {
                this.showAlert('NO RECORDS', 'No patient sessions found');
                this.playFeedback('warning');
                return;
            }
            
            // Create records display
            let recordsText = 'PATIENT RECORDS:\n\n';
            sessions.slice(-5).reverse().forEach((session, index) => {
                const date = new Date(session.timestamp || session.id).toLocaleString();
                recordsText += `${index + 1}. ${date}\n`;
                recordsText += `   Heart: ${session.heartScore} | Breath: ${session.breathScore}\n`;
                recordsText += `   Final: ${session.finalScore} | ${session.resultMessage}\n\n`;
            });
            
            this.showAlert('PATIENT RECORDS', recordsText);
            this.playFeedback('info');
            
        } catch (error) {
            this.showAlert('ERROR', 'Failed to load patient records');
            this.playFeedback('error');
        }
    }

    renderSessionResult(session) {
        this.updateDiagnosis(
            `RESULTS: HEART ${session.heartScore} | BREATH ${session.breathScore} | FINAL ${session.finalScore} | ${session.resultMessage.toUpperCase()}_`
        );
    }

    persistSession(session) {
        try {
            const key = 'lifeTestSessions';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(session);
            localStorage.setItem(key, JSON.stringify(existing));
        } catch {}
    }

    /**
     * End all session timers and reset session state
     */
    endSessionTimers() {
        // Use centralized cleanup helper which handles session timers
        this.cleanupMonitoringTimers();
        
        // Reset session state
        this.sessionActive = false;
        this.sessionPhase = 'idle';
        this.currentSession = null;
        this.heartSamples = [];
        this.breathSamples = [];
        this.inputsDisabled = false;
        this.sessionStartTime = null;
        this.testPhaseStartTime = null;
        
        // Enable inputs and remove phase indicators
        this.enableInputs();
        const heartCard = document.querySelector('.heart-card');
        const breathCard = document.querySelector('.breath-card');
        if (heartCard) {
            heartCard.classList.remove('disabled', 'active-phase');
        }
        if (breathCard) {
            breathCard.classList.remove('disabled', 'active-phase');
        }
        
        // Reset status display
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'SYSTEM ONLINE';
        }
    }

    showToast(title, message) {
        const toast = document.getElementById('toastModal');
        const tTitle = document.getElementById('toastTitle');
        const tText = document.getElementById('toastText');
        if (!toast || !tTitle || !tText) return;
        tTitle.textContent = title;
        tText.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => { try { toast.classList.add('hidden'); } catch {} }, 2500);
    }

    // ============================================================================
    // ENHANCED SESSION MANAGEMENT
    // ============================================================================
    
    /**
     * Start enhanced session workflow with countdown timers and phase management
     */
    startEnhancedSession() {
        // Initialize new session object with timestamp
        this.currentSession = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            heartScore: 0,
            breathScore: 0,
            finalScore: 0,
            resultMessage: '',
            heartSamples: [],
            breathSamples: []
        };
        
        this.sessionActive = true;
        this.sessionPhase = 'idle';
        this.sessionStartTime = Date.now();
        this.heartSamples = [];
        this.breathSamples = [];
        
        // Show initial alert
        this.showAlert('SESSION START', '15 sec heart test starts in 2 seconds');
        this.playFeedback('info');
        
        // Start heart test after delay
        this.countdownTimer = setTimeout(() => {
            this.startHeartTestPhase();
        }, RetroPatientMonitor.SESSION_START_DELAY);
    }
    
    /**
     * Start heart test phase with countdown timer
     */
    startHeartTestPhase() {
        this.sessionPhase = 'heart';
        this.testPhaseStartTime = Date.now();
        this.inputsDisabled = false; // Enable inputs for heart phase
        
        // Enable heart input, disable breath input
        this.enableInputs();
        const heartCard = document.querySelector('.heart-card');
        const breathCard = document.querySelector('.breath-card');
        if (heartCard) heartCard.classList.remove('disabled');
        if (breathCard) breathCard.classList.add('disabled');
        
        // Show heart test alert
        this.hideAlert();
        this.showAlert('HEART TEST', '15 sec heart test started - Click to simulate heartbeat');
        this.playFeedback('success');
        
        // Start countdown display
        this.startCountdown(RetroPatientMonitor.HEART_TEST_DURATION, 'HEART TEST');
        
        // Start heart sampling
        this.beginHeartSampling(RetroPatientMonitor.HEART_TEST_DURATION);
    }
    
    /**
     * Start breath test phase with countdown timer
     */
    startBreathTestPhase() {
        this.sessionPhase = 'breath';
        this.testPhaseStartTime = Date.now();
        this.inputsDisabled = false; // Enable inputs for breath phase
        
        // Enable breath input, disable heart input
        this.enableInputs();
        const heartCard = document.querySelector('.heart-card');
        const breathCard = document.querySelector('.breath-card');
        if (heartCard) heartCard.classList.add('disabled');
        if (breathCard) breathCard.classList.remove('disabled');
        
        // Show breath test alert
        this.hideAlert();
        this.showAlert('BREATH TEST', '10 sec breath test started - Use microphone or simulate');
        this.playFeedback('success');
        
        // Start countdown display
        this.startCountdown(RetroPatientMonitor.BREATH_TEST_DURATION, 'BREATH TEST');
        
        // Start breath sampling
        this.beginBreathSampling(RetroPatientMonitor.BREATH_TEST_DURATION);
    }
    
    /**
     * Start visual countdown timer for test phases
     * @param {number} durationMs - Duration in milliseconds
     * @param {string} phaseName - Name of the test phase
     */
    startCountdown(durationMs, phaseName) {
        const startTime = Date.now();
        const endTime = startTime + durationMs;
        
        // Clear any existing countdown
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            const seconds = Math.ceil(remaining / 1000);
            
            // Update countdown display
            this.updateCountdownDisplay(seconds, phaseName);
            
            // Add urgency animation for last 5 seconds
            if (seconds <= 5 && seconds > 0) {
                this.addCountdownUrgency();
            }
            
            // End countdown when time is up
            if (remaining <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.hideCountdownDisplay();
            }
        }, RetroPatientMonitor.COUNTDOWN_UPDATE_INTERVAL);
    }
    
    /**
     * Update countdown display in the UI
     * @param {number} seconds - Remaining seconds
     * @param {string} phaseName - Current test phase name
     */
    updateCountdownDisplay(seconds, phaseName) {
        // Update diagnosis area with clear countdown format
        const diagnosisElement = document.querySelector('.diagnosis-text');
        if (diagnosisElement) {
            const timeStr = seconds > 0 ? `${seconds}s` : 'TIME UP';
            diagnosisElement.textContent = `${phaseName.toUpperCase()} TEST: ${timeStr} REMAINING_`;
        }
        
        // Update status text with simplified countdown and phase indicator
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            if (seconds > 0) {
                statusText.textContent = `ACTIVE: ${phaseName.toUpperCase()} TEST - ${seconds}s`;
            } else {
                statusText.textContent = `COMPLETE: ${phaseName.toUpperCase()} TEST`;
            }
        }
        
        // Update visual phase indicator on cards
        const heartCard = document.querySelector('.heart-card');
        const breathCard = document.querySelector('.breath-card');
        
        if (heartCard && breathCard) {
            if (phaseName.toLowerCase() === 'heart') {
                heartCard.classList.add('active-phase');
                breathCard.classList.remove('active-phase');
            } else if (phaseName.toLowerCase() === 'breath') {
                breathCard.classList.add('active-phase');
                heartCard.classList.remove('active-phase');
            }
        }
    }
    
    /**
     * Add urgency animation to countdown (last 5 seconds)
     */
    addCountdownUrgency() {
        const statusDot = document.querySelector('.status-dot');
        if (statusDot) {
            statusDot.classList.add('urgent');
            setTimeout(() => {
                statusDot.classList.remove('urgent');
            }, 500);
        }
    }
    
    /**
     * Hide countdown display
     */
    hideCountdownDisplay() {
        const diagnosisElement = document.querySelector('.diagnosis-text');
        if (diagnosisElement) {
            diagnosisElement.textContent = 'ANALYZING RESULTS_';
        }
    }
    
    /**
     * Disable input controls during non-active phases
     */
    disableInputs() {
        this.inputsDisabled = true;
        // Visual feedback for disabled state
        const heartCard = document.querySelector('.heart-card');
        const breathCard = document.querySelector('.breath-card');
        if (heartCard) heartCard.classList.add('disabled');
        if (breathCard) breathCard.classList.add('disabled');
    }
    
    /**
     * Enable input controls for active phase
     */
    enableInputs() {
        this.inputsDisabled = false;
        // Remove disabled visual state
        const heartCard = document.querySelector('.heart-card');
        const breathCard = document.querySelector('.breath-card');
        if (heartCard) heartCard.classList.remove('disabled');
        if (breathCard) breathCard.classList.remove('disabled');
    }
    /**
     * Start legacy session-based diagnosis flow
     */
    startSession() {
        if (!this.isPoweredOn || this.sessionActive) return;
        this.sessionActive = true;
        this.updateDiagnosis('SESSION STARTED: HEART CHECK (15S)_');
        this.sessionTimers.heart = setTimeout(() => {
            this.updateDiagnosis('HEART CHECK COMPLETE. STARTING BREATH CHECK..._');
            this.sessionTimers.breath = setTimeout(() => {
                this.updateDiagnosis('BREATH CHECK COMPLETE. ANALYZING..._');
                this.sessionTimers.analyze = setTimeout(() => {
                    this.completeSessionAnalysis();
                }, RetroPatientMonitor.SESSION_ANALYSIS_DELAY);
            }, RetroPatientMonitor.HEART_TEST_DURATION);
        }, RetroPatientMonitor.HEART_TEST_DURATION);
    }

    completeSessionAnalysis() {
        const badBreath = this.breathQuality < 40;
        const irregularHeart = this.currentBPM > 100 || (this.currentBPM > 0 && this.currentBPM < 60);
        let daysToLive = 0;
        if (badBreath && irregularHeart) {
            daysToLive = Math.max(1, 30 - Math.floor((this.currentBPM || 60) / 2));
            this.updateDiagnosis(`ANALYSIS: CRITICAL. EST. ${daysToLive} DAYS TO LIVE_`);
        } else if (badBreath || irregularHeart) {
            daysToLive = 120 - Math.min(80, Math.abs((this.currentBPM || 60) - 75));
            this.updateDiagnosis(`ANALYSIS: MONITOR CLOSELY. EST. ${daysToLive} DAYS TO LIVE_`);
        } else {
            this.updateDiagnosis('ANALYSIS: STABLE. CONTINUE REGULAR CHECKUPS_');
        }
        const printBtn = document.getElementById('printDeathCert');
        if (printBtn) printBtn.style.display = 'inline-flex';
        this.sessionActive = false;
    }

    /**
     * Handle photo upload for session documentation
     * @param {Event} event - File input change event
     */
    handlePhotoUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.sessionPhotoDataUrl = e.target.result;
            this.playFeedback('success');
            this.updateDiagnosis('PHOTO UPLOADED_');
        };
        reader.readAsDataURL(file);
    }

    printCertificate() {
        const w = window.open('', 'CERT');
        if (!w) return;
        const now = new Date().toLocaleString();
        const mood = this.patientMood;
        const bpm = this.currentBPM || '--';
        const breath = this.breathQuality || '--';
        const imgTag = this.sessionPhotoDataUrl ? `<img src="${this.sessionPhotoDataUrl}" style="max-width:200px;display:block;margin:12px 0;"/>` : '';
        w.document.write(`
          <html><head><title>Death Certificate</title>
          <style>
            body{ font-family: Arial, sans-serif; padding: 24px; }
            h1{ margin: 0 0 8px; }
            .meta{ color:#444; margin-bottom: 16px; }
            .box{ border:1px solid #222; padding:12px; margin-top:12px; }
          </style>
          </head><body>
            <h1>Death Certificate (Parody)</h1>
            <div class=\"meta\">Generated: ${now}</div>
            ${imgTag}
            <div class=\"box\">Heartbeat (BPM): ${bpm}</div>
            <div class=\"box\">Breath Quality: ${breath}%</div>
            <div class=\"box\">Mood: ${mood}</div>
            <p>This certificate is generated for demonstration purposes only.</p>
            <script>window.onload=()=>window.print();<\\/script>
          </body></html>
        `);
        w.document.close();
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

    // ============================================================================
    // 7. TIME SYSTEM
    // ============================================================================
    
    /**
     * Start system time and uptime tracking
     */
    startSystemTime() {
        this.uptimeInterval = setInterval(() => {
            this.updateDateTime();
            this.updateUptime();
        }, RetroPatientMonitor.UPTIME_UPDATE_INTERVAL);
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

    /**
     * Start periodic monitoring beep sounds
     */
    startMonitoringBeeps() {
        if (this.monitoringBeepInterval) {
            clearInterval(this.monitoringBeepInterval);
        }
        
        this.monitoringBeepInterval = setInterval(() => {
            if (this.isPoweredOn && this.isPatientAlive) {
                this.playSound('monitoring_beep');
            }
        }, RetroPatientMonitor.MONITORING_BEEP_INTERVAL);
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
            case 'r':
            case 'R':
                if (this.isPoweredOn) {
                    event.preventDefault();
                    this.viewPatientRecords();
                }
                break;
        }
    }

    showHelp() {
        this.showAlert('SYSTEM HELP', 'SPACE: HEARTBEAT | P: POWER | M: MIC | R: RECORDS | F2: SAVE | ESC: EMERGENCY');
    }

    /**
     * Save current system data to memory
     */
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
        this.playFeedback('success');
    }

    /**
     * Emergency stop all monitoring systems
     */
    emergencyStop() {
        this.stopAllMonitoring();
        this.showAlert('EMERGENCY STOP', 'ALL MONITORING STOPPED');
        this.playFeedback('critical');
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
        window.retroMonitor.playFeedback('success');
    }
}

function closeToast() {
    const t = document.getElementById('toastModal');
    if (t) t.classList.add('hidden');
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
    console.log('- R: PATIENT RECORDS');
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