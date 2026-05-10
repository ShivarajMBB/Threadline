// routes/leads.js
const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/leads/stats/overview
 * Get lead statistics
 * IMPORTANT: This MUST be before /:id or Express matches "stats" as an id
 */
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({ userId: req.user._id });
    
    const closedLeads = await Lead.countDocuments({
      userId: req.user._id,
      funnelState: 'closed'
    });
    
    const revenueResult = await Lead.aggregate([
      { $match: { userId: req.user._id, funnelState: 'closed' } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);
    
    const totalRevenue = revenueResult[0]?.total || 0;
    
    const pipelineStats = await Lead.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$funnelState', count: { $sum: 1 } } }
    ]);
    
    res.json({
      stats: {
        totalLeads,
        closedLeads,
        totalRevenue,
        conversionRate: totalLeads > 0 ? (closedLeads / totalLeads * 100).toFixed(1) : 0,
        pipeline: pipelineStats
      }
    });
  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({ error: 'Failed to fetch lead stats' });
  }
});

/**
 * GET /api/leads
 * Get all leads
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { funnelState, search, clientId } = req.query;
    
    const query = { userId: req.user._id };
    if (clientId && clientId !== 'all') {
      query.clientId = clientId === 'unassigned' ? null : clientId;
    }
    
    if (funnelState) {
      query.funnelState = funnelState;
    }
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .populate('salesPageId')
      .populate('clientId', 'name industry status');
    
    res.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

/**
 * GET /api/leads/:id
 * Get single lead
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('salesPageId').populate('clientId', 'name industry status');
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({ lead });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

/**
 * PATCH /api/leads/:id
 * Update lead (manual update)
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { funnelState, notes, name, email, phone, estimatedValue, revenue, clientId } = req.body;
    
    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Update fields
    if (funnelState) lead.funnelState = funnelState;
    if (notes !== undefined) lead.notes = notes;
    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (estimatedValue !== undefined) lead.estimatedValue = estimatedValue;
    if (revenue !== undefined) lead.revenue = revenue;
    if (clientId !== undefined) lead.clientId = clientId || null;
    
    // Track when business last replied/updated
    if (funnelState === 'replied' || funnelState === 'interested') {
      lead.lastReply = new Date();
    }
    
    await lead.save();
    
    res.json({
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

module.exports = router;
