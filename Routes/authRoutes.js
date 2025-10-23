const express = require("express");
const router = express.Router();

const {
  loginCustomer,
  loginAdmin,
  registerUser,
  forgotPassword,
  resetPassword,
  userInfo,
} = require("../Controllers/authController");

// Customer registration/login
router.post("/api/auth/customer/register", (req, res) =>
  registerUser({ ...req, body: { ...req.body, role: "user" } }, res)
);

router.post("/api/auth/customer/login", loginCustomer);

// Admin registration/login
router.post("/api/auth/admin/register", (req, res) =>
  registerUser({ ...req, body: { ...req.body, role: "admin" } }, res)
);

router.post("/api/auth/admin/login", loginAdmin);

// Legacy endpoints for backward compatibility
router.post("/api/auth/user/register", (req, res) =>
  registerUser({ ...req, body: { ...req.body, role: "user" } }, res)
);

router.post("/api/auth/user/login", loginCustomer);

// Shared routes
router.post("/api/auth/forgot-password", forgotPassword);
router.post("/api/auth/resetpassword", resetPassword);
router.get("/api/auth/userinfo/:id", userInfo);

module.exports = router;
