const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ScheduledPost = require('../models/ScheduledPost');
const Conversation = require('../models/Conversation');
const Lead = require('../models/Lead');
const InstagramMedia = require('../models/InstagramMedia');
const SalesPage = require('../models/SalesPage');
const Report = require('../models/Report');
const { syncInstagramMediaForUser } = require('../services/instagramMediaSync');

const HASHTAG_REGEX = /#[A-Za-z0-9_]+/g;

function extractHashtags(text = '') {
  return [...new Set((text.match(HASHTAG_REGEX) || []).map(tag => tag.toLowerCase()))];
}

function calculateEngagementRate(item) {
  const likes = Number(item.like_count || item.likes || 0);
  const comments = Number(item.comments_count || item.comments || 0);
  const reach = Number(item.reach || item.impressions || 0);
  if (reach <= 0) return 0;
  return Number((((likes + comments) / reach) * 100).toFixed(2));
}

function getPostingHour(dateValue) {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date.getHours();
}

function makeRecommendation(type, title, detail, priority = 'medium') {
  return { type, title, detail, priority };
}

function percentChange(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatChange(value) {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return '0%';
}

function applyClientScope(query, clientId) {
  if (!clientId || clientId === 'all') return query;
  return {
    ...query,
    clientId: clientId === 'unassigned' ? null : clientId
  };
}

async function getPeriodMetrics(userId, start, end, clientId = 'all') {
  const [media, conversations, leads, scheduledPosts, salesPages] = await Promise.all([
    InstagramMedia.find(applyClientScope({
      userId,
      $or: [
        { timestamp: { $gte: start, $lt: end } },
        { timestamp: null, lastSyncedAt: { $gte: start, $lt: end } }
      ]
    }, clientId)).sort({ engagementActions: -1 }),
    Conversation.find(applyClientScope({ userId, lastMessageAt: { $gte: start, $lt: end } }, clientId)),
    Lead.find(applyClientScope({ userId, createdAt: { $gte: start, $lt: end } }, clientId)),
    ScheduledPost.find(applyClientScope({ userId, createdAt: { $gte: start, $lt: end } }, clientId)),
    SalesPage.find(applyClientScope({ userId, updatedAt: { $gte: start, $lt: end } }, clientId))
  ]);

  const engagementActions = media.reduce((sum, item) => sum + (item.engagementActions || 0), 0);
  const likes = media.reduce((sum, item) => sum + (item.likes || 0), 0);
  const comments = media.reduce((sum, item) => sum + (item.comments || 0), 0);
  const closedLeads = leads.filter(lead => lead.funnelState === 'closed').length;
  const revenue = leads.reduce((sum, lead) => sum + (lead.revenue || 0), 0);
  const salesPageViews = salesPages.reduce((sum, page) => sum + (page.views || 0), 0);
  const salesPageRevenue = salesPages.reduce((sum, page) => sum + (page.revenue || 0), 0);

  return {
    media,
    conversations,
    leads,
    scheduledPosts,
    salesPages,
    totals: {
      posts: media.length,
      likes,
      comments,
      engagementActions,
      conversations: conversations.length,
      unreadConversations: conversations.filter(conv => conv.unread).length,
      leads: leads.length,
      closedLeads,
      conversionRate: leads.length ? Number(((closedLeads / leads.length) * 100).toFixed(1)) : 0,
      revenue,
      scheduledPosts: scheduledPosts.filter(post => post.status === 'scheduled').length,
      publishedScheduledPosts: scheduledPosts.filter(post => post.status === 'published').length,
      salesPageViews,
      salesPageRevenue
    }
  };
}

function buildReportText(user, current, previous, recommendations, range) {
  const engagementChange = percentChange(current.totals.engagementActions, previous.totals.engagementActions);
  const leadChange = percentChange(current.totals.leads, previous.totals.leads);
  const conversationChange = percentChange(current.totals.conversations, previous.totals.conversations);
  const topPost = current.media[0];

  const lines = [
    `Weekly Social Report - ${user.businessName}`,
    `${range.start.toISOString().slice(0, 10)} to ${range.end.toISOString().slice(0, 10)}`,
    '',
    'Summary',
    `- Posts analyzed: ${current.totals.posts}`,
    `- Engagement actions: ${current.totals.engagementActions} (${formatChange(engagementChange)} vs previous period)`,
    `- New conversations: ${current.totals.conversations} (${formatChange(conversationChange)} vs previous period)`,
    `- New leads: ${current.totals.leads} (${formatChange(leadChange)} vs previous period)`,
    `- Closed leads: ${current.totals.closedLeads}`,
    `- Lead conversion: ${current.totals.conversionRate}%`,
    `- User-reported revenue: $${current.totals.revenue.toLocaleString()}`,
    '',
    'Content Performance',
    topPost
      ? `- Best post: ${topPost.caption ? topPost.caption.slice(0, 120) : topPost.instagramMediaId} (${topPost.engagementActions || 0} actions)`
      : '- Best post: no synced Instagram posts in this period',
    `- Likes: ${current.totals.likes}`,
    `- Comments: ${current.totals.comments}`,
    '',
    'Next Actions',
    ...recommendations.slice(0, 5).map(item => `- ${item.title}: ${item.detail}`)
  ];

  return lines.join('\n');
}

router.post('/sync/instagram', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Number(req.body?.limit || 50), 100);
    const result = await syncInstagramMediaForUser(req.user, limit);
    req.user.lastInstagramMediaSyncAt = result.syncedAt;
    await req.user.save();
    res.json({
      message: 'Instagram media synced',
      ...result
    });
  } catch (error) {
    console.error('Instagram media sync error:', error.response?.data || error.message);

    if (error.code === 'NO_INSTAGRAM') {
      return res.status(400).json({
        error: 'Instagram account not connected',
        code: 'NO_INSTAGRAM'
      });
    }

    const igError = error.response?.data?.error;
    if (igError?.code === 190) {
      return res.status(401).json({
        error: 'Instagram token expired. Please reconnect your account.',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(500).json({ error: 'Failed to sync Instagram media' });
  }
});

router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clientId = req.query.clientId || 'all';

    const [scheduledPosts, conversations, leads, storedInstagramMedia] = await Promise.all([
      ScheduledPost.find(applyClientScope({ userId: req.user._id, createdAt: { $gte: since } }, clientId)).sort({ createdAt: -1 }),
      Conversation.find(applyClientScope({ userId: req.user._id, lastMessageAt: { $gte: since } }, clientId)).sort({ lastMessageAt: -1 }),
      Lead.find(applyClientScope({ userId: req.user._id, createdAt: { $gte: since } }, clientId)).sort({ createdAt: -1 }),
      InstagramMedia.find(applyClientScope({
        userId: req.user._id,
        $or: [
          { timestamp: { $gte: since } },
          { timestamp: null, lastSyncedAt: { $gte: since } }
        ]
      }, clientId)).sort({ timestamp: -1, lastSyncedAt: -1 })
    ]);

    const instagramStatus = req.user.instagramAccessToken
      ? (storedInstagramMedia.length > 0 ? 'synced' : 'connected_needs_sync')
      : 'not_connected';

    const publishedPosts = [
      ...storedInstagramMedia.map(item => ({
        id: item.instagramMediaId,
        source: 'instagram',
        caption: item.caption || '',
        permalink: item.permalink,
        timestamp: item.timestamp,
        likes: Number(item.likes || 0),
        comments: Number(item.comments || 0),
        engagementRate: Number(item.engagementRate || 0),
        engagementActions: Number(item.engagementActions || 0),
        hashtags: item.hashtags?.length ? item.hashtags : extractHashtags(item.caption),
        lastSyncedAt: item.lastSyncedAt,
        mediaType: item.mediaType
      })),
      ...scheduledPosts
        .filter(post => post.status === 'published')
        .map(post => ({
          id: post.instagramPostId || post._id.toString(),
          source: 'scheduler',
          caption: post.caption || '',
          timestamp: post.publishedAt || post.scheduledFor,
          likes: post.likes || 0,
          comments: post.comments || 0,
          engagementRate: calculateEngagementRate(post),
          engagementActions: (post.likes || 0) + (post.comments || 0),
          hashtags: extractHashtags(post.caption)
        }))
    ];

    const sortedByEngagement = [...publishedPosts]
      .sort((a, b) => (b.engagementActions - a.engagementActions) || (b.engagementRate - a.engagementRate));

    const averageEngagementActions = publishedPosts.length
      ? publishedPosts.reduce((sum, post) => sum + (post.engagementActions || 0), 0) / publishedPosts.length
      : 0;

    const underperformingPosts = publishedPosts
      .filter(post => averageEngagementActions > 0 && post.engagementActions < averageEngagementActions * 0.5)
      .sort((a, b) => a.engagementActions - b.engagementActions)
      .slice(0, 5);

    const hashtagStats = new Map();
    for (const post of publishedPosts) {
      for (const tag of post.hashtags) {
        const current = hashtagStats.get(tag) || { tag, uses: 0, likes: 0, comments: 0, actionsTotal: 0, engagementTotal: 0 };
        current.uses += 1;
        current.likes += post.likes;
        current.comments += post.comments;
        current.actionsTotal += post.engagementActions || 0;
        current.engagementTotal += post.engagementRate;
        hashtagStats.set(tag, current);
      }
    }

    const topHashtags = [...hashtagStats.values()]
      .map(item => ({
        ...item,
        averageActions: Number((item.actionsTotal / item.uses).toFixed(1)),
        averageEngagementRate: Number((item.engagementTotal / item.uses).toFixed(2))
      }))
      .sort((a, b) => (b.averageActions - a.averageActions) || (b.averageEngagementRate - a.averageEngagementRate) || (b.uses - a.uses))
      .slice(0, 10);

    const hourStats = new Map();
    for (const post of publishedPosts) {
      const hour = getPostingHour(post.timestamp);
      if (hour === null) continue;
      const current = hourStats.get(hour) || { hour, posts: 0, actionsTotal: 0, engagementTotal: 0 };
      current.posts += 1;
      current.actionsTotal += post.engagementActions || 0;
      current.engagementTotal += post.engagementRate;
      hourStats.set(hour, current);
    }

    const bestPostingHours = [...hourStats.values()]
      .map(item => ({
        hour: item.hour,
        posts: item.posts,
        averageActions: Number((item.actionsTotal / item.posts).toFixed(1)),
        averageEngagementRate: Number((item.engagementTotal / item.posts).toFixed(2))
      }))
      .sort((a, b) => (b.averageActions - a.averageActions) || (b.averageEngagementRate - a.averageEngagementRate))
      .slice(0, 3);

    const totalLeads = leads.length;
    const closedLeads = leads.filter(lead => lead.funnelState === 'closed').length;
    const openConversations = conversations.filter(conv => conv.unread).length;
    const commentLeads = leads.filter(lead => lead.source === 'comment').length;
    const dmLeads = leads.filter(lead => lead.source === 'dm').length;
    const scheduledUpcoming = scheduledPosts.filter(post => post.status === 'scheduled' && new Date(post.scheduledFor) > new Date()).length;

    const recommendations = [];

    if (!req.user.instagramAccessToken) {
      recommendations.push(makeRecommendation(
        'connection',
        'Connect Instagram to unlock live analytics',
        'The analyser can already use local CRM data, but live post performance needs the Instagram account connection.',
        'high'
      ));
    }

    if (openConversations > 0) {
      recommendations.push(makeRecommendation(
        'inbox',
        'Reply to unread conversations first',
        `${openConversations} conversation${openConversations === 1 ? '' : 's'} need attention. Faster replies protect lead conversion.`,
        'high'
      ));
    }

    if (topHashtags.length > 0) {
      recommendations.push(makeRecommendation(
        'hashtags',
        'Reuse the hashtags currently tied to better engagement',
        `Start with ${topHashtags.slice(0, 3).map(item => item.tag).join(', ')} and keep testing niche tags against broad tags.`,
        'medium'
      ));
    }

    if (bestPostingHours.length > 0) {
      recommendations.push(makeRecommendation(
        'timing',
        'Schedule around your strongest posting window',
        `Your best recent posting hour is around ${bestPostingHours[0].hour}:00 based on available likes and comments.`,
        'medium'
      ));
    }

    if (underperformingPosts.length > 0) {
      recommendations.push(makeRecommendation(
        'underperforming_content',
        'Review posts below your recent baseline',
        `${underperformingPosts.length} post${underperformingPosts.length === 1 ? '' : 's'} landed below half your average engagement actions. Rework hooks, CTA, or posting time before repeating that format.`,
        'medium'
      ));
    }

    if (req.user.instagramAccessToken && storedInstagramMedia.length === 0) {
      recommendations.push(makeRecommendation(
        'sync',
        'Sync Instagram media',
        'Your account is connected, but no media snapshots are stored yet. Run a sync to unlock post scoring and trend reports.',
        'high'
      ));
    }

    if (scheduledUpcoming === 0) {
      recommendations.push(makeRecommendation(
        'consistency',
        'Add the next scheduled post',
        'There are no upcoming scheduled posts. Keep at least one week of content queued for consistent reach.',
        'medium'
      ));
    }

    if (totalLeads > 0 && closedLeads === 0) {
      recommendations.push(makeRecommendation(
        'conversion',
        'Move lead follow-up into the CRM',
        'You are generating leads, but none are marked closed in the last 30 days. Track replies, offers, and outcomes so reports show business impact.',
        'medium'
      ));
    }

    res.json({
      period: {
        label: 'last_30_days',
        since
      },
      channels: {
        instagram: {
          status: instagramStatus,
          postsAnalyzed: storedInstagramMedia.length,
          lastSyncedAt: storedInstagramMedia[0]?.lastSyncedAt || null
        },
        youtube: {
          status: 'not_connected',
          postsAnalyzed: 0
        }
      },
      summary: {
        publishedPosts: publishedPosts.length,
        scheduledUpcoming,
        totalLeads,
        closedLeads,
        conversionRate: totalLeads ? Number(((closedLeads / totalLeads) * 100).toFixed(1)) : 0,
        openConversations,
        leadSources: {
          dm: dmLeads,
          comment: commentLeads,
          other: Math.max(totalLeads - dmLeads - commentLeads, 0)
        }
      },
      topHashtags,
      bestPostingHours,
      topPosts: sortedByEngagement.slice(0, 5),
      underperformingPosts,
      recommendations
    });
  } catch (error) {
    console.error('Social analyzer error:', error);
    res.status(500).json({ error: 'Failed to generate social analysis' });
  }
});

router.get('/weekly-report', authMiddleware, async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days || 7), 30);
    const clientId = req.query.clientId || 'all';
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const previousEnd = start;
    const previousStart = new Date(previousEnd.getTime() - days * 24 * 60 * 60 * 1000);

    const [current, previous] = await Promise.all([
      getPeriodMetrics(req.user._id, start, end, clientId),
      getPeriodMetrics(req.user._id, previousStart, previousEnd, clientId)
    ]);

    const recommendations = [];
    const engagementChange = percentChange(current.totals.engagementActions, previous.totals.engagementActions);
    const leadChange = percentChange(current.totals.leads, previous.totals.leads);

    if (current.totals.posts === 0) {
      recommendations.push(makeRecommendation(
        'content',
        'Sync or publish more content',
        'No Instagram posts were found in this report period, so content recommendations are limited.',
        'high'
      ));
    }

    if (engagementChange < -15) {
      recommendations.push(makeRecommendation(
        'engagement',
        'Engagement dropped this period',
        `Engagement actions changed by ${formatChange(engagementChange)}. Review hooks, creative format, and posting time before repeating this content mix.`,
        'high'
      ));
    }

    if (leadChange < 0) {
      recommendations.push(makeRecommendation(
        'lead_flow',
        'Lead flow is down',
        `New leads changed by ${formatChange(leadChange)}. Add stronger comment CTAs and link social posts back to an active offer.`,
        'medium'
      ));
    }

    if (current.totals.unreadConversations > 0) {
      recommendations.push(makeRecommendation(
        'inbox',
        'Clear unread conversations',
        `${current.totals.unreadConversations} recent conversation${current.totals.unreadConversations === 1 ? '' : 's'} remain unread. Prioritize replies before scheduling new content.`,
        'high'
      ));
    }

    if (current.totals.scheduledPosts === 0) {
      recommendations.push(makeRecommendation(
        'schedule',
        'Build next week content queue',
        'No scheduled posts are currently counted in this period. Queue the next week of content to keep output consistent.',
        'medium'
      ));
    }

    if (recommendations.length === 0) {
      recommendations.push(makeRecommendation(
        'momentum',
        'Keep the current cadence',
        'Performance is stable from the available data. Keep testing hooks, offers, and posting times so the next report has clearer winners.',
        'low'
      ));
    }

    const topPosts = current.media.slice(0, 5).map(item => ({
      id: item.instagramMediaId,
      caption: item.caption || '',
      permalink: item.permalink,
      likes: item.likes || 0,
      comments: item.comments || 0,
      engagementActions: item.engagementActions || 0,
      timestamp: item.timestamp
    }));

    const report = {
      range: { start, end, days },
      previousRange: { start: previousStart, end: previousEnd, days },
      businessName: req.user.businessName,
      summary: current.totals,
      previousSummary: previous.totals,
      changes: {
        engagementActions: engagementChange,
        leads: leadChange,
        conversations: percentChange(current.totals.conversations, previous.totals.conversations),
        revenue: percentChange(current.totals.revenue, previous.totals.revenue)
      },
      topPosts,
      recommendations
    };

    let savedReport = null;
    const reportText = buildReportText(req.user, current, previous, recommendations, { start, end });

    if (req.query.save === 'true') {
      savedReport = await Report.create({
        userId: req.user._id,
        clientId: clientId && !['all', 'unassigned'].includes(clientId) ? clientId : null,
        title: `Weekly Social Report - ${start.toISOString().slice(0, 10)}`,
        type: 'weekly_social',
        periodStart: start,
        periodEnd: end,
        summary: report.summary,
        payload: report,
        text: reportText,
        status: 'draft'
      });
    }

    res.json({
      report,
      text: reportText,
      savedReport
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

module.exports = router;
