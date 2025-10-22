const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Category = sequelize.define('Category', {
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
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
});

// Define associations after all models are loaded
const defineAssociations = () => {
  const SubCategory = require('./subCategoryModel');
  Category.hasMany(SubCategory, { foreignKey: 'parentId', as: 'subcategories' });
  SubCategory.belongsTo(Category, { foreignKey: 'parentId', as: 'category' });
};

// Call defineAssociations when the model is required
defineAssociations();

module.exports = Category; 