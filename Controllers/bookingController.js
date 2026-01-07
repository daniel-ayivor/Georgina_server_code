// Initiate payment for booking (new flow)
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const User = require('../Models/userModel');
const Booking = require('../Models/booking');
const { Op } = require('sequelize');

// Initiate payment for booking
const initiateBookingPayment = async (req, res) => {
  try {
    const {
      userId,
      countryCode,
      amount,
      currency,
      services,
      customerInfo,
      appointment
    } = req.body;

    // Validate required fields - check nested structure
    if (!userId || !amount || !customerInfo?.customerEmail) {
      console.log('❌ Validation failed:', { 
        hasUserId: !!userId, 
        hasAmount: !!amount, 
        hasCustomerInfo: !!customerInfo,
        hasEmail: !!customerInfo?.customerEmail 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields for payment.' 
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId.toString(),
        customerName: customerInfo.customerName || user.name,
        customerEmail: customerInfo.customerEmail,
        customerPhone: customerInfo.customerPhone || '',
        address: customerInfo.address || '',
        appointmentDate: appointment?.date || '',
        appointmentTime: appointment?.time || '',
        services: JSON.stringify(services?.map(s => s.serviceName) || []),
        specialInstructions: customerInfo.specialInstructions || '',
        type: 'booking'
      },
      receipt_email: customerInfo.customerEmail || user.email,
    });

    // Create a pending booking record with payment intent ID
    const serviceType = services?.[0]?.serviceName || 'Cleaning Service';
    const selectedFeatures = services?.map(s => s.serviceName) || [];
    
    const pendingBooking = await Booking.create({
      customerName: customerInfo.customerName || user.name,
      customerEmail: customerInfo.customerEmail,
      customerPhone: customerInfo.customerPhone || '',
      serviceType: serviceType,
      selectedFeatures: selectedFeatures,
      address: customerInfo.address || '',
      date: appointment?.date || new Date().toISOString().split('T')[0],
      time: appointment?.time || '09:00',
      duration: appointment?.duration || 2,
      price: amount / 100, // Convert from cents to currency units
      specialInstructions: customerInfo.specialInstructions || '',
      userId,
      status: 'pending',
      paymentStatus: 'pending',
      paymentIntentId: paymentIntent.id,
      paidAmount: 0
    });

    console.log('✅ Payment intent created:', paymentIntent.id);
    console.log('✅ Pending booking created:', pendingBooking.bookingReference);

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      bookingReference: pendingBooking.bookingReference
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent', 
      error: error.message 
    });
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
      paymentStatus, 
      serviceType,
      date,
      search 
    } = req.query;

    const where = {};
    
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
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
      limit: parseInt(limit),
      attributes: [
        'id',
        'userId',
        'customerName',
        'customerEmail',
        'customerPhone',
        'serviceType',
        'selectedFeatures',
        'address',
        'date',
        'time',
        'duration',
        'price',
        'status',
        'paymentStatus',
        'paymentIntentId',
        'paidAmount',
        'bookingReference',
        'notes',
        'specialInstructions',
        'createdAt',
        'updatedAt'
      ]
    });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
  }
};

// Restore missing controller functions
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findByPk(id, {
      attributes: [
        'id',
        'userId',
        'customerName',
        'customerEmail',
        'customerPhone',
        'serviceType',
        'selectedFeatures',
        'address',
        'date',
        'time',
        'duration',
        'price',
        'status',
        'paymentStatus',
        'paymentIntentId',
        'paidAmount',
        'bookingReference',
        'notes',
        'specialInstructions',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking', 
      error: error.message 
    });
  }
};

const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const where = { customerEmail: email };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
      attributes: [
        'id',
        'customerName',
        'customerEmail',
        'customerPhone',
        'serviceType',
        'selectedFeatures',
        'address',
        'date',
        'time',
        'duration',
        'price',
        'status',
        'paymentStatus',
        'paidAmount',
        'bookingReference',
        'specialInstructions',
        'createdAt',
        'updatedAt'
      ]
    });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings by email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings', 
      error: error.message 
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Prevent updating completed or cancelled bookings
    if (booking.status === 'completed' && updateData.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a completed booking'
      });
    }

    // Update only allowed fields
    const allowedFields = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'serviceType',
      'selectedFeatures',
      'address',
      'date',
      'time',
      'duration',
      'price',
      'status',
      'paymentStatus',
      'notes',
      'specialInstructions'
    ];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        booking[key] = updateData[key];
      }
    });

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error updating booking', 
      error: error.message 
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    if (reason) {
      booking.notes = booking.notes 
        ? `${booking.notes}\n[CANCELLATION] ${reason}` 
        : `[CANCELLATION] ${reason}`;
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        customerName: booking.customerName,
        serviceType: booking.serviceType,
        date: booking.date,
        time: booking.time
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Prevent deletion of completed bookings (for record keeping)
    if (booking.status === 'completed' || booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a completed or paid booking. Consider cancelling instead.'
      });
    }

    const bookingReference = booking.bookingReference;
    await booking.destroy();

    res.json({
      success: true,
      message: 'Booking deleted successfully',
      bookingReference
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting booking', 
      error: error.message 
    });
  }
};

const getAvailableTimeSlots = async (req, res) => {
  try {
// AFTER (Correct):
const { date } = req.params;
const { duration = 2 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Define business hours (8 AM to 6 PM)
    const businessStartHour = 8;
    const businessEndHour = 18;
    
    // Generate all possible time slots
    const allTimeSlots = [];
    for (let hour = businessStartHour; hour < businessEndHour; hour++) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Get all bookings for the specified date
    const existingBookings = await Booking.findAll({
      where: {
        date,
        status: {
          [Op.in]: ['pending', 'confirmed', 'in-progress']
        }
      },
      attributes: ['time', 'duration']
    });

    // Helper function to check if a time slot conflicts with existing bookings
    const isSlotAvailable = (slotTime) => {
      const [slotHour, slotMinute] = slotTime.split(':').map(Number);
      const slotStartMinutes = slotHour * 60 + slotMinute;
      const slotEndMinutes = slotStartMinutes + parseInt(duration) * 60;

      for (const booking of existingBookings) {
        const [bookingHour, bookingMinute] = booking.time.split(':').map(Number);
        const bookingStartMinutes = bookingHour * 60 + bookingMinute;
        const bookingEndMinutes = bookingStartMinutes + booking.duration * 60;

        // Check if there's any overlap
        if (
          (slotStartMinutes >= bookingStartMinutes && slotStartMinutes < bookingEndMinutes) ||
          (slotEndMinutes > bookingStartMinutes && slotEndMinutes <= bookingEndMinutes) ||
          (slotStartMinutes <= bookingStartMinutes && slotEndMinutes >= bookingEndMinutes)
        ) {
          return false;
        }
      }
      return true;
    };

    // Filter out unavailable slots and slots that extend past business hours
    const availableSlots = allTimeSlots.filter(slot => {
      const [hour, minute] = slot.split(':').map(Number);
      const slotEndHour = hour + Math.floor((minute + parseInt(duration) * 60) / 60);
      
      // Check if slot extends past business hours
      if (slotEndHour > businessEndHour) {
        return false;
      }
      
      return isSlotAvailable(slot);
    });

    res.json({
      success: true,
      date,
      duration: parseInt(duration),
      availableSlots,
      totalSlots: availableSlots.length,
      bookedSlots: existingBookings.length
    });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available time slots',
      error: error.message
    });
  }
};


const getUserDashboardBookings = async (req, res) => {
  try {
    // ✅ FIXED: Check query params AND params AND auth user
    const userId = req.query.id || req.query.userId || req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const { 
      page = 1, 
      limit = 10, 
      status,
      paymentStatus,
      email // Also accept email for additional filtering
    } = req.query;

    const where = { userId };
    
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    // Optionally filter by email as well for security
    if (email) where.customerEmail = email;

    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
      attributes: [
        'id',
        'customerName',
        'customerEmail',
        'customerPhone',
        'serviceType',
        'selectedFeatures',
        'address',
        'date',
        'time',
        'duration',
        'price',
        'status',
        'paymentStatus',
        'paidAmount',
        'bookingReference',
        'specialInstructions',
        'createdAt',
        'updatedAt'
      ]
    });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      bookings
    });
  } catch (error) {
    console.error('Error fetching user dashboard bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user bookings', 
      error: error.message 
    });
  }
};

// const getUserDashboardBookings = async (req, res) => {
//   try {
//     const userId = req.params.userId || req.user?.id;
    
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID is required'
//       });
//     }

//     const { 
//       page = 1, 
//       limit = 10, 
//       status,
//       paymentStatus 
//     } = req.query;

//     const where = { userId };
    
//     if (status) where.status = status;
//     if (paymentStatus) where.paymentStatus = paymentStatus;

//     const offset = (page - 1) * limit;

//     const { count, rows: bookings } = await Booking.findAndCountAll({
//       where,
//       order: [['createdAt', 'DESC']],
//       offset,
//       limit: parseInt(limit),
//       attributes: [
//         'id',
//         'customerName',
//         'customerEmail',
//         'customerPhone',
//         'serviceType',
//         'selectedFeatures',
//         'address',
//         'date',
//         'time',
//         'duration',
//         'price',
//         'status',
//         'paymentStatus',
//         'paidAmount',
//         'bookingReference',
//         'specialInstructions',
//         'createdAt',
//         'updatedAt'
//       ]
//     });

//     res.json({
//       success: true,
//       total: count,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       totalPages: Math.ceil(count / limit),
//       bookings
//     });
//   } catch (error) {
//     console.error('Error fetching user dashboard bookings:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching user bookings', 
//       error: error.message 
//     });
//   }
// };

const getDashboardUpcomingBookings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const { limit = 5 } = req.query;
    const today = new Date().toISOString().split('T')[0];

    const upcomingBookings = await Booking.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: today
        },
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: parseInt(limit),
      attributes: [
        'id',
        'customerName',
        'serviceType',
        'selectedFeatures',
        'address',
        'date',
        'time',
        'duration',
        'price',
        'status',
        'paymentStatus',
        'bookingReference',
        'createdAt'
      ]
    });

    res.json({
      success: true,
      count: upcomingBookings.length,
      bookings: upcomingBookings
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching upcoming bookings', 
      error: error.message 
    });
  }
};

const getRecentBookings = async (req, res) => {
  try {
    const { limit = 10, userId } = req.query;
    
    const where = {};
    if (userId) {
      where.userId = userId;
    }

    const recentBookings = await Booking.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id',
        'userId',
        'customerName',
        'customerEmail',
        'serviceType',
        'selectedFeatures',
        'address',
        'date',
        'time',
        'duration',
        'price',
        'status',
        'paymentStatus',
        'bookingReference',
        'createdAt'
      ]
    });

    res.json({
      success: true,
      count: recentBookings.length,
      bookings: recentBookings
    });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recent bookings', 
      error: error.message 
    });
  }
};

const getMyBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findOne({
      where: {
        id,
        userId // Ensure booking belongs to the user
      },
      attributes: [
        'id',
        'customerName',
        'customerEmail',
        'customerPhone',
        'serviceType',
        'selectedFeatures',
        'address',
        'date',
        'time',
        'duration',
        'price',
        'status',
        'paymentStatus',
        'paymentIntentId',
        'paidAmount',
        'bookingReference',
        'notes',
        'specialInstructions',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you do not have access to it'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking', 
      error: error.message 
    });
  }
};

const testEmailSystem = async (req, res) => {
  try {
    const { email, bookingReference } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Test email data
    const testData = {
      to: email,
      bookingReference: bookingReference || 'TEST-' + Date.now(),
      customerName: 'Test Customer',
      serviceType: 'Test Service',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      address: 'Test Address',
      price: 100
    };

    // TODO: Implement actual email sending logic here
    // Example: await sendEmail(testData);
    
    console.log('📧 Test email would be sent to:', email);
    console.log('📧 Email data:', testData);

    res.json({
      success: true,
      message: 'Email system test completed',
      testData: {
        recipient: email,
        bookingReference: testData.bookingReference,
        timestamp: new Date().toISOString()
      },
      note: 'Email sending functionality needs to be configured with an email service provider (e.g., SendGrid, AWS SES, Nodemailer)'
    });
  } catch (error) {
    console.error('Error testing email system:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing email system', 
      error: error.message 
    });
  }
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