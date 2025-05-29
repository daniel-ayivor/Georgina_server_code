// controllers/bookingController.js
const { Booking } = require('../Models/cleaningModel');
const createBooking = async (req, res) => {
  try {
    const { serviceId, date, time, address, notes } = req.body;

    if (!serviceId || !date || !time || !address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const booking = await Booking.create({ serviceId, date, time, address, notes });
    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBooks = async (req, res) => {
  try {
    const { serviceIds, date, time, address, notes } = req.body;

    if (!Array.isArray(serviceIds) || serviceIds.length === 0 || !date || !time || !address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create booking
    const booking = await Booking.create({ date, time, address, notes });

    // Associate services
    await booking.addCleaningServices(serviceIds); // Sequelize auto-method

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.status(200).json({ bookings, message: 'Bookings retrieved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};  

// Get Single Booking
const getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ booking, message: 'Booking retrieved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update Booking       
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { serviceId, date, time, address, notes } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.serviceId = serviceId || booking.serviceId;
    booking.date = date || booking.date;
    booking.time = time || booking.time;
    booking.address = address || booking.address;
    booking.notes = notes || booking.notes;

    await booking.save();
    res.status(200).json({ message: 'Booking updated successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Booking
const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.destroy();
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};  
module.exports = {
    createBooks,
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};