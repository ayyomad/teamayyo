# Click2Care  
*Soul-touching patient monitor*

---

## Basic Details  

**Team Name:** ayyo  

**Team Members:**  
- Team Lead: Sreemadhav – Christ College of Engineering Irinjalakuda  
- Member 2: Vishnu MV – Christ College of Engineering Irinjalakuda  

---

## Project Description  

A playful, session-based medical simulation where users manually interact with a virtual patient to assess heart and breath rates.

---

## The Problem (that doesn't exist)  

Modern medical diagnostics are overly reliant on sensors and AI, leading to a lack of personal interaction and human touch in patient care.

---

## The Solution (that nobody asked for)  

Introducing a manual, click-based ECG simulation paired with a microphone-based breath analyzer, forcing users to engage directly with the system and providing a satirical commentary on the over-complication of simple tasks.

---

## Technical Details  

### Technologies/Components Used  

**For Software:**  
- Languages Used: JavaScript, HTML, CSS  
- Frameworks Used: None  
- Libraries Used: None  
- Tools Used: Claude, ChatGPT  

**For Hardware:** None  

---

## Implementation  

The project is kept simple with single HTML, CSS, and JS files. We experimented with different UI styles before settling on a retro CRT monitor vibe.

## Program Flow

1. **Power On**  
   Press the Power On button to start a new session.  
   Each session includes both the Heart Pulse Test and the Breath Test, followed by score calculation and results display.

2. **Read Alert & Continue**  
   Alerts are shown after each test. Press **Acknowledge** or **Continue** to proceed.

3. **Heart Pulse / ECG Test (15 seconds)**  
   Place one hand on a pulse or heartbeat source (e.g., chest, wrist).  
   Use your other hand to click the mouse in sync with the pulse for 15 seconds to track it.

4. **Breath Test (10 seconds)**  
   Allow microphone access when prompted.  
   Breathe normally into the mic for 10 seconds while the system records breath volume and quality.

5. **Results Display**  
   After both tests, your results are shown:  
   - Heart Test outcome  
   - Breath Test outcome  
   - Estimated “Days Left to Live” (based on your performance)

6. **Death Certificate (Optional)**  
   Click the **Print Death Certificate** button.  
   Upload a photo to generate a personalized, fully “official” PDF.

7. **View Results Later**  
   Past results for the current session can be viewed in the **Patient Dashboard** by clicking the **Sidebar Results** button.

---

## Screenshots  

![Breath Test](images/demo(1).jpg)  
![Heart Test](images/demo(2).jpg)  
![Data Display](images/demo(3).jpg)  
![Alert Message](images/demo(4).jpg)  
