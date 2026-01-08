

const express = require("express");
const router = express.Router();

const { 
    createEmbeddedCheckout,
    getSessionStatus,
    confirmPayment, 
    stripeWebhook ,
    PaymentIntent
} = require("../Controllers/paymentController");


router.post("/api/payment", PaymentIntent);
router.post("/api/payment/checkout", createEmbeddedCheckout);


router.get("/api/session-status", getSessionStatus);
router.post("/api/confirm-payment", confirmPayment);

// Webhook route
router.post("/api/webhook", stripeWebhook);

module.exports = router;