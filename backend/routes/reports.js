const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Client = require('../models/Client');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status = 'all', type = 'all', clientId = 'all' } = req.query;
    const query = { userId: req.user._id };

    if (status !== 'all') query.status = status;
    if (type !== 'all') query.type = type;
    if (clientId !== 'all') query.clientId = clientId === 'unassigned' ? null : clientId || null;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('clientId', 'name industry status');

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { clientId, title, type = 'manual', periodStart, periodEnd, summary = {}, payload = {}, text, status = 'draft' } = req.body;

    if (!title || !text) {
      return res.status(400).json({ error: 'Title and report text are required' });
    }

    if (title.length > 180) {
      return res.status(400).json({ error: 'Title must be under 180 characters' });
    }

    if (text.length > 20000) {
      return res.status(400).json({ error: 'Report text must be under 20000 characters' });
    }

    if (!['weekly_social', 'manual'].includes(type)) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    if (!['draft', 'sent', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid report status' });
    }

    if (clientId) {
      const client = await Client.findOne({ _id: clientId, userId: req.user._id });
      if (!client) return res.status(400).json({ error: 'Client not found' });
    }

    const report = await Report.create({
      userId: req.user._id,
      clientId: clientId || null,
      title: title.trim(),
      type,
      periodStart: periodStart ? new Date(periodStart) : null,
      periodEnd: periodEnd ? new Date(periodEnd) : null,
      summary,
      payload,
      text,
      status
    });

    await report.populate('clientId', 'name industry status');
    res.status(201).json({ message: 'Report saved successfully', report });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const allowed = ['title', 'text', 'status'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) report[key] = req.body[key];
    }

    if (report.title.length > 180) return res.status(400).json({ error: 'Title must be under 180 characters' });
    if (report.text.length > 20000) return res.status(400).json({ error: 'Report text must be under 20000 characters' });
    if (!['draft', 'sent', 'archived'].includes(report.status)) return res.status(400).json({ error: 'Invalid report status' });

    await report.save();
    await report.populate('clientId', 'name industry status');
    res.json({ message: 'Report updated successfully', report });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.status = 'archived';
    await report.save();
    res.json({ message: 'Report archived successfully', report });
  } catch (error) {
    console.error('Archive report error:', error);
    res.status(500).json({ error: 'Failed to archive report' });
  }
});

module.exports = router;
