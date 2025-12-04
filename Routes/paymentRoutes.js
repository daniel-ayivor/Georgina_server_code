// const express = require("express");
// const router =express.Router();

// const {PaymentIntent, confirmPayment}= require("../Controllers/paymentController");

// router.post("/api/payment", PaymentIntent);
// router.post("/api/confirm-payment", confirmPayment);


// module.exports =router

const express = require("express");
const router = express.Router();

const { PaymentIntent, confirmPayment, stripeWebhook } = require("../Controllers/paymentController");

// Regular routes
router.post("/api/payment", PaymentIntent);
router.post("/api/confirm-payment", confirmPayment);

// Webhook route - IMPORTANT: This must be registered BEFORE express.json() middleware
// The raw body is needed for Stripe signature verification
router.post("/api/webhook/stripe", stripeWebhook);

module.exports = router;