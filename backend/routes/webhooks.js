// routes/webhooks.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Lead = require('../models/Lead');
const InstagramAPI = require('../services/instagramAPI');

/**
 * GET /api/webhooks
 * Webhook verification (required by Meta)
 */
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'threadline_verify_token_2026';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

/**
 * POST /api/webhooks
 * Receive webhook events from Instagram
 */
router.post('/', async (req, res) => {
  try {
    // Verify signature using raw body (set by server.js verify callback)
    const signature = req.headers['x-hub-signature-256'];
    if (!signature || !req.rawBody) {
      console.log('❌ Missing webhook signature or raw body');
      return res.sendStatus(403);
    }

    const isValid = InstagramAPI.verifySignature(
      req.rawBody,
      signature
    );

    if (!isValid) {
      console.log('❌ Invalid webhook signature');
      return res.sendStatus(403);
    }
    
    const body = req.body;

    // LOG EVERY WEBHOOK EVENT
    console.log('📩 WEBHOOK RECEIVED:', JSON.stringify(body, null, 2));

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            await processWebhookChange(change, entry.id);
          }
        }
        
        if (entry.messaging) {
          for (const event of entry.messaging) {
            await processMessagingEvent(event);
          }
        }
      }
    }
    
    // Always respond 200 quickly to avoid Meta retries
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 so Meta doesn't retry
    res.sendStatus(200);
  }
});

/**
 * Process webhook change event
 */
async function processWebhookChange(change, entryId) {
  try {
    const { field, value } = change;

    console.log('Webhook change:', field);

    if (field === 'comments') {
      await handleCommentEvent(value, entryId);
    } else if (field === 'mentions') {
      await handleMentionEvent(value, entryId);
    } else if (field === 'messages') {
      // Messages can come via changes (not just entry.messaging)
      console.log('📨 Message via changes:', JSON.stringify(value, null, 2));
      if (value.message) {
        await processMessagingEvent({
          sender: value.sender,
          recipient: value.recipient,
          timestamp: value.timestamp,
          message: value.message
        });
      }
    } else if (field === 'story_insights' || field === 'story_mention') {
      await handleMentionEvent(value);
    }
  } catch (error) {
    console.error('Process change error:', error);
  }
}

async function findConnectedUserByInstagramId(instagramAccountId) {
  if (!instagramAccountId) return null;

  const user = await User.findOne({
    instagramBusinessAccountId: instagramAccountId.toString(),
    instagramAccessToken: { $ne: null }
  });

  if (!user) {
    console.log('No connected user found for Instagram account:', instagramAccountId);
  }

  return user;
}

/**
 * Process messaging event
 */
async function processMessagingEvent(event) {
  try {
    console.log('📨 Processing messaging event:', JSON.stringify(event, null, 2));

    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const message = event.message;

    // Handle message_edit events (num_edit=0 means new message notification in dev mode)
    if (event.message_edit && event.message_edit.num_edit === 0) {
      console.log('📝 New message notification (message_edit with num_edit=0)');
      await handleMessageEditEvent(event);
      return;
    }

    // Skip read receipts and other non-message events
    if (!message) {
      console.log('⏭️ Skipping non-message event (read receipt, reaction, etc.)');
      return;
    }

    if (!senderId || !recipientId) {
      console.log('⏭️ Missing sender or recipient ID');
      return;
    }

    // Detect story replies — they have attachments with type 'story_mention' or 'story_reply'
    const isStoryReply = message.attachments?.data?.some(
      a => a.type === 'story_mention' || a.type === 'story_reply'
    ) || message.reply_to?.story;
    const messageText = message.text || (isStoryReply ? '📖 Replied to your story' : '[media]');
    const source = isStoryReply ? 'story_reply' : 'dm';

    console.log(`💬 ${isStoryReply ? 'Story reply' : 'Message'} from ${senderId} to ${recipientId}: ${messageText}`);

    // Parse timestamp — Meta sends unix seconds as string OR milliseconds
    let eventTimestamp;
    const tsNum = Number(event.timestamp);
    if (!isNaN(tsNum) && tsNum > 0) {
      // If it looks like seconds (< year 2100 in seconds = 4102444800), multiply by 1000
      eventTimestamp = new Date(tsNum < 10000000000 ? tsNum * 1000 : tsNum);
    } else {
      eventTimestamp = new Date();
    }

    const user = await findConnectedUserByInstagramId(recipientId);

    if (!user) {
      return;
    }
    
    // Find or create conversation
    let conversation = await Conversation.findOne({
      userId: user._id,
      instagramUserId: senderId
    });
    
    if (!conversation) {
      conversation = new Conversation({
        userId: user._id,
        instagramUserId: senderId,
        username: 'Instagram User',
        source: source,
        messages: [],
        unread: true
      });
    }

    // Add message
    conversation.messages.push({
      id: message.mid,
      from: {
        id: senderId
      },
      message: messageText,
      timestamp: eventTimestamp,
      isFromBusiness: false
    });

    conversation.lastMessageAt = eventTimestamp;
    conversation.unread = true;
    await conversation.save();
    
    // Create or update lead
    if (!conversation.leadId) {
      let lead = await Lead.findOne({
        userId: user._id,
        instagramUserId: senderId
      });
      
      if (!lead) {
        lead = new Lead({
          userId: user._id,
          instagramUserId: senderId,
          username: 'Instagram User',
          source: 'dm',
          funnelState: 'new'
        });
        await lead.save();
      }
      
      conversation.leadId = lead._id;
      await conversation.save();
    }
    
    // Send acknowledgment if enabled (one-time only)
    if (user.acknowledgmentEnabled) {
      const userMessages = conversation.messages.filter(
        m => !m.isFromBusiness
      );
      
      if (userMessages.length === 1) {
        try {
          await InstagramAPI.sendMessage(
            senderId,
            user.acknowledgmentMessage,
            user.instagramAccessToken
          );
          
          conversation.messages.push({
            id: Date.now().toString(),
            from: {
              id: user.instagramBusinessAccountId
            },
            message: user.acknowledgmentMessage,
            timestamp: new Date(),
            isFromBusiness: true
          });
          
          await conversation.save();
        } catch (error) {
          console.error('Error sending acknowledgment:', error);
        }
      }
    }
  } catch (error) {
    console.error('Process messaging event error:', error);
  }
}

/**
 * Handle message_edit event (used in dev mode to detect new messages)
 * In development mode, Instagram sends message_edit with num_edit=0 instead of message events
 * We use the mid to fetch the actual message content via API
 */
async function handleMessageEditEvent(event) {
  try {
    const mid = event.message_edit?.mid;
    if (!mid) return;

    const user = await findConnectedUserByInstagramId(event.recipient?.id);

    if (!user) {
      console.log('Skipping message_edit because the recipient is not connected');
      return;
    }

    const axios = require('axios');

    // Approach 1: Try to fetch the message by mid
    try {
      const msgResponse = await axios.get(`https://graph.instagram.com/v21.0/${mid}`, {
        params: {
          fields: 'id,message,from,created_time',
          access_token: user.instagramAccessToken
        }
      });
      const msgData = msgResponse.data;
      console.log('📬 Fetched message by mid:', JSON.stringify(msgData, null, 2));

      if (msgData.message && msgData.from) {
        await saveMessageToConversation(user, msgData);
        return;
      }
    } catch (e) {
      console.log('Could not fetch by mid:', e.response?.data?.error?.message || e.message);
    }

    // Approach 2: Fetch all conversations and sync latest messages
    console.log('📥 Trying to sync conversations via API...');
    try {
      const convResponse = await axios.get('https://graph.instagram.com/v21.0/me/conversations', {
        params: {
          platform: 'instagram',
          fields: 'id,updated_time,participants,messages.limit(5){id,message,from,created_time}',
          access_token: user.instagramAccessToken
        }
      });

      const conversations = convResponse.data.data || [];
      console.log(`📥 Found ${conversations.length} conversations via API`);

      for (const conv of conversations) {
        const participant = conv.participants?.data?.find(
          p => p.id !== user.instagramBusinessAccountId
        );
        if (!participant) continue;

        const senderId = participant.id;
        const senderUsername = participant.username || 'Instagram User';

        let conversation = await Conversation.findOne({
          userId: user._id,
          instagramUserId: senderId
        });

        if (!conversation) {
          conversation = new Conversation({
            userId: user._id,
            instagramUserId: senderId,
            username: senderUsername,
            source: 'dm',
            messages: [],
            unread: true
          });
        }

        // Sync messages
        let newCount = 0;
        if (conv.messages?.data) {
          for (const msg of conv.messages.data) {
            const exists = conversation.messages.find(m => m.id === msg.id);
            if (!exists) {
              conversation.messages.push({
                id: msg.id,
                from: {
                  id: msg.from?.id,
                  username: msg.from?.username || senderUsername
                },
                message: msg.message || '[media]',
                timestamp: new Date(msg.created_time),
                isFromBusiness: msg.from?.id === user.instagramBusinessAccountId
              });
              newCount++;
            }
          }
        }

        if (newCount > 0) {
          conversation.lastMessageAt = new Date(conv.updated_time);
          conversation.unread = true;
          conversation.username = senderUsername;
          await conversation.save();
          console.log(`✅ Synced ${newCount} new messages from ${senderUsername}`);

          // Create lead if needed
          if (!conversation.leadId) {
            let lead = await Lead.findOne({ userId: user._id, instagramUserId: senderId });
            if (!lead) {
              lead = new Lead({
                userId: user._id,
                instagramUserId: senderId,
                username: senderUsername,
                source: 'dm',
                funnelState: 'new'
              });
              await lead.save();
              console.log(`✅ Lead created for ${senderUsername}`);
            }
            conversation.leadId = lead._id;
            await conversation.save();
          }
        }
      }

      if (conversations.length === 0) {
        console.log('📭 Conversations API still empty — creating placeholder from webhook event');

        // Create a placeholder conversation so the UI shows something
        // We know a message was sent but can't read it in dev mode
        const entryId = event.message_edit?.mid ? 'webhook_user' : 'unknown';

        let conversation = await Conversation.findOne({
          userId: user._id,
          instagramUserId: 'pending_dev_mode'
        });

        if (!conversation) {
          conversation = new Conversation({
            userId: user._id,
            instagramUserId: 'pending_dev_mode',
            username: 'Instagram User (Dev Mode)',
            source: 'dm',
            messages: [{
              id: mid,
              from: { id: 'pending_dev_mode', username: 'Instagram User' },
              message: '📩 New message received (content available in Live mode)',
              timestamp: new Date(),
              isFromBusiness: false
            }],
            unread: true,
            lastMessageAt: new Date()
          });
          await conversation.save();
          console.log('✅ Created placeholder conversation from webhook event');

          // Create lead
          let lead = await Lead.findOne({ userId: user._id, instagramUserId: 'pending_dev_mode' });
          if (!lead) {
            lead = new Lead({
              userId: user._id,
              instagramUserId: 'pending_dev_mode',
              username: 'Instagram User (Dev Mode)',
              source: 'dm',
              funnelState: 'new'
            });
            await lead.save();
          }
          conversation.leadId = lead._id;
          await conversation.save();
        } else {
          // Add another message to existing placeholder
          conversation.messages.push({
            id: mid,
            from: { id: 'pending_dev_mode', username: 'Instagram User' },
            message: '📩 New message received (content available in Live mode)',
            timestamp: new Date(),
            isFromBusiness: false
          });
          conversation.lastMessageAt = new Date();
          conversation.unread = true;
          await conversation.save();
          console.log('✅ Added message to placeholder conversation');
        }
      }
    } catch (convError) {
      console.log('Could not sync conversations:', convError.response?.data?.error?.message || convError.message);
    }
  } catch (error) {
    console.error('Handle message edit error:', error);
  }
}

/**
 * Helper: Save a fetched message to conversation in DB
 */
async function saveMessageToConversation(user, msgData) {
  const senderId = msgData.from.id;
  const senderUsername = msgData.from.username || 'Instagram User';

  if (senderId === user.instagramBusinessAccountId) {
    console.log('⏭️ Skipping own message');
    return;
  }

  let conversation = await Conversation.findOne({
    userId: user._id,
    instagramUserId: senderId
  });

  if (!conversation) {
    conversation = new Conversation({
      userId: user._id,
      instagramUserId: senderId,
      username: senderUsername,
      source: 'dm',
      messages: [],
      unread: true
    });
  }

  const exists = conversation.messages.find(m => m.id === msgData.id);
  if (exists) {
    console.log('⏭️ Message already exists');
    return;
  }

  conversation.messages.push({
    id: msgData.id,
    from: { id: senderId, username: senderUsername },
    message: msgData.message,
    timestamp: new Date(msgData.created_time),
    isFromBusiness: false
  });

  conversation.lastMessageAt = new Date(msgData.created_time);
  conversation.unread = true;
  conversation.username = senderUsername;
  await conversation.save();
  console.log(`✅ Message saved! From: ${senderUsername}, Text: ${msgData.message}`);

  if (!conversation.leadId) {
    let lead = await Lead.findOne({ userId: user._id, instagramUserId: senderId });
    if (!lead) {
      lead = new Lead({
        userId: user._id, instagramUserId: senderId,
        username: senderUsername, source: 'dm', funnelState: 'new'
      });
      await lead.save();
      console.log(`✅ Lead created for ${senderUsername}`);
    }
    conversation.leadId = lead._id;
    await conversation.save();
  }
}

/**
 * Handle comment event
 * Creates a conversation/lead when someone comments on your posts
 */
async function handleCommentEvent(value, entryId) {
  try {
    console.log('💬 Comment event:', JSON.stringify(value, null, 2));

    const user = await findConnectedUserByInstagramId(value.recipient?.id || value.to?.id || entryId);
    if (!user) return;

    const commentId = value.id;
    const commentText = value.text;
    const commenterUsername = value.from?.username || 'Instagram User';
    const commenterId = value.from?.id;
    const mediaId = value.media?.id;
    const timestamp = value.created_time ? new Date(value.created_time * 1000) : new Date();

    if (!commenterId) {
      console.log('⏭️ No commenter ID in comment event');
      return;
    }

    // Skip own comments
    if (commenterId === user.instagramBusinessAccountId) {
      console.log('⏭️ Skipping own comment');
      return;
    }

    // Find or create conversation for this commenter
    let conversation = await Conversation.findOne({
      userId: user._id,
      instagramUserId: commenterId
    });

    if (!conversation) {
      conversation = new Conversation({
        userId: user._id,
        instagramUserId: commenterId,
        username: commenterUsername,
        source: 'comment',
        sourcePostId: mediaId || null,
        messages: [],
        unread: true
      });
    }

    // Check if this comment is already saved
    const exists = conversation.messages.find(m => m.id === commentId);
    if (exists) {
      console.log('⏭️ Comment already saved');
      return;
    }

    // Add comment as a message
    conversation.messages.push({
      id: commentId,
      from: { id: commenterId, username: commenterUsername },
      message: `💬 Comment: ${commentText}`,
      timestamp: timestamp,
      isFromBusiness: false
    });

    conversation.lastMessageAt = timestamp;
    conversation.unread = true;
    conversation.username = commenterUsername;
    await conversation.save();
    console.log(`✅ Comment saved from ${commenterUsername}: ${commentText}`);

    // Create lead if needed
    if (!conversation.leadId) {
      let lead = await Lead.findOne({ userId: user._id, instagramUserId: commenterId });
      if (!lead) {
        lead = new Lead({
          userId: user._id,
          instagramUserId: commenterId,
          username: commenterUsername,
          source: 'comment',
          funnelState: 'new'
        });
        await lead.save();
        console.log(`✅ Lead created from comment: ${commenterUsername}`);
      }
      conversation.leadId = lead._id;
      await conversation.save();
    }

    // Comment-to-DM Automation: check keyword triggers
    if (user.commentAutomations?.length > 0 && commentText) {
      const enabledRules = user.commentAutomations.filter(r => r.enabled);
      const textUpper = commentText.toUpperCase().trim();

      for (const rule of enabledRules) {
        const keywordUpper = rule.keyword.toUpperCase().trim();
        if (!textUpper.includes(keywordUpper)) continue;

        // Dedup: check if we already sent an auto-DM to this user for this keyword
        const alreadySent = conversation.messages.some(m =>
          m.isFromBusiness && m.message && m.message.includes(`[AutoDM:${rule.keyword}]`)
        );
        if (alreadySent) {
          console.log(`⏭️ AutoDM already sent to ${commenterUsername} for keyword "${rule.keyword}"`);
          break;
        }

        console.log(`🤖 Keyword "${rule.keyword}" matched in comment from ${commenterUsername}`);

        // Send DM to commenter
        try {
          await InstagramAPI.sendMessage(commenterId, rule.dmMessage, user.instagramAccessToken);
          console.log(`✅ AutoDM sent to ${commenterUsername}`);

          // Log the DM in the conversation
          conversation.messages.push({
            id: `autodm_${Date.now()}`,
            from: { id: user.instagramBusinessAccountId },
            message: `${rule.dmMessage} [AutoDM:${rule.keyword}]`,
            timestamp: new Date(),
            isFromBusiness: true
          });
          await conversation.save();
        } catch (dmError) {
          console.error(`❌ AutoDM failed to ${commenterUsername}:`, dmError.response?.data || dmError.message);
        }

        // Optionally send public reply under the comment
        if (rule.publicReply) {
          try {
            await InstagramAPI.replyToComment(commentId, rule.publicReply, user.instagramAccessToken);
            console.log(`✅ Public reply sent on comment from ${commenterUsername}`);
          } catch (replyError) {
            console.error(`❌ Public reply failed:`, replyError.response?.data || replyError.message);
          }
        }

        // Increment trigger count
        rule.triggerCount = (rule.triggerCount || 0) + 1;
        await user.save();

        break; // First match wins
      }
    }
  } catch (error) {
    console.error('Handle comment error:', error);
  }
}

/**
 * Handle mention event
 * Creates a conversation/lead when someone mentions your account
 */
async function handleMentionEvent(value, entryId) {
  try {
    console.log('📢 Mention event:', JSON.stringify(value, null, 2));

    const user = await findConnectedUserByInstagramId(value.recipient?.id || value.to?.id || entryId);
    if (!user) return;

    const mentionerId = value.from?.id;
    const mentionerUsername = value.from?.username || 'Instagram User';
    const mediaId = value.media_id;
    const timestamp = new Date();

    if (!mentionerId) {
      console.log('⏭️ No mentioner ID in mention event');
      return;
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      userId: user._id,
      instagramUserId: mentionerId
    });

    if (!conversation) {
      conversation = new Conversation({
        userId: user._id,
        instagramUserId: mentionerId,
        username: mentionerUsername,
        source: 'story_mention',
        sourcePostId: mediaId || null,
        messages: [],
        unread: true
      });
    }

    // Add mention as a message
    conversation.messages.push({
      id: `mention_${Date.now()}`,
      from: { id: mentionerId, username: mentionerUsername },
      message: `📢 Mentioned you in a post`,
      timestamp: timestamp,
      isFromBusiness: false
    });

    conversation.lastMessageAt = timestamp;
    conversation.unread = true;
    conversation.username = mentionerUsername;
    await conversation.save();
    console.log(`✅ Mention saved from ${mentionerUsername}`);

    // Create lead if needed
    if (!conversation.leadId) {
      let lead = await Lead.findOne({ userId: user._id, instagramUserId: mentionerId });
      if (!lead) {
        lead = new Lead({
          userId: user._id,
          instagramUserId: mentionerId,
          username: mentionerUsername,
          source: 'story_mention',
          funnelState: 'new'
        });
        await lead.save();
        console.log(`✅ Lead created from mention: ${mentionerUsername}`);
      }
      conversation.leadId = lead._id;
      await conversation.save();
    }
  } catch (error) {
    console.error('Handle mention error:', error);
  }
}

module.exports = router;
