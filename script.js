// Manual Patient Monitor - Enhanced Version
// Medical device simulator with realistic monitoring and alerts

class PatientMonitor {
    constructor() {
        // System state
        this.isPoweredOn = false;
        this.isMonitoring = false;
        this.isDarkTheme = true;
        
        // Patient vitals
        this.currentBPM = 0;
        this.breathQuality = 0;
        this.patientMood = 'Neutral';
        this.isPatientAlive = true;
        
        // Monitoring timers and intervals
        this.bpmDecayInterval = null;
        this.inactivityTimer = null;
        this.monitoringBeepInterval = null;
        this.lastInputTime = 0;
        
        // Audio context for hospital sounds
        this.audioContext = null;
        this.isAudioEnabled = false;
        
        // Microphone setup
        this.mediaStream = null;
        this.audioAnalyser = null;
        this.microphoneActive = false;
        
        this.initialize();
    }

    initialize() {
        this.setupAudio();
        this.setupEventListeners();
        this.updateDateTime();
        this.updateUI();
        
        // Update date/time every minute
        setInterval(() => this.updateDateTime(), 60000);
        
        console.log('Manual Patient Monitor initialized');
    }

    setupAudio() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isAudioEnabled = true;
        } catch (error) {
            console.warn('Audio context not supported:', error);
            this.isAudioEnabled = false;
        }
    }

    setupEventListeners() {
        // Power button
        const powerBtn = document.querySelector('.power-btn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => this.togglePower());
        }

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Navigation menu
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Graph container for heartbeat simulation
        const graphContainer = document.querySelector('.graph-container');
        if (graphContainer) {
            graphContainer.addEventListener('click', () => this.simulateHeartbeat());
        }

        // Graph control buttons
        const startBtn = document.querySelector('.control-btn:first-child');
        const resetBtn = document.querySelector('.control-btn:last-child');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleMonitoring());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSystem());
        }

        // Vital cards
        const vitalCards = document.querySelectorAll('.vital-card');
        vitalCards.forEach(card => {
            card.addEventListener('click', () => this.handleVitalCardClick(card));
        });
    }

    // Power System
    togglePower() {
        this.isPoweredOn = !this.isPoweredOn;
        
        const powerBtn = document.querySelector('.power-btn');
        const statusIndicator = document.querySelector('.status-indicator span');
        
        if (this.isPoweredOn) {
            powerBtn.classList.add('active');
            statusIndicator.textContent = 'System ON';
            this.startMonitoring();
            this.playSound('power_on');
        } else {
            powerBtn.classList.remove('active');
            statusIndicator.textContent = 'System OFF';
            this.stopMonitoring();
            this.hideAlert();
            this.playSound('power_off');
        }
        
        this.updateUI();
        console.log(`Power ${this.isPoweredOn ? 'ON' : 'OFF'}`);
    }

    // Theme System
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('light-theme', !this.isDarkTheme);
        console.log(`Theme: ${this.isDarkTheme ? 'Dark' : 'Light'}`);
    }

    // Monitoring System
    startMonitoring() {
        if (!this.isPoweredOn) return;
        
        this.isMonitoring = true;
        this.isPatientAlive = true;
        this.lastInputTime = Date.now();
        
        // Start BPM decay monitoring
        this.bpmDecayInterval = setInterval(() => {
            this.updateBPMDecay();
        }, 1000);
        
        // Start inactivity monitoring
        this.checkInactivity();
        
        // Start monitoring beeps
        this.startMonitoringBeeps();
        
        // Try to initialize microphone
        this.initializeMicrophone();
        
        this.updateDiagnosis('Monitoring Active', 'Patient monitoring in progress', 'Click graph or use microphone for input');
        console.log('Monitoring started');
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        // Clear all intervals
        if (this.bpmDecayInterval) {
            clearInterval(this.bpmDecayInterval);
            this.bpmDecayInterval = null;
        }
        
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        if (this.monitoringBeepInterval) {
            clearInterval(this.monitoringBeepInterval);
            this.monitoringBeepInterval = null;
        }
        
        // Stop microphone
        this.stopMicrophone();
        
        // Reset values
        this.currentBPM = 0;
        this.breathQuality = 0;
        this.patientMood = 'Neutral';
        
        this.updateVitalDisplays();
        this.updateDiagnosis('System Ready', 'Power ON to begin monitoring', 'All systems ready');
        console.log('Monitoring stopped');
    }

    // BPM Logic with Gradual Decay
    updateBPMDecay() {
        if (!this.isMonitoring || !this.isPoweredOn) return;
        
        const timeSinceLastInput = Date.now() - this.lastInputTime;
        
        // If no input for more than 2 seconds, start BPM decay
        if (timeSinceLastInput > 2000 && this.currentBPM > 0) {
            this.currentBPM = Math.max(0, this.currentBPM - 1);
            this.updateVitalDisplays();
            
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
        this.patientMood = 'Critical';
        
        this.showAlert();
        this.playSound('alarm');
        this.updateVitalDisplays();
        this.updateDiagnosis('PATIENT CRITICAL', 'No vital signs detected', 'Emergency response required');
        
        console.log('PATIENT CRITICAL - No input detected');
    }

    // Input Simulation
    simulateHeartbeat() {
        if (!this.isPoweredOn || !this.isMonitoring) return;
        
        this.lastInputTime = Date.now();
        this.isPatientAlive = true;
        
        // Generate realistic BPM (60-100 normal range)
        const bpmIncrease = Math.floor(Math.random() * 15) + 5; // 5-20 increase
        this.currentBPM = Math.min(120, Math.max(60, this.currentBPM + bpmIncrease));
        
        this.hideAlert();
        this.updateVitalDisplays();
        this.animateECG();
        this.playSound('heartbeat');
        
        console.log(`Heartbeat simulated - BPM: ${this.currentBPM}`);
    }

    // Microphone System
    async initializeMicrophone() {
        if (!this.isPoweredOn || !this.isMonitoring) return;
        
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            this.audioAnalyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.audioAnalyser);
            
            this.audioAnalyser.fftSize = 256;
            this.microphoneActive = true;
            
            this.startMicrophoneMonitoring();
            console.log('Microphone initialized');
            
        } catch (error) {
            console.warn('Microphone access denied:', error);
            this.microphoneActive = false;
        }
    }

    startMicrophoneMonitoring() {
        if (!this.microphoneActive || !this.audioAnalyser) return;
        
        const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        
        const checkAudio = () => {
            if (!this.microphoneActive || !this.isPoweredOn || !this.isMonitoring) return;
            
            this.audioAnalyser.getByteFrequencyData(dataArray);
            
            // Calculate audio level
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            
            // If significant audio detected (breathing/speech)
            if (average > 30) {
                this.lastInputTime = Date.now();
                this.isPatientAlive = true;
                this.breathQuality = Math.min(100, Math.floor(average * 2));
                this.hideAlert();
                this.updateVitalDisplays();
            }
            
            requestAnimationFrame(checkAudio);
        };
        
        checkAudio();
    }

    stopMicrophone() {
        this.microphoneActive = false;
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        this.breathQuality = 0;
        console.log('Microphone stopped');
    }

    // Sound System
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
            case 'monitoring_beep':
                frequency = 880;
                duration = 0.05;
                volume = 0.05;
                break;
            case 'alarm':
                frequency = 1000;
                duration = 0.5;
                volume = 0.2;
                break;
            case 'power_on':
                frequency = 440;
                duration = 0.2;
                volume = 0.1;
                break;
            case 'power_off':
                frequency = 220;
                duration = 0.3;
                volume = 0.1;
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

    startMonitoringBeeps() {
        if (!this.isPoweredOn || !this.isMonitoring) return;
        
        this.monitoringBeepInterval = setInterval(() => {
            if (this.isPoweredOn && this.isMonitoring && this.isPatientAlive) {
                this.playSound('monitoring_beep');
            }
        }, 3000); // Beep every 3 seconds
    }

    // UI Updates
    updateVitalDisplays() {
        // Update BPM
        const bpmValue = document.querySelector('.bpm-card .value');
        const bpmStatus = document.querySelector('.bpm-card .vital-status');
        
        if (bpmValue && bpmStatus) {
            bpmValue.textContent = this.currentBPM > 0 ? this.currentBPM : '--';
            
            if (this.currentBPM === 0) {
                bpmStatus.textContent = 'No signal';
            } else if (this.currentBPM > 100) {
                bpmStatus.textContent = 'Elevated';
            } else if (this.currentBPM > 80) {
                bpmStatus.textContent = 'Normal+';
            } else {
                bpmStatus.textContent = 'Normal';
            }
        }
        
        // Update Breath Quality
        const breathValue = document.querySelector('.breath-card .value');
        const breathStatus = document.querySelector('.breath-card .vital-status');
        
        if (breathValue && breathStatus) {
            breathValue.textContent = this.breathQuality > 0 ? this.breathQuality : '--';
            
            if (this.breathQuality === 0) {
                breathStatus.textContent = 'No input detected';
            } else if (this.breathQuality > 80) {
                breathStatus.textContent = 'Good';
            } else if (this.breathQuality > 50) {
                breathStatus.textContent = 'Fair';
            } else {
                breathStatus.textContent = 'Weak';
            }
        }
        
        // Update Patient Mood
        this.updatePatientMood();
    }

    updatePatientMood() {
        const moodValue = document.querySelector('.mood-card .value');
        const moodStatus = document.querySelector('.mood-card .vital-status');
        const moodIcon = document.querySelector('.mood-card .card-icon');
        
        if (!moodValue || !moodStatus || !moodIcon) return;
        
        if (!this.isPatientAlive) {
            this.patientMood = 'Critical';
            moodIcon.textContent = '💀';
        } else if (this.currentBPM > 100) {
            this.patientMood = 'Stressed';
            moodIcon.textContent = '😰';
        } else if (this.currentBPM > 80) {
            this.patientMood = 'Alert';
            moodIcon.textContent = '😊';
        } else if (this.currentBPM > 60) {
            this.patientMood = 'Calm';
            moodIcon.textContent = '😌';
        } else if (this.currentBPM > 0) {
            this.patientMood = 'Resting';
            moodIcon.textContent = '😴';
        } else {
            this.patientMood = 'Unknown';
            moodIcon.textContent = '😐';
        }
        
        moodValue.textContent = this.patientMood;
        moodStatus.textContent = 'Based on vitals';
    }

    updateDiagnosis(status, detail1, detail2) {
        const diagnosisText = document.querySelector('.diagnosis-status p');
        const analysisDetails = document.querySelectorAll('.analysis-details p');
        
        if (diagnosisText) {
            diagnosisText.textContent = `Diagnosis: ${status}`;
        }
        
        if (analysisDetails.length >= 2) {
            analysisDetails[0].textContent = detail1;
            analysisDetails[1].textContent = detail2;
        }
    }

    showAlert() {
        const alertSection = document.querySelector('.alert-section');
        if (alertSection) {
            alertSection.classList.remove('hidden');
        }
    }

    hideAlert() {
        const alertSection = document.querySelector('.alert-section');
        if (alertSection) {
            alertSection.classList.add('hidden');
        }
    }

    animateECG() {
        const ecgLine = document.querySelector('.ecg-line');
        if (ecgLine) {
            ecgLine.style.animation = 'none';
            ecgLine.offsetHeight; // Trigger reflow
            ecgLine.style.animation = 'ecg-pulse 0.5s ease-in-out';
        }
    }

    updateUI() {
        const startBtn = document.querySelector('.control-btn:first-child');
        const graphMessage = document.querySelector('.graph-message');
        
        if (!this.isPoweredOn) {
            if (startBtn) startBtn.textContent = 'Start';
            if (graphMessage) graphMessage.textContent = 'Power ON to begin monitoring';
            this.updateDiagnosis('System Ready', 'Power ON to begin monitoring', 'All systems ready');
        } else if (this.isMonitoring) {
            if (startBtn) startBtn.textContent = 'Stop';
            if (graphMessage) graphMessage.textContent = 'Click to generate heartbeat';
        }
        
        this.updateVitalDisplays();
    }

    updateDateTime() {
        const dateElement = document.querySelector('.date');
        if (dateElement) {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    // Event Handlers
    handleNavigation(e) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const section = e.currentTarget.getAttribute('data-tooltip');
        console.log(`Navigation: ${section}`);
    }

    toggleMonitoring() {
        if (!this.isPoweredOn) {
            console.log('Power must be ON to start monitoring');
            return;
        }
        
        if (this.isMonitoring) {
            this.stopMonitoring();
        } else {
            this.startMonitoring();
        }
        
        this.updateUI();
    }

    resetSystem() {
        console.log('System reset');
        this.stopMonitoring();
        this.hideAlert();
        this.currentBPM = 0;
        this.breathQuality = 0;
        this.patientMood = 'Neutral';
        this.isPatientAlive = true;
        this.updateUI();
        this.playSound('power_on');
    }

    handleVitalCardClick(card) {
        card.style.transform = 'translateY(-4px) scale(1.02)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
        
        const cardType = card.className.split(' ')[1].replace('-card', '');
        console.log(`${cardType} card clicked`);
    }
}

// Initialize the monitor
document.addEventListener('DOMContentLoaded', () => {
    console.log('Manual Patient Monitor starting...');
    
    const monitor = new PatientMonitor();
    window.patientMonitor = monitor;
    
    console.log('Manual Patient Monitor ready!');
    console.log('Controls:');
    console.log('- Power button: Toggle system ON/OFF');
    console.log('- Theme button: Switch dark/light mode');
    console.log('- Click graph: Simulate heartbeat');
    console.log('- Enable microphone: Breath detection');
});

// Global utility functions
window.emergencyReset = () => {
    if (window.patientMonitor) {
        window.patientMonitor.resetSystem();
        console.log('Emergency reset performed');
    }
};

window.simulatePatientData = () => {
    if (window.patientMonitor && window.patientMonitor.isPoweredOn) {
        window.patientMonitor.simulateHeartbeat();
        console.log('Patient data simulated');
    } else {
        console.log('System must be powered ON');
    }
}; 