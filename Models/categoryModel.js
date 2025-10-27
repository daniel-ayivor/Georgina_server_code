// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 3
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // REMOVE image field - not needed for categories
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'categories',
  timestamps: true,
});

// Associations
Category.associate = function(models) {
  Category.belongsTo(models.Category, {
    foreignKey: 'parentId',
    as: 'parent',
    onDelete: 'SET NULL'
  });
  
  Category.hasMany(models.Category, {
    foreignKey: 'parentId',
    as: 'children',
    onDelete: 'CASCADE'
  });
  
  // If you have products
  Category.hasMany(models.Product, {
    foreignKey: 'categoryId',
    as: 'products'
  });
};

module.exports = Category;