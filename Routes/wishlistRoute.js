// routes/wishlistRoute.js
const express = require('express');
const router = express.Router();

// CORRECT: Import the controller functions
const wishlistController = require('../Controllers/wishListController');

// CORRECT: Route definitions - each route calls a function
router.post('/api/wishlist/add', wishlistController.addToWishlist);
router.get('/api/wishlist/my-wishlist', wishlistController.getWishlist);
router.get('/api/wishlist/check/:productId', wishlistController.checkWishlist);
router.delete('/api/wishlist/remove/:productId', wishlistController.removeFromWishlist);
router.delete('/api/wishlist/clear', wishlistController.clearWishlist);

// Export the router
module.exports = router;