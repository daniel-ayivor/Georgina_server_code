const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/bookingController');

// Public routes
router.post('/api/bookings', bookingController.createBooking);
router.get('/api/bookings/:id', bookingController.getBookingById);

// Admin routes (you can add authentication later)
router.get('/api/admin/bookings', bookingController.getBookings);
router.put('/api/admin/bookings/:id', bookingController.updateBooking);
router.delete('/api/admin/bookings/:id', bookingController.deleteBooking);

module.exports = router;