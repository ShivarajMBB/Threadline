const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
    maxlength: 180
  },
  type: {
    type: String,
    enum: ['weekly_social', 'manual'],
    default: 'weekly_social',
    index: true
  },
  periodStart: {
    type: Date,
    default: null
  },
  periodEnd: {
    type: Date,
    default: null
  },
  summary: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  text: {
    type: String,
    required: true,
    maxlength: 20000
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'archived'],
    default: 'draft',
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

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, status: 1, createdAt: -1 });

reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema);
