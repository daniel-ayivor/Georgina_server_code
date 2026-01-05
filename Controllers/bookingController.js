// Initiate payment for booking (new flow)
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const User = require('../Models/userModel');
const Booking = require('../Models/booking');
const { Op } = require('sequelize');

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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: serviceType,
              description: specialInstructions || '',
            },
            unit_amount: Math.round(Number(price) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SUCCESS_URL || 'http://localhost:3000'}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CANCEL_URL || 'http://localhost:3000'}/booking-cancelled`,
      metadata: {
        userId: userId.toString(),
        customerName,
        serviceType,
        date,
        time
      },
      customer_email: customerEmail,
    });

    // Create a pending booking record with session ID
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
      paymentStatus: 'pending',
      paymentIntentId: session.id, // Store session ID for webhook lookup
      paidAmount: 0
    });

    // Return session ID and booking reference to frontend
    return res.json({
      sessionId: session.id,
      bookingReference: pendingBooking.bookingReference,
      url: session.url // For redirecting to Stripe Checkout
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
      userId,
      sessionId, // Stripe session ID for payment verification
      requirePayment = true // Flag to require payment (default true)
    } = req.body;

    console.log('🔍 [BACKEND-DEBUG] Creating booking with data:', {
      customerName,
      customerEmail, 
      serviceType,
      userId,
      requirePayment
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

    // Check if payment is required and verify payment status
    if (requirePayment) {
      if (!sessionId) {
        console.error('❌ [BACKEND-DEBUG] Payment session ID is missing');
        return res.status(400).json({
          success: false,
          message: "Payment verification required. Please complete payment first."
        });
      }

      // Check if booking with this session already exists and is paid
      const existingBooking = await Booking.findOne({ 
        where: { paymentIntentId: sessionId } 
      });

      if (existingBooking && existingBooking.paymentStatus === 'completed') {
        console.log('✅ [BACKEND-DEBUG] Booking already exists with completed payment');
        return res.status(200).json({
          success: true,
          message: 'Booking already confirmed',
          data: {
            bookingReference: existingBooking.bookingReference,
            customerName: existingBooking.customerName,
            serviceType: existingBooking.serviceType,
            date: existingBooking.date,
            time: existingBooking.time,
            status: existingBooking.status,
            paymentStatus: existingBooking.paymentStatus
          }
        });
      }

      if (existingBooking && existingBooking.paymentStatus !== 'completed') {
        console.error('❌ [BACKEND-DEBUG] Payment not completed for session:', sessionId);
        return res.status(402).json({
          success: false,
          message: "Payment not completed. Please complete payment to confirm booking.",
          paymentStatus: existingBooking.paymentStatus
        });
      }

      // Verify payment with Stripe
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid') {
          console.error('❌ [BACKEND-DEBUG] Stripe payment not confirmed:', session.payment_status);
          return res.status(402).json({
            success: false,
            message: "Payment not confirmed. Please complete payment first.",
            paymentStatus: session.payment_status
          });
        }
        console.log('✅ [BACKEND-DEBUG] Payment verified with Stripe');
      } catch (stripeError) {
        console.error('❌ [BACKEND-DEBUG] Error verifying payment with Stripe:', stripeError.message);
        return res.status(400).json({
          success: false,
          message: "Failed to verify payment. Please try again."
        });
      }
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
      userId: numericUserId,
      paymentStatus: requirePayment && sessionId ? 'completed' : 'pending',
      paymentIntentId: sessionId || null,
      paidAmount: requirePayment && sessionId ? price : 0,
      status: requirePayment && sessionId ? 'confirmed' : 'pending'
    });

    console.log('✅ [BACKEND-DEBUG] Booking created successfully:', booking.bookingReference);
    console.log('✅ [BACKEND-DEBUG] Booking userId:', booking.userId);

    res.status(201).json({
      success: true,
      message: requirePayment ? 'Booking confirmed with payment' : 'Booking created successfully',
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
        paymentStatus: booking.paymentStatus,
        paidAmount: booking.paidAmount,
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

// Stripe webhook for payment confirmation
const stripeWebhook = async (req, res) => {
  let event;
  try {
    // Stripe recommends verifying the signature in production
    event = req.body;
    if (req.headers['stripe-signature'] && process.env.STRIPE_WEBHOOK_SECRET) {
      const sig = req.headers['stripe-signature'];
      event = require('stripe')(process.env.STRIPE_SECRET).webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;
    
    try {
      // Find and update booking
      const booking = await Booking.findOne({ where: { paymentIntentId: sessionId } });
      if (booking) {
        booking.status = 'confirmed';
        booking.paymentStatus = 'completed';
        booking.paidAmount = session.amount_total / 100; // Convert from cents
        await booking.save();
        console.log(`✅ Booking ${booking.bookingReference} confirmed after payment.`);
        console.log(`💰 Payment amount: ${booking.paidAmount}`);
      } else {
        console.warn(`⚠️ No booking found for session: ${sessionId}`);
      }
    } catch (err) {
      console.error('❌ Error confirming booking after payment:', err.message);
    }
  }

  // Handle payment_intent.succeeded event (backup)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    
    try {
      // Find and update booking by payment intent
      const booking = await Booking.findOne({ where: { paymentIntentId } });
      if (booking && booking.paymentStatus !== 'completed') {
        booking.status = 'confirmed';
        booking.paymentStatus = 'completed';
        booking.paidAmount = paymentIntent.amount / 100; // Convert from cents
        await booking.save();
        console.log(`✅ Booking ${booking.bookingReference} confirmed via payment_intent.`);
      }
    } catch (err) {
      console.error('❌ Error confirming booking after payment_intent:', err.message);
    }
  }

  // Handle payment failures
  if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
    const sessionId = event.data.object.id;
    
    try {
      const booking = await Booking.findOne({ where: { paymentIntentId: sessionId } });
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
        console.log(`❌ Booking ${booking.bookingReference} payment failed.`);
      }
    } catch (err) {
      console.error('❌ Error updating failed payment:', err.message);
    }
  }

  res.status(200).json({ received: true });
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
  testEmailSystem,
  stripeWebhook
};