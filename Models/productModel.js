// models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Product = sequelize.define('Product', {
     id: {
        type: DataTypes.INTEGER, // Should be INTEGER
        primaryKey: true,
        autoIncrement: true,
    },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON, // This stores array of image paths   // Store array of Cloudinary URLs
    allowNull: true,
    defaultValue: [],
  },

  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  categoryLevel1: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Clothes', 'Foodstuffs', 'Services']]
    },
  },
  categoryLevel2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryLevel3: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serviceType: {
    type: DataTypes.ENUM('physical', 'service'),
    defaultValue: 'physical',
  },
  serviceDuration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'piece',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  images: {
    type: DataTypes.JSON, // This stores array of image paths
    allowNull: true,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
  
});

module.exports = Product;