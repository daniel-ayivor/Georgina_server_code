const express = require('express');
const router = express.Router();

const {
     createBooks,
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} = require('../Controllers/cleaningController');


router.post('/api/cleaning-bookings', createBooks); // Create a new cleaning booking from user input
router.post('/api/cleaning-bookings/create', createBooking); // Create a new cleaning booking with additional details by admin or staff
router.get('/api/cleaning-bookings', getBookings); // Get all cleaning bookings     
router.get('/api/cleaning-bookings/:id', getBookingById); // Get a single cleaning booking by ID
router.put('/api/cleaning-bookings/:id', updateBooking); // Update a cleaning booking by ID
router.delete('/api/cleaning-bookings/:id', deleteBooking); // Delete a cleaning booking by ID



module.exports = router;
// This code defines the routes for managing cleaning bookings in an Express application.