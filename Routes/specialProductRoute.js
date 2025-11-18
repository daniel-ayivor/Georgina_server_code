const express = require('express');
const router = express.Router();
const {
    getAdminSpecialProducts,
    getProductsNotInSpecialCategories,
    updateProductSpecialCategories,
    bulkUpdateSpecialCategories
} = require('../Controllers/productController');

const { authenticate, authorizeRoles } = require('../Middleware/Middelware');

// Admin special products routes
router.get(
    '/api/admin/products/special',
    authenticate,
    authorizeRoles('admin'),
    getAdminSpecialProducts
);

router.get(
    '/api/admin/products/special/available',
    authenticate,
    authorizeRoles('admin'),
    getProductsNotInSpecialCategories
);
router.patch(
    '/api/admin/products/special/bulk/update',
    authenticate,
    authorizeRoles('admin'),
    bulkUpdateSpecialCategories
);

router.patch(
    '/api/admin/products/special/:productId',
    authenticate,
    authorizeRoles('admin'),
    updateProductSpecialCategories
);


module.exports = router;