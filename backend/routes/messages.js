// routes/messages.js
const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Lead = require('../models/Lead');
const InstagramAPI = require('../services/instagramAPI');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/messages/conversations
 * Get all conversations for the user
 */
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    if (!req.user.instagramBusinessAccountId) {
      return res.status(400).json({
        error: 'Instagram account not connected'
      });
    }

    // Try to fetch from Instagram API first
    let igConversations = [];
    try {
      igConversations = await InstagramAPI.getConversations(
        req.user.instagramBusinessAccountId,
        req.user.instagramAccessToken
      );
    } catch (apiError) {
      console.log('Instagram API fetch failed, using DB data:', apiError.message);
    }

    // If API returned conversations, sync them to DB
    if (igConversations.length > 0) {
      for (const igConv of igConversations) {
        const participant = igConv.participants?.data?.find(
          p => p.id !== req.user.instagramBusinessAccountId
        );
        if (!participant) continue;

        let conversation = await Conversation.findOne({
          userId: req.user._id,
          instagramUserId: participant.id
        });

        if (!conversation) {
          conversation = new Conversation({
            userId: req.user._id,
            instagramUserId: participant.id,
            username: participant.username || 'Instagram User',
            source: 'dm',
            messages: [],
            unread: true
          });
        }

        if (igConv.messages?.data) {
          conversation.messages = igConv.messages.data.map(msg => ({
            id: msg.id,
            from: { id: msg.from?.id, username: msg.from?.username },
            message: msg.message,
            timestamp: new Date(msg.created_time),
            isFromBusiness: msg.from?.id === req.user.instagramBusinessAccountId
          }));
          conversation.lastMessageAt = new Date(igConv.updated_time);
        }

        await conversation.save();

        if (!conversation.leadId) {
          let lead = await Lead.findOne({
            userId: req.user._id,
            instagramUserId: participant.id
          });
          if (!lead) {
            lead = new Lead({
              userId: req.user._id,
              instagramUserId: participant.id,
              username: participant.username || 'Instagram User',
              source: 'dm',
              funnelState: 'new'
            });
            await lead.save();
          }
          conversation.leadId = lead._id;
          await conversation.save();
        }
      }
    }

    // ALWAYS return conversations from DB (includes webhook-received data)
    const conversations = await Conversation.find({
      userId: req.user._id
    }).sort({ lastMessageAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * POST /api/messages/send
 * Send a message (manual reply)
 */
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    
    if (!message || !conversationId) {
      return res.status(400).json({
        error: 'Conversation ID and message are required'
      });
    }

    if (typeof message !== 'string' || message.length > 1000) {
      return res.status(400).json({
        error: 'Message must be a string and under 1000 characters'
      });
    }
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Send via Instagram API
    const result = await InstagramAPI.sendMessage(
      conversation.instagramUserId,
      message,
      req.user.instagramAccessToken
    );
    
    // Add message to conversation
    conversation.messages.push({
      id: result.message_id || Date.now().toString(),
      from: {
        id: req.user.instagramBusinessAccountId,
        username: req.user.instagramUsername
      },
      message: message,
      timestamp: new Date(),
      isFromBusiness: true
    });
    
    conversation.lastMessageAt = new Date();
    conversation.unread = false;
    await conversation.save();
    
    // Update lead status
    if (conversation.leadId) {
      const lead = await Lead.findById(conversation.leadId);
      if (lead && lead.funnelState === 'new') {
        lead.funnelState = 'replied';
        lead.lastReply = new Date();
        await lead.save();
      }
    }
    
    res.json({
      message: 'Message sent successfully',
      conversation
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /api/messages/conversation/:id
 * Get single conversation details
 */
router.get('/conversation/:id', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('leadId');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Mark as read
    conversation.unread = false;
    await conversation.save();
    
    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

/**
 * GET /api/messages/stats
 * Get message statistics
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalConversations = await Conversation.countDocuments({ 
      userId: req.user._id 
    });
    
    const unreadCount = await Conversation.countDocuments({ 
      userId: req.user._id,
      unread: true 
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayConversations = await Conversation.countDocuments({
      userId: req.user._id,
      lastMessageAt: { $gte: today }
    });
    
    res.json({
      stats: {
        totalConversations,
        unreadMessages: unreadCount,
        todayConversations
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
