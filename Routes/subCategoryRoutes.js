const express = require('express');
const router = express.Router();
const subCategoryController = require('../Controllers/subCategoryController');
const { authenticate, authorizeRoles } = require('../Middleware/Middelware');

router.post('/', authenticate, authorizeRoles('admin'), subCategoryController.createSubCategory);
router.get('/', subCategoryController.getSubCategories);
router.get('/parent/:parentId', subCategoryController.getSubCategoriesByParent);
router.get('/:id', subCategoryController.getSubCategoryById);
router.put('/:id', authenticate, authorizeRoles('admin'), subCategoryController.updateSubCategory);
router.delete('/:id', authenticate, authorizeRoles('admin'), subCategoryController.deleteSubCategory);

module.exports = router; 