// routes/audienceInsights.js
const express = require('express');
const router = express.Router();
const InstagramAPI = require('../services/instagramAPI');
const authMiddleware = require('../middleware/auth');

// In-memory cache: keyed by `${userId}_${metricType}_${breakdown}`
const insightsCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCachedData(key) {
  const entry = insightsCache.get(key);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS) {
    return entry.data;
  }
  insightsCache.delete(key);
  return null;
}

/**
 * GET /api/audience-insights
 * Returns all four demographic breakdowns (city, country, age, gender)
 * Query params:
 *   ?metric=follower_demographics|engaged_audience_demographics (default: follower_demographics)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.instagramBusinessAccountId || !req.user.instagramAccessToken) {
      return res.status(400).json({
        error: 'Instagram account not connected',
        code: 'NO_INSTAGRAM'
      });
    }

    const metricType = req.query.metric || 'follower_demographics';
    if (!['follower_demographics', 'engaged_audience_demographics'].includes(metricType)) {
      return res.status(400).json({ error: 'Invalid metric type' });
    }

    const igId = req.user.instagramBusinessAccountId;
    const token = req.user.instagramAccessToken;
    const userId = req.user._id.toString();
    const breakdowns = ['city', 'country', 'age', 'gender'];

    const results = {};
    const fetchPromises = [];

    for (const breakdown of breakdowns) {
      const cacheKey = `${userId}_${metricType}_${breakdown}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        results[breakdown] = cached;
      } else {
        fetchPromises.push(
          (metricType === 'follower_demographics'
            ? InstagramAPI.getFollowerDemographics(igId, token, breakdown)
            : InstagramAPI.getEngagedAudienceDemographics(igId, token, breakdown)
          ).then(data => {
            data.sort((a, b) => b.value - a.value);
            results[breakdown] = data;
            insightsCache.set(cacheKey, { data, timestamp: Date.now() });
          })
        );
      }
    }

    await Promise.all(fetchPromises);

    // Compute summary stats
    const totalCityFollowers = results.city.reduce((sum, item) => sum + item.value, 0);
    const topCountry = results.country[0]?.dimension || 'N/A';
    const topCity = results.city[0]?.dimension || 'N/A';
    const dominantAgeGroup = results.age[0]?.dimension || 'N/A';

    const genderSummary = {};
    results.gender.forEach(item => {
      genderSummary[item.dimension] = item.value;
    });

    res.json({
      insights: {
        city: results.city,
        country: results.country,
        age: results.age,
        gender: results.gender,
        summary: {
          totalCityFollowers,
          topCountry,
          topCity,
          dominantAgeGroup,
          genderSummary
        }
      },
      metricType
    });
  } catch (error) {
    console.error('Audience insights error:', error);

    const igError = error.response?.data?.error;
    if (igError) {
      if (igError.code === 190) {
        return res.status(401).json({
          error: 'Instagram token expired. Please reconnect your account.',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (igError.error_subcode === 2108006) {
        return res.status(400).json({
          error: 'Your account needs at least 100 followers to access audience insights.',
          code: 'INSUFFICIENT_FOLLOWERS'
        });
      }
      if (igError.code === 4) {
        return res.status(429).json({
          error: 'API rate limit reached. Please try again later.',
          code: 'RATE_LIMITED'
        });
      }
    }

    res.status(500).json({ error: 'Failed to fetch audience insights' });
  }
});

module.exports = router;
