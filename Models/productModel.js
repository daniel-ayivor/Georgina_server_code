const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Discount percentage (0-100)'
  },
  discountedPrice: {
    type: DataTypes.VIRTUAL,
    get() {
      const price = parseFloat(this.getDataValue('price'));
      const discount = parseFloat(this.getDataValue('discount')) || 0;
      return price - (price * discount / 100);
    }
  },
  categoryLevel1: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Clothes', 'Foodstuffs']]
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
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'piece',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
  },
  
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  // Add these fields to your Product model
averageRating: {
  type: DataTypes.DECIMAL(2, 1),
  defaultValue: 0,
  validate: {
    min: 0,
    max: 5
  }
},
totalReviews: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
  validate: { min: 0 }
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
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isNewArrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
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
  },
  wishList: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'products',
  timestamps: true,
});

// Associations


module.exports = Product;