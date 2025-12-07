const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

// Function to generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase(); // Convert timestamp to base36
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random 6 chars
  return `ORD-${timestamp}-${randomPart}`;
};

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true, // Allow null for existing rows during migration
    defaultValue: generateOrderNumber
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  hooks: {
    beforeCreate: (order) => {
      if (!order.orderNumber) {
        order.orderNumber = generateOrderNumber();
      }
    }
  }
});

module.exports = Order;