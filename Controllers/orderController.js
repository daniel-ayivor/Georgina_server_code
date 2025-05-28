const express = require('express');
const User = require('../Models/userModel');
const Product = require('../Models/productModel');
const Order = require('../Models/orderModel');

// Place an order
const purchaseItem= async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const user = await User.findByPk(userId);
        const product = await Product.findByPk(productId);

        if (!user || !product) {
            return res.status(404).json({ message: 'User or Product not found' });
        }

        // Create order (link User to Product)
        const order = await Order.create({ 
            UserId: userId, 
            ProductId: productId, 
            quantity 
        });

        res.status(201).json({ message: 'Purchase successful', order });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's purchases
const getUserPurchase= async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id, {
            include: Product
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.Products);  // All products linked to this user
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {getUserPurchase, purchaseItem};
