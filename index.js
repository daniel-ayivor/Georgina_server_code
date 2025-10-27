
const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const { config } = require('dotenv');
const path = require('path');
const sequelize = require('./Database/database');
const Product = require('./Models/productModel');
const User = require("./Models/userModel");

const Order = require("./Models/orderModel");
const Category = require("./Models/categoryModel");

const authRoute = require("./Routes/authRoutes");
const userRoute = require("./Routes/userRoutes");
const productRoute = require("./Routes/productRoutes");
const orderRoute = require("./Routes/orderRoutes");
const bookingRoute = require("./Routes/bookingRoute");
const serviceRoute = require("./Routes/serviceRoute");
const categoryRoute = require("./Routes/categoryRoutes");
const orderItemRoute = require("./Routes/orderItemRoutes");
const customerRoute = require("./Routes/customerRoutes");
const notificationRoute = require("./Routes/notificationRoutes");
const paymentRoute = require("./Routes/paymentRoutes");

const { QueryTypes } = require('sequelize');

config();
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: [
    'https://georgina-services-limited-dashboard.vercel.app',
    'https://snappy-cart-carousel.vercel.app',
    'http://localhost:8080',
    'http://localhost:8082',
    'http://localhost:8083',
    'https://georgina-server-code.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));


// Database synchronization function
async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    
    // Use { alter: true } for safe schema updates in production
    await sequelize.sync({ alter: true });
    
    console.log('Database synchronized successfully');
    
    // Seed initial data
    await seedInitialData();
    
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
}

// Enhanced initial data seeding
async function seedInitialData() {
  try {
    // Check if categories already exist
    const existingCategories = await Category.count();
    
    if (existingCategories === 0) {
      console.log('Creating initial categories...');
      
      // Create level 1 categories first
      const level1Categories = await Category.bulkCreate([
        { 
          name: 'Clothes', 
          slug: 'clothes', 
          level: 1, 
          sortOrder: 1,
          description: 'Clothing and fashion items for men, women, and kids'
        },
        { 
          name: 'Foodstuffs', 
          slug: 'foodstuffs', 
          level: 1, 
          sortOrder: 2,
          description: 'Food and grocery items including pantry, prepared mixes, and soup bases'
        },
        { 
          name: 'Services', 
          slug: 'services', 
          level: 1, 
          sortOrder: 3,
          description: 'Various services offered'
        }
      ], { returning: true });

      console.log('Level 1 categories created');

      // Get the created category IDs
      const clothesId = level1Categories[0].id;
      const foodstuffsId = level1Categories[1].id;
      
      // Create level 2 categories (subcategories)
      const level2Categories = await Category.bulkCreate([
        // Clothes subcategories
        { 
          name: 'Men', 
          slug: 'men-clothing', 
          level: 2, 
          parentId: clothesId,
          sortOrder: 1,
          description: 'Men\'s clothing and fashion'
        },
        { 
          name: 'Women', 
          slug: 'women-clothing', 
          level: 2, 
          parentId: clothesId,
          sortOrder: 2,
          description: 'Women\'s clothing and fashion'
        },
        { 
          name: 'Kids', 
          slug: 'kids-clothing', 
          level: 2, 
          parentId: clothesId,
          sortOrder: 3,
          description: 'Kids clothing and fashion'
        },
        
        // Foodstuffs subcategories
        { 
          name: 'Pantry', 
          slug: 'pantry', 
          level: 2, 
          parentId: foodstuffsId,
          sortOrder: 1,
          description: 'Basic pantry items and essentials'
        },
        { 
          name: 'Prepared Mixes', 
          slug: 'prepared-mixes', 
          level: 2, 
          parentId: foodstuffsId,
          sortOrder: 2,
          description: 'Ready-to-cook food mixes'
        },
        { 
          name: 'Soup Base', 
          slug: 'soup-base', 
          level: 2, 
          parentId: foodstuffsId,
          sortOrder: 3,
          description: 'Soup ingredients and bases'
        }
      ], { returning: true });

      console.log('Level 2 categories created');

      // Find the level 2 category IDs for creating level 3
      const menCategory = level2Categories.find(cat => cat.slug === 'men-clothing');
      const womenCategory = level2Categories.find(cat => cat.slug === 'women-clothing');
      const kidsCategory = level2Categories.find(cat => cat.slug === 'kids-clothing');
      const pantryCategory = level2Categories.find(cat => cat.slug === 'pantry');
      const preparedMixesCategory = level2Categories.find(cat => cat.slug === 'prepared-mixes');
      const soupBaseCategory = level2Categories.find(cat => cat.slug === 'soup-base');

      // Create level 3 categories (specific items)
      await Category.bulkCreate([
        // Men's clothing items
        { 
          name: 'African Wear', 
          slug: 'men-african-wear', 
          level: 3, 
          parentId: menCategory.id,
          sortOrder: 1,
          description: 'Traditional African clothing for men'
        },
        { 
          name: 'Trousers', 
          slug: 'men-trousers', 
          level: 3, 
          parentId: menCategory.id,
          sortOrder: 2,
          description: 'Men\'s trousers and pants'
        },
        
        // Women's clothing items
        { 
          name: 'African Print', 
          slug: 'women-african-print', 
          level: 3, 
          parentId: womenCategory.id,
          sortOrder: 1,
          description: 'African print fabrics and clothing'
        },
        { 
          name: 'African Wear', 
          slug: 'women-african-wear', 
          level: 3, 
          parentId: womenCategory.id,
          sortOrder: 2,
          description: 'Traditional African clothing for women'
        },
        { 
          name: 'Ankara', 
          slug: 'women-ankara', 
          level: 3, 
          parentId: womenCategory.id,
          sortOrder: 3,
          description: 'Ankara fabrics and designs'
        },
        { 
          name: 'Bonnet', 
          slug: 'women-bonnet', 
          level: 3, 
          parentId: womenCategory.id,
          sortOrder: 4,
          description: 'Headwear and bonnets'
        },
        
        // Kids clothing items
        { 
          name: 'African Wear', 
          slug: 'kids-african-wear', 
          level: 3, 
          parentId: kidsCategory.id,
          sortOrder: 1,
          description: 'Traditional African clothing for kids'
        },
        
        // Pantry items
        { 
          name: 'Vegetable Oils', 
          slug: 'vegetable-oils', 
          level: 3, 
          parentId: pantryCategory.id,
          sortOrder: 1,
          description: 'Cooking oils and vegetable oils'
        },
        { 
          name: 'Zomi', 
          slug: 'zomi', 
          level: 3, 
          parentId: pantryCategory.id,
          sortOrder: 2,
          description: 'Zomi food products'
        },
        { 
          name: 'Gari', 
          slug: 'gari', 
          level: 3, 
          parentId: pantryCategory.id,
          sortOrder: 3,
          description: 'Gari and cassava products'
        },
        { 
          name: 'Spaghetti', 
          slug: 'spaghetti', 
          level: 3, 
          parentId: pantryCategory.id,
          sortOrder: 4,
          description: 'Pasta and spaghetti'
        },
        { 
          name: 'Tomatoes Paste', 
          slug: 'tomatoes-paste', 
          level: 3, 
          parentId: pantryCategory.id,
          sortOrder: 5,
          description: 'Tomato paste and puree'
        },
        
        // Prepared Mixes items
        { 
          name: 'Fufu', 
          slug: 'fufu', 
          level: 3, 
          parentId: preparedMixesCategory.id,
          sortOrder: 1,
          description: 'Fufu flour and mixes'
        },
        { 
          name: 'Banku', 
          slug: 'banku', 
          level: 3, 
          parentId: preparedMixesCategory.id,
          sortOrder: 2,
          description: 'Banku mixes and ingredients'
        },
        { 
          name: 'Tom Brown', 
          slug: 'tom-brown', 
          level: 3, 
          parentId: preparedMixesCategory.id,
          sortOrder: 3,
          description: 'Tom Brown cereal and porridge'
        },
        { 
          name: 'Konkonte', 
          slug: 'konkonte', 
          level: 3, 
          parentId: preparedMixesCategory.id,
          sortOrder: 4,
          description: 'Konkonte flour and mixes'
        },
        
        // Soup Base items
        { 
          name: 'Palm Nut Soup', 
          slug: 'palm-nut-soup', 
          level: 3, 
          parentId: soupBaseCategory.id,
          sortOrder: 1,
          description: 'Palm nut soup ingredients and base'
        }
      ]);

      console.log(' Level 3 categories created');
      console.log(' All initial categories seeded successfully');
      
    } else {
      console.log('Categories already exist, skipping seed');
    }
    
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}

// Mount routes
app.use(authRoute);
app.use(userRoute);
app.use(bookingRoute);
app.use(orderRoute);
app.use(paymentRoute);
app.use(serviceRoute);
app.use(productRoute);
app.use( categoryRoute); // Make sure this matches your category routes
app.use( orderItemRoute);
app.use( customerRoute);
app.use( notificationRoute);


// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    database: 'Connected',
    categories: 'Available'
  });
});

// Test category route
app.get('/api/test-categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug', 'level', 'parentId', 'description'],
      order: [['level', 'ASC'], ['sortOrder', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server and sync database
(async () => {
    try {
        await sequelize.authenticate();
        console.log(' Database connected...');
        
        // Sync database
        await syncDatabase();
        
        console.log('Starting server...');

    } catch (error) {
        console.error('Error:', error);
    }
})();

app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});