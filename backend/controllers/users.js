const User = require('../models/User');

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search users by name or email
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query'
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email avatar');

    // Don't include current user in search results
    const filteredUsers = users.filter(
      user => user._id.toString() !== req.user.id
    );

    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};