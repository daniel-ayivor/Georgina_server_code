


const express = require("express");
const router = express.Router();

const {
  loginUser,
  loginAdmin,
  verifyToken,
  registerUser,
  registerAdmin,
  forgotPassword,
  resetPassword,
  userInfo,
  createCustomerProfile
} = require("../Controllers/authController");

// E-commerce user routes
router.post("/api/auth/user/register", registerUser);
router.post("/api/auth/user/login", loginUser);

// Dashboard admin/staff routes
router.post("/api/auth/admin/register", registerAdmin);
router.post("/api/auth/admin/login", loginAdmin);


// customer deletion route

// Shared routes
router.post("/api/auth/verify-token", verifyToken);
router.post("/api/auth/forgot-password", forgotPassword);
router.post("/api/auth/resetpassword", resetPassword);
router.get("/api/auth/userinfo/:id", userInfo);

module.exports = router;