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


    // Add these new fields for special categories
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // New Arrivals can be determined by createdAt date
  // but you can also add a manual flag if needed
  isNewArrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Optional: Add fields to control display order
  featuredOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  trendingOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  newArrivalOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  } , // Add these new fields for special categories
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // New Arrivals can be determined by createdAt date
  // but you can also add a manual flag if needed
  isNewArrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  wishList : {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  size : {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Optional: Add fields to control display order
  featuredOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  trendingOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  newArrivalOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'products',
  timestamps: true,
  
});
//  ?orderItems association

Product.associate = (models) => {
  Product.hasMany(models.OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems' // This is the reverse association
  });
};

module.exports = Product;