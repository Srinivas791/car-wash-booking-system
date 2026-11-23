/**
 * AquaSpark Live Wash Tracker
 * Allows users to track wash progress in real-time
 */

class WashTracker {
  constructor() {
    this.trackInput = document.getElementById('tracker-booking-id');
    this.trackBtn = document.getElementById('btn-track-booking');
    this.trackerResult = document.getElementById('tracker-result-area');
    this.progressBar = document.getElementById('tracker-progress-fill');

    this.bindEvents();
  }

  bindEvents() {
    if (this.trackBtn && this.trackInput) {
      this.trackBtn.addEventListener('click', () => {
        const id = this.trackInput.value.trim();
        if (id) {
          this.loadBooking(id);
        } else {
          if (window.notificationManager) {
            window.notificationManager.showToast('Please enter a valid Booking ID', 'warning');
          }
        }
      });
    }
  }

  loadBooking(bookingId) {
    if (this.trackInput) {
      this.trackInput.value = bookingId;
    }

    // Try finding in localStorage
    let bookingData = null;
    try {
      const history = JSON.parse(localStorage.getItem('aquaspark_bookings') || '[]');
      bookingData = history.find(b => b.bookingId.toLowerCase() === bookingId.toLowerCase());
    } catch (e) {}

    // Fallback default mock data if test ID entered
    if (!bookingData) {
      bookingData = {
        bookingId: bookingId,
        customerName: 'Srinivas A.',
        vehicleType: 'Sedan',
        washPackage: 'Deep Foam & Interior Spa',
        totalAmount: 874,
        date: 'Today',
        timeSlot: '02:00 PM - 03:30 PM',
        city: 'Hyderabad',
        targetEmail: 'annavarapusrinivas791@gmail.com',
        targetMobile: '9346898662'
      };
    }

    this.renderTrackerState(bookingData);
  }

  renderTrackerState(booking) {
    if (!this.trackerResult) return;

    // Simulate timeline stage based on creation or mock: step 2 (Van Assigned)
    const step2El = document.getElementById('step-assigned');
    const step3El = document.getElementById('step-washing');

    if (this.progressBar) {
      this.progressBar.style.width = '66%';
    }

    if (step2El) step2El.classList.add('completed');
    if (step3El) step3El.classList.add('active');

    this.trackerResult.innerHTML = `
      <div style="background: rgba(0, 210, 255, 0.08); border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 12px; padding: 1.25rem; margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem;">
          <h4 style="color: #fff; font-size: 1.05rem;">📍 Live Status: <span style="color: #00d2ff;">Van En Route to Doorstep</span></h4>
          <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 3px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 700;">● Active Schedule</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.84rem; color: #94a3b8;">
          <div><strong>Booking ID:</strong> <span style="color: #fff;">${booking.bookingId}</span></div>
          <div><strong>Vehicle:</strong> <span style="color: #fff;">${booking.vehicleType}</span></div>
          <div><strong>Technician:</strong> <span style="color: #fff;">Ramesh Kumar (Van #TS-09-CW-4081)</span></div>
          <div><strong>Dispatched to:</strong> <span style="color: #38bdf8;">${booking.targetEmail || 'annavarapusrinivas791@gmail.com'}</span></div>
          <div><strong>SMS/WhatsApp:</strong> <span style="color: #38bdf8;">+91 ${booking.targetMobile || '9346898662'}</span></div>
          <div><strong>Estimated Arrival:</strong> <span style="color: #10b981; font-weight: 700;">Within 25 Minutes</span></div>
        </div>
      </div>
    `;
  }
}

window.washTracker = new WashTracker();
