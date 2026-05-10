const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  industry: {
    type: String,
    default: '',
    trim: true,
    maxlength: 80
  },
  website: {
    type: String,
    default: '',
    trim: true,
    maxlength: 300
  },
  instagramHandle: {
    type: String,
    default: '',
    trim: true,
    maxlength: 80
  },
  youtubeChannel: {
    type: String,
    default: '',
    trim: true,
    maxlength: 160
  },
  contactName: {
    type: String,
    default: '',
    trim: true,
    maxlength: 120
  },
  contactEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
    maxlength: 160
  },
  notes: {
    type: String,
    default: '',
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active',
    index: true
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

clientSchema.index({ userId: 1, name: 1 });
clientSchema.index({ userId: 1, status: 1, updatedAt: -1 });

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);
