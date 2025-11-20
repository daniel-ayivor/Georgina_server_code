
// const Booking = require("../Models/booking");
// // Import the User model at the top of your booking controller file
// const User = require('../Models/userModel'); // Adjust path as needed
// const { Op } = require('sequelize');
// const nodemailer = require('nodemailer');
// const sequelize = require('sequelize'); // ADD THIS IMPORT

// // Configure email transporter (using Gmail as example)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // Email templates
// // Email templates - Updated to include selected features
// const emailTemplates = {
//   bookingConfirmation: (booking) => ({
//     subject: `Booking Confirmed - ${booking.bookingReference}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #2563eb;">Booking Confirmed!</h2>
//         <p>Dear ${booking.customerName},</p>
//         <p>Your booking has been confirmed. Here are your booking details:</p>
        
//         <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="color: #1e293b; margin-top: 0;">Booking Details</h3>
//           <p><strong>Service:</strong> ${booking.serviceType}</p>
          
//           <!-- Selected Features Section -->
//           ${booking.selectedFeatures && booking.selectedFeatures.length > 0 ? `
//             <div style="margin: 15px 0;">
//               <p style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Selected Features:</p>
//               <div style="display: flex; flex-wrap: wrap; gap: 8px;">
//                 ${booking.selectedFeatures.map(feature => `
//                   <span style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #bae6fd;">
//                     ${feature}
//                   </span>
//                 `).join('')}
//               </div>
//             </div>
//           ` : ''}
          
//           <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
//           <p><strong>Time:</strong> ${booking.time}</p>
//           <p><strong>Duration:</strong> ${booking.duration} hours</p>
//           <p><strong>Price:</strong> $${booking.price}</p>
//           <p><strong>Address:</strong> ${booking.address}</p>
//           <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
//         </div>

//         ${booking.specialInstructions ? `
//           <div style="background: #fefce8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
//             <p style="font-weight: 600; margin: 0 0 8px 0; color: #92400e;">Special Instructions:</p>
//             <p style="margin: 0; color: #92400e;">${booking.specialInstructions}</p>
//           </div>
//         ` : ''}

//         <p>We'll contact you before the service. If you have any questions, please reply to this email.</p>
        
//         <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
//           <p style="color: #64748b; font-size: 14px;">
//             Best regards,<br>
//             Your Cleaning Service Team
//           </p>
//         </div>
//       </div>
//     `
//   }),

//   statusUpdate: (booking, oldStatus) => ({
//     subject: `Booking Status Update - ${booking.bookingReference}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #2563eb;">Booking Status Updated</h2>
//         <p>Dear ${booking.customerName},</p>
//         <p>Your booking status has been updated from <strong>${oldStatus}</strong> to <strong>${booking.status}</strong>.</p>
        
//         <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="color: #1e293b; margin-top: 0;">Booking Details</h3>
//           <p><strong>Service:</strong> ${booking.serviceType}</p>
          
//           <!-- Selected Features Section -->
//           ${booking.selectedFeatures && booking.selectedFeatures.length > 0 ? `
//             <div style="margin: 15px 0;">
//               <p style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Selected Features:</p>
//               <div style="display: flex; flex-wrap: wrap; gap: 8px;">
//                 ${booking.selectedFeatures.map(feature => `
//                   <span style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #bae6fd;">
//                     ${feature}
//                   </span>
//                 `).join('')}
//               </div>
//             </div>
//           ` : ''}
          
//           <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
//           <p><strong>Time:</strong> ${booking.time}</p>
//           <p><strong>Status:</strong> ${booking.status}</p>
//           <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
//           ${booking.notes ? `<p><strong>Admin Notes:</strong> ${booking.notes}</p>` : ''}
//         </div>

//         <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
//           <p style="color: #64748b; font-size: 14px;">
//             Best regards,<br>
//             Your Cleaning Service Team
//           </p>
//         </div>
//       </div>
//     `
//   }),

//   bookingCancelled: (booking) => ({
//     subject: `Booking Cancelled - ${booking.bookingReference}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #dc2626;">Booking Cancelled</h2>
//         <p>Dear ${booking.customerName},</p>
//         <p>Your booking has been cancelled as requested.</p>
        
//         <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="color: #1e293b; margin-top: 0;">Cancelled Booking Details</h3>
//           <p><strong>Service:</strong> ${booking.serviceType}</p>
          
//           <!-- Selected Features Section -->
//           ${booking.selectedFeatures && booking.selectedFeatures.length > 0 ? `
//             <div style="margin: 15px 0;">
//               <p style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Selected Features:</p>
//               <div style="display: flex; flex-wrap: wrap; gap: 8px;">
//                 ${booking.selectedFeatures.map(feature => `
//                   <span style="background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #fecaca;">
//                     ${feature}
//                   </span>
//                 `).join('')}
//               </div>
//             </div>
//           ` : ''}
          
//           <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
//           <p><strong>Time:</strong> ${booking.time}</p>
//           <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
//         </div>

//         <p>If this was a mistake or you'd like to reschedule, please contact us.</p>
        
//         <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
//           <p style="color: #64748b; font-size: 14px;">
//             Best regards,<br>
//             Your Cleaning Service Team
//           </p>
//         </div>
//       </div>
//     `
//   })
// };

// // Send email function
// const sendEmail = async (to, subject, html) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       html
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${to}`);
//     return true;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return false;
//   }
// };

// // Customer creates booking


// const createBooking = async (req, res) => {
//   try {
//     const { 
//       customerName,
//       customerEmail,
//       customerPhone,
//       serviceType,
//       selectedFeatures,
//       address,
//       date,
//       time,
//       duration,
//       price,
//       specialInstructions,
//       userId
//     } = req.body;

//     console.log('🔍 [BACKEND-DEBUG] Creating booking with data:', {
//       customerName,
//       customerEmail, 
//       serviceType,
//       userId
//     });

//     console.log('🔍 [BACKEND-DEBUG] Full request body:', req.body);

//     // Validate that userId is provided
//     if (!userId) {
//       console.error('❌ [BACKEND-DEBUG] userId is missing in request');
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: [{ field: "userId", message: "Booking.userId cannot be null" }]
//       });
//     }

//     // Convert userId to number to be safe
//     const numericUserId = parseInt(userId);
//     if (isNaN(numericUserId)) {
//       console.error('❌ [BACKEND-DEBUG] userId is not a valid number:', userId);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: [{ field: "userId", message: "Booking.userId must be a valid number" }]
//       });
//     }

//     // Check if user exists - ONLY if User model is available
//     let userExists = true;
//     try {
//       const user = await User.findByPk(numericUserId);
//       if (!user) {
//         console.error('❌ [BACKEND-DEBUG] User not found with ID:', numericUserId);
//         userExists = false;
//       } else {
//         console.log('✅ [BACKEND-DEBUG] User found:', user.id, user.email);
//       }
//     } catch (userError) {
//       console.warn('⚠️ [BACKEND-DEBUG] Could not verify user existence:', userError.message);
//       // Continue without user verification if User model isn't available
//       userExists = true; // Assume user exists to proceed
//     }

//     // Validate that selectedFeatures is an array
//     const featuresArray = Array.isArray(selectedFeatures) ? selectedFeatures : [];

//     const booking = await Booking.create({
//       customerName,
//       customerEmail,
//       customerPhone,
//       serviceType: serviceType,
//       selectedFeatures: featuresArray,
//       address,
//       date,
//       time,
//       duration: duration,
//       price: price,
//       specialInstructions,
//       userId: numericUserId
//     });

//     console.log('✅ [BACKEND-DEBUG] Booking created successfully:', booking.bookingReference);
//     console.log('✅ [BACKEND-DEBUG] Booking userId:', booking.userId);

//     res.status(201).json({
//       success: true,
//       message: 'Booking created successfully',
//       data: {
//         bookingReference: booking.bookingReference,
//         customerName: booking.customerName,
//         serviceType: booking.serviceType,
//         selectedFeatures: booking.selectedFeatures,
//         date: booking.date,
//         time: booking.time,
//         address: booking.address,
//         specialInstructions: booking.specialInstructions,
//         status: booking.status,
//         userId: booking.userId
//       }
//     });

//   } catch (error) {
//     console.error('❌ [BACKEND-DEBUG] Error creating booking:', error);
    
//     if (error.name === 'SequelizeValidationError') {
//       console.error('❌ [BACKEND-DEBUG] Validation errors:', error.errors);
      
//       const serviceError = error.errors.find(err => err.path === 'serviceType');
//       if (serviceError) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid service type. We offer: Office Cleaning, Kitchen Cleaning, Bathroom Cleaning, Dusting Service, Mopping Service, Vacuuming Service`
//         });
//       }
      
//       const userIdError = error.errors.find(err => err.path === 'userId');
//       if (userIdError) {
//         return res.status(400).json({
//           success: false,
//           message: "User ID validation failed",
//           errors: [{ field: "userId", message: userIdError.message }]
//         });
//       }
      
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         errors: error.errors.map(err => ({
//           field: err.path,
//           message: err.message
//         }))
//       });
//     }
    
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking reference already exists'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Server error creating booking',
//       error: error.message
//     });
//   }
// };
// // Get all bookings (Admin only)
// const getBookings = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 10, 
//       status, 
//       serviceType,
//       date,
//       search 
//     } = req.query;

//     const where = {};
    
//     if (status) where.status = status;
//     if (serviceType) where.serviceType = serviceType;
//     if (date) where.date = date;
    
//     if (search) {
//       where[Op.or] = [
//         { customerName: { [Op.like]: `%${search}%` } },
//         { customerEmail: { [Op.like]: `%${search}%` } },
//         { bookingReference: { [Op.like]: `%${search}%` } },
//         { address: { [Op.like]: `%${search}%` } }
//       ];
//     }

//     const offset = (page - 1) * limit;

//     const { count, rows: bookings } = await Booking.findAndCountAll({
//       where,
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         bookings,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(count / limit),
//           totalItems: count,
//           itemsPerPage: parseInt(limit)
//         }
//       },
//       message: 'Bookings retrieved successfully'
//     });
//   } catch (err) {
//     console.error('Error fetching bookings:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching bookings'
//     });
//   }
// };

// // Get booking by ID
// const getBookingById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const booking = await Booking.findByPk(id);
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Booking not found' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: booking,
//       message: 'Booking retrieved successfully'
//     });
//   } catch (err) {
//     console.error('Error fetching booking:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching booking'
//     });
//   }
// };

// // Get bookings by customer email
// const getBookingsByEmail = async (req, res) => {
//   const { email } = req.params;

//   try {
//     const bookings = await Booking.findAll({
//       where: { customerEmail: email },
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       success: true,
//       data: bookings,
//       message: 'Bookings retrieved successfully'
//     });
//   } catch (err) {
//     console.error('Error fetching customer bookings:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching bookings'
//     });
//   }
// };




// // Get user dashboard bookings data - FIXED VERSION
// const getUserDashboardBookings = async (req, res) => {
//   try {
//     // Use query parameter instead of req.user (since no auth middleware)
//     const customerEmail = req.query.email;
    
//     if (!customerEmail) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email parameter is required to fetch bookings'
//       });
//     }
    
//     const { 
//       page = 1, 
//       limit = 5,
//       status 
//     } = req.query;

//     const where = { customerEmail };
    
//     // Filter by status if provided
//     if (status && status !== 'all') {
//       where.status = status;
//     }

//     const offset = (page - 1) * limit;

//     const { count, rows: bookings } = await Booking.findAndCountAll({
//       where,
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     // Get booking statistics for dashboard
//     const stats = await Booking.findAll({
//       where: { customerEmail },
//       attributes: [
//         'status',
//         [sequelize.fn('COUNT', sequelize.col('id')), 'count']
//       ],
//       group: ['status'],
//       raw: true
//     });

//     // Format statistics
//     const bookingStats = {
//       total: count,
//       pending: 0,
//       confirmed: 0,
//       'in-progress': 0,
//       completed: 0,
//       cancelled: 0
//     };

//     stats.forEach(stat => {
//       bookingStats[stat.status] = parseInt(stat.count);
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         bookings,
//         stats: bookingStats,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(count / limit),
//           totalItems: count,
//           itemsPerPage: parseInt(limit)
//         }
//       },
//       message: 'Dashboard bookings retrieved successfully'
//     });
//   } catch (err) {
//     console.error('Error fetching dashboard bookings:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching dashboard bookings'
//     });
//   }
// };

// // Get recent bookings for dashboard (last 5 bookings) - FIXED VERSION
// const getRecentBookings = async (req, res) => {
//   try {
//     const customerEmail = req.query.email;
    
//     if (!customerEmail) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email parameter is required'
//       });
//     }

//     const bookings = await Booking.findAll({
//       where: { customerEmail },
//       order: [['createdAt', 'DESC']],
//       limit: 5
//     });

//     res.status(200).json({
//       success: true,
//       data: bookings,
//       message: 'Recent bookings retrieved successfully'
//     });
//   } catch (err) {
//     console.error('Error fetching recent bookings:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching recent bookings'
//     });
//   }
// };

// // Get upcoming bookings for dashboard - FIXED VERSION
// const getDashboardUpcomingBookings = async (req, res) => {
//   try {
//     const customerEmail = req.query.email;
    
//     if (!customerEmail) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email parameter is required'
//       });
//     }
    
//     const today = new Date().toISOString().split('T')[0];

//     const bookings = await Booking.findAll({
//       where: {
//         customerEmail,
//         date: {
//           [Op.gte]: today
//         },
//         status: {
//           [Op.in]: ['pending', 'confirmed', 'in-progress']
//         }
//       },
//       order: [['date', 'ASC'], ['time', 'ASC']],
//       limit: 3
//     });

//     res.status(200).json({
//       success: true,
//       data: bookings,
//       message: 'Upcoming bookings retrieved successfully'
//     });
//   } catch (err) {
//     console.error('Error fetching upcoming dashboard bookings:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching upcoming bookings'
//     });
//   }
// };

// // Get specific booking for authenticated user - FIXED VERSION
// const getMyBookingById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const customerEmail = req.query.email;
    
//     if (!customerEmail) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email parameter is required'
//       });
//     }
    
//     const booking = await Booking.findOne({
//       where: {
//         id,
//         customerEmail
//       }
//     });

//     if (!booking) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Booking not found or you do not have permission to view this booking' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: booking,
//       message: 'Booking retrieved successfully'
//     });
//   } catch (err) {
//     console.error('Error fetching booking:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching booking'
//     });
//   }
// };


// const updateBooking = async (req, res) => {
//   const { id } = req.params;
//   const { status, notes, notifyCustomer = true } = req.body;

//   try {
//     const booking = await Booking.findByPk(id);
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Booking not found' 
//       });
//     }

//     const oldStatus = booking.status;

//     await booking.update({
//       status: status || booking.status,
//       notes: notes !== undefined ? notes : booking.notes
//     });

//     // Send email notification for status changes
//     if (notifyCustomer && status && status !== oldStatus) {
//       let emailTemplate;
      
//       if (status === 'confirmed') {
//         emailTemplate = emailTemplates.bookingConfirmation(booking);
//       } else if (status === 'cancelled') {
//         emailTemplate = emailTemplates.bookingCancelled(booking);
//       } else {
//         emailTemplate = emailTemplates.statusUpdate(booking, oldStatus);
//       }

//       await sendEmail(booking.customerEmail, emailTemplate.subject, emailTemplate.html);
      
//       console.log(`📧 Status update email sent to ${booking.customerEmail} for booking ${booking.bookingReference}`);
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Booking updated successfully',
//       data: booking,
//       emailSent: notifyCustomer && status && status !== oldStatus
//     });
//   } catch (err) {
//     console.error('Error updating booking:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating booking'
//     });
//   }
// };

// // Cancel booking (Customer or Admin)
// const cancelBooking = async (req, res) => {
//   const { id } = req.params;
//   const { cancellationReason } = req.body;

//   try {
//     const booking = await Booking.findByPk(id);
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Booking not found' 
//       });
//     }

//     if (booking.status === 'completed') {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot cancel a completed booking'
//       });
//     }

//     const oldStatus = booking.status;

//     await booking.update({
//       status: 'cancelled',
//       notes: cancellationReason ? 
//         `Cancellation reason: ${cancellationReason}. ${booking.notes || ''}`.trim() 
//         : booking.notes
//     });

//     // Send cancellation email
//     await sendEmail(
//       booking.customerEmail,
//       emailTemplates.bookingCancelled(booking).subject,
//       emailTemplates.bookingCancelled(booking).html
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Booking cancelled successfully',
//       data: booking
//     });
//   } catch (err) {
//     console.error('Error cancelling booking:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while cancelling booking'
//     });
//   }
// };

// // Delete booking (Admin only)
// const deleteBooking = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const booking = await Booking.findByPk(id);
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Booking not found' 
//       });
//     }

//     await booking.destroy();
//     res.status(200).json({ 
//       success: true,
//       message: 'Booking deleted successfully' 
//     });
//   } catch (err) {
//     console.error('Error deleting booking:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while deleting booking'
//     });
//   }
// };

// // Get available time slots for a date
// const getAvailableTimeSlots = async (req, res) => {
//   const { date } = req.params;

//   try {
//     const allTimeSlots = [
//       '08:00', '09:00', '10:00', '11:00', '12:00', 
//       '13:00', '14:00', '15:00', '16:00', '17:00'
//     ];

//     // Get booked time slots for the date
//     const bookedBookings = await Booking.findAll({
//       where: {
//         date,
//         status: {
//           [Op.in]: ['pending', 'confirmed', 'in-progress']
//         }
//       },
//       attributes: ['time']
//     });

//     const bookedTimeSlots = bookedBookings.map(booking => booking.time);
//     const availableTimeSlots = allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));

//     res.status(200).json({
//       success: true,
//       data: {
//         date,
//         availableTimeSlots,
//         bookedTimeSlots
//       }
//     });
//   } catch (err) {
//     console.error('Error fetching available time slots:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching available time slots'
//     });
//   }
// };

// module.exports = {
//   createBooking,
//   getBookings,
//   getBookingById,
//   getBookingsByEmail,
//   updateBooking,
//   cancelBooking,
//   deleteBooking,
//   getAvailableTimeSlots,
//   // ADD THE NEW FUNCTIONS TO EXPORTS:
//   getUserDashboardBookings,
//   getRecentBookings,
//   getDashboardUpcomingBookings,
//   getMyBookingById
// };


const Booking = require("../Models/booking");
// Import the User model at the top of your booking controller file
const User = require('../Models/userModel'); // Adjust path as needed
const Service = require("../Models/cleaningServiceModel");
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const sequelize = require('sequelize'); // ADD THIS IMPORT

// Configure email transporter with better error handling
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true, // enable debug output
  logger: true // log to console
});

// Validate email configuration on startup
const validateEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email environment variables are not set!');
    console.error('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.error('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
    return false;
  }
  console.log('✅ Email configuration validated');
  return true;
};

// Call this when your server starts
validateEmailConfig();

// Email templates - Updated to include selected features
const emailTemplates = {
  bookingConfirmation: (booking) => ({
    subject: `Booking Confirmed - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmed!</h2>
        <p>Dear ${booking.customerName},</p>
        <p>Your booking has been confirmed. Here are your booking details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Booking Details</h3>
          <p><strong>Service:</strong> ${booking.serviceType}</p>
          
          <!-- Selected Features Section -->
          ${booking.selectedFeatures && booking.selectedFeatures.length > 0 ? `
            <div style="margin: 15px 0;">
              <p style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Selected Features:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${booking.selectedFeatures.map(feature => `
                  <span style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #bae6fd;">
                    ${feature}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Duration:</strong> ${booking.duration} hours</p>
          <p><strong>Price:</strong> $${booking.price}</p>
          <p><strong>Address:</strong> ${booking.address}</p>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        </div>

        ${booking.specialInstructions ? `
          <div style="background: #fefce8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <p style="font-weight: 600; margin: 0 0 8px 0; color: #92400e;">Special Instructions:</p>
            <p style="margin: 0; color: #92400e;">${booking.specialInstructions}</p>
          </div>
        ` : ''}

        <p>We'll contact you before the service. If you have any questions, please reply to this email.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            Your Cleaning Service Team
          </p>
        </div>
      </div>
    `
  }),

  statusUpdate: (booking, oldStatus) => ({
    subject: `Booking Status Update - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Status Updated</h2>
        <p>Dear ${booking.customerName},</p>
        <p>Your booking status has been updated from <strong>${oldStatus}</strong> to <strong>${booking.status}</strong>.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Booking Details</h3>
          <p><strong>Service:</strong> ${booking.serviceType}</p>
          
          <!-- Selected Features Section -->
          ${booking.selectedFeatures && booking.selectedFeatures.length > 0 ? `
            <div style="margin: 15px 0;">
              <p style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Selected Features:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${booking.selectedFeatures.map(feature => `
                  <span style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #bae6fd;">
                    ${feature}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          ${booking.notes ? `<p><strong>Admin Notes:</strong> ${booking.notes}</p>` : ''}
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            Your Cleaning Service Team
          </p>
        </div>
      </div>
    `
  }),

  bookingCancelled: (booking) => ({
    subject: `Booking Cancelled - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Booking Cancelled</h2>
        <p>Dear ${booking.customerName},</p>
        <p>Your booking has been cancelled as requested.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Cancelled Booking Details</h3>
          <p><strong>Service:</strong> ${booking.serviceType}</p>
          
          <!-- Selected Features Section -->
          ${booking.selectedFeatures && booking.selectedFeatures.length > 0 ? `
            <div style="margin: 15px 0;">
              <p style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Selected Features:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${booking.selectedFeatures.map(feature => `
                  <span style="background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #fecaca;">
                    ${feature}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        </div>

        <p>If this was a mistake or you'd like to reschedule, please contact us.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            Your Cleaning Service Team
          </p>
        </div>
      </div>
    `
  }),

  // NEW: Booking received template for when booking is initially created
  bookingReceived: (booking) => ({
    subject: `Booking Received - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Booking Received!</h2>
        <p>Dear ${booking.customerName},</p>
        <p>Thank you for your booking request! We have received your booking and will confirm it shortly.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="color: #1e293b; margin-top: 0;">Booking Details</h3>
          <p><strong>Service:</strong> ${booking.serviceType}</p>
          
          <!-- Selected Features Section -->
          ${booking.selectedFeatures && booking.selectedFeatures.length > 0 ? `
            <div style="margin: 15px 0;">
              <p style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Selected Features:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${booking.selectedFeatures.map(feature => `
                  <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #bbf7d0;">
                    ${feature}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Duration:</strong> ${booking.duration} hours</p>
          <p><strong>Price:</strong> $${booking.price}</p>
          <p><strong>Address:</strong> ${booking.address}</p>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Status:</strong> <span style="color: #d97706;">Pending Confirmation</span></p>
        </div>

        ${booking.specialInstructions ? `
          <div style="background: #fefce8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <p style="font-weight: 600; margin: 0 0 8px 0; color: #92400e;">Special Instructions:</p>
            <p style="margin: 0; color: #92400e;">${booking.specialInstructions}</p>
          </div>
        ` : ''}

        <p>We will review your booking and send a confirmation email shortly. If you have any questions, please reply to this email.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            Your Cleaning Service Team
          </p>
        </div>
      </div>
    `
  })
};

// Enhanced Send email function with better logging
const sendEmail = async (to, subject, html) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Using email user: ${process.env.EMAIL_USER}`);
    console.log(`📧 Email subject: ${subject}`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}, Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Email error details:', {
      to,
      subject,
      errorCode: error.code,
      errorMessage: error.message,
      command: error.command
    });
    return false;
  }
};

// Customer creates booking - UPDATED WITH EMAIL
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

    console.log('🔍 [EMAIL-DEBUG] Starting booking creation for:', customerEmail);

    // ... (your existing validation code)

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

    console.log('✅ [EMAIL-DEBUG] Booking created:', booking.bookingReference);

    // ✅ ENHANCED EMAIL SENDING WITH BETTER DEBUGGING
    let emailSent = false;
    let emailError = null;
    
    try {
      console.log(`📧 [EMAIL-DEBUG] Preparing to send booking received email to: ${booking.customerEmail}`);
      
      const emailTemplate = emailTemplates.bookingReceived(booking);
      console.log(`📧 [EMAIL-DEBUG] Email subject: ${emailTemplate.subject}`);
      
      emailSent = await sendEmail(booking.customerEmail, emailTemplate.subject, emailTemplate.html);
      
      if (emailSent) {
        console.log(`✅ [EMAIL-DEBUG] Booking received email successfully sent to ${booking.customerEmail}`);
      } else {
        console.error(`❌ [EMAIL-DEBUG] Failed to send booking received email to ${booking.customerEmail}`);
        emailError = 'Email sending function returned false';
      }
    } catch (emailError) {
      console.error(`❌ [EMAIL-DEBUG] Error sending booking received email:`, emailError);
      emailError = emailError.message;
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        serviceType: booking.serviceType,
        selectedFeatures: booking.selectedFeatures,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        specialInstructions: booking.specialInstructions,
        status: booking.status,
        userId: booking.userId
      },
      email: {
        sent: emailSent,
        error: emailError,
        recipient: booking.customerEmail
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
          message: `Invalid service type. We offer: Office Cleaning, Kitchen Cleaning, Bathroom Cleaning, Dusting Service, Mopping Service, Vacuuming Service`
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
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      },
      message: 'Bookings retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({
      success: false,
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
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// Get bookings by customer email
const getBookingsByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const bookings = await Booking.findAll({
      where: { customerEmail: email },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: bookings,
      message: 'Bookings retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching customer bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// Get user dashboard bookings data - FIXED VERSION
const getUserDashboardBookings = async (req, res) => {
  try {
    // Use query parameter instead of req.user (since no auth middleware)
    const customerEmail = req.query.email;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required to fetch bookings'
      });
    }
    
    const { 
      page = 1, 
      limit = 5,
      status 
    } = req.query;

    const where = { customerEmail };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get booking statistics for dashboard
    const stats = await Booking.findAll({
      where: { customerEmail },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Format statistics
    const bookingStats = {
      total: count,
      pending: 0,
      confirmed: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      bookingStats[stat.status] = parseInt(stat.count);
    });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        stats: bookingStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      },
      message: 'Dashboard bookings retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching dashboard bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard bookings'
    });
  }
};

// Get recent bookings for dashboard (last 5 bookings) - FIXED VERSION
const getRecentBookings = async (req, res) => {
  try {
    const customerEmail = req.query.email;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const bookings = await Booking.findAll({
      where: { customerEmail },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.status(200).json({
      success: true,
      data: bookings,
      message: 'Recent bookings retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching recent bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent bookings'
    });
  }
};

// Get upcoming bookings for dashboard - FIXED VERSION
const getDashboardUpcomingBookings = async (req, res) => {
  try {
    const customerEmail = req.query.email;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }
    
    const today = new Date().toISOString().split('T')[0];

    const bookings = await Booking.findAll({
      where: {
        customerEmail,
        date: {
          [Op.gte]: today
        },
        status: {
          [Op.in]: ['pending', 'confirmed', 'in-progress']
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: 3
    });

    res.status(200).json({
      success: true,
      data: bookings,
      message: 'Upcoming bookings retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching upcoming dashboard bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming bookings'
    });
  }
};

// Get specific booking for authenticated user - FIXED VERSION
const getMyBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const customerEmail = req.query.email;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }
    
    const booking = await Booking.findOne({
      where: {
        id,
        customerEmail
      }
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found or you do not have permission to view this booking' 
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// Update booking - ENHANCED WITH BETTER EMAIL LOGIC
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { status, notes, notifyCustomer = true } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    const oldStatus = booking.status;

    await booking.update({
      status: status || booking.status,
      notes: notes !== undefined ? notes : booking.notes
    });

    // Send email notification for status changes
    let emailSent = false;
    if (notifyCustomer && status && status !== oldStatus) {
      try {
        let emailTemplate;
        
        if (status === 'confirmed') {
          emailTemplate = emailTemplates.bookingConfirmation(booking);
        } else if (status === 'cancelled') {
          emailTemplate = emailTemplates.bookingCancelled(booking);
        } else {
          emailTemplate = emailTemplates.statusUpdate(booking, oldStatus);
        }

        emailSent = await sendEmail(booking.customerEmail, emailTemplate.subject, emailTemplate.html);
        
        if (emailSent) {
          console.log(`📧 Status update email sent to ${booking.customerEmail} for booking ${booking.bookingReference}`);
        } else {
          console.error(`❌ Failed to send status update email to ${booking.customerEmail}`);
        }
      } catch (emailError) {
        console.error('❌ Error sending status update email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
      emailSent: emailSent
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking'
    });
  }
};

// Cancel booking (Customer or Admin) - ENHANCED WITH EMAIL
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    const oldStatus = booking.status;

    await booking.update({
      status: 'cancelled',
      notes: cancellationReason ? 
        `Cancellation reason: ${cancellationReason}. ${booking.notes || ''}`.trim() 
        : booking.notes
    });

    // Send cancellation email
    let emailSent = false;
    try {
      const emailTemplate = emailTemplates.bookingCancelled(booking);
      emailSent = await sendEmail(
        booking.customerEmail,
        emailTemplate.subject,
        emailTemplate.html
      );
      
      if (emailSent) {
        console.log(`📧 Cancellation email sent to ${booking.customerEmail}`);
      } else {
        console.error(`❌ Failed to send cancellation email to ${booking.customerEmail}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending cancellation email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
      emailSent: emailSent
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    });
  }
};

// Delete booking (Admin only)
const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    await booking.destroy();
    res.status(200).json({ 
      success: true,
      message: 'Booking deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting booking'
    });
  }
};

// Get available time slots for a date
const getAvailableTimeSlots = async (req, res) => {
  const { date } = req.params;

  try {
    const allTimeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', 
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    // Get booked time slots for the date
    const bookedBookings = await Booking.findAll({
      where: {
        date,
        status: {
          [Op.in]: ['pending', 'confirmed', 'in-progress']
        }
      },
      attributes: ['time']
    });

    const bookedTimeSlots = bookedBookings.map(booking => booking.time);
    const availableTimeSlots = allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        date,
        availableTimeSlots,
        bookedTimeSlots
      }
    });
  } catch (err) {
    console.error('Error fetching available time slots:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available time slots'
    });
  }
};

// NEW: Test email function for debugging
const testEmail = async (req, res) => {
  try {
    const { email = 'test@example.com' } = req.body;
    
    const testBooking = {
      customerName: 'Test Customer',
      customerEmail: email,
      serviceType: 'Office Cleaning',
      selectedFeatures: ['Vacuuming', 'Dusting'],
      date: new Date(),
      time: '10:00',
      duration: 2,
      price: 100,
      address: '123 Test Street',
      bookingReference: 'TEST123',
      status: 'pending',
      specialInstructions: 'This is a test email'
    };

    const emailTemplate = emailTemplates.bookingReceived(testBooking);
    const emailSent = await sendEmail(email, emailTemplate.subject, emailTemplate.html);
    
    res.json({
      success: emailSent,
      message: emailSent ? 'Test email sent successfully' : 'Failed to send test email',
      emailConfig: {
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Missing',
        emailPass: process.env.EMAIL_PASS ? 'Set' : 'Missing'
      }
    });
  } catch (error) {
    console.error('Error in testEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
};

// Add this to your booking controller
const testEmailSystem = async (req, res) => {
  try {
    const { email = 'test@example.com' } = req.body;
    
    console.log('🧪 Testing email system...');
    console.log('📧 Email User:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
    
    // Test email configuration
    const testBooking = {
      customerName: 'Test Customer',
      customerEmail: email,
      serviceType: 'Office Cleaning',
      selectedFeatures: ['Vacuuming', 'Dusting'],
      date: new Date(),
      time: '10:00',
      duration: 2,
      price: 100,
      address: '123 Test Street',
      bookingReference: 'TEST123',
      status: 'pending',
      specialInstructions: 'This is a test email'
    };

    // Test 1: Booking received email
    console.log('📧 Testing booking received email...');
    const receivedTemplate = emailTemplates.bookingReceived(testBooking);
    const receivedSent = await sendEmail(email, receivedTemplate.subject, receivedTemplate.html);
    
    // Test 2: Booking confirmation email
    console.log('📧 Testing booking confirmation email...');
    const confirmTemplate = emailTemplates.bookingConfirmation(testBooking);
    const confirmSent = await sendEmail(email, confirmTemplate.subject, confirmTemplate.html);

    res.json({
      success: true,
      tests: {
        bookingReceived: receivedSent,
        bookingConfirmation: confirmSent
      },
      environment: {
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Missing',
        emailPass: process.env.EMAIL_PASS ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      message: 'Email system test completed'
    });
    
  } catch (error) {
    console.error('❌ Email system test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email system test failed',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  getBookingsByEmail,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getAvailableTimeSlots,
  getUserDashboardBookings,
  getRecentBookings,
  getDashboardUpcomingBookings,
  getMyBookingById,
  testEmailSystem,
  testEmail // NEW: Add test email function
};