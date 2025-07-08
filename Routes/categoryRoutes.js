const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');
const { authenticate, authorizeRoles } = require('../Middleware/Middelware');

router.post('/', authenticate, authorizeRoles('admin'), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', authenticate, authorizeRoles('admin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router; 