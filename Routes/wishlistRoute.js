// routes/wishlistRoute.js
const express = require('express');
const router = express.Router();

// CORRECT: Import the controller functions
const wishlistController = require('../Controllers/wishListController');

// CORRECT: Route definitions - each route calls a function
router.post('/add', wishlistController.addToWishlist);
router.get('/my-wishlist', wishlistController.getWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);
router.delete('/remove/:productId', wishlistController.removeFromWishlist);
router.delete('/clear', wishlistController.clearWishlist);

// Export the router
module.exports = router;