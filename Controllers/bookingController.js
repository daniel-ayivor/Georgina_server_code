const Booking = require("../Models/booking"); // Bookings model
const Service = require("../Models/cleaningServiceModel"); // Services model
// Customer creates booking (customer details come from frontend localStorage)
const createBooking = async (req, res) => {
  try {
    const {
      customerName,      // From frontend localStorage
      customerEmail,     // From frontend localStorage  
      customerPhone,     // From frontend localStorage
      serviceType,       // Selected service (from frontend)
      address,           // Customer input (delivery address)
      date,              // Customer input (preferred service date)
      time,              // Customer input (preferred service time)
      specialInstructions // Customer input
    } = req.body;

    console.log('Creating booking with customer details from localStorage:', {
      customerName, customerEmail, customerPhone, serviceType, address, date, time
    });

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !serviceType || !address || !date || !time) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Get service details to get price and duration
    const service = await Service.findOne({ 
      where: { name: serviceType, status: 'active' } 
    });

    if (!service) {
      return res.status(400).json({ 
        message: 'Selected service is not available' 
      });
    }

    // Create booking with all details
    const booking = await Booking.create({
      customerName,
      customerEmail, 
      customerPhone,
      serviceType,
      address,
      date, // Customer's preferred service date
      time, // Customer's preferred service time
      duration: service.duration,
      price: service.price,
      specialInstructions: specialInstructions || null,
      status: 'pending'
      // createdAt and updatedAt are automatically set by Sequelize
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        serviceType: booking.serviceType,
        serviceDate: booking.date,
        serviceTime: booking.time,
        duration: booking.duration,
        price: booking.price,
        status: booking.status,
        address: booking.address,
        bookingCreatedAt: booking.createdAt, // Dynamic timestamp
        specialInstructions: booking.specialInstructions
      }
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      message: 'Server error while creating booking'
    });
  }
};

// Get all bookings (Admin only)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      bookings,
      message: 'Bookings retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({
      message: 'Server error while fetching bookings'
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      booking,
      message: 'Booking retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({
      message: 'Server error while fetching booking'
    });
  }
};

// Update booking status (Admin only)
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.update({
      status: status || booking.status,
      notes: notes !== undefined ? notes : booking.notes
    });

    res.status(200).json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({
      message: 'Server error while updating booking'
    });
  }
};

// Delete booking (Admin only)
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
    console.error('Error deleting booking:', err);
    res.status(500).json({
      message: 'Server error while deleting booking'
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};