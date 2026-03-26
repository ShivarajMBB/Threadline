// services/instagramAPI.js
const axios = require('axios');
const crypto = require('crypto');

const GRAPH_API_VERSION = 'v21.0';
const INSTAGRAM_GRAPH_BASE = `https://graph.instagram.com/${GRAPH_API_VERSION}`;
const FACEBOOK_GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

class InstagramAPI {

  /**
   * Get Instagram Business Account Info
   * Uses Instagram Graph API (for Instagram Login tokens)
   */
  static async getAccountInfo(igBusinessAccountId, accessToken) {
    try {
      const response = await axios.get(
        `${INSTAGRAM_GRAPH_BASE}/me`,
        {
          params: {
            fields: 'user_id,username,profile_picture_url,followers_count,account_type',
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting account info:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get conversations (Direct Messages)
   * Instagram Business Login uses the Instagram Graph API for conversations
   * Endpoint: GET /me/conversations
   */
  static async getConversations(igBusinessAccountId, accessToken, limit = 50) {
    // Use Instagram Graph API — the only endpoint that works with Instagram Login tokens
    try {
      const response = await axios.get(
        `${INSTAGRAM_GRAPH_BASE}/me/conversations`,
        {
          params: {
            platform: 'instagram',
            fields: 'id,updated_time,participants,messages{id,message,from,created_time}',
            limit,
            access_token: accessToken
          }
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error.response?.data?.error?.message || error.message);
      return [];
    }
  }

  /**
   * Send a message (manual reply)
   * Uses POST /me/messages with recipient object
   * Can only reply to user-initiated conversations within the 24-hour messaging window.
   */
  static async sendMessage(recipientId, messageText, accessToken) {
    try {
      const response = await axios.post(
        `${INSTAGRAM_GRAPH_BASE}/me/messages`,
        {
          recipient: {
            id: recipientId
          },
          message: {
            text: messageText
          }
        },
        {
          params: {
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get comments on media (for manual replies)
   */
  static async getMediaComments(mediaId, accessToken) {
    try {
      const response = await axios.get(
        `${INSTAGRAM_GRAPH_BASE}/${mediaId}/comments`,
        {
          params: {
            fields: 'id,text,username,timestamp,from',
            access_token: accessToken
          }
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data);
      throw error;
    }
  }

  /**
   * Reply to a comment (manual reply)
   */
  static async replyToComment(commentId, message, accessToken) {
    try {
      const response = await axios.post(
        `${INSTAGRAM_GRAPH_BASE}/${commentId}/replies`,
        {
          message: message
        },
        {
          params: {
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error replying to comment:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get media (posts) for the account
   */
  static async getMedia(igBusinessAccountId, accessToken, limit = 25) {
    try {
      const response = await axios.get(
        `${INSTAGRAM_GRAPH_BASE}/me/media`,
        {
          params: {
            fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
            limit: limit,
            access_token: accessToken
          }
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching media:', error.response?.data);
      throw error;
    }
  }

  /**
   * Create a container for publishing (Step 1 of posting)
   */
  static async createMediaContainer(igBusinessAccountId, imageUrl, caption, accessToken) {
    try {
      const response = await axios.post(
        `${INSTAGRAM_GRAPH_BASE}/me/media`,
        {
          image_url: imageUrl,
          caption: caption
        },
        {
          params: {
            access_token: accessToken
          }
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error creating media container:', error.response?.data);
      throw error;
    }
  }

  /**
   * Publish a media container (Step 2 of posting)
   */
  static async publishMedia(igBusinessAccountId, creationId, accessToken) {
    try {
      const response = await axios.post(
        `${INSTAGRAM_GRAPH_BASE}/me/media_publish`,
        {
          creation_id: creationId
        },
        {
          params: {
            access_token: accessToken
          }
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error publishing media:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get Instagram User Profile (for leads)
   */
  static async getInstagramUser(instagramUserId, accessToken) {
    try {
      const response = await axios.get(
        `${INSTAGRAM_GRAPH_BASE}/${instagramUserId}`,
        {
          params: {
            fields: 'id,username,profile_picture_url',
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting Instagram user:', error.response?.data);
      throw error;
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   * Note: For Instagram Login, this uses the Instagram Graph API endpoint
   */
  static async getLongLivedToken(shortLivedToken) {
    try {
      const response = await axios.get(
        'https://graph.instagram.com/access_token',
        {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret: process.env.INSTAGRAM_APP_SECRET,
            access_token: shortLivedToken
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging token:', error.response?.data);
      throw error;
    }
  }

  /**
   * Refresh a long-lived token before it expires
   */
  static async refreshLongLivedToken(longLivedToken) {
    try {
      const response = await axios.get(
        'https://graph.instagram.com/refresh_access_token',
        {
          params: {
            grant_type: 'ig_refresh_token',
            access_token: longLivedToken
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get follower demographics (city, country, age, gender)
   * Requires: instagram_business_manage_insights permission
   * Account must have 100+ followers, returns top 45 results
   */
  static async getFollowerDemographics(igBusinessAccountId, accessToken, breakdown) {
    try {
      const response = await axios.get(
        `${INSTAGRAM_GRAPH_BASE}/${igBusinessAccountId}/insights`,
        {
          params: {
            metric: 'follower_demographics',
            period: 'lifetime',
            timeframe: 'this_month',
            breakdown: breakdown,
            metric_type: 'total_value',
            access_token: accessToken
          }
        }
      );

      const data = response.data?.data?.[0]?.total_value?.breakdowns?.[0]?.results || [];
      return data.map(item => ({
        dimension: item.dimension_values[1] || item.dimension_values[0],
        value: item.value
      }));
    } catch (error) {
      console.error(`Error getting follower demographics (${breakdown}):`, error.response?.data);
      throw error;
    }
  }

  /**
   * Get engaged audience demographics (city, country, age, gender)
   * Same as follower demographics but for engaged users only
   */
  static async getEngagedAudienceDemographics(igBusinessAccountId, accessToken, breakdown) {
    try {
      const response = await axios.get(
        `${INSTAGRAM_GRAPH_BASE}/${igBusinessAccountId}/insights`,
        {
          params: {
            metric: 'engaged_audience_demographics',
            period: 'lifetime',
            timeframe: 'this_month',
            breakdown: breakdown,
            metric_type: 'total_value',
            access_token: accessToken
          }
        }
      );

      const data = response.data?.data?.[0]?.total_value?.breakdowns?.[0]?.results || [];
      return data.map(item => ({
        dimension: item.dimension_values[1] || item.dimension_values[0],
        value: item.value
      }));
    } catch (error) {
      console.error(`Error getting engaged audience demographics (${breakdown}):`, error.response?.data);
      throw error;
    }
  }

  /**
   * Verify webhook signature (for security)
   * Expects raw body string, not parsed JSON
   */
  static verifySignature(rawBody, signature) {
    // Try Instagram App Secret first, then Facebook App Secret
    const secrets = [
      process.env.INSTAGRAM_APP_SECRET,
      process.env.FACEBOOK_APP_SECRET
    ].filter(Boolean);

    for (const secret of secrets) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      if (signature === `sha256=${expectedSignature}`) {
        return true;
      }
    }

    console.log('Signature mismatch. Received:', signature);
    return false;
  }
}

module.exports = InstagramAPI;
