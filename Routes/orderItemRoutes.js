const express = require('express');
const router = express.Router();
const orderItemController = require('../Controllers/orderItemController');
const { authenticate } = require('../Middleware/Middelware');

router.post('/', authenticate, orderItemController.createOrderItem);
router.get('/', authenticate, orderItemController.getOrderItems);
router.get('/:id', authenticate, orderItemController.getOrderItemById);
router.put('/:id', authenticate, orderItemController.updateOrderItem);
router.delete('/:id', authenticate, orderItemController.deleteOrderItem);

module.exports = router; 