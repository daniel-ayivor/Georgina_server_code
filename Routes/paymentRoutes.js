// // const express = require("express");
// // const router =express.Router();

// // const {PaymentIntent, confirmPayment}= require("../Controllers/paymentController");

// // router.post("/api/payment", PaymentIntent);
// // router.post("/api/confirm-payment", confirmPayment);


// // module.exports =router

// const express = require("express");
// const router = express.Router();

// const { PaymentIntent, confirmPayment, stripeWebhook } = require("../Controllers/paymentController");

// // Regular routes
// router.post("/api/payment", PaymentIntent);
// router.post("/api/confirm-payment", confirmPayment);

// // Webhook route - IMPORTANT: This must be registered BEFORE express.json() middleware
// // The raw body is needed for Stripe signature verification
// router.post("/api/webhook/stripe", stripeWebhook);

// module.exports = router;

const express = require("express");
const router = express.Router();

const { 
    PaymentIntent, 
    createEmbeddedCheckout,
    getSessionStatus,
    confirmPayment, 
    stripeWebhook 
} = require("../Controllers/paymentController");

// Regular routes (use JSON body parser)
router.post("/api/payment", PaymentIntent); // Legacy redirect checkout
router.post("/api/create-checkout-session", createEmbeddedCheckout); // New embedded checkout
router.get("/api/session-status", getSessionStatus); // Check payment status
router.post("/api/confirm-payment", confirmPayment);

// Webhook route - This will use raw body parser from server.js
router.post("/api/webhook", stripeWebhook);

module.exports = router;