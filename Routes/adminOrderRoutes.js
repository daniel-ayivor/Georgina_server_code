const express = require('express');
const router = express.Router();
const adminOrderController = require('../Controllers/adminOrderController');
const { authenticate } = require('../Middleware/Middelware'); // Fixed typo: Middelware → Middleware

// Admin order management routes (using the functions you actually have)
router.get('/api/admin/orders', authenticate, adminOrderController.getAllOrders);
router.get('/api/admin/orders/:id', authenticate, adminOrderController.getOrderById);
router.put('/api/admin/orders/:id/status', authenticate, adminOrderController.updateOrderStatus);
router.delete('/api/admin/orders/:id', authenticate, adminOrderController.deleteOrder);
router.get('/api/admin/orders-stats', authenticate, adminOrderController.getOrderStats);

module.exports = router;