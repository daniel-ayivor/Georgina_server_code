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
  testEmailSystem
} = require('../Controllers/bookingController');
router.post('/test-email-system', testEmailSystem);

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================
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

module.exports = router;