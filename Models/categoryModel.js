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
});

Category.associate = (models) => {
  Category.hasMany(models.SubCategory, { foreignKey: 'parentId', as: 'subcategories' });
};

module.exports = Category; 