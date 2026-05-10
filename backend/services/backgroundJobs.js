const User = require('../models/User');
const InstagramAPI = require('./instagramAPI');
const { syncInstagramMediaForUser } = require('./instagramMediaSync');

const HOUR_MS = 60 * 60 * 1000;
let started = false;

async function refreshExpiringInstagramTokens() {
  const cutoff = new Date(Date.now() + 7 * 24 * HOUR_MS);
  const users = await User.find({
    instagramAccessToken: { $ne: null },
    instagramTokenExpiry: { $ne: null, $lte: cutoff }
  });

  for (const user of users) {
    try {
      const refreshedToken = await InstagramAPI.refreshLongLivedToken(user.instagramAccessToken);
      user.instagramAccessToken = refreshedToken;
      user.instagramTokenExpiry = new Date(Date.now() + 60 * 24 * HOUR_MS);
      await user.save();
      console.log('Refreshed Instagram token for user:', user._id.toString());
    } catch (error) {
      console.error('Instagram token refresh failed for user:', user._id.toString(), error.response?.data || error.message);
    }
  }
}

async function syncConnectedInstagramAccounts() {
  const staleBefore = new Date(Date.now() - 6 * HOUR_MS);
  const users = await User.find({
    instagramAccessToken: { $ne: null },
    instagramBusinessAccountId: { $ne: null },
    $or: [
      { lastInstagramMediaSyncAt: { $exists: false } },
      { lastInstagramMediaSyncAt: null },
      { lastInstagramMediaSyncAt: { $lte: staleBefore } }
    ]
  }).limit(25);

  for (const user of users) {
    try {
      const result = await syncInstagramMediaForUser(user, 50);
      user.lastInstagramMediaSyncAt = result.syncedAt;
      await user.save();
      console.log('Synced Instagram media for user:', user._id.toString(), result);
    } catch (error) {
      console.error('Instagram media auto-sync failed for user:', user._id.toString(), error.response?.data || error.message);
    }
  }
}

function startBackgroundJobs() {
  if (started || process.env.ENABLE_BACKGROUND_JOBS !== 'true') return;
  started = true;

  console.log('Background jobs enabled');

  setInterval(refreshExpiringInstagramTokens, 24 * HOUR_MS);
  setInterval(syncConnectedInstagramAccounts, 6 * HOUR_MS);

  setTimeout(refreshExpiringInstagramTokens, 30 * 1000);
  setTimeout(syncConnectedInstagramAccounts, 60 * 1000);
}

module.exports = {
  startBackgroundJobs,
  refreshExpiringInstagramTokens,
  syncConnectedInstagramAccounts
};
