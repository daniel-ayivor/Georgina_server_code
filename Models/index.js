// models/index.js
const Product = require('./productModel');
const User = require('./userModel');
const Wishlist = require('./wishlist');
const OrderItem = require('./orderItemModel');
const Order = require('./orderModel');

// Set up associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Wishlist, {
    foreignKey: 'userId',
    as: 'wishlistItems'
  });
  
  User.hasMany(OrderItem, {
    foreignKey: 'userId',
    as: 'orderItems'
  });

  // Product associations
  Product.hasMany(Wishlist, {
    foreignKey: 'productId',
    as: 'wishlistedBy'
  });
  
  Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems'
  });

  // Wishlist associations
  Wishlist.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Wishlist.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
  });

  // OrderItem associations
  OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
  });
  
  OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
  });
};

// SET UP ASSOCIATIONS IMMEDIATELY
setupAssociations();

module.exports = {
  Product,
  User,
  Wishlist,
  OrderItem,
  Order,
  setupAssociations
};