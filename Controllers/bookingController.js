// Initiate payment for booking (new flow)
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const User = require('../Models/userModel');
const Booking = require('../Models/booking');

// Initiate payment for booking
const initiateBookingPayment = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceType,
      selectedFeatures,
      address,
      date,
      time,
      duration,
      price,
      specialInstructions,
      userId,
      countryCode
    } = req.body;

    // Validate required fields
    if (!userId || !price || !customerEmail) {
      return res.status(400).json({ success: false, message: 'Missing required fields for payment.' });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Determine currency
    let currency = 'usd';
    if (countryCode === 'GB') currency = 'gbp';
    else if (countryCode === 'GH') currency = 'ghs';
    else if (countryCode === 'NG') currency = 'ngn';

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(price) * 100),
      currency,
      metadata: {
        userId: userId.toString(),
        customerName,
        serviceType,
        date,
        time
      },
      receipt_email: customerEmail,
      description: `Service booking: ${serviceType}`
    });

    // Create a pending booking record with paymentIntentId
    const featuresArray = Array.isArray(selectedFeatures) ? selectedFeatures : [];
    const pendingBooking = await Booking.create({
      customerName,
      customerEmail,
      customerPhone,
      serviceType,
      selectedFeatures: featuresArray,
      address,
      date,
      time,
      duration,
      price,
      specialInstructions,
      userId,
      status: 'pending',
      paymentIntentId: paymentIntent.id
    });

    // Return client secret and booking reference to frontend
    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      bookingReference: pendingBooking.bookingReference
    });
  } catch (error) {
    console.error('Error initiating booking payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate payment', error: error.message });
  }
};

// Customer creates booking


const createBooking = async (req, res) => {
  try {
    const { 
      customerName,
      customerEmail,
      customerPhone,
      serviceType,
      selectedFeatures,
      address,
      date,
      time,
      duration,
      price,
      specialInstructions,
      userId
    } = req.body;

    console.log('🔍 [BACKEND-DEBUG] Creating booking with data:', {
      customerName,
      customerEmail, 
      serviceType,
      userId
    });

    console.log('🔍 [BACKEND-DEBUG] Full request body:', req.body);

    // Validate that userId is provided
    if (!userId) {
      console.error('❌ [BACKEND-DEBUG] userId is missing in request');
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [{ field: "userId", message: "Booking.userId cannot be null" }]
      });
    }

    // Convert userId to number to be safe
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId)) {
      console.error('❌ [BACKEND-DEBUG] userId is not a valid number:', userId);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [{ field: "userId", message: "Booking.userId must be a valid number" }]
      });
    }

    // Check if user exists - ONLY if User model is available
    let userExists = true;
    try {
      const user = await User.findByPk(numericUserId);
      if (!user) {
        console.error('❌ [BACKEND-DEBUG] User not found with ID:', numericUserId);
        userExists = false;
      } else {
        console.log('✅ [BACKEND-DEBUG] User found:', user.id, user.email);
      }
    } catch (userError) {
      console.warn('⚠️ [BACKEND-DEBUG] Could not verify user existence:', userError.message);
      // Continue without user verification if User model isn't available
      userExists = true; // Assume user exists to proceed
    }

    // Validate that selectedFeatures is an array
    const featuresArray = Array.isArray(selectedFeatures) ? selectedFeatures : [];

    const booking = await Booking.create({
      customerName,
      customerEmail,
      customerPhone,
      serviceType: serviceType,
      selectedFeatures: featuresArray,
      address,
      date,
      time,
      duration: duration,
      price: price,
      specialInstructions,
      userId: numericUserId
    });

    console.log('✅ [BACKEND-DEBUG] Booking created successfully:', booking.bookingReference);
    console.log('✅ [BACKEND-DEBUG] Booking userId:', booking.userId);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        serviceType: booking.serviceType,
        selectedFeatures: booking.selectedFeatures,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        specialInstructions: booking.specialInstructions,
        status: booking.status,
        userId: booking.userId
      }
    });

  } catch (error) {
    console.error('❌ [BACKEND-DEBUG] Error creating booking:', error);
    
    if (error.name === 'SequelizeValidationError') {
      console.error('❌ [BACKEND-DEBUG] Validation errors:', error.errors);
      
      const serviceError = error.errors.find(err => err.path === 'serviceType');
      if (serviceError) {
        return res.status(400).json({
          success: false,
          message: "Invalid service type. We offer: Office Cleaning, Kitchen Cleaning, Bathroom Cleaning, Dusting Service, Mopping Service, Vacuuming Service"
        });
      }
      
      const userIdError = error.errors.find(err => err.path === 'userId');
      if (userIdError) {
        return res.status(400).json({
          success: false,
          message: "User ID validation failed",
          errors: [{ field: "userId", message: userIdError.message }]
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Booking reference already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating booking',
      error: error.message
    });
  }
};

// Get all bookings (Admin only)
const getBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      serviceType,
      date,
      search 
    } = req.query;

    const where = {};
    
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    if (date) where.date = date;
    
    if (search) {
      where[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { customerEmail: { [Op.like]: `%${search}%` } },
        { bookingReference: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      total: count,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
  }
};

// Restore missing controller functions
const getBookingById = async (req, res) => {
  // Example implementation
  res.json({ message: 'getBookingById not yet implemented' });
};

const getBookingsByEmail = async (req, res) => {
  res.json({ message: 'getBookingsByEmail not yet implemented' });
};

const updateBooking = async (req, res) => {
  res.json({ message: 'updateBooking not yet implemented' });
};

const cancelBooking = async (req, res) => {
  res.json({ message: 'cancelBooking not yet implemented' });
};

const deleteBooking = async (req, res) => {
  res.json({ message: 'deleteBooking not yet implemented' });
};

const getAvailableTimeSlots = async (req, res) => {
  res.json({ message: 'getAvailableTimeSlots not yet implemented' });
};

const getUserDashboardBookings = async (req, res) => {
  res.json({ message: 'getUserDashboardBookings not yet implemented' });
};

const getDashboardUpcomingBookings = async (req, res) => {
  res.json({ message: 'getDashboardUpcomingBookings not yet implemented' });
};

const getRecentBookings = async (req, res) => {
  res.json({ message: 'getRecentBookings not yet implemented' });
};

const getMyBookingById = async (req, res) => {
  res.json({ message: 'getMyBookingById not yet implemented' });
};

const testEmailSystem = async (req, res) => {
  res.json({ message: 'testEmailSystem not yet implemented' });
};

module.exports = {
  initiateBookingPayment,
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
};