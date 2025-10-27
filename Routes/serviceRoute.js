const express = require('express');
const router = express.Router();
const serviceController = require('../Controllers/serviceController');
const { authenticate, authorizeRoles } = require('../Middleware/Middelware');

// Public routes (no authentication required - for customers)
router.get('/api/admin/services/active', serviceController.getActiveServices);

// Admin only routes
router.post('/api/admin/services', 
  authenticate, 
  authorizeRoles('admin'), 
  serviceController.createService
);

router.get('/api/admin/services', 
  authenticate, 
  authorizeRoles('admin'), 
  serviceController.getServices
);

router.put('/api/admin/services/:id', 
  authenticate, 
  authorizeRoles('admin'), 
  serviceController.updateService
);

router.delete('/api/admin/services/:id', 
  authenticate, 
  authorizeRoles('admin'), 
  serviceController.deleteService
);

module.exports = router;