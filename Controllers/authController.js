const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const userSchema = require("../Schemas/userSchema");
const bcrypt = require('bcryptjs');
const Ajv = require("ajv");
const nodemailer = require("nodemailer");
const Product = require("../Models/productModel");

const ajv = new Ajv();
const validate = ajv.compile(userSchema);

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, contact, role } = req.body;
    const valid = validate(req.body);

    if (!valid) {
      return res.status(400).json({
        message: "Invalid user data",
        errors: validate.errors,
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create User (Role defaults to 'user' if not provided)
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      contact,
      role: role || "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Customer
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error("Error logging in customer", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in admin", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate Reset Token (JWT)
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Send Reset Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent. Please check your inbox." });
  } catch (error) {
    console.error("Error in forgot password", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password", error);
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

// Get User Info
const userInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user info", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  registerUser,
  loginCustomer,
  loginAdmin,
  userInfo,
  forgotPassword,
  resetPassword,
};
