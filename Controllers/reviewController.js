// const Review = require("../Models/reviewModel");
// const Product = require("../Models/productModel");
// const sequelize = require("../Database/database");
// const { Op } = require('sequelize');

// // Helper function to update product rating stats
// const updateProductRatingStats = async (productId) => {
//   try {
//     const reviews = await Review.findAll({
//       where: { 
//         productId,
//         isApproved: true 
//       }
//     });

//     if (reviews.length > 0) {
//       const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
//       const averageRating = totalRating / reviews.length;
      
//       await Product.update(
//         {
//           averageRating: parseFloat(averageRating.toFixed(1)),
//           totalReviews: reviews.length
//         },
//         { where: { id: productId } }
//       );
//     } else {
//       await Product.update(
//         {
//           averageRating: 0,
//           totalReviews: 0
//         },
//         { where: { id: productId } }
//       );
//     }
//   } catch (error) {
//     console.error('Error updating product rating stats:', error);
//   }
// };

// // Create Review
// const createReview = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const {
//       userId,
//       userName,
//       userEmail,
//       rating,
//       title,
//       comment,
//       verifiedPurchase = false
//     } = req.body;

//     // Validation
//     if (!userId || !userName || !rating || !comment) {
//       return res.status(400).json({
//         message: 'userId, userName, rating, and comment are required'
//       });
//     }

//     // Check if product exists
//     const product = await Product.findByPk(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // Check if user already reviewed this product
//     const existingReview = await Review.findOne({
//       where: {
//         productId,
//         userId
//       }
//     });

//     if (existingReview) {
//       return res.status(400).json({
//         message: 'You have already reviewed this product'
//       });
//     }

//     // Create review
//     const review = await Review.create({
//       productId,
//       userId,
//       userName,
//       userEmail,
//       rating: parseInt(rating),
//       title,
//       comment,
//       verifiedPurchase,
//       isApproved: true // Auto-approve for now, can be moderated
//     });

//     // Update product rating stats
//     await updateProductRatingStats(productId);

//     // Get updated product with stats
//     const updatedProduct = await Product.findByPk(productId);

//     res.status(201).json({
//       message: 'Review submitted successfully',
//       review,
//       productStats: {
//         averageRating: updatedProduct.averageRating,
//         totalReviews: updatedProduct.totalReviews
//       }
//     });
//   } catch (error) {
//     console.error('Error creating review:', error);
//     res.status(500).json({
//       message: 'Error creating review',
//       error: error.message
//     });
//   }
// };

// // Get Product Reviews
// const getProductReviews = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { 
//       page = 1, 
//       limit = 10, 
//       sort = 'newest',
//       rating,
//       verified
//     } = req.query;

//     const pageSize = parseInt(limit);
//     const offset = (parseInt(page) - 1) * pageSize;

//     // Check if product exists
//     const product = await Product.findByPk(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     let whereClause = { productId, isApproved: true };
//     let order = [];

//     // Filter by rating
//     if (rating) {
//       whereClause.rating = parseInt(rating);
//     }

//     // Filter by verified purchase
//     if (verified === 'true') {
//       whereClause.verifiedPurchase = true;
//     }

//     // Sorting
//     switch (sort) {
//       case 'helpful':
//         order = [['helpfulCount', 'DESC'], ['createdAt', 'DESC']];
//         break;
//       case 'rating_high':
//         order = [['rating', 'DESC'], ['createdAt', 'DESC']];
//         break;
//       case 'rating_low':
//         order = [['rating', 'ASC'], ['createdAt', 'DESC']];
//         break;
//       default: // 'newest'
//         order = [['createdAt', 'DESC']];
//     }

//     const { count, rows: reviews } = await Review.findAndCountAll({
//       where: whereClause,
//       order,
//       limit: pageSize,
//       offset
//     });

//     // Calculate rating distribution
//     const ratingDistribution = {};
//     for (let i = 1; i <= 5; i++) {
//       const count = await Review.count({
//         where: { ...whereClause, rating: i }
//       });
//       ratingDistribution[i] = count;
//     }

//     // Get average rating
//     const avgRating = await Review.findOne({
//       where: whereClause,
//       attributes: [
//         [sequelize.fn('AVG', sequelize.col('rating')), 'average']
//       ],
//       raw: true
//     });

//     res.status(200).json({
//       reviews,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(count / pageSize),
//         totalReviews: count,
//         hasNext: (offset + pageSize) < count,
//         hasPrev: parseInt(page) > 1
//       },
//       stats: {
//         averageRating: avgRating ? parseFloat(avgRating.average).toFixed(1) : '0.0',
//         ratingDistribution,
//         totalReviews: count
//       },
//       message: 'Reviews retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Error getting product reviews:', error);
//     res.status(500).json({
//       message: 'Error retrieving reviews',
//       error: error.message
//     });
//   }
// };

// // Update Review Helpful Count
// const markReviewHelpful = async (req, res) => {
//   try {
//     const { reviewId } = req.params;

//     const review = await Review.findByPk(reviewId);
//     if (!review) {
//       return res.status(404).json({ message: 'Review not found' });
//     }

//     // Increment helpful count
//     await review.update({
//       helpfulCount: review.helpfulCount + 1
//     });

//     res.status(200).json({
//       message: 'Review marked as helpful',
//       helpfulCount: review.helpfulCount
//     });
//   } catch (error) {
//     console.error('Error marking review helpful:', error);
//     res.status(500).json({
//       message: 'Error marking review as helpful',
//       error: error.message
//     });
//   }
// };

// // Reply to Review (Admin/Store Owner)
// const replyToReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const { reply } = req.body;

//     if (!reply) {
//       return res.status(400).json({ message: 'Reply content is required' });
//     }

//     const review = await Review.findByPk(reviewId);
//     if (!review) {
//       return res.status(404).json({ message: 'Review not found' });
//     }

//     await review.update({
//       reply,
//       repliedAt: new Date()
//     });

//     res.status(200).json({
//       message: 'Reply added successfully',
//       review
//     });
//   } catch (error) {
//     console.error('Error replying to review:', error);
//     res.status(500).json({
//       message: 'Error adding reply',
//       error: error.message
//     });
//   }
// };

// // Get User Reviews
// const getUserReviews = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     const pageSize = parseInt(limit);
//     const offset = (parseInt(page) - 1) * pageSize;

//     const { count, rows: reviews } = await Review.findAndCountAll({
//       where: { userId },
//       include: [{
//         model: Product,
//         attributes: ['id', 'name', 'slug', 'images']
//       }],
//       order: [['createdAt', 'DESC']],
//       limit: pageSize,
//       offset
//     });

//     res.status(200).json({
//       reviews,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(count / pageSize),
//         totalReviews: count,
//         hasNext: (offset + pageSize) < count,
//         hasPrev: parseInt(page) > 1
//       },
//       message: 'User reviews retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Error getting user reviews:', error);
//     res.status(500).json({
//       message: 'Error retrieving user reviews',
//       error: error.message
//     });
//   }
// };

// // Admin: Get All Reviews (with filtering)
// const getAllReviews = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 20,
//       productId,
//       userId,
//       rating,
//       isApproved,
//       verifiedPurchase,
//       search
//     } = req.query;

//     const pageSize = parseInt(limit);
//     const offset = (parseInt(page) - 1) * pageSize;

//     let whereClause = {};

//     if (productId) whereClause.productId = productId;
//     if (userId) whereClause.userId = userId;
//     if (rating) whereClause.rating = parseInt(rating);
//     if (isApproved !== undefined) whereClause.isApproved = isApproved === 'true';
//     if (verifiedPurchase !== undefined) whereClause.verifiedPurchase = verifiedPurchase === 'true';

//     if (search) {
//       whereClause[Op.or] = [
//         { userName: { [Op.like]: `%${search}%` } },
//         { userEmail: { [Op.like]: `%${search}%` } },
//         { comment: { [Op.like]: `%${search}%` } },
//         { title: { [Op.like]: `%${search}%` } }
//       ];
//     }

//     const { count, rows: reviews } = await Review.findAndCountAll({
//       where: whereClause,
//       include: [{
//         model: Product,
//         attributes: ['id', 'name', 'slug']
//       }],
//       order: [['createdAt', 'DESC']],
//       limit: pageSize,
//       offset
//     });

//     // Get stats
//     const stats = {
//       totalReviews: await Review.count(),
//       approvedReviews: await Review.count({ where: { isApproved: true } }),
//       pendingReviews: await Review.count({ where: { isApproved: false } }),
//       averageRating: await Review.findOne({
//         attributes: [
//           [sequelize.fn('AVG', sequelize.col('rating')), 'average']
//         ],
//         raw: true
//       })
//     };

//     res.status(200).json({
//       reviews,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(count / pageSize),
//         totalReviews: count,
//         hasNext: (offset + pageSize) < count,
//         hasPrev: parseInt(page) > 1
//       },
//       stats,
//       message: 'All reviews retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Error getting all reviews:', error);
//     res.status(500).json({
//       message: 'Error retrieving reviews',
//       error: error.message
//     });
//   }
// };

// // Admin: Update Review Status
// const updateReviewStatus = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const { isApproved } = req.body;

//     const review = await Review.findByPk(reviewId);
//     if (!review) {
//       return res.status(404).json({ message: 'Review not found' });
//     }

//     const previousStatus = review.isApproved;
//     await review.update({ isApproved });

//     // Update product rating stats if approval status changed
//     if (previousStatus !== isApproved) {
//       await updateProductRatingStats(review.productId);
//     }

//     res.status(200).json({
//       message: `Review ${isApproved ? 'approved' : 'disapproved'} successfully`,
//       review
//     });
//   } catch (error) {
//     console.error('Error updating review status:', error);
//     res.status(500).json({
//       message: 'Error updating review status',
//       error: error.message
//     });
//   }
// };

// // Delete Review
// const deleteReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;

//     const review = await Review.findByPk(reviewId);
//     if (!review) {
//       return res.status(404).json({ message: 'Review not found' });
//     }

//     const productId = review.productId;
//     await review.destroy();

//     // Update product rating stats
//     await updateProductRatingStats(productId);

//     res.status(200).json({
//       message: 'Review deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting review:', error);
//     res.status(500).json({
//       message: 'Error deleting review',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   createReview,
//   getProductReviews,
//   markReviewHelpful,
//   replyToReview,
//   getUserReviews,
//   getAllReviews,
//   updateReviewStatus,
//   deleteReview
// };

const Review = require("../Models/reviewModel");
const Product = require("../Models/productModel");
const User = require("../Models/userModel"); // Add User model import
const sequelize = require("../Database/database");
const { Op } = require('sequelize');

// Helper function to update product rating stats
const updateProductRatingStats = async (productId) => {
  try {
    const reviews = await Review.findAll({
      where: { 
        productId,
        isApproved: true 
      }
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Product.update(
        {
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalReviews: reviews.length
        },
        { where: { id: productId } }
      );
    } else {
      await Product.update(
        {
          averageRating: 0,
          totalReviews: 0
        },
        { where: { id: productId } }
      );
    }
  } catch (error) {
    console.error('Error updating product rating stats:', error);
  }
};

// Create Review
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      verifiedPurchase = false
    } = req.body;

    // Validation
    if (!userId || !userName || !rating || !comment) {
      return res.status(400).json({
        message: 'userId, userName, rating, and comment are required'
      });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: {
        productId,
        userId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await Review.create({
      productId,
      userId,
      userName,
      userEmail,
      rating: parseInt(rating),
      title,
      comment,
      verifiedPurchase,
      isApproved: true // Auto-approve for now, can be moderated
    });

    // Update product rating stats
    await updateProductRatingStats(productId);

    // Get updated product with stats
    const updatedProduct = await Product.findByPk(productId);

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
      productStats: {
        averageRating: updatedProduct.averageRating,
        totalReviews: updatedProduct.totalReviews
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      message: 'Error creating review',
      error: error.message
    });
  }
};

// Get Product Reviews
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sort = 'newest',
      rating,
      verified
    } = req.query;

    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let whereClause = { productId, isApproved: true };
    let order = [];

    // Filter by rating
    if (rating) {
      whereClause.rating = parseInt(rating);
    }

    // Filter by verified purchase
    if (verified === 'true') {
      whereClause.verifiedPurchase = true;
    }

    // Sorting
    switch (sort) {
      case 'helpful':
        order = [['helpfulCount', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'rating_high':
        order = [['rating', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'rating_low':
        order = [['rating', 'ASC'], ['createdAt', 'DESC']];
        break;
      default: // 'newest'
        order = [['createdAt', 'DESC']];
    }

    // FIXED: Use 'as: "product"' as defined in the association
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [{
        model: Product,
        as: 'product', // Use the alias defined in the association
        attributes: ['id', 'name', 'slug', 'images']
      }],
      order,
      limit: pageSize,
      offset
    });

    // Calculate rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      const count = await Review.count({
        where: { ...whereClause, rating: i }
      });
      ratingDistribution[i] = count;
    }

    // Get average rating
    const avgRating = await Review.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average']
      ],
      raw: true
    });

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / pageSize),
        totalReviews: count,
        hasNext: (offset + pageSize) < count,
        hasPrev: parseInt(page) > 1
      },
      stats: {
        averageRating: avgRating ? parseFloat(avgRating.average).toFixed(1) : '0.0',
        ratingDistribution,
        totalReviews: count
      },
      message: 'Reviews retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting product reviews:', error);
    res.status(500).json({
      message: 'Error retrieving reviews',
      error: error.message
    });
  }
};

// Update Review Helpful Count
const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Increment helpful count
    await review.update({
      helpfulCount: review.helpfulCount + 1
    });

    res.status(200).json({
      message: 'Review marked as helpful',
      helpfulCount: review.helpfulCount
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
};

// Reply to Review (Admin/Store Owner)
const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.update({
      reply,
      repliedAt: new Date()
    });

    res.status(200).json({
      message: 'Reply added successfully',
      review
    });
  } catch (error) {
    console.error('Error replying to review:', error);
    res.status(500).json({
      message: 'Error adding reply',
      error: error.message
    });
  }
};

// Get User Reviews
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;

    // FIXED: Use 'as: "product"' as defined in the association
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product', // Use the alias defined in the association
        attributes: ['id', 'name', 'slug', 'images']
      }],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset
    });

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / pageSize),
        totalReviews: count,
        hasNext: (offset + pageSize) < count,
        hasPrev: parseInt(page) > 1
      },
      message: 'User reviews retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      message: 'Error retrieving user reviews',
      error: error.message
    });
  }
};

// Admin: Get All Reviews (with filtering)
const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      userId,
      rating,
      isApproved,
      verifiedPurchase,
      search
    } = req.query;

    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;

    let whereClause = {};

    if (productId) whereClause.productId = productId;
    if (userId) whereClause.userId = userId;
    if (rating) whereClause.rating = parseInt(rating);
    if (isApproved !== undefined) whereClause.isApproved = isApproved === 'true';
    if (verifiedPurchase !== undefined) whereClause.verifiedPurchase = verifiedPurchase === 'true';

    if (search) {
      whereClause[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { userEmail: { [Op.like]: `%${search}%` } },
        { comment: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } }
      ];
    }

    // FIXED: Use 'as: "product"' as defined in the association
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [{
        model: Product,
        as: 'product', // Use the alias defined in the association
        attributes: ['id', 'name', 'slug', 'categoryLevel1']
      }],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset
    });

    // Get stats
    const stats = {
      totalReviews: await Review.count(),
      approvedReviews: await Review.count({ where: { isApproved: true } }),
      pendingReviews: await Review.count({ where: { isApproved: false } }),
      averageRating: await Review.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'average']
        ],
        raw: true
      })
    };

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / pageSize),
        totalReviews: count,
        hasNext: (offset + pageSize) < count,
        hasPrev: parseInt(page) > 1
      },
      stats,
      message: 'All reviews retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({
      message: 'Error retrieving reviews',
      error: error.message
    });
  }
};

// Admin: Update Review Status
const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const previousStatus = review.isApproved;
    await review.update({ isApproved });

    // Update product rating stats if approval status changed
    if (previousStatus !== isApproved) {
      await updateProductRatingStats(review.productId);
    }

    res.status(200).json({
      message: `Review ${isApproved ? 'approved' : 'disapproved'} successfully`,
      review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      message: 'Error updating review status',
      error: error.message
    });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.productId;
    await review.destroy();

    // Update product rating stats
    await updateProductRatingStats(productId);

    res.status(200).json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      message: 'Error deleting review',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  markReviewHelpful,
  replyToReview,
  getUserReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview
};