// models/Booking.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  serviceType: {
    type: DataTypes.ENUM(
      'Office Cleaning',
      'Kitchen Cleaning', 
      'Bathroom Cleaning',
      'Dusting Service',
      'Mopping Service',
      'Vacuuming Service'
    ),
    allowNull: false,
  },
  // NEW: Store selected features as JSON array
  selectedFeatures: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 255]
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString().split('T')[0]
    }
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
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
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  bookingReference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  hooks: {
    beforeValidate: (booking) => {
      if (!booking.bookingReference) {
        booking.bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }
    }
  }
});

module.exports = Booking;