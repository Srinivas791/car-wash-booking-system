/**
 * AquaSpark Booking Engine
 * Indian Vehicle Categories, Packages, Add-ons & Dynamic Pricing
 */

const VEHICLE_PRICING = {
  hatchback: { name: 'Hatchback', icon: '🚗', multiplier: 1.0, models: 'Swift, i20, Tiago, Baleno, Alto' },
  sedan: { name: 'Sedan', icon: '🚘', multiplier: 1.25, models: 'City, Verna, Dzire, Slavia, Virtus' },
  suv: { name: 'Compact / Full SUV', icon: '🚙', multiplier: 1.5, models: 'Creta, Brezza, Thar, Fortuner, XUV700' },
  luxury: { name: 'Luxury / Supercar', icon: '🏎️', multiplier: 2.0, models: 'BMW, Mercedes, Audi, Porsche, Jaguar' }
};

const WASH_PACKAGES = {
  express: {
    id: 'express',
    name: 'Hydro Express Clean',
    basePrice: 399,
    duration: '35 mins',
    features: [
      'High-Pressure Water Rinse',
      'pH-Neutral Snow Foam Wash',
      'Tire & Rim Dressing',
      'Streak-free Glass Clean'
    ]
  },
  deep: {
    id: 'deep',
    name: 'Deep Foam & Interior Spa',
    basePrice: 699,
    duration: '65 mins',
    popular: true,
    features: [
      'Everything in Hydro Express',
      'Deep Cabin Vacuuming & Mat Wash',
      'Dashboard & Trim Conditioning',
      'Underbody High-Pressure Wash',
      'AC Vent Deodorization'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Ceramic & Engine Spa',
    basePrice: 1299,
    duration: '95 mins',
    features: [
      'Everything in Deep Interior Spa',
      'Engine Bay Degreasing & Dressing',
      'Ceramic Wax Sealant Spray (30 Days)',
      'Leather Seat Cleaning & Nourish',
      'Alloy De-ironizing & Caliper Polish'
    ]
  },
  diamond: {
    id: 'diamond',
    name: 'Ultra Diamond 9H Coating & Detail',
    basePrice: 2499,
    duration: '150 mins',
    features: [
      'Complete Showroom Level Spa',
      'Clay Bar Surface Decontamination',
      'Machine Glaze Swirl Removal',
      '9H Nano-Ceramic Protective Shield',
      'Windshield Rain-X Water Repellent'
    ]
  }
};

const ADDONS = {
  rain_repellent: { id: 'rain_repellent', name: 'Windshield Hydrophobic Shield', price: 199, icon: '🌧️' },
  underbody_rust: { id: 'underbody_rust', name: 'Underbody Anti-Rust Treatment', price: 399, icon: '🛡️' },
  ac_sanitization: { id: 'ac_sanitization', name: 'AC Vent Deep Steam Sanitization', price: 249, icon: '❄️' },
  engine_dressing: { id: 'engine_dressing', name: 'Engine Bay Polish & Degrease', price: 299, icon: '⚙️' }
};

class BookingEngine {
  constructor() {
    this.selectedVehicle = 'sedan';
    this.selectedPackage = 'deep';
    this.selectedAddons = new Set();
    this.serviceMode = 'doorstep'; // 'doorstep' or 'station'
    this.selectedDate = '';
    this.selectedSlot = '10:00 AM - 11:30 AM';
    this.selectedCity = 'Hyderabad';

    this.init();
  }

  init() {
    this.setDefaultDate();
    this.bindEvents();
    this.updateSummaryUI();
  }

  setDefaultDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1); // tomorrow by default
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.selectedDate = `${yyyy}-${mm}-${dd}`;

    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      dateInput.value = this.selectedDate;
      dateInput.min = `${today.getFullYear()}-${mm}-${String(today.getDate()).padStart(2, '0')}`;
    }
  }

  bindEvents() {
    // 1. Vehicle category selection
    document.querySelectorAll('.vehicle-option-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const vType = card.dataset.vehicle;
        this.setVehicle(vType);
        if (window.soundSystem) window.soundSystem.playClick();
      });
    });

    // 2. Package selection
    document.querySelectorAll('.package-card').forEach(card => {
      card.addEventListener('click', () => {
        const pkgId = card.dataset.package;
        this.setPackage(pkgId);
        if (window.soundSystem) window.soundSystem.playClick();
      });
    });

    // 3. Add-on toggles
    document.querySelectorAll('.addon-checkbox-card').forEach(card => {
      card.addEventListener('click', () => {
        const addonId = card.dataset.addon;
        this.toggleAddon(addonId);
        if (window.soundSystem) window.soundSystem.playClick();
      });
    });

    // 4. Service mode toggle (Doorstep vs Studio)
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.serviceMode = btn.dataset.mode;
        this.updateSummaryUI();
        if (window.soundSystem) window.soundSystem.playClick();
      });
    });

    // 5. Date & slot changes
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.updateSummaryUI();
      });
    }

    const slotSelect = document.getElementById('booking-slot');
    if (slotSelect) {
      slotSelect.addEventListener('change', (e) => {
        this.selectedSlot = e.target.value;
        this.updateSummaryUI();
      });
    }

    const citySelect = document.getElementById('booking-city');
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        this.selectedCity = e.target.value;
        this.updateSummaryUI();
      });
    }
  }

  setVehicle(type) {
    if (!VEHICLE_PRICING[type]) return;
    this.selectedVehicle = type;

    // Update active classes on cards
    document.querySelectorAll('.vehicle-option-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.vehicle === type);
    });

    // Sync with 3D studio
    if (window.carStudio) {
      window.carStudio.buildCar(type);
    }

    // Sync 3D top buttons
    document.querySelectorAll('.car-type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === type);
    });

    this.updateSummaryUI();
  }

  setPackage(pkgId) {
    if (!WASH_PACKAGES[pkgId]) return;
    this.selectedPackage = pkgId;

    document.querySelectorAll('.package-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.package === pkgId);
    });

    this.updateSummaryUI();
  }

  toggleAddon(addonId) {
    if (this.selectedAddons.has(addonId)) {
      this.selectedAddons.delete(addonId);
    } else {
      this.selectedAddons.add(addonId);
    }

    document.querySelectorAll('.addon-checkbox-card').forEach(c => {
      if (c.dataset.addon === addonId) {
        c.classList.toggle('selected', this.selectedAddons.has(addonId));
      }
    });

    this.updateSummaryUI();
  }

  calculatePricing() {
    const vInfo = VEHICLE_PRICING[this.selectedVehicle];
    const pInfo = WASH_PACKAGES[this.selectedPackage];

    // Base package price multiplied by vehicle class
    const packagePrice = Math.round(pInfo.basePrice * vInfo.multiplier);

    // Sum of addons
    let addonsTotal = 0;
    this.selectedAddons.forEach(addonId => {
      if (ADDONS[addonId]) {
        addonsTotal += ADDONS[addonId].price;
      }
    });

    // Doorstep travel fee is ₹0 (Free promotion across Indian metros)
    const travelFee = 0;

    const grandTotal = packagePrice + addonsTotal + travelFee;

    return {
      packagePrice,
      addonsTotal,
      travelFee,
      grandTotal,
      vInfo,
      pInfo
    };
  }

  updateSummaryUI() {
    const pricing = this.calculatePricing();

    // Summary Card Preview
    const previewVehicleName = document.getElementById('summary-vehicle-name');
    if (previewVehicleName) {
      previewVehicleName.textContent = pricing.vInfo.name;
    }

    const previewModels = document.getElementById('summary-vehicle-models');
    if (previewModels) {
      previewModels.textContent = `(${pricing.vInfo.models})`;
    }

    const previewPkgName = document.getElementById('summary-package-name');
    if (previewPkgName) {
      previewPkgName.textContent = pricing.pInfo.name;
    }

    const previewPkgPrice = document.getElementById('summary-package-price');
    if (previewPkgPrice) {
      previewPkgPrice.textContent = `₹${pricing.packagePrice.toLocaleString('en-IN')}`;
    }

    const previewAddonsPrice = document.getElementById('summary-addons-price');
    if (previewAddonsPrice) {
      previewAddonsPrice.textContent = `₹${pricing.addonsTotal.toLocaleString('en-IN')}`;
    }

    const previewMode = document.getElementById('summary-service-mode');
    if (previewMode) {
      previewMode.textContent = this.serviceMode === 'doorstep' ? 'Doorstep Van Service (FREE)' : 'Studio Express Bay';
    }

    const previewTotal = document.getElementById('summary-grand-total');
    if (previewTotal) {
      previewTotal.textContent = `₹${pricing.grandTotal.toLocaleString('en-IN')}`;
    }
  }

  getBookingPayload() {
    const pricing = this.calculatePricing();
    const nameInput = document.getElementById('user-fullname');
    const phoneInput = document.getElementById('user-phone');
    const addressInput = document.getElementById('user-address');
    const paymentModeSelect = document.getElementById('payment-mode');

    const customerName = nameInput ? nameInput.value.trim() : 'Customer';
    const customerPhone = phoneInput ? phoneInput.value.trim() : '9346898662';
    const customerAddress = addressInput ? addressInput.value.trim() : 'Doorstep Location';
    const paymentMode = paymentModeSelect ? paymentModeSelect.value : 'UPI';

    const addonNames = Array.from(this.selectedAddons).map(id => ADDONS[id]?.name || id);

    return {
      bookingId: 'IND-CW-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      customerName: customerName || 'Valued Indian Car Owner',
      customerPhone: customerPhone || '9346898662',
      customerAddress: customerAddress,
      city: this.selectedCity,
      vehicleType: pricing.vInfo.name,
      washPackage: pricing.pInfo.name,
      addons: addonNames,
      serviceMode: this.serviceMode === 'doorstep' ? 'Doorstep Mobile Wash Van' : 'At-Studio Car Spa',
      date: this.selectedDate,
      timeSlot: this.selectedSlot,
      totalAmount: pricing.grandTotal,
      paymentMode: paymentMode,
      // Target recipients per requirement
      targetEmail: 'annavarapusrinivas791@gmail.com',
      targetMobile: '9346898662'
    };
  }
}

// Global booking engine instance
window.bookingEngine = new BookingEngine();
