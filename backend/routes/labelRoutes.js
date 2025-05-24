const express = require('express');
const {
    getLabels,
    createLabel,
    updateLabel,
    deleteLabel
} = require('../controllers/labels');
const { protect, isActivated } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, isActivated, getLabels)
    .post(protect, isActivated, createLabel);

router.route('/:id')
    .put(protect, isActivated, updateLabel)
    .delete(protect, isActivated, deleteLabel);

module.exports = router; 