const express = require("express");
const router =express.Router();

const {PaymentIntent, confirmPayment}= require("../Controllers/paymentController");

router.post("/api/payment", PaymentIntent);
router.post("/api/confirm-payment", confirmPayment);


module.exports =router