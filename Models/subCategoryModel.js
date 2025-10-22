const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const SubCategory = sequelize.define('SubCategory', {
  id: {
    type: DataTypes.STRING,
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
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'subcategories',
  timestamps: true,
  underscored: true,
});

// Associations are defined in categoryModel.js to avoid circular dependencies

module.exports = SubCategory; 