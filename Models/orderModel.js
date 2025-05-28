const { DataTypes } = require('sequelize');
const sequelize = require('../Database/database');
const User = require('../Models/userModel');
const Product = require('../Models/productModel');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending'
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    paymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true
});


User.belongsToMany(Product, { through: Order });
Product.belongsToMany(User, { through: Order });

// Optional: Order can belong to both User and Product
Order.belongsTo(User);
Order.belongsTo(Product);


module.exports = Order;
