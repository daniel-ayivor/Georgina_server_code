const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../Middleware/Middelware');
const {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryTree,
  updateCategory,
  deleteCategory,
  bulkCreateCategories,
  getCategoriesByLevel,
  getSubcategories
} = require('../Controllers/categoryController');

/**
 * 🌳 Public Category Routes — No Authentication Required
 */

// Get all categories with optional filtering
router.get('/api/categories', getCategories);

// Get category by ID
router.get('/api/categories/:id', getCategoryById);

// Get complete category tree (hierarchical structure)
router.get('/api/categories-tree', getCategoryTree);

// Get categories by level
router.get('/api/categories/level/:level', getCategoriesByLevel);

// Get subcategories by parent ID
router.get('/api/categories/parent/:parentId/children', getSubcategories);

/**
 * 🛠️ Admin Category Routes — Requires Authentication and Admin Role
 */

// Create new category
router.post(
  '/api/admin/categories',
  authenticate,
  authorizeRoles('admin'),
  createCategory
);

// Update category
router.put(
  '/api/admin/categories/:id',
  authenticate,
  authorizeRoles('admin'),
  updateCategory
);

// Delete category
router.delete(
  '/api/admin/categories/:id',
  authenticate,
  authorizeRoles('admin'),
  deleteCategory
);

// Bulk create categories (for initial setup)
router.post(
  '/api/admin/categories/bulk',
  authenticate,
  authorizeRoles('admin'),
  bulkCreateCategories
);

/**
 * 🔍 Additional Utility Routes
 */

// Get categories by parent (alias for subcategories)
router.get('/api/categories/parent/:parentId', (req, res, next) => {
  req.params.parentId = req.params.parentId;
  next();
}, getSubcategories);

// Get children of specific category
router.get('/api/categories/:id/children', async (req, res, next) => {
  req.params.parentId = req.params.id;
  next();
}, getSubcategories);

module.exports = router;