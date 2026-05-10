// models/Conversation.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: String, // Instagram message ID
  from: {
    id: String,
    username: String
  },
  message: String,
  timestamp: Date,
  isFromBusiness: {
    type: Boolean,
    default: false
  }
});

const conversationSchema = new mongoose.Schema({
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
  
  // Instagram user info
  instagramUserId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  profilePictureUrl: {
    type: String,
    default: null
  },
  
  // Conversation metadata
  source: {
    type: String,
    enum: ['dm', 'comment', 'story_mention', 'story_reply'],
    required: true
  },
  sourcePostId: {
    type: String, // If from comment/story
    default: null
  },
  
  // Messages
  messages: [messageSchema],
  
  // Status
  unread: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  // Link to lead
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
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

// Indexes for performance
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ userId: 1, unread: 1 });
conversationSchema.index({ userId: 1, clientId: 1, lastMessageAt: -1 });

// Update timestamp
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
