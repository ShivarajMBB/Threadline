const InstagramMedia = require('../models/InstagramMedia');
const InstagramAPI = require('./instagramAPI');

const HASHTAG_REGEX = /#[A-Za-z0-9_]+/g;

function extractHashtags(text = '') {
  return [...new Set((text.match(HASHTAG_REGEX) || []).map(tag => tag.toLowerCase()))];
}

function normalizeInstagramMedia(userId, item) {
  const likes = Number(item.like_count || item.likes || 0);
  const comments = Number(item.comments_count || item.comments || 0);
  const engagementActions = likes + comments;

  return {
    userId,
    instagramMediaId: item.id,
    caption: item.caption || '',
    mediaType: item.media_type || item.mediaType || null,
    mediaUrl: item.media_url || item.mediaUrl || null,
    thumbnailUrl: item.thumbnail_url || item.thumbnailUrl || null,
    permalink: item.permalink || null,
    timestamp: item.timestamp ? new Date(item.timestamp) : null,
    hashtags: extractHashtags(item.caption),
    likes,
    comments,
    engagementActions,
    engagementRate: 0
  };
}

async function syncInstagramMediaForUser(user, limit = 50) {
  if (!user.instagramAccessToken || !user.instagramBusinessAccountId) {
    const error = new Error('Instagram account not connected');
    error.code = 'NO_INSTAGRAM';
    throw error;
  }

  const media = await InstagramAPI.getMedia(
    user.instagramBusinessAccountId,
    user.instagramAccessToken,
    limit
  );

  let created = 0;
  let updated = 0;
  const syncedAt = new Date();

  for (const item of media) {
    const normalized = normalizeInstagramMedia(user._id, item);
    const existing = await InstagramMedia.findOne({
      userId: user._id,
      instagramMediaId: normalized.instagramMediaId
    });

    const snapshot = {
      likes: normalized.likes,
      comments: normalized.comments,
      engagementActions: normalized.engagementActions,
      capturedAt: syncedAt
    };

    if (!existing) {
      await InstagramMedia.create({
        ...normalized,
        firstSyncedAt: syncedAt,
        lastSyncedAt: syncedAt,
        metricSnapshots: [snapshot]
      });
      created += 1;
      continue;
    }

    existing.caption = normalized.caption;
    existing.mediaType = normalized.mediaType;
    existing.mediaUrl = normalized.mediaUrl;
    existing.thumbnailUrl = normalized.thumbnailUrl;
    existing.permalink = normalized.permalink;
    existing.timestamp = normalized.timestamp;
    existing.hashtags = normalized.hashtags;
    existing.likes = normalized.likes;
    existing.comments = normalized.comments;
    existing.engagementActions = normalized.engagementActions;
    existing.engagementRate = normalized.engagementRate;
    existing.lastSyncedAt = syncedAt;

    const latestSnapshot = existing.metricSnapshots[existing.metricSnapshots.length - 1];
    const changed = !latestSnapshot ||
      latestSnapshot.likes !== snapshot.likes ||
      latestSnapshot.comments !== snapshot.comments;

    if (changed) {
      existing.metricSnapshots.push(snapshot);
      existing.metricSnapshots = existing.metricSnapshots.slice(-30);
    }

    await existing.save();
    updated += 1;
  }

  return {
    fetched: media.length,
    created,
    updated,
    syncedAt
  };
}

module.exports = {
  syncInstagramMediaForUser,
  extractHashtags
};
