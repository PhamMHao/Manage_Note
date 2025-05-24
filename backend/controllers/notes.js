const Note = require('../models/Note');
const bcrypt = require('bcryptjs');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    // Get all notes for current user plus any shared notes
    const notes = await Note.find({
      $or: [
        { user: req.user.id },
        { collaborators: req.user.id }
      ]
    })
      .populate('labels', 'name color')
      .populate('collaborators', 'name email avatar')
      .sort({ isPinned: -1, lastUpdated: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('labels', 'name color')
      .populate('collaborators', 'name email avatar');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note or is a collaborator
    if (
      note.user.toString() !== req.user.id &&
      !note.collaborators.some(collab => collab._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this note'
      });
    }

    // Check if note is password protected
    if (note.isPasswordProtected) {
      // Password check will happen on the frontend
      // We just need to notify the client that it's protected
      return res.status(200).json({
        success: true,
        isPasswordProtected: true,
        data: {
          _id: note._id,
          title: note.title,
          user: note.user,
          isPasswordProtected: note.isPasswordProtected,
          lastUpdated: note.lastUpdated,
          createdAt: note.createdAt
        }
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Verify note password
// @route   POST /api/notes/:id/verify
// @access  Private
exports.verifyNotePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a password'
      });
    }

    const note = await Note.findById(req.params.id)
      .select('+password')
      .populate('labels', 'name color')
      .populate('collaborators', 'name email avatar');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note or is a collaborator
    if (
      note.user.toString() !== req.user.id &&
      !note.collaborators.some(collab => collab._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this note'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, note.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password'
      });
    }

    // Don't send the password back
    note.password = undefined;

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // If password is provided for protection
    if (req.body.password && req.body.isPasswordProtected) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const note = await Note.create(req.body);

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note or is a collaborator
    if (
      note.user.toString() !== req.user.id &&
      !note.collaborators.some(collab => collab.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    // If updating password
    if (req.body.password && req.body.isPasswordProtected) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update lastUpdated timestamp
    req.body.lastUpdated = Date.now();

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('labels', 'name color')
      .populate('collaborators', 'name email avatar');

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this note'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Upload images to a note
// @route   PUT /api/notes/:id/images
// @access  Private
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one file'
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note or is a collaborator
    if (
      note.user.toString() !== req.user.id &&
      !note.collaborators.some(collab => collab.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    // Add uploaded images to note
    const newImages = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      publicId: file.filename
    }));

    note.images = [...note.images, ...newImages];
    note.lastUpdated = Date.now();
    await note.save();

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search notes
// @route   GET /api/notes/search
// @access  Private
exports.searchNotes = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search query'
      });
    }

    // Search in title and content
    const notes = await Note.find({
      $and: [
        {
          $or: [
            { user: req.user.id },
            { collaborators: req.user.id }
          ]
        },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
      .populate('labels', 'name color')
      .populate('collaborators', 'name email avatar')
      .sort({ isPinned: -1, lastUpdated: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add collaborator to note
// @route   PUT /api/notes/:id/collaborators/:userId
// @access  Private
exports.addCollaborator = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add collaborators'
      });
    }

    // Check if user is already a collaborator
    if (note.collaborators.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already a collaborator'
      });
    }

    note.collaborators.push(req.params.userId);
    note.lastUpdated = Date.now();
    await note.save();

    const updatedNote = await Note.findById(req.params.id)
      .populate('labels', 'name color')
      .populate('collaborators', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedNote
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Remove collaborator from note
// @route   DELETE /api/notes/:id/collaborators/:userId
// @access  Private
exports.removeCollaborator = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove collaborators'
      });
    }

    // Filter out the collaborator
    note.collaborators = note.collaborators.filter(
      collab => collab.toString() !== req.params.userId
    );

    note.lastUpdated = Date.now();
    await note.save();

    const updatedNote = await Note.findById(req.params.id)
      .populate('labels', 'name color')
      .populate('collaborators', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedNote
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};