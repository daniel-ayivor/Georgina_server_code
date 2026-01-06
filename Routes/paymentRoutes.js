

const express = require("express");
const router = express.Router();

const { 
    createEmbeddedCheckout,
    getSessionStatus,
    confirmPayment, 
    stripeWebhook ,
    PaymentIntent
} = require("../Controllers/paymentController");

// Embedded checkout route (replaces old /api/payment)
router.post("/api/payment", PaymentIntent);
router.post("/api/payment/checkout", createEmbeddedCheckout);

// Other routes
router.get("/api/session-status", getSessionStatus);
router.post("/api/confirm-payment", confirmPayment);

// Webhook route
router.post("/api/webhook", stripeWebhook);

module.exports = router;