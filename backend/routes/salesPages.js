// routes/salesPages.js
const express = require('express');
const router = express.Router();
const SalesPage = require('../models/SalesPage');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/sales-pages
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = { userId: req.user._id };
    const { clientId } = req.query;
    if (clientId && clientId !== 'all') {
      query.clientId = clientId === 'unassigned' ? null : clientId;
    }

    const salesPages = await SalesPage.find(query)
      .sort({ createdAt: -1 })
      .populate('clientId', 'name industry status');
    
    res.json({ salesPages });
  } catch (error) {
    console.error('Get sales pages error:', error);
    res.status(500).json({ error: 'Failed to fetch sales pages' });
  }
});

/**
 * POST /api/sales-pages
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, currency, imageUrl, clientId } = req.body;
    
    if (!title || !description || !price) {
      return res.status(400).json({ 
        error: 'Title, description, and price are required' 
      });
    }
    
    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    while (await SalesPage.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const salesPage = new SalesPage({
      userId: req.user._id,
      title,
      description,
      clientId: clientId || null,
      slug,
      price,
      currency: currency || 'USD',
      imageUrl
    });
    
    await salesPage.save();
    
    res.status(201).json({
      message: 'Sales page created successfully',
      salesPage,
      url: `${process.env.CLIENT_URL}/p/${slug}`
    });
  } catch (error) {
    console.error('Create sales page error:', error);
    res.status(500).json({ error: 'Failed to create sales page' });
  }
});

/**
 * GET /api/sales-pages/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const salesPage = await SalesPage.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!salesPage) {
      return res.status(404).json({ error: 'Sales page not found' });
    }
    
    res.json({ salesPage });
  } catch (error) {
    console.error('Get sales page error:', error);
    res.status(500).json({ error: 'Failed to fetch sales page' });
  }
});

/**
 * PATCH /api/sales-pages/:id
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, currency, imageUrl, active, clientId } = req.body;
    
    const salesPage = await SalesPage.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!salesPage) {
      return res.status(404).json({ error: 'Sales page not found' });
    }
    
    if (title) salesPage.title = title;
    if (description) salesPage.description = description;
    if (price) salesPage.price = price;
    if (currency) salesPage.currency = currency;
    if (imageUrl !== undefined) salesPage.imageUrl = imageUrl;
    if (active !== undefined) salesPage.active = active;
    if (clientId !== undefined) salesPage.clientId = clientId || null;
    
    await salesPage.save();
    
    res.json({
      message: 'Sales page updated successfully',
      salesPage
    });
  } catch (error) {
    console.error('Update sales page error:', error);
    res.status(500).json({ error: 'Failed to update sales page' });
  }
});

/**
 * DELETE /api/sales-pages/:id
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const salesPage = await SalesPage.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!salesPage) {
      return res.status(404).json({ error: 'Sales page not found' });
    }
    
    res.json({ message: 'Sales page deleted successfully' });
  } catch (error) {
    console.error('Delete sales page error:', error);
    res.status(500).json({ error: 'Failed to delete sales page' });
  }
});

/**
 * POST /api/sales-pages/:slug/view
 * Track page view (public endpoint)
 */
router.post('/:slug/view', async (req, res) => {
  try {
    const salesPage = await SalesPage.findOne({ slug: req.params.slug });
    
    if (!salesPage) {
      return res.status(404).json({ error: 'Sales page not found' });
    }
    
    salesPage.views += 1;
    await salesPage.save();
    
    res.json({ message: 'View tracked' });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

module.exports = router;
