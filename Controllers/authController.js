

const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const userSchema = require("../Schemas/userSchema");
const bcrypt = require('bcryptjs');
const Ajv = require("ajv");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const ajv = new Ajv();
const validate = ajv.compile(userSchema);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Reusable mail transporter builder with SMTP override + Gmail fallback
const buildMailTransporter = () => {
  // Check if SMTP configuration exists
  if (process.env.SMTP_HOST) {
    console.log('📧 Using SMTP configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? '***configured***' : 'NOT SET'
    });
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Gmail (requires EMAIL_USER + EMAIL_PASS app password)
  console.log('📧 Using Gmail fallback configuration');
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '***configured***' : 'NOT SET');
  console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not configured! Set EMAIL_USER and EMAIL_PASS in .env');
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  }
  
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Register User (for e-commerce users)
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const valid = validate(req.body);

    if (!valid) {
      return res.status(400).json({
        message: "Invalid user data",
        errors: validate.errors,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create User with role 'user'
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      
      role: "user", // Fixed role for user registration
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register Admin (for dashboard admins/staff)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;
    const valid = validate(req.body);

    if (!valid) {
      return res.status(400).json({
        message: "Invalid admin data",
        errors: validate.errors,
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create Admin with role 'admin'
    const admin = await User.create({
      name,
      email,
      password: hashPassword,
      contact,
      role: "admin", // Fixed role for admin registration
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        contact: admin.contact,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error registering admin", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login User (for e-commerce users)
const loginUser = async (req, res) => {
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

    // Check if user has 'user' role
    if (user.role !== "user") {
      return res.status(403).json({ message: "Access denied. User login only." });
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
      { expiresIn: "8h" }
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
    console.error("Error logging in user", error);
    res.status(500).json({ message: "Server error" });
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordLength: password?.length }); // Debug log

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin by email
    const admin = await User.findOne({ where: { email } });
    console.log('Admin found:', { 
      exists: !!admin, 
      hasPassword: !!admin?.password,
      passwordLength: admin?.password?.length 
    }); // Debug log

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user has admin role
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin login only." });
    }

    // Add validation before bcrypt.compare
    if (!admin.password) {
      console.error('Admin password is missing in database');
      return res.status(500).json({ message: "Account configuration error" });
    }

    // Compare password
    console.log('Before bcrypt.compare'); // Debug log
    const validPassword = await bcrypt.compare(password, admin.password);
    console.log('Password valid:', validPassword); // Debug log

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error logging in admin", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Google OAuth login/register
const socialLoginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google OAuth is not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Unable to verify Google account" });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || payload.family_name || email;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: null, // passwordless OAuth user
        role: "user",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      token,
      provider: "google",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error with Google OAuth", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

// Facebook OAuth login/register
const socialLoginFacebook = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "accessToken is required" });
    }

    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return res.status(500).json({ message: "Facebook OAuth is not configured" });
    }

    const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;

    // Validate the access token
    const debugResponse = await axios.get(
      "https://graph.facebook.com/debug_token",
      {
        params: {
          input_token: accessToken,
          access_token: appAccessToken,
        },
      }
    );

    const tokenData = debugResponse.data?.data;
    if (!tokenData?.is_valid || tokenData.app_id !== process.env.FACEBOOK_APP_ID) {
      return res.status(401).json({ message: "Invalid Facebook token" });
    }

    // Fetch user profile
    const profileResponse = await axios.get(
      "https://graph.facebook.com/me",
      {
        params: {
          access_token: accessToken,
          fields: "id,name,email",
        },
      }
    );

    const { id, name, email: fbEmail } = profileResponse.data || {};
    const email = (fbEmail || `fb-${id}@facebook.com`).toLowerCase();
    const displayName = name || "Facebook User";

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name: displayName,
        email,
        password: null,
        role: "user",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      token,
      provider: "facebook",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      facebookId: id,
      rawEmail: fbEmail || null
    });
  } catch (error) {
    console.error("Error with Facebook OAuth", error.response?.data || error);
    res.status(500).json({ message: "Facebook authentication failed" });
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
  { expiresIn: "12h" }
);

    // Send Reset Email
    try {
      const transporter = buildMailTransporter();
      
      // Verify transporter configuration
      console.log('📧 Verifying email transporter...');
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER || process.env.SMTP_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p><strong>This link will expire in 12 hours.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      console.log('📧 Sending password reset email to:', email);
      await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully');

      res.json({ 
        success: true,
        message: "Password reset email sent. Please check your inbox." 
      });
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      console.error("Email error details:", {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode
      });
      
      // Return specific error messages
      if (emailError.code === 'EAUTH') {
        return res.status(500).json({ 
          success: false,
          message: "Email authentication failed. Please contact support.",
          error: "Invalid email credentials configured on server"
        });
      }
      
      if (emailError.code === 'ECONNECTION' || emailError.code === 'ETIMEDOUT') {
        return res.status(500).json({ 
          success: false,
          message: "Unable to connect to email server. Please try again later.",
          error: "Email server connection failed"
        });
      }
      
      return res.status(500).json({ 
        success: false,
        message: "Failed to send password reset email. Please try again later.",
        error: emailError.message
      });
    }
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
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user info", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Verify Token Endpoint
const verifyToken = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: "Access token is required" 
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access token is required" 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token:', decoded); // Debug log

    // Check for user ID in different possible fields
    const userId = decoded.userId || decoded.id || decoded.user?.id;
    
    if (!userId) {
      console.log('❌ No user ID found in token. Available fields:', Object.keys(decoded));
      return res.status(401).json({ 
        success: false,
        message: "Invalid token structure - no user ID found" 
      });
    }

    // Find user by ID from the token
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Return user data
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          contact: user.contact
        }
      },
      message: "Token is valid"
    });

  } catch (error) {
    console.error("Token verification error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token has expired" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Server error during token verification" 
    });
  }
};




const adminChangePassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;
    
    // Check if the requester is an admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: "Access token is required" 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify the requester is an admin
    const requester = await User.findByPk(decoded.userId);
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    // Validate inputs
    if (!userId || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "User ID, new password, and confirm password are required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long" 
      });
    }

    // Find the user whose password needs to be changed
    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );

    // Optionally, send email notification to the user
    try {
      const transporter = buildMailTransporter();
      await transporter.verify();

      const mailOptions = {
        from: process.env.EMAIL_USER || process.env.SMTP_USER,
        to: userToUpdate.email,
        subject: "Your Password Has Been Updated",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Updated</h2>
            <p>Hello ${userToUpdate.name},</p>
            <p>Your password has been updated by an administrator.</p>
            <p><strong>Updated by:</strong> ${requester.name} (${requester.email})</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #d9534f; margin-top: 20px;">⚠️ If you did not request this change, please contact our support team immediately.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p>Best regards,<br>The Admin Team</p>
          </div>
        `,
      };

      console.log('📧 Sending password update notification to:', userToUpdate.email);
      await transporter.sendMail(mailOptions);
      console.log('✅ Password update notification sent successfully');
    } catch (emailError) {
      console.error("❌ Error sending notification email:", emailError);
      console.error("Email error code:", emailError.code);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {
        userId: userToUpdate.id,
        email: userToUpdate.email,
        name: userToUpdate.name,
        updatedBy: requester.id,
        updatedByEmail: requester.email
      }
    });

  } catch (error) {
    console.error("Error in admin change password:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token has expired" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Server error during password change" 
    });
  }
};

// Admin Change Own Password (Admin changes their own password)
const adminChangeOwnPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Get admin from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: "Access token is required" 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the admin
    const admin = await User.findByPk(decoded.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Current password, new password, and confirm password are required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "New passwords do not match" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be at least 6 characters long" 
      });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!validPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin's password
    await User.update(
      { password: hashedPassword },
      { where: { id: admin.id } }
    );

    res.status(200).json({
      success: true,
      message: "Your password has been updated successfully"
    });

  } catch (error) {
    console.error("Error in admin change own password:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token has expired" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Server error during password change" 
    });
  }
};

module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
  loginAdmin,
  userInfo,
  forgotPassword,
  adminChangePassword ,
  adminChangeOwnPassword,
  verifyToken,
  resetPassword,
  socialLoginGoogle,
  socialLoginFacebook,
};