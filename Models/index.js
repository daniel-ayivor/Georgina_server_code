// models/index.js
const Product = require('./productModel');
const User = require('./userModel');
const Wishlist = require('./wishlist');
const OrderItem = require('./orderItemModel');
const Order = require('./orderModel');
const Review = require('./reviewModel'); // Add Review model

// Set up associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders'
  });

  User.hasMany(Wishlist, {
    foreignKey: 'userId',
    as: 'wishlistItems'
  });

  User.hasMany(Review, {
    foreignKey: 'userId',
    as: 'reviews'
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

  Product.hasMany(Review, {
    foreignKey: 'productId',
    as: 'reviews', // Changed from 'Reviews' to 'reviews' for consistency
    onDelete: 'CASCADE'
  });

  // Order associations - CRITICAL FOR ORDER QUERIES
  Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'  // This alias MUST match the include in controller
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

  // OrderItem associations - CRITICAL FOR ITEM/PRODUCT QUERIES
  OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
  });
  
  OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'  // This alias MUST match the include in controller
  });

  // Review associations
  Review.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
  });

  Review.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Verify associations are set up
  console.log('✅ All associations are set up:');
  console.log('✅ Product associations:', Object.keys(Product.associations || {}));
  console.log('✅ User associations:', Object.keys(User.associations || {}));
  console.log('✅ Order associations:', Object.keys(Order.associations || {}));
  console.log('✅ OrderItem associations:', Object.keys(OrderItem.associations || {}));
  console.log('✅ Review associations:', Object.keys(Review.associations || {}));
  console.log('✅ Wishlist associations:', Object.keys(Wishlist.associations || {}));
};

// SET UP ASSOCIATIONS IMMEDIATELY
setupAssociations();

module.exports = {
  Product,
  User,
  Wishlist,
  OrderItem,
  Order,
  Review, 
  setupAssociations
};