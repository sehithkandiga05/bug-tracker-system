const User = require('../models/User');
const { memoryUsers } = require('./authController');

/**
 * @desc    Get all users (Admin view)
 * @route   GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    let users = [];
    try {
      users = await User.find({}).select('-password');
    } catch (e) {
      users = [...memoryUsers];
    }
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user role or department
 * @route   PUT /api/users/:id/role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department } = req.body;

    let user;
    try {
      user = await User.findById(id);
      if (user) {
        if (role) user.role = role;
        if (department) user.department = department;
        await user.save();
      }
    } catch (e) {
      user = memoryUsers.find((u) => u._id.toString() === id.toString());
      if (user) {
        if (role) user.role = role;
        if (department) user.department = department;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete User (Admin)
 * @route   DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await User.findByIdAndDelete(id);
    } catch (e) {
      const idx = memoryUsers.findIndex((u) => u._id.toString() === id.toString());
      if (idx !== -1) memoryUsers.splice(idx, 1);
    }
    return res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser };
