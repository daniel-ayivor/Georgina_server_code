const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const { config } = require('dotenv');
const path = require('path');
const sequelize = require('./Database/database');
const Product = require('./Models/productModel');
const User = require("./Models/userModel");
const Order = require("./Models/orderModel");
const authRoute = require("./Routes/authRoutes");
const userRoute = require("./Routes/userRoutes");
const productRoute = require("./Routes/productRoutes");
const orderRoute = require("./Routes/orderRoutes");
const bookingRoute = require("./Routes/cleaningBookingRoutes");
const categoryRoute = require("./Routes/categoryRoutes");
const subCategoryRoute = require("./Routes/subCategoryRoutes");
const orderItemRoute = require("./Routes/orderItemRoutes");
const customerRoute = require("./Routes/customerRoutes");
const notificationRoute = require("./Routes/notificationRoutes");
const { QueryTypes } = require('sequelize');

const paymentRoute = require("./Routes/paymentRoutes");

config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use("/uploads",express.static(path.join(__dirname,'uploads')));

// Mount the user routes with a base path
app.use( authRoute);
app.use(userRoute);
app.use(bookingRoute);
app.use(orderRoute);
app.use(paymentRoute);
app.use(productRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/subcategories", subCategoryRoute);
app.use("/api/order-items", orderItemRoute);
app.use("/api/customers", customerRoute);
app.use("/api/notifications", notificationRoute);


(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // --- FIX for slug migration ---
        // 1. Add slug column if it doesn't exist (ignore error if exists)
        try {
            await sequelize.query("ALTER TABLE products ADD COLUMN slug VARCHAR(255)");
        } catch (e) {
            // Ignore error if column already exists
        }
        // 2. Fill in unique slugs for products with NULL or empty slug
        const products = await sequelize.query("SELECT id, slug FROM products", { type: QueryTypes.SELECT });
        const usedSlugs = new Set();
        for (const p of products) {
            if (p.slug) usedSlugs.add(p.slug);
        }
        for (const p of products) {
            if (!p.slug || p.slug === '' || usedSlugs.has(p.slug)) {
                let newSlug = `product-${p.id}`;
                let counter = 1;
                while (usedSlugs.has(newSlug)) {
                    newSlug = `product-${p.id}-${counter++}`;
                }
                await sequelize.query("UPDATE products SET slug = :slug WHERE id = :id", {
                    replacements: { slug: newSlug, id: p.id },
                });
                usedSlugs.add(newSlug);
            }
        }
        // 3. Make slug NOT NULL and UNIQUE
        try {
            await sequelize.query("ALTER TABLE products MODIFY slug VARCHAR(255) NOT NULL");
        } catch (e) {}
        try {
            await sequelize.query("ALTER TABLE products ADD UNIQUE (slug)");
        } catch (e) {}
        // --- END FIX ---

        // Sync models explicitly
        await Product.sync({ alter: true });
        console.log('Product model synced!');
        await User.sync({ alter: true });
        console.log("User model synced!", User);
        await Order.sync({ alter: true });
        console.log("Order model synced!");

    } catch (error) {
        console.error('Error syncing database:', error);
    }
})();

app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
