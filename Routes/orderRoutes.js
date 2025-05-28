const express = require("express");
const router =express.Router();
const {purchaseItem, getUserPurchase} =require("../Controllers/orderController");


router.post("/api/purchaseItem", purchaseItem);
router.get("/api/getUserPurchase", getUserPurchase);

module.exports=router;