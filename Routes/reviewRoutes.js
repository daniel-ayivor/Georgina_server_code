const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../Middleware/Middelware');
const {
  createReview,
  getProductReviews,
  markReviewHelpful,
  replyToReview,
  getUserReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview
} = require('../Controllers/reviewController');

// Public: list reviews for a product
router.get('/api/products/:productId/reviews', getProductReviews);

// Authenticated user: create a review
router.post('/api/products/:productId/reviews', authenticate, createReview);

// Authenticated user: mark a review as helpful
router.post('/api/reviews/:reviewId/helpful', authenticate, markReviewHelpful);

// Authenticated user: list their own reviews
router.get('/api/users/:userId/reviews', authenticate, getUserReviews);

// Admin: reply to a review
router.post(
  '/api/reviews/:reviewId/reply',
  authenticate,
  authorizeRoles('admin'),
  replyToReview
);

// Admin: get/manage all reviews
router.get(
  '/api/admin/reviews',
  authenticate,
  authorizeRoles('admin'),
  getAllReviews
);
router.patch(
  '/api/admin/reviews/:reviewId/status',
  authenticate,
  authorizeRoles('admin'),
  updateReviewStatus
);
router.delete(
  '/api/admin/reviews/:reviewId',
  authenticate,
  authorizeRoles('admin'),
  deleteReview
);

module.exports = router;

