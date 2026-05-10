# ðŸš€ THREADLINE CRM BACKEND - SETUP & DEPLOYMENT GUIDE

Complete production-ready backend for Meta App Review

---

## ðŸ“‹ TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Facebook App Configuration](#facebook-app-configuration)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Meta App Review Testing](#meta-app-review-testing)
7. [API Documentation](#api-documentation)

---

## âš¡ QUICK START (5 Minutes)

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your credentials
nano .env  # or use any text editor

# 5. Start MongoDB (if running locally)
mongod

# 6. Start server
npm run dev

# Server runs on http://localhost:5000
```

---

## ðŸ”§ ENVIRONMENT SETUP

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **MongoDB** 6+ (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Facebook Developer Account** ([Sign up](https://developers.facebook.com))

### Install MongoDB

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

**OR Use MongoDB Atlas (Cloud):**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Use in `.env` file

---

## ðŸ“± FACEBOOK APP CONFIGURATION

### Step 1: Create Facebook App

1. Go to https://developers.facebook.com
2. Click "My Apps" â†’ "Create App"
3. Choose "Business" type
4. Fill in app details:
   - **App Name:** Threadline CRM
   - **Contact Email:** your-email@example.com
5. Click "Create App"

### Step 2: Add Instagram Products

1. In app dashboard, click "Add Product"
2. Find "Instagram" â†’ Click "Set Up"
3. Find "Messenger" â†’ Click "Set Up" (needed for DMs)

### Step 3: Configure Instagram Basic Display

1. Go to Instagram â†’ Basic Display
2. Create New App
3. Fill in OAuth Redirect URIs:
   ```
   https://your-domain.com/auth/instagram/callback
   http://localhost:5000/auth/instagram/callback
   ```

### Step 4: Get App Credentials

1. Go to Settings â†’ Basic
2. Copy **App ID** and **App Secret**
3. Add to `.env`:
   ```
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   ```

### Step 5: Set Up Webhooks

1. Go to Instagram â†’ Configuration
2. Edit Subscription
3. Callback URL: `https://your-domain.com/api/webhooks`
4. Verify Token: (same as `WEBHOOK_VERIFY_TOKEN` in `.env`)
5. Subscribe to fields:
   - `messages`
   - `messaging_postbacks`
   - `messaging_optins`
   - `message_reactions`
   - `comments`
   - `mentions`

---

## ðŸ’» LOCAL DEVELOPMENT

### 1. Clone/Setup Project

```bash
# If you have the files, just navigate to backend folder
cd backend

# Install dependencies
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/threadline-crm
JWT_SECRET=generate-a-random-secret-here
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
WEBHOOK_VERIFY_TOKEN=any-random-string
CLIENT_URL=http://localhost:3000
ENABLE_BACKGROUND_JOBS=false
```

Set `ENABLE_BACKGROUND_JOBS=true` in production when you want Threadline to automatically refresh expiring Instagram tokens once per day and sync connected Instagram media every 6 hours.

### 3. Generate JWT Secret

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output to JWT_SECRET in .env
```

### 4. Start Development Server

```bash
# With auto-reload
npm run dev

# Regular start
npm start
```

**Server will run on:** `http://localhost:5000`

### 5. Test Health Endpoint

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Threadline CRM API is running",
  "timestamp": "2026-02-07T..."
}
```

---

## ðŸŒ PRODUCTION DEPLOYMENT

### Option 1: Deploy to Heroku

```bash
# 1. Install Heroku CLI
# Download from https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create threadline-crm-api

# 4. Add MongoDB addon
heroku addons:create mongolab:sandbox

# 5. Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set FACEBOOK_APP_ID=your-app-id
heroku config:set FACEBOOK_APP_SECRET=your-app-secret
heroku config:set WEBHOOK_VERIFY_TOKEN=your-token
heroku config:set CLIENT_URL=https://your-frontend-url.com

# 6. Deploy
git push heroku main

# 7. Open app
heroku open
```

### Option 2: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Add environment variables in Railway dashboard
6. Deploy automatically on push

### Option 3: Deploy to Render

1. Go to https://render.com
2. Click "New" â†’ "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables
6. Deploy

### Option 4: Deploy to DigitalOcean/AWS

**Using PM2:**

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Node.js & MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs mongodb

# 3. Clone repository
git clone your-repo-url
cd backend

# 4. Install dependencies
npm install

# 5. Create .env file with production values

# 6. Install PM2
sudo npm install -g pm2

# 7. Start app
pm2 start server.js --name threadline-api

# 8. Setup auto-restart
pm2 startup
pm2 save

# 9. Setup Nginx reverse proxy (optional)
sudo apt install nginx
# Configure nginx to proxy to localhost:5000
```

---

## ðŸ§ª META APP REVIEW TESTING

### Step 1: Set Up Test Users

1. Go to Facebook Developers â†’ Roles â†’ Test Users
2. Create test Instagram Business Account
3. Get access token for testing

### Step 2: Test Endpoints Meta Will Check

```bash
# Test 1: Health Check
curl https://your-api-url.com/health

# Test 2: Webhook Verification
curl "https://your-api-url.com/api/webhooks?hub.mode=subscribe&hub.challenge=test&hub.verify_token=your-token"

# Test 3: Get Conversations (requires auth)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-api-url.com/api/messages/conversations

# Test 4: Send Message (manual reply)
curl -X POST https://your-api-url.com/api/messages/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"123","message":"Test reply"}'
```

### Step 3: Provide Test Credentials to Meta

When submitting for review, provide:

```
API Base URL: https://your-api-url.com
Test Account Email: test@example.com
Test Account Password: TestPassword123

Test Instagram Account:
- Username: @your_test_account
- Already connected to app

Example API Calls:
1. Login: POST /api/auth/login
2. Get Messages: GET /api/messages/conversations
3. Send Reply: POST /api/messages/send
```

### Step 4: Record Demo Video

Show:
1. **Login** to the app
2. **View inbox** with Instagram messages
3. **Click on conversation**
4. **Type a reply manually**
5. **Click Send button**
6. Show that **reply appears** in conversation
7. **Emphasize:** "This is a manual reply - user clicked Send"

---

## ðŸ“– API DOCUMENTATION

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "businessName": "My Business"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "businessName": "My Business"
  }
}
```

#### Connect Instagram
```http
POST /api/auth/instagram/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "accessToken": "instagram-access-token",
  "pageId": "facebook-page-id"
}
```

### Messages

#### Get Conversations
```http
GET /api/messages/conversations
Authorization: Bearer {token}
```

#### Send Message (Manual Reply)
```http
POST /api/messages/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "conversation-id",
  "message": "Hello! How can I help you?"
}
```

### Leads

#### Get All Leads
```http
GET /api/leads
Authorization: Bearer {token}
```

#### Update Lead
```http
PATCH /api/leads/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "funnelState": "qualified",
  "notes": "Interested in premium package"
}
```

### Sales Pages

#### Create Sales Page
```http
POST /api/sales-pages
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Premium Coaching",
  "description": "12-week program",
  "price": 1200,
  "currency": "USD"
}
```

### Scheduler

#### Schedule Post
```http
POST /api/scheduler/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "caption": "Check out our new product!",
  "imageUrl": "https://...",
  "scheduledFor": "2026-02-10T10:00:00Z",
  "trackingKeyword": "NEWPRODUCT"
}
```

### Settings

#### Update Acknowledgment
```http
PATCH /api/settings/acknowledgment
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": true,
  "message": "Thanks for reaching out! We'll reply shortly."
}
```

---

## ðŸ” SECURITY CHECKLIST

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Use HTTPS only (no HTTP)
- [ ] Enable rate limiting (already configured)
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Set strong passwords
- [ ] Configure CORS properly
- [ ] Verify webhook signatures
- [ ] Log errors to monitoring service
- [ ] Set up backups for database

---

## ðŸ“Š MONITORING

### Health Checks

```bash
# Check if server is running
curl https://your-api-url.com/health

# Check database connection
# Server logs will show "âœ… MongoDB Connected"
```

### Error Logging

All errors are logged to console. For production, integrate:
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **DataDog** (APM)

---

## ðŸ†˜ TROUBLESHOOTING

### Issue: MongoDB Connection Failed

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Check connection string in .env
# Format: mongodb://localhost:27017/database-name
```

### Issue: Instagram API Errors

```bash
# Check access token hasn't expired
# Token expires after 60 days
# Re-authenticate to get new token
```

### Issue: Webhook Not Receiving Events

1. Check webhook URL is publicly accessible
2. Verify WEBHOOK_VERIFY_TOKEN matches Facebook settings
3. Check webhook subscriptions in Facebook dashboard
4. Test with Facebook's webhook test tool

---

## âœ… READY FOR META REVIEW

Your backend is now:
- âœ… Production-ready
- âœ… Meta-compliant
- âœ… Fully documented
- âœ… Secure
- âœ… Scalable

**Next step:** Submit to Meta App Review with confidence! ðŸš€
