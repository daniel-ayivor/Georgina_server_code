const express = require('express');
const router = express.Router();
const customerController = require('../Controllers/customerController');
const { authenticate, authorizeRoles } = require('../Middleware/Middelware');

router.post('/api/customers', authenticate, authorizeRoles('admin'), customerController.createCustomer);
router.get('/api/customers', authenticate, customerController.getCustomers);
router.get('/api/customers/:id', authenticate, customerController.getCustomerById);
router.put('/api/customers/:id', authenticate, authorizeRoles('admin'), customerController.updateCustomer);
router.delete('/api/customers/:id', authenticate, authorizeRoles('admin'), customerController.deleteCustomer);

module.exports = router; 