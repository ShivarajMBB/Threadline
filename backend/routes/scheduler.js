// routes/scheduler.js
const express = require('express');
const router = express.Router();
const ScheduledPost = require('../models/ScheduledPost');
const InstagramAPI = require('../services/instagramAPI');
const authMiddleware = require('../middleware/auth');

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_error) {
    return false;
  }
}

/**
 * GET /api/scheduler/posts
 */
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const { status, clientId } = req.query;
    
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }
    if (clientId && clientId !== 'all') {
      query.clientId = clientId === 'unassigned' ? null : clientId;
    }
    
    const posts = await ScheduledPost.find(query)
      .sort({ scheduledFor: -1 })
      .populate('referenceSalesPageId')
      .populate('clientId', 'name industry status');
    
    res.json({ posts });
  } catch (error) {
    console.error('Get scheduled posts error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled posts' });
  }
});

/**
 * POST /api/scheduler/posts
 */
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { caption, imageUrl, scheduledFor, trackingKeyword, referenceSalesPageId, clientId } = req.body;
    
    if (!caption || !imageUrl || !scheduledFor) {
      return res.status(400).json({ 
        error: 'Caption, image URL, and scheduled time are required' 
      });
    }

    if (typeof caption !== 'string' || caption.trim().length > 2200) {
      return res.status(400).json({
        error: 'Caption must be under 2200 characters'
      });
    }

    if (!isValidHttpUrl(imageUrl)) {
      return res.status(400).json({
        error: 'Image URL must be a valid http or https URL'
      });
    }
    
    if (!req.user.instagramBusinessAccountId) {
      return res.status(400).json({ 
        error: 'Instagram account not connected' 
      });
    }
    
    if (new Date(scheduledFor) <= new Date()) {
      return res.status(400).json({ 
        error: 'Scheduled time must be in the future' 
      });
    }
    
    const post = new ScheduledPost({
      userId: req.user._id,
      clientId: clientId || null,
      caption: caption.trim(),
      imageUrl: imageUrl.trim(),
      scheduledFor: new Date(scheduledFor),
      trackingKeyword,
      referenceSalesPageId,
      status: 'scheduled'
    });
    
    await post.save();
    
    res.status(201).json({
      message: 'Post scheduled successfully',
      post
    });
  } catch (error) {
    console.error('Create scheduled post error:', error);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

/**
 * POST /api/scheduler/posts/:id/publish
 * Manually publish a post now
 */
router.post('/posts/:id/publish', authMiddleware, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.status !== 'scheduled') {
      return res.status(400).json({ error: 'Post is not in scheduled status' });
    }
    
    try {
      const containerId = await InstagramAPI.createMediaContainer(
        req.user.instagramBusinessAccountId,
        post.imageUrl,
        post.caption,
        req.user.instagramAccessToken
      );
      
      const mediaId = await InstagramAPI.publishMedia(
        req.user.instagramBusinessAccountId,
        containerId,
        req.user.instagramAccessToken
      );
      
      post.status = 'published';
      post.instagramPostId = mediaId;
      post.publishedAt = new Date();
      await post.save();
      
      res.json({
        message: 'Post published successfully',
        post,
        instagramPostId: mediaId
      });
    } catch (publishError) {
      console.error('Publish error:', publishError);
      
      post.status = 'failed';
      post.errorMessage = publishError.message;
      await post.save();
      
      res.status(500).json({ 
        error: 'Failed to publish post',
        details: publishError.message 
      });
    }
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

/**
 * DELETE /api/scheduler/posts/:id
 */
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.status === 'published') {
      return res.status(400).json({ 
        error: 'Cannot delete published post' 
      });
    }
    
    if (post.status === 'scheduled') {
      post.status = 'cancelled';
      await post.save();
    } else {
      await post.deleteOne();
    }
    
    res.json({ message: 'Post cancelled/deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
