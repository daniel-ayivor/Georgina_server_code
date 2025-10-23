const express = require("express");
const router = express.Router();

const {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  userInfo,
} = require("../Controllers/authController");

// E-commerce user registration/login
router.post("/api/auth/user/register", (req, res) =>
  registerUser({ ...req, body: { ...req.body, role: "user" } }, res)
);

router.post("/api/auth/user/login", (req, res) =>
  loginUser({ ...req, body: { ...req.body, role: "user" } }, res)
);

// Dashboard admin/staff registration/login
router.post("/api/auth/admin/register", (req, res) =>
  registerUser({ ...req, body: { ...req.body, role: "admin" } }, res)
);

router.post("/api/auth/admin/login", (req, res) =>
  loginUser({ ...req, body: { ...req.body, role: "admin" } }, res)
);

// Shared routes
router.post("/api/auth/forgot-password", forgotPassword);
router.post("/api/auth/resetpassword", resetPassword);
router.get("/api/auth/userinfo/:id", userInfo);

module.exports = router;
