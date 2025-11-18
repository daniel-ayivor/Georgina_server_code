const express = require('express');
const router = express.Router();
const {
    getAdminSpecialProducts,
    getProductsNotInSpecialCategories,
    updateProductSpecialCategories,
    bulkUpdateSpecialCategories
} = require('../Controllers/productController');

const { authenticate, authorizeRoles } = require('../middleware/auth');

// Admin special products routes
router.get(
    '/admin/products/special',
    authenticate,
    authorizeRoles('admin'),
    getAdminSpecialProducts
);

router.get(
    '/admin/products/special/available',
    authenticate,
    authorizeRoles('admin'),
    getProductsNotInSpecialCategories
);

router.patch(
    '/admin/products/special/:productId',
    authenticate,
    authorizeRoles('admin'),
    updateProductSpecialCategories
);

router.patch(
    '/admin/products/special/bulk/update',
    authenticate,
    authorizeRoles('admin'),
    bulkUpdateSpecialCategories
);

module.exports = router;