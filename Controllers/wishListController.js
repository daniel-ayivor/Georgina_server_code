// controllers/wishlistController.js
const Wishlist = require("../Models/wishlist");
const Product = require("../Models/productModel");

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = 1; // For testing

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      where: { userId, productId }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'Product already in wishlist' 
      });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      productId
    });

    res.status(201).json({ 
      message: 'Added to wishlist',
      wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ 
      message: 'Error adding to wishlist',
      error: error.message 
    });
  }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = 1; // For testing

    // Get wishlist items
    const wishlistItems = await Wishlist.findAll({
      where: { userId }
    });

    // Get product details
    const productIds = wishlistItems.map(item => item.productId);
    const products = await Product.findAll({
      where: {
        id: productIds,
        isActive: true
      }
    });

    // Match products with wishlist info
    const wishlistProducts = products.map(product => {
      const wishlistItem = wishlistItems.find(item => item.productId === product.id);
      return {
        ...product.toJSON(),
        addedAt: wishlistItem.createdAt,
        wishlistId: wishlistItem.id
      };
    });

    res.status(200).json({ 
      products: wishlistProducts,
      count: wishlistProducts.length,
      message: 'Wishlist retrieved'
    });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ 
      message: 'Error getting wishlist',
      error: error.message 
    });
  }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = 1; // For testing

    const wishlistItem = await Wishlist.findOne({
      where: { userId, productId }
    });

    res.status(200).json({ 
      inWishlist: !!wishlistItem,
      message: 'Wishlist status checked'
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ 
      message: 'Error checking wishlist',
      error: error.message 
    });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = 1; // For testing

    const result = await Wishlist.destroy({
      where: { userId, productId }
    });

    if (result === 0) {
      return res.status(404).json({ 
        message: 'Product not found in wishlist' 
      });
    }

    res.status(200).json({ 
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ 
      message: 'Error removing from wishlist',
      error: error.message 
    });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = 1; // For testing

    const deletedCount = await Wishlist.destroy({
      where: { userId }
    });

    res.status(200).json({ 
      message: 'Wishlist cleared',
      deletedCount
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ 
      message: 'Error clearing wishlist',
      error: error.message 
    });
  }
};

// Make sure you're exporting functions, not objects
module.exports = {
  addToWishlist,
  getWishlist,
  checkWishlist,
  removeFromWishlist,
  clearWishlist
};