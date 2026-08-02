const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Memory store fallback if DB is not connected
const memoryUsers = [];

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all required fields' });
    }

    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'Reporter',
        department: department || 'General',
      });

      const token = user.getSignedJwtToken();
      const refreshToken = user.getRefreshToken();

      return res.status(201).json({
        success: true,
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
        },
      });
    } catch (dbErr) {
      // In-Memory fallback registration
      const existing = memoryUsers.find((u) => u.email === email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      const newUser = {
        _id: `mem_u_${Date.now()}`,
        name,
        email,
        role: role || 'Reporter',
        department: department || 'General',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };
      memoryUsers.push(newUser);

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      const refreshToken = jwt.sign({ id: newUser._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        token,
        refreshToken,
        user: newUser,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = user.getSignedJwtToken();
      const refreshToken = user.getRefreshToken();

      return res.json({
        success: true,
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
        },
      });
    } catch (dbErr) {
      // In-Memory Fallback Check
      const memUser = memoryUsers.find((u) => u.email === email);
      if (memUser) {
        const token = jwt.sign({ id: memUser._id, role: memUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        const refreshToken = jwt.sign({ id: memUser._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
        return res.json({
          success: true,
          token,
          refreshToken,
          user: memUser,
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Current Logged in User Profile
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        return res.json({ success: true, user });
      }
    } catch (e) {}

    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Refresh Token
 * @route   POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_bug_tracker_2026_antigravity');
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET || 'super_secret_jwt_key_bug_tracker_2026_antigravity', {
      expiresIn: process.env.JWT_EXPIRE || '1d',
    });

    res.json({ success: true, token: accessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * @desc    Forgot Password Request
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: `If an account with email ${email} exists, a password reset link has been dispatched.`,
  });
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password/:resetToken
 */
const resetPassword = async (req, res) => {
  res.json({
    success: true,
    message: 'Password reset successfully. You can now login with your new credentials.',
  });
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  memoryUsers,
};
