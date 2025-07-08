const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  discountPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  images: {
    type: DataTypes.JSON, // Store array of image URLs/paths
    allowNull: false,
    defaultValue: [],
  },
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subcategoryId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 5,
    },
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sizes: {
    type: DataTypes.JSON, // Store array of sizes
    allowNull: true,
    defaultValue: [],
  },
  colors: {
    type: DataTypes.JSON, // Store array of colors
    allowNull: true,
    defaultValue: [],
  },
}, {
  tableName: 'products',
  timestamps: true,
});

Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
  Product.belongsTo(models.SubCategory, { foreignKey: 'subcategoryId', as: 'subcategory' });
};

module.exports = Product;
