const express = require('express');
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  uploadImages,
  searchNotes,
  verifyNotePassword,
  addCollaborator,
  removeCollaborator
} = require('../controllers/notes');
const { protect, isActivated } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, isActivated, getNotes)
  .post(protect, isActivated, createNote);

router.get('/search', protect, isActivated, searchNotes);
router.post('/:id/verify', protect, isActivated, verifyNotePassword);
router.put('/:id/images', protect, isActivated, upload.array('images', 5), uploadImages);

router.route('/:id/collaborators/:userId')
  .put(protect, isActivated, addCollaborator)
  .delete(protect, isActivated, removeCollaborator);

router.route('/:id')
  .get(protect, isActivated, getNote)
  .put(protect, isActivated, updateNote)
  .delete(protect, isActivated, deleteNote);

module.exports = router;