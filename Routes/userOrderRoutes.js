const express = require("express");
const router = express.Router();
const userOrderController = require("../Controllers/userOrder.Controller");
const { authenticate ,debugAuth} = require("../Middleware/Middelware");

// User order routes
router.post("/api/orders",debugAuth, authenticate, userOrderController.createOrder);
router.get("/api/orders/my-orders", authenticate, userOrderController.getMyOrders);
router.get("/api/orders/:id", authenticate, userOrderController.getOrderById);
router.put("/api/orders/:id/cancel", authenticate, userOrderController.cancelOrder);

module.exports = router;