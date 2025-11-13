const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database");
const Order = require("../Models/orderModel"); // Import the Order model

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: { msg: "Please enter a valid email" },
        len: { args: [5, 150], msg: "Email must be between 5 to 150 characters" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
    indexes: [
      {
        unique: true,
        fields: ["email"],
        name: "unique_email_index",
      },
    ],
  }
);

// Associations
User.hasMany(Order, { as: "orders", foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = User;
