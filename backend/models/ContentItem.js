const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  platform: {
    type: String,
    enum: ['instagram', 'youtube', 'both'],
    default: 'instagram',
    index: true
  },
  contentType: {
    type: String,
    enum: ['post', 'reel', 'story', 'short', 'video', 'carousel'],
    default: 'post'
  },
  caption: {
    type: String,
    default: '',
    maxlength: 5000
  },
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  dueDate: {
    type: Date,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['idea', 'draft', 'scheduled', 'published', 'archived'],
    default: 'idea',
    index: true
  },
  approvalStatus: {
    type: String,
    enum: ['internal', 'needs_client_review', 'approved', 'changes_requested'],
    default: 'internal',
    index: true
  },
  assetUrl: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    default: '',
    maxlength: 2000
  },
  publishedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

contentItemSchema.index({ userId: 1, status: 1, dueDate: 1 });
contentItemSchema.index({ userId: 1, clientId: 1, dueDate: 1 });

contentItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('ContentItem', contentItemSchema);
