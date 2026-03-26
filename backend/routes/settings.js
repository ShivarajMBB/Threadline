// routes/settings.js
const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/settings
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const settings = {
      acknowledgmentEnabled: req.user.acknowledgmentEnabled,
      acknowledgmentMessage: req.user.acknowledgmentMessage,
      plan: req.user.plan,
      subscriptionStatus: req.user.subscriptionStatus,
      trialEndsAt: req.user.trialEndsAt,
      instagramConnected: !!req.user.instagramBusinessAccountId,
      instagramUsername: req.user.instagramUsername,
      commentAutomations: req.user.commentAutomations || []
    };
    
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PATCH /api/settings/acknowledgment
 */
router.patch('/acknowledgment', authMiddleware, async (req, res) => {
  try {
    const { enabled, message } = req.body;
    
    if (enabled !== undefined) {
      req.user.acknowledgmentEnabled = enabled;
    }
    
    if (message !== undefined) {
      if (message.length > 200) {
        return res.status(400).json({ 
          error: 'Message must be less than 200 characters' 
        });
      }
      req.user.acknowledgmentMessage = message;
    }
    
    await req.user.save();
    
    res.json({
      message: 'Acknowledgment settings updated',
      settings: {
        acknowledgmentEnabled: req.user.acknowledgmentEnabled,
        acknowledgmentMessage: req.user.acknowledgmentMessage
      }
    });
  } catch (error) {
    console.error('Update acknowledgment error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * POST /api/settings/disconnect-instagram
 */
router.post('/disconnect-instagram', authMiddleware, async (req, res) => {
  try {
    req.user.instagramBusinessAccountId = null;
    req.user.instagramUsername = null;
    req.user.instagramAccessToken = null;
    req.user.instagramTokenExpiry = null;
    req.user.facebookPageId = null;
    
    await req.user.save();
    
    res.json({ message: 'Instagram account disconnected' });
  } catch (error) {
    console.error('Disconnect Instagram error:', error);
    res.status(500).json({ error: 'Failed to disconnect Instagram' });
  }
});

/**
 * GET /api/settings/comment-automations
 */
router.get('/comment-automations', authMiddleware, async (req, res) => {
  try {
    res.json({ automations: req.user.commentAutomations || [] });
  } catch (error) {
    console.error('Get comment automations error:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
});

/**
 * PUT /api/settings/comment-automations
 * Replace the entire automations array
 */
router.put('/comment-automations', authMiddleware, async (req, res) => {
  try {
    const { automations } = req.body;

    if (!Array.isArray(automations)) {
      return res.status(400).json({ error: 'automations must be an array' });
    }

    // Validate each automation
    for (const rule of automations) {
      if (!rule.keyword || typeof rule.keyword !== 'string') {
        return res.status(400).json({ error: 'Each automation must have a keyword' });
      }
      if (!rule.dmMessage || typeof rule.dmMessage !== 'string') {
        return res.status(400).json({ error: 'Each automation must have a DM message' });
      }
      if (rule.dmMessage.length > 500) {
        return res.status(400).json({ error: 'DM message must be under 500 characters' });
      }
      if (rule.publicReply && rule.publicReply.length > 200) {
        return res.status(400).json({ error: 'Public reply must be under 200 characters' });
      }
    }

    // Normalize keywords to uppercase and preserve triggerCount
    const existing = req.user.commentAutomations || [];
    req.user.commentAutomations = automations.map(rule => {
      const prev = existing.find(e => e._id?.toString() === rule._id);
      return {
        ...rule,
        keyword: rule.keyword.toUpperCase().trim(),
        triggerCount: prev?.triggerCount || rule.triggerCount || 0,
        createdAt: prev?.createdAt || new Date()
      };
    });

    await req.user.save();

    res.json({
      message: 'Comment automations updated',
      automations: req.user.commentAutomations
    });
  } catch (error) {
    console.error('Update comment automations error:', error);
    res.status(500).json({ error: 'Failed to update automations' });
  }
});

/**
 * DELETE /api/settings/clear-test-data
 * Clear all test conversations and leads (for dev mode testing)
 */
router.delete('/clear-test-data', authMiddleware, async (req, res) => {
  try {
    const convResult = await Conversation.deleteMany({ userId: req.user._id });
    const leadResult = await Lead.deleteMany({ userId: req.user._id });

    res.json({
      message: 'Test data cleared',
      deleted: {
        conversations: convResult.deletedCount,
        leads: leadResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear test data error:', error);
    res.status(500).json({ error: 'Failed to clear test data' });
  }
});

module.exports = router;
