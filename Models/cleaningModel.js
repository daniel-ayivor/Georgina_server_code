// models/Booking.js
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'CleaningServices',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: DataTypes.TEXT
  });

    // Define associations
  Booking.associate = models => {
    Booking.belongsToMany(models.CleaningService, {
      through: 'BookingServices',
      foreignKey: 'bookingId',
      otherKey: 'serviceId'
    });
  };

  return Booking;
};
