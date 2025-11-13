// const { DataTypes } = require('sequelize');
// const sequelize = require('../Database/database');

// const Order = sequelize.define('Order', {
//   id: {
//     type: DataTypes.INTEGER, // Correct type for UUID
//     primaryKey: true,
//     defaultValue: DataTypes.INTEGER // Default value generator
//   },
//     userId: {
//         type: DataTypes.INTEGER, // Use INTEGER to match User model
//         allowNull: false,
//         references: {
//             model: 'users',
//             key: 'id'
//         }
//     },
//     status: {
//         type: DataTypes.ENUM('pending', 'paid', 'failed', 'completed', 'cancelled'),
//         defaultValue: 'pending'
//     },
//     totalAmount: {
//         type: DataTypes.FLOAT,
//         allowNull: false
//     },
//     paymentIntentId: {
//         type: DataTypes.STRING,
//         allowNull: true
//     },
//     paymentMethod: {
//         type: DataTypes.STRING,
//         allowNull: true
//     },
//     shippingAddress: {
//         type: DataTypes.TEXT,
//         allowNull: true
//     }
// }, {
//     tableName: 'orders',
//     timestamps: true
// });

// Order.associate = (models) => {
//     Order.belongsTo(models.User, {
//         foreignKey: 'userId',
//         as: 'user'
//     });
    
//     Order.hasMany(models.OrderItem, {
//         foreignKey: 'orderId',
//         as: 'items'
//     });
// };

// module.exports = Order;


const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "completed", "cancelled"),
      defaultValue: "pending",
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

module.exports = Order;
