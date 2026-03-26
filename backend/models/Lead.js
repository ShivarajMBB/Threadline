// models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Customer info
  instagramUserId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: null
  },
  profilePictureUrl: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  
  // Lead source
  source: {
    type: String,
    enum: ['dm', 'comment', 'story_mention', 'story_reply'],
    required: true
  },
  sourcePostId: {
    type: String,
    default: null
  },
  sourceContent: {
    type: String,
    default: null
  },
  
  // Funnel stage — matches frontend exactly
  funnelState: {
    type: String,
    enum: ['new', 'replied', 'interested', 'call_booked', 'closed', 'lost'],
    default: 'new'
  },
  
  // Notes
  notes: {
    type: String,
    default: ''
  },
  
  // Revenue tracking
  estimatedValue: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  salesPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesPage',
    default: null
  },
  
  // Timestamps
  lastReply: {
    type: Date,
    default: null
  },
  closedAt: {
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

// Indexes
leadSchema.index({ userId: 1, funnelState: 1 });
leadSchema.index({ userId: 1, createdAt: -1 });

// Update timestamp
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set closedAt when status changes to closed
  if (this.isModified('funnelState') && this.funnelState === 'closed' && !this.closedAt) {
    this.closedAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
