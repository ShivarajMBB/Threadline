# Threadline CRM — Basic Mode Review

**Review Date:** 2026-02-08
**Scope:** Basic mode only — Inbox, Leads, Sales Pages, Scheduler, Settings
**Status:** MVP / Pre-Meta Submission

---

## OVERVIEW

The app is a clean, well-designed MVP. Solid CSS, good architecture, working Instagram integration. There are a few things that need fixing before Meta reviews it.

---

## FRONTEND — Basic Mode

### Inbox
| Status | Item |
|--------|------|
| OK | Conversation list renders correctly with username, last message, timestamp |
| OK | Unread indicator (blue dot) works |
| OK | Click into conversation works |
| BUG | **Search box is hidden** — gated behind `REVIEW_MODE === 'safe'` (line 697). Users can't search conversations |
| BUG | **Source tags (DM/Comment) hidden** — same gate (line 751). Can't tell where a conversation came from |

### Conversation View
| Status | Item |
|--------|------|
| OK | Message thread renders correctly (customer left, business right) |
| OK | Reply box with Send button works |
| OK | Timestamps on each message |
| BUG | **"View in CRM" link hidden** — gated behind `REVIEW_MODE === 'safe'` (line 788). Can't jump from conversation to lead |
| BUG | Lead context never fetched — line 775 intentionally skips it in basic mode |
| MISSING | Clicking a conversation doesn't mark it as read — unread dot stays forever |

### Leads
| Status | Item |
|--------|------|
| OK | Leads table with name, source, funnel state, revenue, created date |
| OK | Search by username works |
| OK | Funnel filter buttons work |
| OK | Click "View" opens lead detail |
| OK | Empty state shown when no leads |

### Lead Detail
| Status | Item |
|--------|------|
| OK | Contact info card (username, email, phone) |
| OK | Lead source card |
| OK | Notes field with auto-save on blur |
| OK | Funnel state progression (clickable steps) |
| OK | Revenue input (shown when state = closed) |
| OK | "View Messages" button works |
| BUG | **"Schedule Call" button — no onClick handler** (line 1131). Dead button |
| BUG | **"Send Sales Page" button — no onClick handler** (line 1135). Dead button |
| BUG | Revenue input fires API call on **every keystroke** — no debounce (line 1102) |

### Sales Pages
| Status | Item |
|--------|------|
| OK | "Create Page" opens modal form |
| OK | Form has title, description, price, image URL fields |
| OK | Pages display as cards with stats (price, views, sales, revenue) |
| OK | Edit button opens pre-filled form |
| OK | Delete button with confirmation |
| OK | Active/Inactive status badge |
| MINOR | "View Page" button opens `/p/{slug}` — no public sales page route exists on frontend yet |

### Scheduler
| Status | Item |
|--------|------|
| OK | "Schedule Post" opens modal form |
| OK | Form has caption, image URL, datetime picker, tracking keyword |
| OK | Scheduled posts list with status badges |
| OK | "Publish Now" button on scheduled posts |
| OK | "Cancel" button on scheduled posts |
| OK | Error message shown for failed posts |
| OK | Image preview in post cards |

### Settings
| Status | Item |
|--------|------|
| OK | Acknowledgment message toggle works |
| OK | Preview shown when enabled |
| OK | Compliance notes section |
| MINOR | Acknowledgment message text is hardcoded, not customizable |
| MISSING | No Instagram connection status or disconnect option visible |

### General Frontend
| Status | Item |
|--------|------|
| OK | Login/Register flow works |
| OK | Sidebar navigation correct — Inbox, Leads, Sales Pages, Scheduler, Settings |
| OK | Mode indicator widget is hidden (commented out) |
| OK | All forms use alert() for errors — functional but not pretty |
| MINOR | No loading spinners — just text "Loading conversations..." |
| MINOR | No pagination on any list |

---

## BACKEND — Basic Mode Features

### What Works Well
| Item | Details |
|------|---------|
| Password hashing | bcrypt with salt — properly implemented |
| JWT auth | 30-day expiry, proper middleware |
| Route isolation | All routes filter by `userId` — proper tenant separation |
| Security headers | Helmet middleware applied |
| Rate limiting | 100 req/15min on all `/api/` routes |
| CORS | Properly scoped to `CLIENT_URL` |
| DB indexing | Compound indexes on frequently queried fields |
| Webhook handling | Covers DMs, comments, mentions, story replies |
| Acknowledgment | Sent only once per conversation — smart logic |
| Signature verification | HMAC-SHA256 with both Instagram and Facebook secrets |

### Bugs & Issues

#### CRITICAL
| Issue | File | Line | Details |
|-------|------|------|---------|
| Hardcoded test user in OAuth | auth.js | 245 | Instagram callback saves token to `test@test.com` instead of the user who initiated OAuth. Breaks multi-user |
| Webhook user fallback | webhooks.js | 170 | If recipient ID doesn't match, falls back to ANY user with a token. Wrong user gets messages in multi-user setup |

#### MEDIUM
| Issue | File | Line | Details |
|-------|------|------|---------|
| Webhook signature optional | webhooks.js | 41 | If `x-hub-signature-256` header is missing, webhook is processed anyway. Should be mandatory |
| SalesPage slug conflict | SalesPage.js | 21+82 | `unique: true` on field AND compound index with userId. Field-level unique is global — User A's slug blocks User B |
| Debug endpoint exposed | auth.js | 289 | `/debug-token` reveals token scopes and API test results. Should be admin-only or removed |
| No message length validation | messages.js | 106 | Instagram has ~1000 char limit. No check before sending |
| No idempotency on message send | messages.js | 106 | Network retry could send duplicate messages |
| View tracking unauthenticated | salesPages.js | 149 | `/api/sales-pages/:slug/view` is public — view counts are inflatable |

#### LOW
| Issue | File | Line | Details |
|-------|------|------|---------|
| No image URL validation | scheduler.js | 36 | Invalid URLs accepted, fails at Instagram API |
| No email format check | leads.js | 125 | Lead email field accepts anything |
| No numeric validation | leads.js | 110 | Revenue/estimatedValue accept non-positive values |
| Empty slug edge case | salesPages.js | 35 | Title of "!!!" generates empty slug |
| Inconsistent delete behavior | scheduler.js | 159 | Scheduled posts soft-deleted, failed posts hard-deleted |
| Token refresh never called | instagramAPI.js | — | `refreshLongLivedToken()` exists but nothing invokes it. Tokens expire after 60 days silently |

---

## SUMMARY — What to Fix Before Meta Submission

### Must Fix (5 items)
1. **Unhide search bar in Inbox** — remove the `REVIEW_MODE` gate on line 697
2. **Unhide source tags in Inbox** — remove the gate on line 751
3. **Unhide "View in CRM" link in Conversation** — remove the gate on lines 775, 788
4. **Fix or remove dead buttons** — "Schedule Call" and "Send Sales Page" in Lead Detail have no handlers
5. **Deploy to stable URL** — ngrok is temporary; Meta reviewers need a persistent URL

### Should Fix (4 items)
6. **Make webhook signature mandatory** — don't skip verification when header is missing
7. **Fix SalesPage slug uniqueness** — remove `unique: true` from field, keep compound index only
8. **Add debounce to revenue input** — currently fires API call per keystroke
9. **Mark conversations as read** — unread dot stays forever after clicking into a conversation

### Nice to Have (5 items)
10. Remove `/debug-token` endpoint or restrict to admin
11. Add message length validation before sending to Instagram
12. Add loading spinners instead of text
13. Replace `alert()` errors with inline form feedback
14. Implement token refresh job for Instagram tokens

---

## VERDICT

**The app is ready for a demo.** The core flows work — messages come in via webhook, show in inbox, you can reply, leads get auto-created, sales pages and scheduler have full CRUD. The CSS is polished and the UX is clean.

**Not quite ready for Meta submission** — the 5 "must fix" items above are quick fixes (mostly removing REVIEW_MODE gates and wiring up 2 buttons). After those, the app will be in good shape for Meta's reviewer to test.

**Not ready for production** — the hardcoded test user in OAuth and the webhook user fallback are fine for single-user demo but will break with real multi-user usage. Fix those before onboarding real customers.
