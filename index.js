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
app.use(cors({
  origin: [
    "https://georgina-server-code.onrender.com",
    "https://snappy-cart-carousel.vercel.app",
    "https://luckyexpress-dashboard.vercel.app"
  ],
  credentials: true // if you need to allow cookies/auth headers
}));
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

        // --- REMOVE slug migration code for fresh DBs ---
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
