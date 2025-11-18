


const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../Middleware/Middelware');
const {
    createProducts,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    toggleProductStatus,
    getAdminProducts,
    getAdminProductById,
    getFeaturedProducts,
    getTrendingProducts,
    getNewArrivals,
    updateProductSpecialCategories,
    getAdminSpecialProducts,
    getProductsNotInSpecialCategories,
    bulkUpdateSpecialCategories
} = require('../Controllers/productController');

// Import Cloudinary upload configuration
const { upload } = require('../config/cloudinary');

/** 
 * 🛒 Public User Routes — No Authentication Required
 */
router.get('/api/products', getProducts);
router.get('/api/products/category/:level1', getProductsByCategory);
router.get('/api/products/category/:level1/:level2', getProductsByCategory);
router.get('/api/products/category/:level1/:level2/:level3', getProductsByCategory);
router.get('/api/products/:productId', getProduct);



// Special products routes
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);
router.patch('/:productId/special-categories', updateProductSpecialCategories);


// Admin special products routes
// In your backend routes file
router.get('/admin/products/special', getAdminSpecialProducts);
router.get('/admin/products/special/available', getProductsNotInSpecialCategories);
router.patch('/admin/products/special/:productId', updateProductSpecialCategories);
router.patch('/admin/products/special/bulk/update', bulkUpdateSpecialCategories);
/**
 * 🛠️ Admin Routes — Requires Authentication and Role Check
 */

router.get(
    '/api/admin/products',
    authenticate,
    authorizeRoles('admin'),
    getAdminProducts
);

router.get(
    '/api/admin/products/:productId',
    authenticate,
    authorizeRoles('admin'),
    getAdminProductById
);

router.post(
    '/api/admin/products',
    authenticate,
    authorizeRoles('admin'),
    upload.single('image'), // Use Cloudinary upload instead of local multer
    createProducts
);

router.put(
    '/api/admin/products/:productId',
    authenticate,
    authorizeRoles('admin'),
    upload.single('image'), // Use Cloudinary upload instead of local multer
    updateProduct
);

router.patch(
    '/api/admin/products/:productId/toggle-status',
    authenticate,
    authorizeRoles('admin'),
    toggleProductStatus
);

router.delete(
    '/api/admin/products/:productId',
    authenticate,
    authorizeRoles('admin'),
    deleteProduct
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Too many files uploaded.'
            });
        }
    }
    res.status(400).json({ message: error.message });
});

module.exports = router;