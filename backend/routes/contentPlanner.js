const express = require('express');
const router = express.Router();
const ContentItem = require('../models/ContentItem');
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');

const VALID_STATUSES = ['idea', 'draft', 'scheduled', 'published', 'archived'];
const VALID_APPROVALS = ['internal', 'needs_client_review', 'approved', 'changes_requested'];
const VALID_PLATFORMS = ['instagram', 'youtube', 'both'];
const VALID_TYPES = ['post', 'reel', 'story', 'short', 'video', 'carousel'];

function parseHashtags(value) {
  if (Array.isArray(value)) {
    return value.map(tag => String(tag).trim().replace(/^#/, '').toLowerCase()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\s]+/)
      .map(tag => tag.trim().replace(/^#/, '').toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function isValidOptionalUrl(value = '') {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_error) {
    return false;
  }
}

async function assertClientOwnership(userId, clientId) {
  if (!clientId) return null;
  const client = await Client.findOne({ _id: clientId, userId });
  return client;
}

function normalizePayload(body) {
  return {
    clientId: body.clientId || null,
    title: body.title?.trim(),
    platform: body.platform || 'instagram',
    contentType: body.contentType || 'post',
    caption: body.caption?.trim() || '',
    hashtags: parseHashtags(body.hashtags),
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    status: body.status || 'idea',
    approvalStatus: body.approvalStatus || 'internal',
    assetUrl: body.assetUrl?.trim() || '',
    notes: body.notes?.trim() || ''
  };
}

function validatePayload(data, isCreate = true) {
  if (isCreate && !data.title) return 'Title is required';
  if (data.title !== undefined && (!data.title || data.title.length > 160)) return 'Title must be under 160 characters';
  if (!VALID_PLATFORMS.includes(data.platform)) return 'Invalid platform';
  if (!VALID_TYPES.includes(data.contentType)) return 'Invalid content type';
  if (!VALID_STATUSES.includes(data.status)) return 'Invalid status';
  if (!VALID_APPROVALS.includes(data.approvalStatus)) return 'Invalid approval status';
  if (data.caption && data.caption.length > 5000) return 'Caption must be under 5000 characters';
  if (data.notes && data.notes.length > 2000) return 'Notes must be under 2000 characters';
  if (data.assetUrl && !isValidOptionalUrl(data.assetUrl)) return 'Asset URL must be a valid http or https URL';
  if (data.dueDate && Number.isNaN(data.dueDate.getTime())) return 'Due date is invalid';
  if (data.hashtags.length > 40) return 'Use 40 or fewer hashtags';
  return null;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, approvalStatus, platform, clientId, from, to, search } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'all') query.status = status;
    if (approvalStatus && approvalStatus !== 'all') query.approvalStatus = approvalStatus;
    if (platform && platform !== 'all') query.platform = platform;
    if (clientId && clientId !== 'all') query.clientId = clientId === 'unassigned' ? null : clientId;

    if (from || to) {
      query.dueDate = {};
      if (from) query.dueDate.$gte = new Date(from);
      if (to) query.dueDate.$lte = new Date(to);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caption: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { hashtags: { $regex: search.replace(/^#/, ''), $options: 'i' } }
      ];
    }

    const items = await ContentItem.find(query)
      .sort({ dueDate: 1, updatedAt: -1 })
      .populate('clientId', 'name industry status instagramHandle youtubeChannel');

    res.json({ items });
  } catch (error) {
    console.error('Get content items error:', error);
    res.status(500).json({ error: 'Failed to fetch content planner items' });
  }
});

router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const [byStatus, byApproval, overdueCount] = await Promise.all([
      ContentItem.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ContentItem.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
      ]),
      ContentItem.countDocuments({
        userId: req.user._id,
        dueDate: { $lt: new Date() },
        status: { $in: ['idea', 'draft', 'scheduled'] }
      })
    ]);

    res.json({
      stats: {
        byStatus,
        byApproval,
        overdueCount
      }
    });
  } catch (error) {
    console.error('Get content planner stats error:', error);
    res.status(500).json({ error: 'Failed to fetch content planner stats' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = normalizePayload(req.body);
    const validationError = validatePayload(data, true);
    if (validationError) return res.status(400).json({ error: validationError });

    if (data.clientId) {
      const client = await assertClientOwnership(req.user._id, data.clientId);
      if (!client) return res.status(400).json({ error: 'Client not found' });
    }

    const item = new ContentItem({
      userId: req.user._id,
      ...data
    });

    await item.save();
    await item.populate('clientId', 'name industry status instagramHandle youtubeChannel');
    res.status(201).json({ message: 'Content item created successfully', item });
  } catch (error) {
    console.error('Create content item error:', error);
    res.status(500).json({ error: 'Failed to create content item' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await ContentItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Content item not found' });

    const merged = {
      ...item.toObject(),
      ...req.body,
      hashtags: req.body.hashtags !== undefined ? req.body.hashtags : item.hashtags
    };
    const data = normalizePayload(merged);
    const validationError = validatePayload(data, false);
    if (validationError) return res.status(400).json({ error: validationError });

    if (data.clientId) {
      const client = await assertClientOwnership(req.user._id, data.clientId);
      if (!client) return res.status(400).json({ error: 'Client not found' });
    }

    Object.assign(item, data);
    await item.save();
    await item.populate('clientId', 'name industry status instagramHandle youtubeChannel');
    res.json({ message: 'Content item updated successfully', item });
  } catch (error) {
    console.error('Update content item error:', error);
    res.status(500).json({ error: 'Failed to update content item' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await ContentItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Content item not found' });

    item.status = 'archived';
    await item.save();
    await item.populate('clientId', 'name industry status instagramHandle youtubeChannel');
    res.json({ message: 'Content item archived successfully', item });
  } catch (error) {
    console.error('Archive content item error:', error);
    res.status(500).json({ error: 'Failed to archive content item' });
  }
});

module.exports = router;
