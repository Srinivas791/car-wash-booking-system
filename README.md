# 🚗 AquaSpark 3D - Car Wash Booking System (India)

A modern, interactive 3D Car Wash & Doorstep Detailing Booking Web Application tailored for Indian car owners, built with **HTML5, CSS3, Three.js, WebGL, and the Web Audio API**.

---

## 🌟 Key Features

### 1. Interactive 3D Vehicle Wash Studio (Three.js)
- **3D Vehicle Geometry**: Procedural realistic 3D models with chassis, cabin, tinted glass, LED headlights, chrome front grille, wheels with disc brake calipers, side mirrors, and Indian license plate (`IND`).
- **Vehicle Body Types**:
  - 🚗 **Hatchback** (Swift, i20, Tiago, Baleno)
  - 🚘 **Sedan** (Honda City, Verna, Dzire, Slavia)
  - 🚙 **SUV / CUV** (Creta, Thar, Brezza, Fortuner, XUV700)
  - 🏎️ **Luxury / Exotic** (BMW, Audi, Mercedes, Porsche)
- **Multi-Stage 3D Wash Simulation**:
  - 🚿 **Stage 1: Water Jet** - Animated high-pressure water stream particles + washdown audio.
  - 🧼 **Stage 2: Snow Foam Bath** - 3D foam coating on car body + soap bubble particles.
  - 🧽 **Stage 3: Microfiber Scrub** - Dual spinning 3D brush cylinders sweeping across the vehicle.
  - 💨 **Stage 4: Hot Air Dryer** - Turbo blower mist particles evaporating water droplets.
  - ✨ **Stage 5: Ceramic Gloss** - High-specular mirror reflection finish + golden sparkle star particles.
  - 🚀 **Full Auto-Wash Cycle** - 1-click sequence running all 5 stages from 100% dirty to showroom shine!
- **Interactive Road Dirt Slider**: Real-time transition from muddy Indian monsoon road grime to 0% spotless shine.
- **Paint Color Customizer**: Switch between Royal Blue, Pearl Arctic White, Magma Grey, Phoenix Red, Midnight Obsidian Black, and Sunset Gold.
- **Camera Presets**: Isometric, Front, Side Profile, Wheel Close-up, and Top-down.
- **Orbit Controls & Fallback Touch/Mouse Drag**: Rotate 360°, pan, and zoom smoothly.

---

### 2. Procedural Sound System (Web Audio API)
- Zero external MP3 downloads required! Sound effects are synthesized on the fly:
  - 🌊 High-pressure water jet noise
  - 🫧 Soap foam bubble pops
  - 💨 Turbo air blower resonance
  - ✨ Ascending ceramic sparkle chimes
  - 🔔 Victory booking confirmation chord
  - 🔇 Sound Mute/Unmute toggle

---

### 3. Indian Pricing & Service Options
- **Currency**: Indian Rupee (`₹ INR`)
- **Detailing Packages**:
  - **Hydro Express Clean**: ₹399 base (35 mins)
  - **Deep Foam & Interior Spa**: ₹699 base (65 mins - *Most Popular*)
  - **Pro Ceramic & Engine Spa**: ₹1,299 base (95 mins)
  - **Ultra Diamond 9H Detailing**: ₹2,499 base (150 mins)
- **Specialized Add-ons**:
  - 🌧️ Windshield Rain-X Water Repellent (+₹199)
  - 🛡️ Underbody Anti-Rust Treatment (+₹399)
  - ❄️ AC Vent Steam Sanitization (+₹249)
  - ⚙️ Engine Bay Degreasing & Dressing (+₹299)
- **Service Modes**:
  - 🚐 **Doorstep Mobile Wash Van**: Equipped with water tank & generator, arrives at home/office.
  - 🏢 **Detailing Studio Visit**: Drive-in express bay.
- **Major Indian Cities**: Hyderabad, Bengaluru, Mumbai, Delhi NCR, Chennai, Pune, Kolkata, Ahmedabad, Visakhapatnam, Vijayawada, Jaipur, Chandigarh.
- **Indian Payment Modes**: UPI (Google Pay, PhonePe, Paytm, BHIM), Cash on Delivery (COD), RuPay/Cards, Net Banking.

---

### 4. 📢 Notification & Confirmation Pop-up Dispatch System
When the user clicks **CONFIRM 3D CAR WASH**, the system:
1. Opens an **animated Confirmation Modal** displaying:
   - Unique Indian Booking ID (e.g. `IND-CW-2026-849102`)
   - **Dispatched Notification Banner**:
     - 📧 **Sent to Email**: `annavarapusrinivas791@gmail.com`
     - 📱 **Mobile Alert Sent To**: `+91 9346898662`
   - Itemized order breakdown with customer details, scheduled date, time slot, and total in ₹.
2. **Instant Action Buttons**:
   - 🟢 **Open Direct WhatsApp Message to 9346898662**: Opens WhatsApp with pre-filled formatted invoice.
   - 📧 **Send Email to annavarapusrinivas791@gmail.com**: Direct `mailto` link pre-filled with the booking confirmation slip.
   - 🖨️ **Print Invoice Slip**: Formats and triggers the browser print dialog.
   - 📍 **Track Live Status**: Jumps directly to the Live Van Tracker.
3. Fires a floating **Toast Notification**:
   `✅ Booking Confirmed! Alerts sent to annavarapusrinivas791@gmail.com & 9346898662`
4. Plays synthesized **audio confirmation chime**.
5. Persists the booking to `localStorage` for live tracking.

---

## 🚀 How to Run the Website

### Option 1: Direct Browser Launch
Simply double-click `index.html` or right-click and choose **Open with Google Chrome** / **Microsoft Edge** / **Firefox**.

### Option 2: Local HTTP Server (Optional)
If you have Python or Node or any static server installed:
```bash
# Using Python
python -m http.server 8080

# Using Node (npx)
npx serve
```
Then navigate to `http://localhost:8080` in your browser.

---

## 📁 File Structure

```
car washing system/
├── index.html            # Main 3D Car Wash Application Page
├── README.md             # Documentation & Guide
├── css/
│   └── styles.css        # Luxury glassmorphism dark theme & responsive UI
└── js/
    ├── sound.js          # Web Audio API sound synthesizer
    ├── car3d.js          # Three.js 3D vehicle & wash stages engine
    ├── booking.js        # Indian vehicle categories, packages & pricing engine
    ├── notification.js   # Popup modal, WhatsApp & Email dispatch triggers
    └── tracker.js        # Live mobile van progress tracker
```
