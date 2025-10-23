// controllers/bookingController.js
const { Booking } = require('../Models/Booking'); // Adjust path as needed

// Create Single Booking
const createBooking = async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      serviceType, 
      address, 
      date, 
      time, 
      duration, 
      price, 
      notes 
    } = req.body;

    console.log('Creating booking with data:', req.body);

    // Validate required fields based on your model
    if (!customerName || !customerEmail || !customerPhone || !serviceType || !address || !date || !time || !duration || !price) {
      return res.status(400).json({ 
        message: 'Missing required fields: customerName, customerEmail, customerPhone, serviceType, address, date, time, duration, price are required' 
      });
    }

    // Validate service type
    const validServiceTypes = ['basic', 'deep', 'office', 'post-construction'];
    if (!validServiceTypes.includes(serviceType)) {
      return res.status(400).json({ 
        message: 'Invalid service type. Must be one of: basic, deep, office, post-construction' 
      });
    }

    // Validate date
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    // Create booking
    const booking = await Booking.create({ 
      customerName,
      customerEmail,
      customerPhone,
      serviceType,
      address,
      date: bookingDate,
      time,
      duration: parseInt(duration),
      price: parseFloat(price),
      notes: notes || null,
      status: 'pending' // Default status
    });

    console.log('Booking created successfully:', booking.id);

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        serviceType: booking.serviceType,
        address: booking.address,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        price: booking.price,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt
      }
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    
    // Handle specific Sequelize errors
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => ({
        field: error.path,
        message: error.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Booking already exists' 
      });
    }

    res.status(500).json({ 
      message: 'Server error while creating booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Create Multiple Services Booking (Simplified version)
const createBooks = async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      serviceType, 
      address, 
      date, 
      time, 
      duration, 
      price, 
      notes 
    } = req.body;

    console.log('Creating booking (multi-service):', req.body);

    // Use the same validation as createBooking
    if (!customerName || !customerEmail || !customerPhone || !serviceType || !address || !date || !time || !duration || !price) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const booking = await Booking.create({ 
      customerName,
      customerEmail,
      customerPhone,
      serviceType,
      address,
      date: bookingDate,
      time,
      duration: parseInt(duration),
      price: parseFloat(price),
      notes: notes || null,
      status: 'pending'
    });

    console.log('Multi-service booking created successfully:', booking.id);

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking 
    });
  } catch (err) {
    console.error('Error creating multi-service booking:', err);
    
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => ({
        field: error.path,
        message: error.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Server error while creating booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get All Bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ 
      bookings, 
      message: 'Bookings retrieved successfully',
      count: bookings.length
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ 
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
    
    res.status(200).json({ 
      booking, 
      message: 'Booking retrieved successfully' 
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ 
      message: 'Server error while fetching booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update Booking
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { 
    customerName, 
    customerEmail, 
    customerPhone, 
    serviceType, 
    address, 
    date, 
    time, 
    duration, 
    price, 
    status, 
    notes 
  } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate service type if provided
    if (serviceType) {
      const validServiceTypes = ['basic', 'deep', 'office', 'post-construction'];
      if (!validServiceTypes.includes(serviceType)) {
        return res.status(400).json({ 
          message: 'Invalid service type' 
        });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status' 
        });
      }
    }

    // Update fields
    const updateData = {};
    if (customerName) updateData.customerName = customerName;
    if (customerEmail) updateData.customerEmail = customerEmail;
    if (customerPhone) updateData.customerPhone = customerPhone;
    if (serviceType) updateData.serviceType = serviceType;
    if (address) updateData.address = address;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (duration) updateData.duration = parseInt(duration);
    if (price) updateData.price = parseFloat(price);
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await booking.update(updateData);

    res.status(200).json({ 
      message: 'Booking updated successfully', 
      booking 
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => ({
        field: error.path,
        message: error.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Server error while updating booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
    console.error('Error deleting booking:', err);
    res.status(500).json({ 
      message: 'Server error while deleting booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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