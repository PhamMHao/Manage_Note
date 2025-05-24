const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  activateAccount,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  updatePreferences,
  uploadAvatar
} = require('../controllers/auth');
const { protect, isActivated } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', register);
router.post('/activate/:token', activateAccount);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, isActivated, updateDetails);
router.put('/updatepassword', protect, isActivated, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/preferences', protect, isActivated, updatePreferences);
router.put('/avatar', protect, isActivated, upload.single('avatar'), uploadAvatar);

module.exports = router;