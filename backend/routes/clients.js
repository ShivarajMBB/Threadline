const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');

function normalizeHandle(value = '') {
  return value.trim().replace(/^@+/, '');
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

function pickClientFields(body) {
  return {
    name: body.name?.trim(),
    industry: body.industry?.trim() || '',
    website: body.website?.trim() || '',
    instagramHandle: normalizeHandle(body.instagramHandle || ''),
    youtubeChannel: body.youtubeChannel?.trim() || '',
    contactName: body.contactName?.trim() || '',
    contactEmail: body.contactEmail?.trim().toLowerCase() || '',
    notes: body.notes?.trim() || '',
    status: body.status || 'active'
  };
}

function validateClientPayload(data, isCreate = true) {
  if (isCreate && !data.name) return 'Client name is required';
  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.length > 120)) {
    return 'Client name must be under 120 characters';
  }
  if (!['active', 'paused', 'archived'].includes(data.status)) {
    return 'Invalid client status';
  }
  if (!isValidOptionalUrl(data.website)) {
    return 'Website must be a valid http or https URL';
  }
  if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    return 'Contact email is invalid';
  }
  if (data.notes && data.notes.length > 2000) {
    return 'Notes must be under 2000 characters';
  }
  return null;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status = 'active', search } = req.query;
    const query = { userId: req.user._id };

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { instagramHandle: { $regex: search, $options: 'i' } },
        { youtubeChannel: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query).sort({ status: 1, updatedAt: -1 });
    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const stats = await Client.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byStatus = stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, { active: 0, paused: 0, archived: 0 });

    res.json({
      stats: {
        total: byStatus.active + byStatus.paused + byStatus.archived,
        ...byStatus
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ error: 'Failed to fetch client stats' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = pickClientFields(req.body);
    const validationError = validateClientPayload(data, true);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const client = new Client({
      userId: req.user._id,
      ...data
    });

    await client.save();
    res.status(201).json({ message: 'Client created successfully', client });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user._id });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const data = pickClientFields({ ...client.toObject(), ...req.body });
    const validationError = validateClientPayload(data, false);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    Object.assign(client, data);
    await client.save();

    res.json({ message: 'Client updated successfully', client });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user._id });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    client.status = 'archived';
    await client.save();

    res.json({ message: 'Client archived successfully', client });
  } catch (error) {
    console.error('Archive client error:', error);
    res.status(500).json({ error: 'Failed to archive client' });
  }
});

module.exports = router;
