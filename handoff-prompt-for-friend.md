# Handoff Prompt for Meta/Facebook App Verification

Copy-paste this entire prompt to give your friend full context on the task.

---

## PROMPT START

Hey, I need your help getting our app **Threadline** verified on Meta (Facebook/Instagram) so that any business can connect their Instagram account to it. Here's everything you need to know:

---

### What is Threadline?

Threadline is an **Instagram CRM tool** — a web app where businesses can:
- Connect their Instagram Business account
- View and reply to Instagram DMs from a unified inbox
- Manage leads generated from conversations and comments
- View audience insights and analytics

The backend is **Node.js/Express** with **MongoDB**, and the frontend is **React (Vite)**.

---

### Current State

- The app is **built and working** locally
- It already integrates with the **Instagram Graph API v21.0** and **Facebook Graph API v21.0**
- OAuth login flow is implemented (Instagram Business login)
- Webhooks for real-time messaging are set up
- The app is currently in **Development Mode** on Meta — only test users can connect

### App IDs (from the developer dashboard)

- **Facebook App ID:** 897534005979875
- **Instagram App ID:** 921211750428615
- **Facebook Page ID:** 61587708387604

---

### The Company Situation

- We are **NOT a Private Limited company**
- We have a company called **Technoboost Services** (could be sole proprietorship, partnership, or similar)
- We created a **Facebook account for Technoboost** to add our app as their product
- The goal is to get **Technoboost verified as a business on Meta**, then submit the app for review under Technoboost

---

### What Needs To Be Done

#### Step 1: Set Up & Verify Technoboost on Meta Business Manager
1. Go to https://business.facebook.com with Technoboost's Facebook account
2. Create a Business Manager account if not already done
3. Make sure you (or whoever is doing this) has **Admin access**
4. Go to **Settings > Security Center > Start Verification**
5. Submit business details + documents:
   - Legal name must **exactly match** the document
   - Documents that work: **GST Certificate, UDYAM/MSME Registration, Shop & Establishment License, or bank statement with business name**
   - You do NOT need a Certificate of Incorporation (that's for Pvt Ltd companies)
6. Choose phone/SMS/email verification when Meta asks to confirm
7. Wait 3 days to 4 weeks for approval

#### Step 2: Transfer the App to Technoboost's Business Manager
1. Go to https://developers.facebook.com > your app (Threadline)
2. Go to **Settings > Basic**
3. Under **Business Manager**, select Technoboost's Business Manager
4. Save

OR from Business Manager side:
1. Go to **Settings > Accounts > Apps > Add > Claim an App ID**
2. Enter the App ID: `897534005979875`

#### Step 3: Prepare the App Dashboard
Make sure ALL of these are set up on developers.facebook.com:

- [ ] **App Icon** — 1024x1024 square image (not a placeholder)
- [ ] **Privacy Policy URL** — must be a live, public webpage that specifically mentions Instagram data (DMs, messages, etc.). Host at something like `technoboost.in/privacy-policy`
- [ ] **Terms of Service URL** — live, public webpage. Host at `technoboost.in/terms`
- [ ] **App Category** — set to "Business"
- [ ] **Instagram Product** — added and configured in the app dashboard
- [ ] **Webhooks** — subscribed to: `messages`, `messaging_postbacks`, `messaging_seen`. The webhook URL must be live and responding to Meta's verification challenge
- [ ] **OAuth Redirect URI** — production HTTPS URL that matches what's in the code (e.g., `https://app.threadline.com/auth/callback`)
- [ ] **Test User** — create a test account with realistic data (conversations, leads). Write down username & password for Meta reviewers

#### Step 4: Record a Screencast Video (MOST IMPORTANT)
Meta reviewers watch this to decide approval. Must show:

1. **Login Flow** (30-60s) — Click "Connect Instagram" > Instagram OAuth > permissions granted > redirected back to app
2. **Inbox/Messages** (60-90s) — Show inbox with real conversations > open a chat > read messages > type and send a reply
3. **Lead Management** (30-60s) — Show how conversations create leads > show leads dashboard
4. **Comment Management** (30-60s) — Show comments on posts and how the app manages them

Rules:
- Screen width 1440px or less
- No audio needed, but add text annotations on screen
- 2-5 minutes total, MP4 or unlisted YouTube link
- Everything must work — no loading spinners, no errors, no broken buttons

#### Step 5: Submit for App Review
Go to **App Review > Permissions and Features** and request these permissions:

| Permission | What it does | Why Threadline needs it |
|---|---|---|
| `instagram_business_basic` | Read basic account info (username, profile pic) | So businesses can connect their Instagram |
| `instagram_business_manage_messages` | Read and send Instagram DMs | Core feature — unified inbox for customer conversations |
| `instagram_business_manage_comments` | Read and manage post comments | Track leads from comments (e.g., "interested") |
| `instagram_business_manage_insights` | Read account analytics | Audience insights dashboard |
| `instagram_business_content_publish` | Publish content | Content management features |
| `pages_manage_metadata` | Manage linked Facebook Page | Instagram Business accounts require a linked FB Page |
| `human_agent` | Extends DM reply window from 24h to 7 days | Critical for a CRM — businesses need more than 24h to respond |

For EACH permission, provide:
1. A 2-3 sentence explanation of exactly how the app uses it
2. The screencast video showing the feature
3. Test account credentials

#### Step 6: After Approval — Go Live
1. On the app dashboard, find the toggle that says **"In Development"**
2. Switch it to **"Live"**
3. Test with a real Instagram Business account

---

### Common Rejection Reasons & Fixes
- **"Screencast doesn't demonstrate the feature"** — Reshoot the specific feature more clearly
- **"Privacy policy doesn't cover Instagram data"** — Add explicit section about Instagram DMs and data handling
- **"Business not verified"** — Complete business verification first
- **"Insufficient information"** — Write longer, more detailed permission explanations
- **"Test user doesn't work"** — Ensure credentials work and app has sample data

You can resubmit unlimited times. Read the rejection reason carefully and fix exactly what they mention.

---

### Reference Files in the Repo
- `meta-verification-guide.md` — Detailed 7-phase guide with everything above and more
- `backend/routes/auth.js` — OAuth flow implementation
- `backend/services/instagramAPI.js` — All Instagram/Facebook API calls
- `backend/routes/webhooks.js` — Webhook handling
- `backend/.env` — App IDs and secrets (DO NOT share publicly)

---

### Timeline Estimate
- Week 1: Business Manager setup + submit business verification + create privacy/terms pages
- Week 2 (while waiting): Transfer app + configure dashboard + create test data + record video
- Week 3 (after verification): Submit app review
- After approval: Go live

---

## PROMPT END
