const Product = require("../Models/productModel");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { Op } = require('sequelize');

// Helper function to generate slug
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Controllers/productController.js
const createProducts = async (req, res) => {
  try {
    const {
      isFeatured,
      isTrending,
      isNewArrival,
      featuredOrder,
      trendingOrder,
      newArrivalOrder,
      name,
      description,
      price,
      categoryLevel1,
      categoryLevel2,
      categoryLevel3,
      wishList,
      size,
      serviceType,
      serviceDuration,
      unit,
      stock,
      tags,
      brand,
      isActive
    } = req.body;

    // Validation
    if (!name || !price || !categoryLevel1) {
      return res.status(400).json({ 
        message: 'Name, price, and categoryLevel1 are required' 
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Cloudinary provides the file URL in file.path
    const imageUrl = file.path;
    
    // Generate slug from name
    const slug = generateSlug(name);
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ where: { slug } });
    if (existingProduct) {
      // If product exists, delete the uploaded image from Cloudinary
      try {
        const publicId = extractPublicIdFromUrl(imageUrl);
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
      return res.status(400).json({ 
        message: 'Product with similar name already exists' 
      });
    }

    // Handle tags
    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    const product = await Product.create({
          isFeatured: isFeatured === 'true' || isFeatured === true,
      isTrending: isTrending === 'true' || isTrending === true,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      featuredOrder: featuredOrder ? parseInt(featuredOrder) : 0,
      trendingOrder: trendingOrder ? parseInt(trendingOrder) : 0,
      newArrivalOrder: newArrivalOrder ? parseInt(newArrivalOrder) : 0,
      name,
      slug,
      wishList: wishList === 'true' || wishList === true,
      size: size || null,
      description: description || null,
      price: parseFloat(price),
      categoryLevel1,
      categoryLevel2: categoryLevel2 || null,
      categoryLevel3: categoryLevel3 || null,
      serviceType: serviceType || 'physical',
      serviceDuration: serviceDuration || null,
      unit: unit || 'piece',
      stock: stock ? parseInt(stock) : 0,
      images: [imageUrl], // Store Cloudinary URL as array
      tags: tagsArray,
      brand: brand || null,
      isActive: isActive !== undefined ? isActive === 'true' : true
    });

    res.status(201).json({ 
      message: 'Product created successfully', 
      product 
    });
  } catch (error) {
    // If error occurs, delete the uploaded image from Cloudinary
    if (req.file && req.file.path) {
      try {
        const publicId = extractPublicIdFromUrl(req.file.path);
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
    }
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Error creating product', 
      error: error.message 
    });
  }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return matches ? matches[1] : null;
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If new image is uploaded, handle image update with Cloudinary
    if (req.file) {
      const newImageUrl = req.file.path; // Cloudinary URL (no need to replace backslashes)
      
      // Delete old images from Cloudinary if they exist
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        for (const oldImageUrl of product.images) {
          try {
            const publicId = extractPublicIdFromUrl(oldImageUrl);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          } catch (deleteError) {
            console.error('Error deleting old image from Cloudinary:', deleteError);
            // Continue with update even if deletion fails
          }
        }
      }
      
      req.body.images = [newImageUrl]; // Update images array with Cloudinary URL
    }

    // Generate new slug if name is being updated
    if (req.body.name && req.body.name !== product.name) {
      req.body.slug = generateSlug(req.body.name);
      
      const existingProduct = await Product.findOne({ 
        where: { 
          slug: req.body.slug,
          id: { [Op.ne]: productId }
        } 
      });
      
      if (existingProduct) {
        if (req.file) {
          // Delete the newly uploaded image from Cloudinary
          try {
            const publicId = extractPublicIdFromUrl(req.file.path);
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.error('Error deleting image from Cloudinary:', deleteError);
          }
        }
        return res.status(400).json({ 
          message: 'Product with similar name already exists' 
        });
      }
    }

    // Convert data types
    if (req.body.price) req.body.price = parseFloat(req.body.price);
    if (req.body.stock) req.body.stock = parseInt(req.body.stock);
    if (req.body.tags) {
      req.body.tags = typeof req.body.tags === 'string' ? 
        JSON.parse(req.body.tags) : req.body.tags;
    }
    if (req.body.isActive !== undefined) {
      req.body.isActive = req.body.isActive === 'true';
    }

    await product.update(req.body);
    
    res.status(200).json({ 
      product, 
      message: "Product updated successfully" 
    });
  } catch (error) {
    // If error occurs, delete the newly uploaded image from Cloudinary
    if (req.file && req.file.path) {
      try {
        const publicId = extractPublicIdFromUrl(req.file.path);
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
    }
    console.error("Error updating product:", error);
    res.status(500).json({ 
      error: "Error updating product",
      message: error.message 
    });
  }
};

// Helper function to extract public_id from Cloudinary URL

// Get All Products with advanced filtering
const getProducts = async (req, res) => {
    try {
        const { 
            categoryLevel1, 
            categoryLevel2, 
            categoryLevel3, 
            serviceType, 
            isActive,
            search,
            minPrice,
            maxPrice,
            brand
        } = req.query;
        
        let whereClause = {};
        
        // Category filtering
        if (categoryLevel1) whereClause.categoryLevel1 = categoryLevel1;
        if (categoryLevel2) whereClause.categoryLevel2 = categoryLevel2;
        if (categoryLevel3) whereClause.categoryLevel3 = categoryLevel3;
        if (serviceType) whereClause.serviceType = serviceType;
        if (brand) whereClause.brand = brand;
        
        // Active status filtering
        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }
        
        // Price range filtering
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }
        
        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { brand: { [Op.like]: `%${search}%` } }
            ];
        }

        const products = await Product.findAll({ 
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({ 
            products, 
            message: "Products retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ 
            error: "Error retrieving products",
            message: error.message 
        });
    }
};


// Get Featured Products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const products = await Product.findAll({
      where: { 
        isFeatured: true,
        isActive: true 
      },
      order: [
        ['featuredOrder', 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit: limit ? parseInt(limit) : undefined
    });
    
    res.status(200).json({ 
      products, 
      message: "Featured products retrieved successfully" 
    });
  } catch (error) {
    console.error("Error retrieving featured products:", error);
    res.status(500).json({ 
      error: "Error retrieving featured products",
      message: error.message 
    });
  }
};

// Get Trending Products
const getTrendingProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const products = await Product.findAll({
      where: { 
        isTrending: true,
        isActive: true 
      },
      order: [
        ['trendingOrder', 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit: limit ? parseInt(limit) : undefined
    });
    
    res.status(200).json({ 
      products, 
      message: "Trending products retrieved successfully" 
    });
  } catch (error) {
    console.error("Error retrieving trending products:", error);
    res.status(500).json({ 
      error: "Error retrieving trending products",
      message: error.message 
    });
  }
};

// Get New Arrivals
const getNewArrivals = async (req, res) => {
  try {
    const { limit, days = 30 } = req.query;
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    
    const products = await Product.findAll({
      where: { 
        isActive: true,
        createdAt: {
          [Op.gte]: dateThreshold
        }
      },
      order: [
        ['isNewArrival', 'DESC'], // Manual new arrivals first
        ['newArrivalOrder', 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit: limit ? parseInt(limit) : undefined
    });
    
    res.status(200).json({ 
      products, 
      message: "New arrivals retrieved successfully" 
    });
  } catch (error) {
    console.error("Error retrieving new arrivals:", error);
    res.status(500).json({ 
      error: "Error retrieving new arrivals",
      message: error.message 
    });
  }
};

// Update product special categories
const updateProductSpecialCategories = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      isFeatured, 
      isTrending, 
      isNewArrival,
      featuredOrder,
      trendingOrder,
      newArrivalOrder
    } = req.body;
    
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {};
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isTrending !== undefined) updateData.isTrending = isTrending;
    if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival;
    if (featuredOrder !== undefined) updateData.featuredOrder = featuredOrder;
    if (trendingOrder !== undefined) updateData.trendingOrder = trendingOrder;
    if (newArrivalOrder !== undefined) updateData.newArrivalOrder = newArrivalOrder;

    await product.update(updateData);
    
    res.status(200).json({ 
      product, 
      message: "Product special categories updated successfully" 
    });
  } catch (error) {
    console.error("Error updating product special categories:", error);
    res.status(500).json({ 
      error: "Error updating product special categories",
      message: error.message 
    });
  }
};

// Get Single Product by ID or Slug
const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        
        let product;
        
        // Better approach: Try by ID first, then by slug
        // Check if productId looks like a numeric ID
        if (!isNaN(productId)) {
            // It's a numeric ID like "1", "2", etc.
            product = await Product.findByPk(productId);
        } else {
            // It's probably a slug
            product = await Product.findOne({ where: { slug: productId } });
        }
        
        // If still not found, try as UUID (if your IDs can be UUIDs)
        if (!product) {
            product = await Product.findByPk(productId);
        }
        
        if (!product) {
            return res.status(404).json({ 
                message: "Product not found",
                productId: productId 
            });
        }
        
        res.status(200).json({ 
            product, 
            message: "Product retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving product:", error);
        res.status(500).json({ 
            error: "Error retrieving product",
            message: error.message 
        });
    }
};


// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete associated image files
        if (product.images && Array.isArray(product.images)) {
            product.images.forEach(imagePath => {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }

        await product.destroy();
        
        res.status(200).json({ 
            message: "Product deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ 
            error: "Error deleting product",
            message: error.message 
        });
    }
};

// Get Products by Category
const getProductsByCategory = async (req, res) => {
    try {
        const { level1, level2, level3 } = req.params;
        
        let whereClause = {};
        if (level1) whereClause.categoryLevel1 = level1;
        if (level2) whereClause.categoryLevel2 = level2;
        if (level3) whereClause.categoryLevel3 = level3;

        const products = await Product.findAll({ 
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({ 
            products, 
            message: "Products retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving products by category:", error);
        res.status(500).json({ 
            error: "Error retrieving products",
            message: error.message 
        });
    }
};

// Toggle Product Active Status
const toggleProductStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await product.update({ isActive: !product.isActive });
        
        res.status(200).json({ 
            product, 
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error("Error toggling product status:", error);
        res.status(500).json({ 
            error: "Error updating product status",
            message: error.message 
        });
    }
};

// Get all products for admin (includes sensitive data and analytics)
const getAdminProducts = async (req, res) => {
    try {
        const { 
            categoryLevel1, 
            categoryLevel2, 
            categoryLevel3, 
            serviceType, 
            isActive,
            search,
            minPrice,
            maxPrice,
            brand,
            lowStock
        } = req.query;
        
        let whereClause = {};
        
        // Category filtering
        if (categoryLevel1) whereClause.categoryLevel1 = categoryLevel1;
        if (categoryLevel2) whereClause.categoryLevel2 = categoryLevel2;
        if (categoryLevel3) whereClause.categoryLevel3 = categoryLevel3;
        if (serviceType) whereClause.serviceType = serviceType;
        if (brand) whereClause.brand = brand;
        
        // Active status filtering
        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }
        
        // Price range filtering
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }
        
        // Low stock filtering
        if (lowStock === 'true') {
            whereClause.stock = { [Op.lt]: 10 };
        }
        
        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { brand: { [Op.like]: `%${search}%` } }
            ];
        }

        const products = await Product.findAll({ 
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        
        // Add analytics data for admin
        const analytics = {
            totalProducts: products.length,
            activeProducts: products.filter(p => p.isActive).length,
            inactiveProducts: products.filter(p => !p.isActive).length,
            lowStockProducts: products.filter(p => p.stock < 10).length,
            outOfStockProducts: products.filter(p => p.stock === 0).length,
            totalValue: products.reduce((sum, product) => sum + (product.price * product.stock), 0)
        };

        res.status(200).json({ 
            products, 
            analytics,
            message: "Admin products retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving admin products:", error);
        res.status(500).json({ 
            error: "Error retrieving admin products",
            message: error.message 
        });
    }
};

// Get single product for admin (includes all data)
const getAdminProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await Product.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Get related products for admin context
        const relatedProducts = await Product.findAll({
            where: {
                categoryLevel1: product.categoryLevel1,
                id: { [Op.ne]: product.id }
            },
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ 
            product,
            relatedProducts,
            message: "Admin product retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving admin product:", error);
        res.status(500).json({ 
            error: "Error retrieving admin product",
            message: error.message 
        });
    }
};


// Get All Special Products for Admin (with analytics)
const getAdminSpecialProducts = async (req, res) => {
  try {
    const { type, limit, page = 1 } = req.query; // type: 'featured', 'trending', 'new-arrivals'
    const pageSize = limit || 50;
    const offset = (parseInt(page) - 1) * pageSize;

    let whereClause = {};
    let order = [];
    
    switch (type) {
      case 'featured':
        whereClause.isFeatured = true;
        order = [['featuredOrder', 'ASC'], ['createdAt', 'DESC']];
        break;
      case 'trending':
        whereClause.isTrending = true;
        order = [['trendingOrder', 'ASC'], ['createdAt', 'DESC']];
        break;
      case 'new-arrivals':
        whereClause.isNewArrival = true;
        order = [['newArrivalOrder', 'ASC'], ['createdAt', 'DESC']];
        break;
      default:
        // Return all special products
        whereClause = {
          [Op.or]: [
            { isFeatured: true },
            { isTrending: true },
            { isNewArrival: true }
          ]
        };
        order = [['updatedAt', 'DESC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order,
      limit: pageSize,
      offset
    });

    // Analytics for admin
    const analytics = {
      totalFeatured: await Product.count({ where: { isFeatured: true } }),
      totalTrending: await Product.count({ where: { isTrending: true } }),
      totalNewArrivals: await Product.count({ where: { isNewArrival: true } }),
      activeFeatured: await Product.count({ 
        where: { isFeatured: true, isActive: true } 
      }),
      activeTrending: await Product.count({ 
        where: { isTrending: true, isActive: true } 
      }),
      activeNewArrivals: await Product.count({ 
        where: { isNewArrival: true, isActive: true } 
      })
    };

    res.status(200).json({ 
      products,
      analytics,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / pageSize),
        totalProducts: count,
        hasNext: (offset + pageSize) < count,
        hasPrev: parseInt(page) > 1
      },
      message: "Admin special products retrieved successfully" 
    });
  } catch (error) {
    console.error("Error retrieving admin special products:", error);
    res.status(500).json({ 
      error: "Error retrieving admin special products",
      message: error.message 
    });
  }
};

// Update Product Special Categories (Admin Only)
// const updateProductSpecialCategories = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { 
//       isFeatured, 
//       isTrending, 
//       isNewArrival,
//       featuredOrder,
//       trendingOrder,
//       newArrivalOrder
//     } = req.body;
    
//     const product = await Product.findByPk(productId);
    
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const updateData = {};
//     if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
//     if (isTrending !== undefined) updateData.isTrending = isTrending;
//     if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival;
//     if (featuredOrder !== undefined) updateData.featuredOrder = parseInt(featuredOrder) || 0;
//     if (trendingOrder !== undefined) updateData.trendingOrder = parseInt(trendingOrder) || 0;
//     if (newArrivalOrder !== undefined) updateData.newArrivalOrder = parseInt(newArrivalOrder) || 0;

//     await product.update(updateData);

//     // Get updated product with associations
//     const updatedProduct = await Product.findByPk(productId);
    
//     res.status(200).json({ 
//       product: updatedProduct, 
//       message: "Product special categories updated successfully" 
//     });
//   } catch (error) {
//     console.error("Error updating product special categories:", error);
//     res.status(500).json({ 
//       error: "Error updating product special categories",
//       message: error.message 
//     });
//   }
// };

// Bulk Update Special Categories (Admin Only)
const bulkUpdateSpecialCategories = async (req, res) => {
  try {
    const { products } = req.body; // Array of { productId, updates }
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        message: "Products array is required" 
      });
    }

    const results = [];
    const errors = [];

    for (const item of products) {
      try {
        const { productId, updates } = item;
        const product = await Product.findByPk(productId);
        
        if (!product) {
          errors.push({ productId, error: "Product not found" });
          continue;
        }

        const updateData = {};
        if (updates.isFeatured !== undefined) updateData.isFeatured = updates.isFeatured;
        if (updates.isTrending !== undefined) updateData.isTrending = updates.isTrending;
        if (updates.isNewArrival !== undefined) updateData.isNewArrival = updates.isNewArrival;
        if (updates.featuredOrder !== undefined) updateData.featuredOrder = parseInt(updates.featuredOrder) || 0;
        if (updates.trendingOrder !== undefined) updateData.trendingOrder = parseInt(updates.trendingOrder) || 0;
        if (updates.newArrivalOrder !== undefined) updateData.newArrivalOrder = parseInt(updates.newArrivalOrder) || 0;

        await product.update(updateData);
        results.push({ productId, success: true });
      } catch (error) {
        errors.push({ productId: item.productId, error: error.message });
      }
    }

    res.status(200).json({ 
      results,
      errors,
      message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.` 
    });
  } catch (error) {
    console.error("Error in bulk update special categories:", error);
    res.status(500).json({ 
      error: "Error in bulk update",
      message: error.message 
    });
  }
};

// Get Products Not in Special Categories (For Admin to add new ones)
const getProductsNotInSpecialCategories = async (req, res) => {
  try {
    const { limit = 20, page = 1, search } = req.query;
    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;

    let whereClause = {
      [Op.and]: [
        { isFeatured: false },
        { isTrending: false },
        { isNewArrival: false }
      ]
    };

    if (search) {
      whereClause[Op.and].push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { brand: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset
    });

    res.status(200).json({ 
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / pageSize),
        totalProducts: count,
        hasNext: (offset + pageSize) < count,
        hasPrev: parseInt(page) > 1
      },
      message: "Products not in special categories retrieved successfully" 
    });
  } catch (error) {
    console.error("Error retrieving products not in special categories:", error);
    res.status(500).json({ 
      error: "Error retrieving products",
      message: error.message 
    });
  }
};

module.exports = {
    deleteProduct,
    createProducts,
    getFeaturedProducts,
    getTrendingProducts,
    getNewArrivals,
    updateProductSpecialCategories,
    bulkUpdateSpecialCategories,
    getProductsNotInSpecialCategories,
    getAdminSpecialProducts,
    getProduct,
    getProducts,
    updateProduct,
    getProductsByCategory,
    toggleProductStatus,
    getAdminProducts,      // Add this
    getAdminProductById    // Add this
};