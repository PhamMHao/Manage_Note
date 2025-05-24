const express = require('express');
const { getUser, searchUsers } = require('../controllers/users');
const { protect, isActivated } = require('../middleware/auth');

const router = express.Router();

router.get('/search', protect, isActivated, searchUsers);
router.get('/:id', protect, isActivated, getUser);

module.exports = router;