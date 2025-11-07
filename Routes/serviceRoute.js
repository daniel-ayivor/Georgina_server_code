// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getActiveServices,
  getServiceById,
  updateService,
  updateServiceStatus,
  deleteService,
  reorderServices,
  getServiceStats
} = require('../Controllers/serviceController');
const { authenticate, authorizeRoles } = require('../Middleware/Middelware');

// =============================================
// PUBLIC ROUTES (No authentication required)
// For customers browsing services on frontend

// =============================================
// PUBLIC ROUTES (No authentication required)
// For customers browsing services on frontend
// =============================================

// Get all active services for customers
router.get('/api/services/active', getActiveServices);

// Get specific service by ID (public)
router.get('/api/services/:id', getServiceById);

// =============================================
router.get('/api/admin/services/active', getActiveServices);

// =============================================
// ADMIN ONLY ROUTES (Authentication + Admin role required)
// For admin panel management
// =============================================

// Create new service
router.post('/api/admin/services', 
  authenticate, 
  authorizeRoles('admin'), 
  createService
);

// Get all services with filtering/pagination
router.get('/api/admin/services', 
  authenticate, 
  authorizeRoles('admin'), 
  getServices
);

// Get service statistics
router.get('/api/admin/services/stats', 
  authenticate, 
  authorizeRoles('admin'), 
  getServiceStats
);

// Get specific service by ID
router.get('/api/admin/services/:id', 
  authenticate, 
  authorizeRoles('admin'), 
  getServiceById
);

// Update service details
router.put('/api/admin/services/:id', 
  authenticate, 
  authorizeRoles('admin'), 
  updateService
);

// Update service status (activate/deactivate)
router.patch('/api/admin/services/:id/status', 
  authenticate, 
  authorizeRoles('admin'), 
  updateServiceStatus
);

// Delete service (soft delete)
router.delete('/api/admin/services/:id', 
  authenticate, 
  authorizeRoles('admin'), 
  deleteService
);

// Reorder services display
router.patch('/api/admin/services/reorder', 
  authenticate, 
  authorizeRoles('admin'), 
  reorderServices
);

module.exports = router;