const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_bug_tracker_2026_antigravity');

      // Attempt to load from MongoDB, fallback to decoded user info if in-memory
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (e) {
        req.user = null;
      }

      if (!req.user) {
        req.user = { _id: decoded.id, role: decoded.role || 'Reporter' };
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token validation failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, access token missing',
    });
  }
};

module.exports = { protect };
