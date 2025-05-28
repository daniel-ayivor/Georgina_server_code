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
app.use(orderRoute);
app.use(paymentRoute);
app.use(productRoute);


(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

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
