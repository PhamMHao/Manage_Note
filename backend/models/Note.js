const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  images: [
    {
      url: String,
      publicId: String
    }
  ],
  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label'
    }
  ],
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for text search
NoteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', NoteSchema);