const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER, // Change to INTEGER
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER, // Change to INTEGER to match Order.id
    allowNull: false,
    references: {
        model: 'orders',
        key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER, // Change to INTEGER to match Product.id
    allowNull: false,
    references: {
        model: 'products',
        key: 'id'
    }
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'order_items',
  timestamps: true,
});

module.exports = OrderItem;