// server.js - Main Express Server for Threadline CRM
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Track DB connection status for health check
let dbConnected = false;
mongoose.connection.on('connected', () => { dbConnected = true; });
mongoose.connection.on('disconnected', () => { dbConnected = false; });

// Middleware
app.use(helmet()); // Security headers
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

// IMPORTANT: Webhook routes MUST be registered BEFORE mongoSanitize
// because Meta sends query params with dots (hub.mode, hub.verify_token, hub.challenge)
// and mongoSanitize strips keys containing dots as potential NoSQL injection
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use('/api/webhooks', webhookRoutes); // Instagram webhooks - before sanitize

// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Prevent NoSQL injection

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Import routes
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');
const leadsRoutes = require('./routes/leads');
const salesPagesRoutes = require('./routes/salesPages');
const schedulerRoutes = require('./routes/scheduler');
const settingsRoutes = require('./routes/settings');
const audienceInsightsRoutes = require('./routes/audienceInsights');
const socialAnalyzerRoutes = require('./routes/socialAnalyzer');
const clientsRoutes = require('./routes/clients');
const contentPlannerRoutes = require('./routes/contentPlanner');
const reportsRoutes = require('./routes/reports');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/sales-pages', salesPagesRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audience-insights', audienceInsightsRoutes);
app.use('/api/social-analyzer', socialAnalyzerRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/content-planner', contentPlannerRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint — actually checks DB status
app.get('/health', (req, res) => {
  const status = dbConnected ? 'ok' : 'degraded';
  const code = dbConnected ? 200 : 503;

  res.status(code).json({ 
    status,
    database: dbConnected ? 'connected' : 'disconnected',
    message: 'Threadline CRM API is running',
    timestamp: new Date().toISOString()
  });
});

// Privacy Policy (required for Meta App Review / Live mode)
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html><head><title>Privacy Policy - Threadline CRM</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px;">
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
      <h2>Data We Collect</h2>
      <p>Threadline CRM collects Instagram messages, comments, and profile information only when you explicitly connect your Instagram Business account.</p>
      <h2>How We Use Your Data</h2>
      <p>Your data is used solely to display your Instagram conversations and manage leads within the Threadline CRM dashboard. We do not sell or share your data with third parties.</p>
      <h2>Data Storage</h2>
      <p>Data is stored securely in our database and is only accessible to you through your authenticated account.</p>
      <h2>Data Deletion</h2>
      <p>You can disconnect your Instagram account at any time from Settings, which will stop data collection. To request full data deletion, contact us.</p>
      <h2>Contact</h2>
      <p>For privacy concerns, contact us at the email associated with your account.</p>
    </body></html>
  `);
});

// Data Deletion Request (required by Meta)
app.get('/data-deletion', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html><head><title>Data Deletion - Threadline CRM</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px;">
      <h1>Data Deletion Request</h1>
      <p>To request deletion of your data, disconnect your Instagram account from Threadline CRM Settings, or contact us directly.</p>
      <p>We will process all deletion requests within 30 days.</p>
    </body></html>
  `);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Threadline CRM API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const { startBackgroundJobs } = require('./services/backgroundJobs');

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 API available at http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  startBackgroundJobs();
});

module.exports = app;
