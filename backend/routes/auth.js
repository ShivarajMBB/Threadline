// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InstagramAPI = require('../services/instagramAPI');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, businessName } = req.body;
    
    // Validation
    if (!email || !password || !businessName) {
      return res.status(400).json({ 
        error: 'Email, password, and business name are required' 
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user
    const user = new User({
      email,
      password,
      businessName
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        businessName: user.businessName,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        businessName: user.businessName,
        plan: user.plan,
        instagramConnected: !!user.instagramBusinessAccountId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/instagram/connect
 * Connect Instagram Business Account
 */
router.post('/instagram/connect', authMiddleware, async (req, res) => {
  try {
    const { accessToken, pageId } = req.body;
    
    // Exchange for long-lived token
    const longLivedToken = await InstagramAPI.getLongLivedToken(accessToken);
    
    // Get Instagram Business Account ID
    const igBusinessAccountId = await InstagramAPI.getInstagramBusinessAccount(
      pageId,
      longLivedToken
    );
    
    if (!igBusinessAccountId) {
      return res.status(400).json({ 
        error: 'No Instagram Business Account found for this page' 
      });
    }
    
    // Get account info
    const accountInfo = await InstagramAPI.getAccountInfo(
      igBusinessAccountId,
      longLivedToken
    );
    
    // Update user
    req.user.instagramBusinessAccountId = igBusinessAccountId;
    req.user.instagramUsername = accountInfo.username;
    req.user.instagramAccessToken = longLivedToken;
    req.user.instagramTokenExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
    req.user.facebookPageId = pageId;
    
    await req.user.save();
    
    res.json({
      message: 'Instagram account connected successfully',
      instagram: {
        username: accountInfo.username,
        profilePictureUrl: accountInfo.profile_picture_url,
        followersCount: accountInfo.followers_count
      }
    });
  } catch (error) {
    console.error('Instagram connection error:', error);
    res.status(500).json({ error: 'Failed to connect Instagram account' });
  }
});

/**
 * GET /api/auth/instagram/login
 * Redirect to Instagram OAuth (using Instagram API with Instagram Login)
 */
router.get('/instagram/login', (req, res) => {
  const redirectUri = `${process.env.NGROK_URL || 'http://localhost:5000'}/api/auth/instagram/callback`;
  const scope = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights';
  const appId = process.env.INSTAGRAM_APP_ID;

  const igAuthUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

  res.redirect(igAuthUrl);
});

/**
 * GET /api/auth/instagram/callback
 * Handle Instagram OAuth callback - exchange code for tokens
 */
router.get('/instagram/callback', async (req, res) => {
  try {
    const { code, error: authError } = req.query;

    if (authError) {
      return res.status(400).send(`<h2>Authorization denied</h2><p>${authError}</p>`);
    }

    if (!code) {
      return res.status(400).send('No authorization code received');
    }

    const axios = require('axios');
    const redirectUri = `${process.env.NGROK_URL || 'http://localhost:5000'}/api/auth/instagram/callback`;
    const igAppId = process.env.INSTAGRAM_APP_ID;
    const igAppSecret = process.env.INSTAGRAM_APP_SECRET;

    // Step 1: Exchange code for short-lived token
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token',
      new URLSearchParams({
        client_id: igAppId,
        client_secret: igAppSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const shortLivedToken = tokenResponse.data.access_token;
    const igUserId = tokenResponse.data.user_id;
    console.log('Got short-lived token for user:', igUserId);

    // Step 2: Exchange for long-lived token
    const longLivedResponse = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: igAppSecret,
        access_token: shortLivedToken
      }
    });

    const longLivedToken = longLivedResponse.data.access_token;
    console.log('Got long-lived token');

    // Step 3: Get user info
    const userInfoResponse = await axios.get(`https://graph.instagram.com/v21.0/me`, {
      params: {
        fields: 'user_id,username,account_type,profile_picture_url',
        access_token: longLivedToken
      }
    });

    const igUsername = userInfoResponse.data.username;
    const igAccountId = userInfoResponse.data.user_id || igUserId;
    console.log('Instagram account:', igUsername, 'ID:', igAccountId);

    // Step 4: Save to the test user
    const user = await User.findOne({ email: 'test@test.com' });
    if (user) {
      user.instagramBusinessAccountId = igAccountId.toString();
      user.instagramUsername = igUsername;
      user.instagramAccessToken = longLivedToken;
      user.instagramTokenExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      user.facebookPageId = process.env.FACEBOOK_PAGE_ID || '61587708387604';
      await user.save();
      console.log('User updated with Instagram token!');
    }

    res.send(
      '<h2>Instagram Connected Successfully!</h2>' +
      '<p><strong>Instagram Account:</strong> @' + igUsername + '</p>' +
      '<p><strong>Instagram ID:</strong> ' + igAccountId + '</p>' +
      '<p><strong>Account Type:</strong> ' + userInfoResponse.data.account_type + '</p>' +
      '<p>Token saved! You can close this window and go back to <a href="http://localhost:5173">Threadline CRM</a>.</p>'
    );

  } catch (error) {
    console.error('Instagram callback error:', error.response?.data || error.message);
    res.status(500).send('<h2>Error</h2><pre>' + JSON.stringify(error.response?.data || error.message, null, 2) + '</pre>');
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -instagramAccessToken');
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * GET /api/auth/debug-token
 * Debug: Check what permissions the Instagram token has
 */
router.get('/debug-token', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const axios = require('axios');

    if (!user.instagramAccessToken) {
      return res.json({ error: 'No Instagram token found' });
    }

    // Check token info
    const tokenDebug = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'user_id,username,account_type',
        access_token: user.instagramAccessToken
      }
    });

    // Check token permissions
    let permissions = null;
    try {
      const permResponse = await axios.get(`https://graph.instagram.com/v21.0/me/permissions`, {
        params: { access_token: user.instagramAccessToken }
      });
      permissions = permResponse.data;
    } catch (e) {
      permissions = { error: e.response?.data || e.message };
    }

    // Try conversations with different param combos
    let conversations = {};

    // Attempt 1: default
    try {
      const r1 = await axios.get('https://graph.instagram.com/v21.0/me/conversations', {
        params: { platform: 'instagram', access_token: user.instagramAccessToken }
      });
      conversations.withPlatform = r1.data;
    } catch (e) {
      conversations.withPlatform = { error: e.response?.data?.error?.message || e.message };
    }

    // Attempt 2: with folder=inbox
    try {
      const r2 = await axios.get('https://graph.instagram.com/v21.0/me/conversations', {
        params: { platform: 'instagram', folder: 'inbox', access_token: user.instagramAccessToken }
      });
      conversations.withFolder = r2.data;
    } catch (e) {
      conversations.withFolder = { error: e.response?.data?.error?.message || e.message };
    }

    // Attempt 3: without platform param
    try {
      const r3 = await axios.get('https://graph.instagram.com/v21.0/me/conversations', {
        params: { access_token: user.instagramAccessToken }
      });
      conversations.noPlatform = r3.data;
    } catch (e) {
      conversations.noPlatform = { error: e.response?.data?.error?.message || e.message };
    }

    // Attempt 4: using user_id instead of /me
    try {
      const r4 = await axios.get(`https://graph.instagram.com/v21.0/${user.instagramBusinessAccountId}/conversations`, {
        params: { platform: 'instagram', access_token: user.instagramAccessToken }
      });
      conversations.withUserId = r4.data;
    } catch (e) {
      conversations.withUserId = { error: e.response?.data?.error?.message || e.message };
    }

    // Attempt 5: using scoped ID (the 'id' field, not 'user_id')
    const scopedId = tokenDebug.data.id;
    try {
      const r5 = await axios.get(`https://graph.instagram.com/v21.0/${scopedId}/conversations`, {
        params: { platform: 'instagram', access_token: user.instagramAccessToken }
      });
      conversations.withScopedId = r5.data;
    } catch (e) {
      conversations.withScopedId = { error: e.response?.data?.error?.message || e.message };
    }

    // Attempt 6: try Facebook app token to debug scopes
    let tokenScopes = null;
    try {
      const r6 = await axios.get('https://graph.facebook.com/debug_token', {
        params: {
          input_token: user.instagramAccessToken,
          access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
        }
      });
      tokenScopes = r6.data;
    } catch (e) {
      tokenScopes = { error: e.response?.data?.error?.message || e.message };
    }

    res.json({
      igAccountId: user.instagramBusinessAccountId,
      scopedId: scopedId,
      igUsername: user.instagramUsername,
      tokenInfo: tokenDebug.data,
      permissions,
      conversations,
      tokenScopes,
      tokenExpiry: user.instagramTokenExpiry
    });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

/**
 * POST /api/auth/update-token
 * Update Instagram access token (from Meta Dashboard generated token)
 */
router.post('/update-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const axios = require('axios');

    // Verify the token works
    const verify = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'user_id,username,account_type',
        access_token: token
      }
    });

    // Update user
    req.user.instagramAccessToken = token;
    req.user.instagramTokenExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
    await req.user.save();

    // Test conversations with the new token
    let convTest = null;
    try {
      const convResponse = await axios.get('https://graph.instagram.com/v21.0/me/conversations', {
        params: { platform: 'instagram', fields: 'id,updated_time,participants', access_token: token }
      });
      convTest = convResponse.data;
    } catch (e) {
      convTest = { error: e.response?.data?.error?.message || e.message };
    }

    res.json({
      message: 'Token updated successfully',
      tokenVerified: verify.data,
      conversationTest: convTest
    });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;
