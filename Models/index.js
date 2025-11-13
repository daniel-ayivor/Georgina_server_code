const sequelize = require('../Database/database');
const User = require('./userModel');
const Order = require('./orderModel');
const Booking = require('./booking');
const Customer = require('./customerModel');
const Product = require('./productModel');
const Category = require('./categoryModel');
const OrderItem = require('./orderItemModel');

// User <-> Order associations
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Booking associations
User.hasMany(Booking, { foreignKey: "userId", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });

// Order <-> OrderItem associations
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Product <-> OrderItem associations
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User <-> OrderItem associations (if needed)
User.hasMany(OrderItem, { foreignKey: "userId", as: "orderItems" });
OrderItem.belongsTo(User, { foreignKey: "userId", as: "user" });

// Export all models and sequelize
module.exports = {
  sequelize,
  User,
  Order,
  Booking,
  Customer,
  Product,
  Category,
  OrderItem
};