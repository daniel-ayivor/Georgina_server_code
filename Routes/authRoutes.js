


const express = require("express");
const router = express.Router();

const {
  loginUser,
  loginAdmin,
  registerUser,
  registerAdmin,
  forgotPassword,
  resetPassword,
  userInfo,
} = require("../Controllers/authController");

// E-commerce user routes
router.post("/api/auth/user/register", registerUser);
router.post("/api/auth/user/login", loginUser);

// Dashboard admin/staff routes
router.post("/api/auth/admin/register", registerAdmin);
router.post("/api/auth/admin/login", loginAdmin);

// Shared routes
router.post("/api/auth/forgot-password", forgotPassword);
router.post("/api/auth/resetpassword", resetPassword);
router.get("/api/auth/userinfo/:id", userInfo);

module.exports = router;