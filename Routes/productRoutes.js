// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const { authenticate, authorizeRoles } = require('../Middleware/Middelware');
// const {
//     createProducts,
//     getProducts,
//     getProduct,
//     updateProduct,
//     deleteProduct,
//     getProductsByCategory,
//     toggleProductStatus,
//     getAdminProducts,
//     getAdminProductById
// } = require('../Controllers/productController');

// // Ensure upload directory exists
// const uploadDir = path.join(__dirname, '../uploads/products');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log('Created uploads/products directory');
// }

// // Enhanced Multer configuration for multiple images support
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadPath = path.join(__dirname, '../uploads/products');
        
//         // Create directory if it doesn't exist
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }
        
//         cb(null, uploadPath);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only image files are allowed!'), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // 5MB limit
//     }
// });

// /** 
//  * 🛒 Public User Routes — No Authentication Required
//  */
// router.get('/api/products', getProducts);
// router.get('/api/products/category/:level1', getProductsByCategory);
// router.get('/api/products/category/:level1/:level2', getProductsByCategory);
// router.get('/api/products/category/:level1/:level2/:level3', getProductsByCategory);
// router.get('/api/products/:productId', getProduct);

// /**
//  * 🛠️ Admin Routes — Requires Authentication and Role Check
//  */

// router.get(
//     '/api/admin/products',
//     authenticate,
//     authorizeRoles('admin'),
//     getAdminProducts
// );

// router.get(
//     '/api/admin/products/:productId',
//     authenticate,
//     authorizeRoles('admin'),
//     getAdminProductById
// );

// router.post(
//     '/api/admin/products',
//     authenticate,
//     authorizeRoles('admin'),
//     upload.single('image'),
//     createProducts
// );

// router.put(
//     '/api/admin/products/:productId',
//     authenticate,
//     authorizeRoles('admin'),
//     upload.single('image'),
//     updateProduct
// );

// router.patch(
//     '/api/admin/products/:productId/toggle-status',
//     authenticate,
//     authorizeRoles('admin'),
//     toggleProductStatus
// );

// router.delete(
//     '/api/admin/products/:productId',
//     authenticate,
//     authorizeRoles('admin'),
//     deleteProduct
// );

// // Error handling middleware for multer
// router.use((error, req, res, next) => {
//     if (error instanceof multer.MulterError) {
//         if (error.code === 'LIMIT_FILE_SIZE') {
//             return res.status(400).json({
//                 message: 'File too large. Maximum size is 5MB.'
//             });
//         }
//         if (error.code === 'LIMIT_FILE_COUNT') {
//             return res.status(400).json({
//                 message: 'Too many files uploaded.'
//             });
//         }
//     }
//     res.status(400).json({ message: error.message });
// });

// module.exports = router;


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
    getAdminProductById
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