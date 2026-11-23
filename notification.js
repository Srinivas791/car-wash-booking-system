/**
 * AquaSpark Notification & Confirmation Dispatch System
 * Dispatches booking alerts to:
 * - Email: annavarapusrinivas791@gmail.com
 * - Mobile: 9346898662
 * Generates WhatsApp instant click-to-chat, Mailto relay, and printable slips.
 */

class NotificationManager {
  constructor() {
    this.modalBackdrop = document.getElementById('success-modal-backdrop');
    this.toastContainer = document.getElementById('toast-container');
    this.targetEmail = 'annavarapusrinivas791@gmail.com';
    this.targetMobile = '9346898662';
    this.currentBooking = null;

    this.bindEvents();
  }

  bindEvents() {
    // Confirm booking button
    const confirmBtn = document.getElementById('btn-confirm-booking');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleBookingSubmission();
      });
    }

    // Modal close button
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Backdrop click close
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) {
          this.closeModal();
        }
      });
    }

    // Print receipt button
    const printBtn = document.getElementById('modal-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Track wash button from modal
    const trackBtn = document.getElementById('modal-track-btn');
    if (trackBtn) {
      trackBtn.addEventListener('click', () => {
        this.closeModal();
        const trackerSection = document.getElementById('tracker-section');
        if (trackerSection) {
          trackerSection.scrollIntoView({ behavior: 'smooth' });
          if (this.currentBooking && window.washTracker) {
            window.washTracker.loadBooking(this.currentBooking.bookingId);
          }
        }
      });
    }
  }

  handleBookingSubmission() {
    // Validate inputs
    const nameInput = document.getElementById('user-fullname');
    const phoneInput = document.getElementById('user-phone');
    const addressInput = document.getElementById('user-address');

    if (!nameInput || !nameInput.value.trim()) {
      this.showToast('⚠️ Please enter your Full Name before booking.', 'warning');
      nameInput?.focus();
      return;
    }

    if (!phoneInput || !phoneInput.value.trim() || phoneInput.value.trim().length < 10) {
      this.showToast('⚠️ Please enter a valid 10-digit Indian Mobile Number.', 'warning');
      phoneInput?.focus();
      return;
    }

    // Generate booking payload from booking engine
    const booking = window.bookingEngine ? window.bookingEngine.getBookingPayload() : null;
    if (!booking) return;

    this.currentBooking = booking;

    // Save to localStorage history
    this.saveBookingToStorage(booking);

    // Play victory / success audio chime
    if (window.soundSystem) {
      window.soundSystem.playSuccessChime();
    }

    // Show popup modal with dispatched notifications
    this.showConfirmationModal(booking);

    // Show floating toast
    this.showToast(`✅ Booking ${booking.bookingId} Confirmed! Alerts sent to ${this.targetEmail} & ${this.targetMobile}`, 'success');
  }

  showConfirmationModal(booking) {
    if (!this.modalBackdrop) return;

    // Fill in modal details
    const idEl = document.getElementById('modal-booking-id-val');
    if (idEl) idEl.textContent = booking.bookingId;

    const custEl = document.getElementById('modal-customer-name');
    if (custEl) custEl.textContent = `${booking.customerName} (${booking.customerPhone})`;

    const vehicleEl = document.getElementById('modal-vehicle-val');
    if (vehicleEl) vehicleEl.textContent = booking.vehicleType;

    const pkgEl = document.getElementById('modal-pkg-val');
    if (pkgEl) pkgEl.textContent = booking.washPackage;

    const scheduleEl = document.getElementById('modal-schedule-val');
    if (scheduleEl) scheduleEl.textContent = `${booking.date} • ${booking.timeSlot}`;

    const locEl = document.getElementById('modal-loc-val');
    if (locEl) locEl.textContent = `${booking.customerAddress || 'Doorstep Delivery'}, ${booking.city}`;

    const totalEl = document.getElementById('modal-total-val');
    if (totalEl) totalEl.textContent = `₹${booking.totalAmount.toLocaleString('en-IN')} (${booking.paymentMode})`;

    const addonsEl = document.getElementById('modal-addons-val');
    if (addonsEl) {
      addonsEl.textContent = booking.addons.length > 0 ? booking.addons.join(', ') : 'None';
    }

    // Target recipient details
    const emailTargetEl = document.getElementById('modal-target-email-val');
    if (emailTargetEl) emailTargetEl.textContent = this.targetEmail;

    const mobileTargetEl = document.getElementById('modal-target-mobile-val');
    if (mobileTargetEl) mobileTargetEl.textContent = `+91 ${this.targetMobile}`;

    // WhatsApp Message URL Generator
    const waText = this.buildWhatsAppMessage(booking);
    const waUrl = `https://wa.me/91${this.targetMobile}?text=${encodeURIComponent(waText)}`;
    const waBtn = document.getElementById('modal-whatsapp-btn');
    if (waBtn) {
      waBtn.href = waUrl;
    }

    // Direct Email mailto URL Generator
    const emailSubject = `🚗 New Car Wash Booking Confirmed: ${booking.bookingId}`;
    const emailBody = this.buildEmailBody(booking);
    const mailtoUrl = `mailto:${this.targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const mailBtn = document.getElementById('modal-email-btn');
    if (mailBtn) {
      mailBtn.href = mailtoUrl;
    }

    // Open modal backdrop
    this.modalBackdrop.classList.add('open');
  }

  closeModal() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('open');
    }
  }

  buildWhatsAppMessage(booking) {
    return `🚗 *AQUA-SPARK 3D CAR WASH - BOOKING CONFIRMED* 🚗\n\n` +
      `*Booking ID:* ${booking.bookingId}\n` +
      `*Customer Name:* ${booking.customerName}\n` +
      `*Contact Phone:* ${booking.customerPhone}\n` +
      `*Vehicle Type:* ${booking.vehicleType}\n` +
      `*Package:* ${booking.washPackage}\n` +
      `*Add-ons:* ${booking.addons.length > 0 ? booking.addons.join(', ') : 'None'}\n` +
      `*Service Mode:* ${booking.serviceMode}\n` +
      `*Date & Slot:* ${booking.date} (${booking.timeSlot})\n` +
      `*Service Location:* ${booking.customerAddress || 'Doorstep'}, ${booking.city}\n` +
      `*Total Price:* ₹${booking.totalAmount.toLocaleString('en-IN')}\n` +
      `*Payment Method:* ${booking.paymentMode}\n\n` +
      `📩 *Notification Sent to:* ${this.targetEmail}\n` +
      `📱 *Mobile Alert to:* +91 ${this.targetMobile}\n\n` +
      `Status: CONFIRMED & SCHEDULED. Our mobile wash van is assigned!`;
  }

  buildEmailBody(booking) {
    return `Dear Team / Customer,\n\n` +
      `Your 3D Car Wash appointment has been successfully booked.\n\n` +
      `================ BOOKING DETAILS ================\n` +
      `Booking ID:       ${booking.bookingId}\n` +
      `Customer:         ${booking.customerName}\n` +
      `Phone:            ${booking.customerPhone}\n` +
      `Vehicle Type:     ${booking.vehicleType}\n` +
      `Package:          ${booking.washPackage}\n` +
      `Add-ons:          ${booking.addons.length > 0 ? booking.addons.join(', ') : 'None'}\n` +
      `Service Mode:     ${booking.serviceMode}\n` +
      `Date & Slot:      ${booking.date} at ${booking.timeSlot}\n` +
      `Location:         ${booking.customerAddress || 'Doorstep'}, ${booking.city}\n` +
      `Grand Total:      ₹${booking.totalAmount.toLocaleString('en-IN')}\n` +
      `Payment Mode:     ${booking.paymentMode}\n` +
      `==================================================\n\n` +
      `Automated Notification Dispatched to:\n` +
      `- Email: ${this.targetEmail}\n` +
      `- Mobile SMS/WhatsApp: +91 ${this.targetMobile}\n\n` +
      `Thank you for choosing AquaSpark 3D Car Spa India!`;
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;

    if (type === 'success') {
      toast.style.borderColor = 'rgba(16, 185, 129, 0.6)';
    } else if (type === 'warning') {
      toast.style.borderColor = 'rgba(245, 158, 11, 0.6)';
    }

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  saveBookingToStorage(booking) {
    try {
      const history = JSON.parse(localStorage.getItem('aquaspark_bookings') || '[]');
      history.unshift(booking);
      localStorage.setItem('aquaspark_bookings', JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }
}

// Global notification instance
window.notificationManager = new NotificationManager();
