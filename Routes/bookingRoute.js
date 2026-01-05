// routes/bookingRoute.js
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  getBookingsByEmail,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getAvailableTimeSlots,
  getUserDashboardBookings,
  getDashboardUpcomingBookings,
  getRecentBookings,
  getMyBookingById,
  testEmailSystem,
  stripeWebhook // Import the stripeWebhook controller
} = require('../Controllers/bookingController');
router.post('/test-email-system', testEmailSystem);

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================
// Initiate payment for booking (new flow)
const { initiateBookingPayment } = require('../Controllers/bookingController');
router.post('/api/bookings/initiate-payment', initiateBookingPayment);
router.post('/api/bookings/payment-intent', initiateBookingPayment); // Alternative endpoint for frontend

// Legacy direct booking creation (should be deprecated)
router.post('/api/bookings', createBooking);
router.get('/api/bookings/available-slots/:date', getAvailableTimeSlots);

// =============================================
// USER DASHBOARD ROUTES (Must come BEFORE /api/bookings/:id)
// =============================================
router.get('/api/user/bookings', getUserDashboardBookings);
router.get('/api/user/bookings/upcoming', getDashboardUpcomingBookings);
router.get('/api/user/bookings/recent', getRecentBookings);
router.get('/api/user/bookings/:id', getMyBookingById);
router.patch('/api/user/bookings/:id/cancel', cancelBooking);

// =============================================
// MIXED ACCESS ROUTES 
// =============================================
router.get('/api/bookings/:id', getBookingById); // Public access to booking by ID
router.get('/api/bookings/email/:email', getBookingsByEmail); // Public access by email

// =============================================
// ADMIN ONLY ROUTES 
// =============================================
router.get('/api/admin/bookings', getBookings);
router.put('/api/admin/bookings/:id', updateBooking);
router.delete('/api/admin/bookings/:id', deleteBooking);

// Stripe webhook route for payment confirmation
router.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;