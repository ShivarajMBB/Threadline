const mongoose = require('mongoose');

const metricSnapshotSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  engagementActions: { type: Number, default: 0 },
  capturedAt: { type: Date, default: Date.now }
}, { _id: false });

const instagramMediaSchema = new mongoose.Schema({
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
  instagramMediaId: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    default: null
  },
  mediaUrl: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  permalink: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: null
  },
  hashtags: [{
    type: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  engagementActions: {
    type: Number,
    default: 0
  },
  engagementRate: {
    type: Number,
    default: 0
  },
  metricSnapshots: [metricSnapshotSchema],
  firstSyncedAt: {
    type: Date,
    default: Date.now
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
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

instagramMediaSchema.index({ userId: 1, instagramMediaId: 1 }, { unique: true });
instagramMediaSchema.index({ userId: 1, timestamp: -1 });
instagramMediaSchema.index({ userId: 1, engagementRate: -1 });
instagramMediaSchema.index({ userId: 1, clientId: 1, timestamp: -1 });

instagramMediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InstagramMedia', instagramMediaSchema);
