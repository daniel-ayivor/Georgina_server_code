const express = require('express');
const router = express.Router();
const orderItemController = require('../Controllers/orderItemsController');
const { authenticate } = require('../Middleware/Middelware');

// Admin order item management
router.post('/api/admin/order-items', authenticate, orderItemController.createOrderItem);
router.get('/api/admin/order-items', authenticate, orderItemController.getOrderItems);
router.get('/api/admin/order-items/:id', authenticate, orderItemController.getOrderItemById);
router.put('/api/admin/order-items/:id', authenticate, orderItemController.updateOrderItem);
router.delete('/api/admin/order-items/:id', authenticate, orderItemController.deleteOrderItem);

module.exports = router;