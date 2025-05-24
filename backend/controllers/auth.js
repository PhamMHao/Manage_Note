const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password
    });

    // Generate activation token
    const activationToken = user.getActivationToken();
    await user.save({ validateBeforeSave: false });

    // Create activation url
    const activationUrl = `${process.env.CLIENT_URL}/activate/${activationToken}`;

    const message = `
      <h1>Account Activation</h1>
      <p>Please click the link below to activate your account:</p>
      <a href="${activationUrl}" target="_blank">Activate Account</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Account Activation',
        html: message
      });

      res.status(200).json({
        success: true,
        data: 'Activation email sent'
      });
    } catch (err) {
      console.log(err);
      user.activationToken = undefined;
      user.activationTokenExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email could not be sent'
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Activate account
// @route   POST /api/auth/activate/:token
// @access  Public
exports.activateAccount = async (req, res) => {
  try {
    // Get hashed token
    const activationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      activationToken,
      activationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired activation token'
      });
    }

    // Activate account
    user.isActivated = true;
    user.activationToken = undefined;
    user.activationTokenExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

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

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user with that email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    const message = `
      <h1>Password Reset</h1>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        html: message
      });

      res.status(200).json({ 
        success: true, 
        data: 'Email sent' 
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email could not be sent'
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.preferences
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Upload avatar
// @route   PUT /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user.id);

    // Update avatar
    user.avatar = req.file.filename;
    await user.save();

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

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Use secure flag in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};