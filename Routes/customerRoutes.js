const express = require('express');
const router = express.Router();
const customerController = require('../Controllers/customerController');
const { authenticate, authorizeRoles } = require('../Middleware/Middelware');

router.post('/', authenticate, authorizeRoles('admin'), customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', authenticate, authorizeRoles('admin'), customerController.updateCustomer);
router.delete('/:id', authenticate, authorizeRoles('admin'), customerController.deleteCustomer);

module.exports = router; 