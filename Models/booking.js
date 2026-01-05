const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database");

const Booking = sequelize.define(
  "Booking",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerEmail: { type: DataTypes.STRING, allowNull: false },
    customerPhone: { type: DataTypes.STRING, allowNull: false },
    serviceType: {
      type: DataTypes.ENUM(
        "Office Cleaning",
        "Kitchen Cleaning",
        "Bathroom Cleaning",
        "Dusting Service",
        "Mopping Service",
        "Vacuuming Service"
      ),
      allowNull: false,
    },
    selectedFeatures: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    address: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "in-progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    paymentIntentId: { type: DataTypes.STRING, allowNull: true },
    paidAmount: { type: DataTypes.FLOAT, allowNull: true },
    bookingReference: { type: DataTypes.STRING, unique: true, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    specialInstructions: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "bookings",
    timestamps: true,
    hooks: {
      beforeValidate: (booking) => {
        if (!booking.bookingReference) {
          booking.bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        }
      },
    },
  }
);

module.exports = Booking;