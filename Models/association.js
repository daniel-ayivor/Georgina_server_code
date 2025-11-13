const User = require('./userModel');
const Order = require('./orderModel');
const Booking = require('./booking');
const Customer = require('./customerModel');

// User <-> Order associations (use consistent aliases)
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Booking associations
User.hasMany(Booking, { foreignKey: "userId", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { User, Order, Booking, Customer };