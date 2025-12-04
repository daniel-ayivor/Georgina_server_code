

const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const userSchema = require("../Schemas/userSchema");
const bcrypt = require('bcryptjs');
const Ajv = require("ajv");
const nodemailer = require("nodemailer");

const ajv = new Ajv();
const validate = ajv.compile(userSchema);

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



// // Update User Profile (Basic Info - name, contact)
// const updateProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, contact } = req.body;

//     // Check if user exists
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Validate input
//     if (!name && !contact) {
//       return res.status(400).json({ message: "At least one field (name or contact) is required" });
//     }

//     // Update fields
//     const updateData = {};
//     if (name) updateData.name = name;
//     if (contact) updateData.contact = contact;

//     await User.update(updateData, { where: { id } });

//     // Get updated user
//     const updatedUser = await User.findByPk(id, {
//       attributes: { exclude: ['password'] }
//     });

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error("Error updating profile", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update User Email
// const updateEmail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Verify password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     // Check if new email already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser && existingUser.id !== parseInt(id)) {
//       return res.status(400).json({ message: "Email already in use" });
//     }

//     // Update email
//     await User.update({ email }, { where: { id } });

//     const updatedUser = await User.findByPk(id, {
//       attributes: { exclude: ['password'] }
//     });

//     res.status(200).json({
//       message: "Email updated successfully",
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error("Error updating email", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update Password
// const updatePassword = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ message: "Current password and new password are required" });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ message: "New password must be at least 6 characters long" });
//     }

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Verify current password
//     const validPassword = await bcrypt.compare(currentPassword, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ message: "Current password is incorrect" });
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update password
//     await User.update({ password: hashedPassword }, { where: { id } });

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("Error updating password", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Complete Profile Update (Multiple fields at once)
// const updateUserDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, contact, currentPassword } = req.body;

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // If changing sensitive fields, require password verification
//     if (currentPassword) {
//       const validPassword = await bcrypt.compare(currentPassword, user.password);
//       if (!validPassword) {
//         return res.status(400).json({ message: "Current password is incorrect" });
//       }
//     }

//     const updateData = {};
//     if (name) updateData.name = name;
//     if (contact) updateData.contact = contact;

//     // Check if there are fields to update
//     if (Object.keys(updateData).length === 0) {
//       return res.status(400).json({ message: "No fields to update" });
//     }

//     await User.update(updateData, { where: { id } });

//     const updatedUser = await User.findByPk(id, {
//       attributes: { exclude: ['password'] }
//     });

//     res.status(200).json({
//       message: "User details updated successfully",
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error("Error updating user details", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// Admin Change Password (Admin changes password for any user)
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
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userToUpdate.email,
        subject: "Your Password Has Been Updated",
        html: `
          <p>Hello ${userToUpdate.name},</p>
          <p>Your password has been updated by an administrator.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
          <p>Best regards,<br>The Admin Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
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
};