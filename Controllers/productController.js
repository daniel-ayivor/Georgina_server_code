const Product = require("../Models/productModel");
const multer = require("multer");
const path = require("path");

const createProducts = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            categoryId,
            subcategoryId,
            rating,
            stock,
            featured,
            size
        } = req.body;

        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imagePath = file.path.replace(/\\/g, '/');

        const product = await Product.create({
            name,
            description,
            price,
            discountPrice,
            categoryId,
            subcategoryId,
            rating,
            stock,
            featured: featured === 'true', // in case it's sent as string
            size,
            image: imagePath
        });

        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error });
    }
};


// Get All Products
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json({ products, message: "Products retrieved successfully" });
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ error: "Error retrieving products" });
    }
};

// Get Single Product
const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ product, message: "Product retrieved successfully" });
    } catch (error) {
        console.error("Error retrieving product:", error);
        res.status(500).json({ error: "Error retrieving product" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // If image is uploaded
        if (req.file) {
            req.body.image = req.file.path.replace(/\\/g, '/');
        }

        await product.update(req.body);
        res.status(200).json({ product, message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Error updating product" });
    }
};


// Delete Product
const deletingProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await product.destroy();
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Error deleting product" });
    }
};

// Rate Product
const rateProduct = async (req, res) => {
    const { rating } = req.body;
    try {
        const [updated] = await Product.update(
            { rating },
            { where: { id: req.params.id } }
        );
        if (updated) {
            res.status(200).send('Rating submitted successfully!');
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error("Error updating rating:", error);
        res.status(500).json({ error: "Error updating rating" });
    }
};

// Get Trending Products
const getTrendingProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;
        
        const products = await Product.findAll({
            where: { trending: true },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        
        const total = await Product.count({ where: { trending: true } });
        
        res.status(200).json({ 
            products, 
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            message: "Trending products retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving trending products:", error);
        res.status(500).json({ error: "Error retrieving trending products" });
    }
};

// Get New Arrival Products
const getNewArrivalProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;
        
        const products = await Product.findAll({
            where: { newArrival: true },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        
        const total = await Product.count({ where: { newArrival: true } });
        
        res.status(200).json({ 
            products, 
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            message: "New arrival products retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving new arrival products:", error);
        res.status(500).json({ error: "Error retrieving new arrival products" });
    }
};

// Get Featured Products
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;
        
        const products = await Product.findAll({
            where: { featured: true },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        
        const total = await Product.count({ where: { featured: true } });
        
        res.status(200).json({ 
            products, 
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            message: "Featured products retrieved successfully" 
        });
    } catch (error) {
        console.error("Error retrieving featured products:", error);
        res.status(500).json({ error: "Error retrieving featured products" });
    }
};

// module.exports = upload;
module.exports = {
    deletingProduct,
    createProducts,
    getProduct,
    getProducts,
    rateProduct,
    updateProduct,
    getTrendingProducts,
    getNewArrivalProducts,
    getFeaturedProducts,
};
