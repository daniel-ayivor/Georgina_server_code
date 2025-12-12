const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');
const Product = require('./productModel');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  verifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'reviews',
  timestamps: true,
});



module.exports = Review;