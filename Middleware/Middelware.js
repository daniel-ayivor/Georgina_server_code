// middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log('🔐 Header starts with Bearer?:', authHeader?.startsWith('Bearer '));
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - No token provided or invalid format" 
      });
    }

    const token = authHeader.split(" ")[1];
    
    // Validate token format
    if (!token || token.trim() === '') {
      console.log('❌ Token is empty or whitespace');
      return res.status(401).json({ 
        success: false,
        message: "Invalid token format" 
      });
    }

    console.log('🔐 Token length:', token.length);
    console.log('🔐 Token preview:', token.substring(0, 30) + '...');

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', { 
      userId: decoded.userId, 
      role: decoded.role 
    });
    
    // Your tokens use 'userId' field
    const userId = decoded.userId;
    
    if (!userId) {
      console.log('❌ No userId found in token');
      return res.status(401).json({ 
        success: false,
        message: "Invalid token structure" 
      });
    }
    
    // Set user object
    req.user = {
      id: userId,
      userId: userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    console.error('❌ Error name:', err.name);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token format" 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }

    return res.status(401).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};


const debugAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Raw Authorization header:', authHeader);
  console.log('🔐 Header length:', authHeader?.length);
  console.log('🔐 Starts with Bearer?:', authHeader?.startsWith('Bearer '));
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log('🔐 Extracted token:', token);
    console.log('🔐 Token length:', token?.length);
    console.log('🔐 Token preview:', token?.substring(0, 50) + '...');
  }
  
  next();
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Forbidden - Insufficient permissions" 
      });
    }
    next();
  };
};

// Simple admin authorization
const authorize = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// For customer routes - ensure user owns the data
const authorizeCustomer = (req, res, next) => {
  // This ensures the user can only access their own data
  // We'll handle this in the controller by checking req.user.email
  next();
};

module.exports = { 
  authenticate, 
  authorizeRoles,
  debugAuth, 
  authorize, 
  authorizeCustomer 
};