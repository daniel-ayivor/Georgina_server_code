const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database");

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "completed", "cancelled"),
      defaultValue: "pending",
    },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    paymentIntentId: { type: DataTypes.STRING, allowNull: true },
    paymentMethod: { type: DataTypes.STRING, allowNull: true },
    shippingAddress: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "orders", timestamps: true }
);

Order.associate = (models) => {
  Order.belongsTo(models.User, { as: "customer", foreignKey: "userId" });
};

module.exports = Order;
