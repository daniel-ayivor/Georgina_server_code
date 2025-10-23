const express = require('express');
const router = express.Router();
const multer = require('multer');

const { authenticate, authorizeRoles } = require('../Middleware/Middelware');
const {
    createProducts,
    getProducts,
    getProduct,
    updateProduct,
    rateProduct,
    deletingProduct,
    getTrendingProducts,
    getNewArrivalProducts,
    getFeaturedProducts
} = require('../Controllers/productController');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

/** 
 * 🛒 Public User Routes — No Authentication Required
 */
router.get('/api/products', getProducts);
router.get('/api/products/:productId', getProduct);
router.get('/api/products/trending', getTrendingProducts);
router.get('/api/products/new-arrivals', getNewArrivalProducts);
router.get('/api/products/featured', getFeaturedProducts);

/**
 * 🛠️ Admin Routes — Requires Authentication and Role Check
 */
router.post(
    '/api/admin/products',
    authenticate,
    authorizeRoles('admin'),
    upload.single('image'),
    createProducts
);

router.put(
    '/api/admin/products/:productId',
    authenticate,
    authorizeRoles('admin'),
    upload.single('image'),
    updateProduct
);

router.delete(
    '/api/admin/products/:productId',
    authenticate,
    authorizeRoles('admin'),
    deletingProduct
);
router.put('/api/:id/rate', rateProduct);
module.exports = router;
