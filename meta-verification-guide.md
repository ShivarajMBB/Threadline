# Getting Threadline Verified Under Technoboost Services — Full Guide

This is your step-by-step guide to get your Instagram messaging app approved by Meta, so any business can connect their Instagram account to it.

---

## PHASE 1: Set Up Technoboost's Meta Business Manager

**What is this?**
Meta Business Manager is like a control panel where companies manage their Facebook Pages, Instagram accounts, and apps. Technoboost needs one so Meta knows which company owns your app.

**What to do:**

1. The owner of Technoboost goes to https://business.facebook.com
2. If they don't already have a Business Manager, they click "Create Account" and fill in:
   - Business name: Technoboost Services (must match legal documents exactly)
   - Your name
   - Business email
3. Once the Business Manager exists, the owner must add YOU as an Admin:
   - Go to **Settings** (gear icon, bottom left)
   - Click **People**
   - Click **Add People**
   - Enter your email
   - Select **Admin Access** (not Employee — you need full control)
   - You'll get an email invitation — accept it

**Why Admin?** You need Admin access to transfer your app and submit it for review. Employee access won't work.

---

## PHASE 2: Verify Technoboost as a Real Business

**What is this?**
Meta wants proof that Technoboost is a real, registered company — not a scam. This is called "Business Verification." Without it, your app will never get approved.

**What to do:**

1. In Technoboost's Business Manager, go to:
   **Settings > Security Center > Start Verification**

2. You'll need to fill in company details:
   - **Legal business name** — must match your document exactly (even "Pvt Ltd" vs "Private Limited" matters)
   - **Address** — must match your document exactly
   - **Phone number** — must be a number the company can receive calls/SMS on
   - **Website** — Technoboost's website (e.g., technoboost.in or whatever it is)

3. Upload ONE of these documents:
   - **Certificate of Incorporation (COI)** — best option, least likely to get rejected
   - **GST Registration Certificate** — make sure the GSTIN status is "Active" on the GST portal
   - **UDYAM/MSME Registration Certificate** — also works

4. Choose how Meta will confirm it's really you (pick one):
   - **Phone call** — Meta calls the business number and gives a code
   - **SMS** — Meta texts a code
   - **Email** — Meta sends a code to an email on your company domain (e.g., admin@technoboost.in)
   - **DNS verification** — You add a TXT record to your domain's DNS settings
   - **Meta-tag** — You add a line of code to your website's HTML

   **Easiest option:** Phone call or SMS if you have the business phone handy.

5. Submit and wait.

**How long does it take?**
- Sometimes 3 business days
- Sometimes up to 4 weeks
- If they reject it, they'll tell you why — fix the issue and resubmit

**Common rejection reasons:**
- Name on the form doesn't match name on the document (even small differences)
- Document is expired or unclear (blurry scan)
- Phone number doesn't match what's on the document
- Website doesn't look like a real business website

---

## PHASE 3: Move Your App to Technoboost's Business Manager

**What is this?**
Right now, your app (Threadline/Tradline) lives under your personal Facebook developer account. You need to move it so it belongs to Technoboost's Business Manager. This is how Meta knows which verified business is responsible for the app.

**What to do (Option A — from the Developer Dashboard):**

1. Go to https://developers.facebook.com
2. Click on your app (Threadline)
3. Go to **Settings > Basic**
4. Scroll down to the **Business Manager** field
5. Click it and select **Technoboost's Business Manager** from the dropdown
6. Save changes

**What to do (Option B — from Business Manager):**

1. Go to Technoboost's Business Manager
2. Go to **Settings > Accounts > Apps**
3. Click **Add**
4. Select **Claim an App ID**
5. Enter your App ID (you can find this on your developer dashboard — it's a long number)
6. Submit the claim

**Important:** You must be an Admin on Technoboost's Business Manager for either option to work. That's why Phase 1 matters.

---

## PHASE 4: Prepare Your App for Review

**What is this?**
Before Meta will review your app, certain things must be set up properly. Think of it like a checklist before an exam — if anything is missing, they won't even look at your app.

**Go to your app dashboard at https://developers.facebook.com and check each item:**

### 1. App Icon
- Upload a square image (1024x1024 recommended)
- Must not be blank or a placeholder

### 2. Privacy Policy URL
- You need a webpage that explains what data your app collects and how it uses it
- It MUST be live and publicly accessible (anyone can visit the link)
- It MUST mention Instagram data specifically (e.g., "We access Instagram Direct Messages to help businesses manage customer conversations")
- Host it on Technoboost's website, e.g., `https://technoboost.in/privacy-policy`
- If you don't have one, you can use a free privacy policy generator online and host it as a simple webpage

### 3. Terms of Service URL
- Similar to privacy policy — a page that explains terms of using your app
- Must also be live and public
- e.g., `https://technoboost.in/terms`

### 4. App Category
- Set to **"Business"** in Settings > Basic

### 5. Instagram Product
- In your app dashboard, go to **Add Product** (left sidebar)
- Make sure **Instagram** is added and configured
- Under Instagram > Basic Display or Instagram > Messaging, configure your settings

### 6. Webhooks
- Webhooks are how Instagram sends you real-time updates (new messages, etc.)
- You must have these webhook subscriptions active:
  - `messages` — when someone sends a DM
  - `messaging_postbacks` — when someone clicks a button in your chat
  - `messaging_seen` — when someone reads your message
- Your webhook URL must be live and responding (your server must handle the verification challenge)

### 7. OAuth Redirect URI
- This is the URL where users land after they log in with Instagram through your app
- Must be your real production URL (e.g., `https://app.threadline.com/auth/callback`)
- Must use HTTPS
- Must match exactly what's in your code

### 8. Test User Credentials
- Meta reviewers need to log into your app to test it
- Create a test account with some real-looking data (conversations, leads, etc.)
- Write down the username and password — you'll give this to Meta during submission

---

## PHASE 5: Submit for App Review

**What is this?**
This is where you formally ask Meta to approve your app for specific permissions. Each permission lets your app do something specific with Instagram data.

**What to do:**

1. Go to your app dashboard
2. Click **App Review > Permissions and Features**
3. Request each of the following permissions:

### Permission 1: `instagram_business_basic`
- **What it does:** Lets your app read basic info about connected Instagram Business accounts (username, profile pic, etc.)
- **Why you need it:** So businesses can connect their Instagram to Threadline

### Permission 2: `instagram_business_manage_messages`
- **What it does:** Lets your app read and send Instagram DMs on behalf of the business
- **Why you need it:** This is the core feature — managing customer conversations in an inbox

### Permission 3: `instagram_business_manage_comments`
- **What it does:** Lets your app read and manage comments on Instagram posts
- **Why you need it:** So businesses can track leads from comments (e.g., someone comments "interested" on a post)

### Permission 4: `pages_manage_metadata`
- **What it does:** Lets your app manage the Facebook Page connected to the Instagram account
- **Why you need it:** Instagram Business accounts are always linked to a Facebook Page — your app needs access to manage this connection

### Permission 5: `human_agent`
- **What it does:** Extends the messaging reply window from 24 hours to 7 days
- **Why you need it:** Normally, businesses can only reply to a DM within 24 hours. This lets Threadline users reply for up to 7 days — critical for a CRM tool

**For EACH permission, you must provide:**

1. **A written explanation** — 2-3 sentences explaining exactly how your app uses this permission. Be specific. Example for messages:
   > "Our app displays incoming Instagram Direct Messages in a unified inbox. Business users can read customer messages and send replies directly from our dashboard. This allows businesses to manage customer conversations without switching to the Instagram app."

2. **A screencast video** — a screen recording showing the feature working (see Phase 6)

3. **Test credentials** — the username and password for your test account so reviewers can try it themselves

---

## PHASE 6: Record the Screencast Video

**What is this?**
This is the MOST IMPORTANT part of your submission. Meta reviewers primarily watch your video to decide if your app is legitimate. A bad video = rejection, even if everything else is perfect.

**How to record:**
- Use any screen recorder (OBS Studio is free, or QuickTime on Mac, or Loom)
- No audio/voiceover needed
- Add text annotations on screen to explain what you're doing (e.g., "Now logging in..." or "This shows the inbox with real DMs")

**What to show (in this order):**

### Step 1: Login Flow (30-60 seconds)
- Start with your app's login page
- Show the full Instagram OAuth flow:
  - Click "Connect Instagram"
  - Get redirected to Instagram/Facebook login
  - Enter credentials
  - Grant permissions
  - Get redirected back to your app
- Add text: "User authenticates via Instagram OAuth"

### Step 2: Inbox / Messages (60-90 seconds)
- Show the inbox with real conversations (not empty)
- Open a conversation
- Show you can read messages
- Type and send a reply
- Show the reply appears in the conversation
- Add text: "Business user can read and reply to Instagram DMs"

### Step 3: Lead Management (30-60 seconds)
- Show how a new conversation automatically creates a lead
- Show the leads list/dashboard
- Add text: "Leads are automatically created from conversations"

### Step 4: Comment Management (30-60 seconds)
- If you requested the comments permission:
  - Show comments on a post
  - Show how your app displays/manages them
  - Add text: "Business can manage Instagram comments"

### Step 5: Any Other Features (30 seconds each)
- Show every feature tied to every permission you requested
- Every button in the video must actually work — if you click something and it breaks, they'll reject you

**Video rules:**
- Screen width: 1440px or less (don't record on a 4K ultrawide)
- Language: Keep UI in English
- Length: 2-5 minutes total is ideal
- Format: MP4 or upload to a public link (YouTube unlisted works)
- Make sure everything is loaded — don't show loading spinners or errors

---

## PHASE 7: Go Live

**What is this?**
After Meta approves all your permissions, your app is still in "Development Mode" by default. You need to flip it to "Live Mode" so real users (not just test users) can connect their Instagram accounts.

**What to do:**

1. Go to your app dashboard at https://developers.facebook.com
2. At the top of the page, you'll see a toggle that says **"In Development"**
3. Click it and switch to **"Live"**
4. Confirm

**What happens now:**
- Any Instagram Business account can now authorize your app
- Your webhooks will receive real events from real users
- Your app is publicly available

---

## QUESTIONS TO ANSWER BEFORE YOU START

Answer these for yourself before starting Phase 1:

1. **Does Technoboost already have a Meta Business Manager?**
   - Check by going to https://business.facebook.com and logging in with Technoboost's Facebook account
   - If yes, great — move to getting yourself added as Admin
   - If no, create one first

2. **Do you have Admin access on Technoboost's Business Manager?**
   - If no, get the owner to add you (Phase 1, step 3)

3. **Do you have a live website with privacy policy and terms pages?**
   - You need public URLs like `technoboost.in/privacy` and `technoboost.in/terms`
   - If no website exists, even a simple one-page site works

4. **Does the Instagram account connected to your app have 1,000+ followers?**
   - Some features (especially messaging API) may require the business account to have at least 1,000 followers
   - Check your connected test account

5. **What is the exact app name — "Tradline" or "Threadline"?**
   - Make sure the name in the Meta developer dashboard matches what you want

---

## SUGGESTED ORDER OF WORK

Here's the simplest path forward:

```
Week 1:
  [ ] Set up Technoboost Business Manager (if not done)
  [ ] Get Admin access for yourself
  [ ] Start Business Verification (submit documents)
  [ ] Create Privacy Policy and Terms of Service pages

Week 2 (while waiting for verification):
  [ ] Transfer/claim the app under Technoboost's Business Manager
  [ ] Set up all app dashboard items (icon, URLs, webhooks, etc.)
  [ ] Create a test account with realistic data
  [ ] Record the screencast video

Week 3 (after verification is approved):
  [ ] Submit for App Review with all permissions
  [ ] Wait for review (usually 1-5 business days)

After approval:
  [ ] Switch app to Live mode
  [ ] Test with a real Instagram Business account
```

---

## IF YOU GET REJECTED

Don't panic — most apps get rejected at least once. Common reasons:

- **"Screencast doesn't demonstrate the feature"** — Reshoot the video showing the exact feature more clearly
- **"Privacy policy doesn't cover Instagram data"** — Add a section specifically about Instagram DMs and data
- **"Business not verified"** — Complete Phase 2 first, then resubmit
- **"Insufficient information"** — Write longer, more detailed explanations for each permission
- **"Test user doesn't work"** — Make sure your test credentials actually work and the app has data

You can resubmit as many times as needed. Read the rejection reason carefully and fix exactly what they asked for.
