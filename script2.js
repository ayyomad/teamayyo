// RETRO MEDICAL TERMINAL - PIXEL EDITION
// Authentic 80s CRT Medical Device Simulator

class RetroMedicalTerminal {
    constructor() {
        // System State
        this.isPoweredOn = false;
        this.systemStartTime = null;
        this.uptime = 0;
        
        // Heart Rate Monitoring
        this.heartbeats = [];
        this.currentBPM = 0;
        this.isMonitoring = false;
        this.measurementTimer = null;
        this.measurementDuration = 15; // seconds
        this.timeRemaining = 15;
        
        // Breath Analysis
        this.microphoneEnabled = false;
        this.mediaStream = null;
        this.audioAnalyser = null;
        this.breathQuality = 0;
        this.breathBars = [];
        
        // AI Analysis
        this.aiMessages = [
            'INITIALIZING NEURAL NETWORK...',
            'LOADING MEDICAL DATABASE...',
            'CALIBRATING SENSORS...',
            'READY FOR ANALYSIS',
            'MONITORING VITAL SIGNS...',
            'PROCESSING DATA PATTERNS...',
            'ANALYZING HEART RHYTHM...',
            'EVALUATING BREATH PATTERNS...',
            'GENERATING DIAGNOSIS...',
            'ASSESSMENT COMPLETE'
        ];
        this.currentAIMessage = 0;
        this.aiConfidence = 0;
        
        // Canvas Elements
        this.ecgCanvas = null;
        this.ecgContext = null;
        this.breathCanvas = null;
        this.breathContext = null;
        this.ecgData = [];
        this.breathData = [];
        
        // Audio System
        this.audioContext = null;
        this.isAudioEnabled = false;
        
        // Intervals
        this.uptimeInterval = null;
        this.aiUpdateInterval = null;
        this.ecgAnimationInterval = null;
        this.breathAnimationInterval = null;
        
        this.initialize();
    }

    initialize() {
        this.setupAudio();
        this.setupCanvas();
        this.setupEventListeners();
        this.startSystemTime();
        this.startAIUpdates();
        this.initializeDisplays();
        
        console.log('RETRO MEDICAL TERMINAL v2.1 INITIALIZED');
        console.log('TYPE: PIXEL EDITION');
        console.log('STATUS: READY');
    }

    // Audio System Setup
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isAudioEnabled = true;
        } catch (error) {
            console.warn('AUDIO SYSTEM: OFFLINE');
            this.isAudioEnabled = false;
        }
    }

    // Canvas Setup
    setupCanvas() {
        // ECG Canvas
        this.ecgCanvas = document.getElementById('ecgCanvas');
        if (this.ecgCanvas) {
            this.ecgContext = this.ecgCanvas.getContext('2d');
            this.initializeECG();
        }

        // Breath Canvas
        this.breathCanvas = document.getElementById('breathCanvas');
        if (this.breathCanvas) {
            this.breathContext = this.breathCanvas.getContext('2d');
            this.initializeBreathGraph();
        }

        // Initialize breath meter bars
        this.breathBars = document.querySelectorAll('.meter-bar');
    }

    initializeECG() {
        if (!this.ecgContext) return;
        
        const canvas = this.ecgCanvas;
        this.ecgData = new Array(canvas.width).fill(canvas.height / 2);
        this.drawECG();
        
        // Start ECG baseline animation
        this.ecgAnimationInterval = setInterval(() => {
            this.animateECGBaseline();
        }, 50);
    }

    initializeBreathGraph() {
        if (!this.breathContext) return;
        
        const canvas = this.breathCanvas;
        this.breathData = new Array(canvas.width).fill(canvas.height / 2);
        this.drawBreathGraph();
        
        // Start breath animation
        this.breathAnimationInterval = setInterval(() => {
            this.animateBreathGraph();
        }, 100);
    }

    // Event Listeners
    setupEventListeners() {
        // Power Button
        const powerBtn = document.querySelector('.power-btn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => this.togglePower());
        }

        // Heartbeat Button
        const heartbeatBtn = document.querySelector('.heartbeat-btn');
        if (heartbeatBtn) {
            heartbeatBtn.addEventListener('click', () => this.recordHeartbeat());
        }

        // Microphone Toggle
        const micToggleBtn = document.querySelector('.mic-toggle-btn');
        if (micToggleBtn) {
            micToggleBtn.addEventListener('click', () => this.toggleMicrophone());
        }

        // Control Buttons
        const startBtn = document.querySelector('.start-btn');
        const stopBtn = document.querySelector('.stop-btn');
        const resetBtn = document.querySelector('.reset-btn');
        const saveBtn = document.querySelector('.save-btn');
        const emergencyBtn = document.querySelector('.emergency-btn');

        if (startBtn) startBtn.addEventListener('click', () => this.startMonitoring());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopMonitoring());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSystem());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveData());
        if (emergencyBtn) emergencyBtn.addEventListener('click', () => this.emergencyStop());

        // Canvas click for heartbeat
        if (this.ecgCanvas) {
            this.ecgCanvas.addEventListener('click', () => this.recordHeartbeat());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Power System
    togglePower() {
        this.isPoweredOn = !this.isPoweredOn;
        
        const powerBtn = document.querySelector('.power-btn');
        const statusLed = document.querySelector('.status-led');
        const statusText = document.querySelector('.status-text');
        const systemStatus = document.getElementById('systemStatus');
        
        if (this.isPoweredOn) {
            // Power ON
            powerBtn.classList.add('active');
            statusLed.classList.add('online');
            statusText.textContent = 'ONLINE';
            systemStatus.textContent = 'ONLINE';
            
            this.systemStartTime = Date.now();
            this.playSound('power_on');
            this.updateAIOutput('SYSTEM BOOT COMPLETE_');
            
            console.log('POWER: ON');
        } else {
            // Power OFF
            powerBtn.classList.remove('active');
            statusLed.classList.remove('online');
            statusText.textContent = 'OFFLINE';
            systemStatus.textContent = 'OFFLINE';
            
            this.stopAllMonitoring();
            this.resetDisplays();
            this.playSound('power_off');
            this.updateAIOutput('SYSTEM SHUTDOWN_');
            
            console.log('POWER: OFF');
        }
    }

    // Heart Rate Monitoring
    recordHeartbeat() {
        if (!this.isPoweredOn) return;
        
        const now = Date.now();
        this.heartbeats.push(now);
        
        // Keep only recent heartbeats (last 30 seconds)
        const cutoff = now - 30000;
        this.heartbeats = this.heartbeats.filter(beat => beat > cutoff);
        
        // Calculate BPM
        this.calculateBPM();
        
        // Visual and audio feedback
        this.addECGSpike();
        this.playSound('heartbeat');
        this.updateAIOutput('HEARTBEAT DETECTED_');
        
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
            // Calculate average interval between beats
            const intervals = [];
            for (let i = 1; i < recentBeats.length; i++) {
                intervals.push(recentBeats[i] - recentBeats[i - 1]);
            }
            
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            this.currentBPM = Math.round((60 * 1000) / avgInterval);
            
            // Clamp to realistic range
            this.currentBPM = Math.max(30, Math.min(200, this.currentBPM));
        }
        
        this.updateBPMDisplay();
        this.updateAIConfidence();
    }

    updateBPMDisplay() {
        const bpmValue = document.querySelector('.bpm-value');
        if (bpmValue) {
            bpmValue.textContent = this.currentBPM > 0 ? this.currentBPM : '--';
        }
    }

    startMonitoring() {
        if (!this.isPoweredOn) return;
        
        this.isMonitoring = true;
        this.timeRemaining = this.measurementDuration;
        
        // Update UI
        const startBtn = document.querySelector('.start-btn');
        const ecgStatus = document.querySelector('.ecg-card .status-label');
        const timer = document.querySelector('.measurement-timer');
        
        if (startBtn) startBtn.classList.add('active');
        if (ecgStatus) ecgStatus.textContent = 'MONITORING';
        
        // Start countdown
        this.measurementTimer = setInterval(() => {
            this.timeRemaining--;
            if (timer) timer.textContent = `${this.timeRemaining}s`;
            
            if (this.timeRemaining <= 0) {
                this.stopMonitoring();
            }
        }, 1000);
        
        this.updateAIOutput('MONITORING STARTED_');
        this.playSound('start');
        
        console.log('MONITORING: STARTED');
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.measurementTimer) {
            clearInterval(this.measurementTimer);
            this.measurementTimer = null;
        }
        
        // Update UI
        const startBtn = document.querySelector('.start-btn');
        const ecgStatus = document.querySelector('.ecg-card .status-label');
        const timer = document.querySelector('.measurement-timer');
        
        if (startBtn) startBtn.classList.remove('active');
        if (ecgStatus) ecgStatus.textContent = 'COMPLETE';
        if (timer) timer.textContent = '15s';
        
        // Final BPM calculation
        this.calculateBPM();
        this.generateDiagnosis();
        
        this.updateAIOutput('MONITORING COMPLETE_');
        this.playSound('stop');
        
        console.log('MONITORING: STOPPED');
    }

    // Microphone System
    async toggleMicrophone() {
        if (!this.isPoweredOn) return;
        
        this.microphoneEnabled = !this.microphoneEnabled;
        
        const micBtn = document.querySelector('.mic-toggle-btn .pixel-text');
        const breathStatus = document.querySelector('.breath-card .status-label');
        const breathStatusText = document.querySelector('.breath-status');
        
        if (this.microphoneEnabled) {
            try {
                await this.initializeMicrophone();
                if (micBtn) micBtn.textContent = 'MIC ON';
                if (breathStatus) breathStatus.textContent = 'ACTIVE';
                if (breathStatusText) breathStatusText.textContent = 'LISTENING';
                this.playSound('toggle_on');
                console.log('MICROPHONE: ENABLED');
            } catch (error) {
                this.microphoneEnabled = false;
                if (micBtn) micBtn.textContent = 'MIC ERR';
                if (breathStatus) breathStatus.textContent = 'ERROR';
                if (breathStatusText) breathStatusText.textContent = 'ACCESS DENIED';
                console.error('MICROPHONE: ACCESS DENIED');
            }
        } else {
            this.stopMicrophone();
            if (micBtn) micBtn.textContent = 'MIC OFF';
            if (breathStatus) breathStatus.textContent = 'DISABLED';
            if (breathStatusText) breathStatusText.textContent = 'INACTIVE';
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

        this.audioAnalyser.fftSize = 256;
        this.audioAnalyser.smoothingTimeConstant = 0.8;

        this.startBreathAnalysis();
    }

    startBreathAnalysis() {
        if (!this.microphoneEnabled || !this.audioAnalyser) return;

        const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

        const analyzeAudio = () => {
            if (!this.microphoneEnabled || !this.isPoweredOn) return;

            this.audioAnalyser.getByteFrequencyData(dataArray);

            // Calculate audio level with noise filtering
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const threshold = 35; // Increased threshold for noise reduction
            const normalizedLevel = Math.max(0, (average - threshold) / (100 - threshold));

            if (normalizedLevel > 0.2) { // Only register significant audio
                this.breathQuality = Math.min(100, Math.floor(normalizedLevel * 100));
                this.updateBreathDisplay();
                this.updateAIOutput('BREATH DETECTED_');
            } else {
                // Gradual decay
                this.breathQuality = Math.max(0, this.breathQuality - 1);
                this.updateBreathDisplay();
            }

            requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();
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

    updateBreathDisplay() {
        // Update breath quality percentage
        const breathValue = document.getElementById('breathValue');
        if (breathValue) {
            breathValue.textContent = this.breathQuality > 0 ? this.breathQuality : '--';
        }

        // Update meter bars
        const activeBarCount = Math.ceil((this.breathQuality / 100) * this.breathBars.length);
        this.breathBars.forEach((bar, index) => {
            if (index < activeBarCount) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    // ECG Canvas Animation
    drawECG() {
        if (!this.ecgContext) return;

        const ctx = this.ecgContext;
        const canvas = this.ecgCanvas;

        // Clear canvas
        ctx.fillStyle = '#001100';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw ECG line
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < this.ecgData.length - 1; i++) {
            if (i === 0) {
                ctx.moveTo(i, this.ecgData[i]);
            } else {
                ctx.lineTo(i, this.ecgData[i]);
            }
        }

        ctx.stroke();
    }

    animateECGBaseline() {
        if (!this.isPoweredOn) return;

        // Shift data left
        this.ecgData.shift();
        
        // Add new baseline point with slight noise
        const baseline = this.ecgCanvas.height / 2;
        const noise = (Math.random() - 0.5) * 2;
        this.ecgData.push(baseline + noise);

        this.drawECG();
    }

    addECGSpike() {
        if (!this.ecgContext) return;

        const spikeHeight = 40;
        const spikeWidth = 12;
        const baseline = this.ecgCanvas.height / 2;

        // Create spike pattern
        for (let i = 0; i < spikeWidth; i++) {
            const progress = i / spikeWidth;
            let y = baseline;

            if (progress < 0.2) {
                y = baseline - (spikeHeight * 0.3 * (progress / 0.2));
            } else if (progress < 0.4) {
                y = baseline - spikeHeight * ((progress - 0.2) / 0.2);
            } else if (progress < 0.6) {
                y = baseline - spikeHeight + (spikeHeight * 1.5 * ((progress - 0.4) / 0.2));
            } else if (progress < 0.8) {
                y = baseline + (spikeHeight * 0.5) - (spikeHeight * 0.5 * ((progress - 0.6) / 0.2));
            } else {
                y = baseline + (baseline * 0.1 * (1 - ((progress - 0.8) / 0.2)));
            }

            if (this.ecgData.length > 0) {
                this.ecgData[this.ecgData.length - spikeWidth + i] = y;
            }
        }

        this.drawECG();
    }

    // Breath Graph Animation
    drawBreathGraph() {
        if (!this.breathContext) return;

        const ctx = this.breathContext;
        const canvas = this.breathCanvas;

        // Clear canvas
        ctx.fillStyle = '#001100';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw breath waveform
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let i = 0; i < this.breathData.length - 1; i++) {
            if (i === 0) {
                ctx.moveTo(i, this.breathData[i]);
            } else {
                ctx.lineTo(i, this.breathData[i]);
            }
        }

        ctx.stroke();
    }

    animateBreathGraph() {
        if (!this.isPoweredOn) return;

        // Shift data left
        this.breathData.shift();

        // Add new breath data point
        const baseline = this.breathCanvas.height / 2;
        const amplitude = (this.breathQuality / 100) * (this.breathCanvas.height / 4);
        const frequency = 0.1;
        const time = Date.now() * frequency;
        const wave = Math.sin(time) * amplitude;

        this.breathData.push(baseline + wave);
        this.drawBreathGraph();
    }

    // AI System
    startAIUpdates() {
        this.aiUpdateInterval = setInterval(() => {
            if (this.isPoweredOn) {
                this.updateAIMessage();
            }
        }, 3000);
    }

    updateAIMessage() {
        this.currentAIMessage = (this.currentAIMessage + 1) % this.aiMessages.length;
        const message = this.aiMessages[this.currentAIMessage];
        this.updateAIOutput(message + '_');
    }

    updateAIOutput(message) {
        const aiOutput = document.getElementById('aiOutput');
        if (aiOutput) {
            aiOutput.textContent = message;
        }
    }

    updateAIConfidence() {
        // Calculate confidence based on data quality
        let confidence = 0;
        
        if (this.currentBPM > 0) confidence += 40;
        if (this.breathQuality > 0) confidence += 30;
        if (this.heartbeats.length > 5) confidence += 30;
        
        this.aiConfidence = Math.min(100, confidence);
        
        // Update confidence bars
        const confBars = document.querySelectorAll('.conf-bar');
        const activeCount = Math.ceil((this.aiConfidence / 100) * confBars.length);
        
        confBars.forEach((bar, index) => {
            if (index < activeCount) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    generateDiagnosis() {
        let diagnosis = 'ANALYSIS COMPLETE: ';
        
        if (this.currentBPM === 0) {
            diagnosis += 'NO CARDIAC ACTIVITY';
        } else if (this.currentBPM < 60) {
            diagnosis += 'BRADYCARDIA DETECTED';
        } else if (this.currentBPM > 100) {
            diagnosis += 'TACHYCARDIA DETECTED';
        } else {
            diagnosis += 'NORMAL HEART RATE';
        }
        
        this.updateAIOutput(diagnosis + '_');
    }

    // System Controls
    resetSystem() {
        this.stopAllMonitoring();
        this.heartbeats = [];
        this.currentBPM = 0;
        this.breathQuality = 0;
        this.aiConfidence = 0;
        
        this.resetDisplays();
        this.updateAIOutput('SYSTEM RESET COMPLETE_');
        this.playSound('reset');
        
        console.log('SYSTEM: RESET');
    }

    saveData() {
        if (!this.isPoweredOn) return;
        
        const data = {
            timestamp: new Date().toISOString(),
            bpm: this.currentBPM,
            breathQuality: this.breathQuality,
            heartbeats: this.heartbeats.length,
            aiConfidence: this.aiConfidence
        };
        
        console.log('DATA SAVED:', data);
        this.updateAIOutput('DATA SAVED TO MEMORY_');
        this.playSound('save');
    }

    emergencyStop() {
        this.stopAllMonitoring();
        this.showAlert('EMERGENCY STOP ACTIVATED', 'ALL MONITORING STOPPED');
        this.playSound('emergency');
        console.log('EMERGENCY: STOP ACTIVATED');
    }

    stopAllMonitoring() {
        this.isMonitoring = false;
        
        if (this.measurementTimer) {
            clearInterval(this.measurementTimer);
            this.measurementTimer = null;
        }
        
        this.stopMicrophone();
        this.resetDisplays();
    }

    resetDisplays() {
        // Reset BPM display
        const bpmValue = document.querySelector('.bpm-value');
        if (bpmValue) bpmValue.textContent = '--';
        
        // Reset breath display
        const breathValue = document.getElementById('breathValue');
        if (breathValue) breathValue.textContent = '--';
        
        // Reset meter bars
        this.breathBars.forEach(bar => bar.classList.remove('active'));
        
        // Reset confidence bars
        const confBars = document.querySelectorAll('.conf-bar');
        confBars.forEach(bar => bar.classList.remove('active'));
        
        // Reset status indicators
        const ecgStatus = document.querySelector('.ecg-card .status-label');
        const breathStatus = document.querySelector('.breath-card .status-label');
        
        if (ecgStatus) ecgStatus.textContent = 'STANDBY';
        if (breathStatus) breathStatus.textContent = 'DISABLED';
        
        // Reset timer
        const timer = document.querySelector('.measurement-timer');
        if (timer) timer.textContent = '15s';
    }

    // System Time
    startSystemTime() {
        this.uptimeInterval = setInterval(() => {
            this.updateSystemTime();
            this.updateUptime();
        }, 1000);
    }

    updateSystemTime() {
        const timeElement = document.getElementById('systemTime');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            timeElement.textContent = timeString;
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

    initializeDisplays() {
        // Initialize system mode
        const systemMode = document.getElementById('systemMode');
        if (systemMode) systemMode.textContent = 'STANDBY';
        
        // Initialize all displays
        this.resetDisplays();
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
                frequency = 220;
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
            case 'save':
                frequency = 1100;
                duration = 0.15;
                volume = 0.08;
                break;
            case 'emergency':
                frequency = 1760;
                duration = 0.5;
                volume = 0.2;
                break;
            case 'toggle_on':
                frequency = 550;
                duration = 0.1;
                volume = 0.08;
                break;
            case 'toggle_off':
                frequency = 275;
                duration = 0.1;
                volume = 0.08;
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
        if (!this.isPoweredOn) return;

        switch (event.key) {
            case 'F1':
                event.preventDefault();
                this.showHelp();
                break;
            case 'F2':
                event.preventDefault();
                this.saveData();
                break;
            case 'F3':
                event.preventDefault();
                this.loadData();
                break;
            case 'Escape':
                event.preventDefault();
                this.emergencyStop();
                break;
            case ' ':
                event.preventDefault();
                this.recordHeartbeat();
                break;
        }
    }

    showHelp() {
        this.showAlert('SYSTEM HELP', 'SPACE: HEARTBEAT | F1: HELP | F2: SAVE | F3: LOAD | ESC: EMERGENCY');
    }

    loadData() {
        this.updateAIOutput('NO SAVED DATA FOUND_');
        this.playSound('toggle_off');
    }

    // Alert System
    showAlert(title, message) {
        const modal = document.getElementById('alertModal');
        const alertText = document.getElementById('alertText');
        
        if (modal && alertText) {
            alertText.textContent = message;
            modal.classList.remove('hidden');
        }
    }

    hideAlert() {
        const modal = document.getElementById('alertModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

// Global Functions
function closeAlert() {
    if (window.terminal) {
        window.terminal.hideAlert();
    }
}

function acknowledgeAlert() {
    if (window.terminal) {
        window.terminal.hideAlert();
        window.terminal.playSound('toggle_on');
    }
}

// Initialize Terminal
document.addEventListener('DOMContentLoaded', () => {
    console.log('=================================');
    console.log('RETRO MEDICAL TERMINAL v2.1');
    console.log('PIXEL EDITION - INITIALIZING...');
    console.log('=================================');
    
    const terminal = new RetroMedicalTerminal();
    window.terminal = terminal;
    
    console.log('SYSTEM READY');
    console.log('POWER ON TO BEGIN MONITORING');
    console.log('=================================');
});

// Global Utility Functions
window.simulateHeartRate = (bpm) => {
    if (window.terminal && window.terminal.isPoweredOn) {
        const interval = 60000 / bpm;
        let count = 0;
        const maxBeats = 10;
        
        const beatInterval = setInterval(() => {
            window.terminal.recordHeartbeat();
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

window.getTerminalStatus = () => {
    if (window.terminal) {
        const terminal = window.terminal;
        console.log('=== TERMINAL STATUS ===');
        console.log(`POWER: ${terminal.isPoweredOn ? 'ON' : 'OFF'}`);
        console.log(`BPM: ${terminal.currentBPM}`);
        console.log(`BREATH: ${terminal.breathQuality}%`);
        console.log(`MONITORING: ${terminal.isMonitoring ? 'ACTIVE' : 'INACTIVE'}`);
        console.log(`MICROPHONE: ${terminal.microphoneEnabled ? 'ON' : 'OFF'}`);
        console.log(`HEARTBEATS: ${terminal.heartbeats.length}`);
        console.log(`AI CONFIDENCE: ${terminal.aiConfidence}%`);
        console.log('=====================');
    }
}; 