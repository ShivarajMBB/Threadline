// models/ScheduledPost.js
const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema({
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
  
  // Post content
  caption: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  
  // Tracking (for internal analytics only - NOT automation triggers)
  trackingKeyword: {
    type: String,
    default: null
  },
  referenceSalesPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesPage',
    default: null
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'published', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Instagram post info (after publishing)
  instagramPostId: {
    type: String,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  
  // Analytics (manual tracking only)
  comments: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
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

// Indexes
scheduledPostSchema.index({ userId: 1, scheduledFor: 1 });
scheduledPostSchema.index({ userId: 1, status: 1 });
scheduledPostSchema.index({ userId: 1, clientId: 1, scheduledFor: 1 });

// Update timestamp
scheduledPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ScheduledPost', scheduledPostSchema);
