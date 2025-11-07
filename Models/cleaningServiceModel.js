// models/Service.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      isFloat: true
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    validate: {
      isValidFeatures(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('Features must be an array');
        }
        if (value && value.some(feature => typeof feature !== 'string')) {
          throw new Error('All features must be strings');
        }
      }
    }
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'default-icon'
  },
  category: {
    type: DataTypes.ENUM('residential', 'commercial', 'specialized'),
    allowNull: false,
    defaultValue: 'residential'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'services',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['category']
    },
    {
      fields: ['displayOrder']
    }
  ]
});

// models/Service.js
module.exports = Service;