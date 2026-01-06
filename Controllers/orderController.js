const express = require('express');
const User = require('../Models/userModel');
const Product = require('../Models/productModel');
const Order = require('../Models/orderModel');
const OrderItem = require('../Models/orderItemModel'); // Import OrderItem

// Place an order
const purchaseItem = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const user = await User.findByPk(userId);
        const product = await Product.findByPk(productId);

        if (!user || !product) {
            return res.status(404).json({ message: 'User or Product not found' });
        }

        // Calculate total amount
        const totalAmount = parseFloat(product.price) * parseInt(quantity);

        // Create order
        const order = await Order.create({ 
            userId: userId,
            totalAmount: totalAmount,
            status: 'confirmed'
        });

        // Create order item
        const orderItem = await OrderItem.create({
            orderId: order.id,
            productId: productId,
            productName: product.name,
            price: parseFloat(product.price),
            quantity: parseInt(quantity)
        });

        res.status(201).json({ 
            message: 'Purchase successful', 
            order: order,
            orderItem: orderItem
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's purchases - FIXED VERSION
const getUserPurchase = async (req, res) => {
    const { id } = req.params;

    try {
        // Option 1: Get orders with order items and products (using aliases)
        const orders = await Order.findAll({
            where: { userId: id },
            include: [{
                model: OrderItem,
                as: 'items', // Use the alias from Order model
                include: [{
                    model: Product,
                    as: 'product' // Use the alias from OrderItem model
                }]
            }]
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No purchases found for this user' });
        }

        // Extract products from order items
        const products = orders.flatMap(order => 
            order.items.map(item => ({
                ...item.product.toJSON(),
                purchaseDate: order.createdAt,
                quantity: item.quantity,
                orderId: order.id,
                orderStatus: order.status,
                price: item.price,
                total: item.price * item.quantity
            }))
        );

        res.json({
            success: true,
            products: products,
            totalOrders: orders.length
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

module.exports = { getUserPurchase, purchaseItem };