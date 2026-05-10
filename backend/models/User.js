// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  businessName: {
    type: String,
    required: true
  },
  
  // Instagram Business Account Data
  instagramBusinessAccountId: {
    type: String,
    default: null
  },
  instagramUsername: {
    type: String,
    default: null
  },
  instagramAccessToken: {
    type: String,
    default: null
  },
  instagramTokenExpiry: {
    type: Date,
    default: null
  },
  facebookPageId: {
    type: String,
    default: null
  },
  lastInstagramMediaSyncAt: {
    type: Date,
    default: null
  },
  
  // Settings
  acknowledgmentEnabled: {
    type: Boolean,
    default: false
  },
  acknowledgmentMessage: {
    type: String,
    default: 'Thanks for reaching out! We\'ll reply shortly.'
  },

  // Comment-to-DM Automations
  commentAutomations: [{
    keyword: { type: String, required: true },
    dmMessage: { type: String, required: true },
    publicReply: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    triggerCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Subscription info
  plan: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'trial'],
    default: 'trial'
  },
  trialEndsAt: {
    type: Date,
    default: () => new Date(+new Date() + 14*24*60*60*1000) // 14 days
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
