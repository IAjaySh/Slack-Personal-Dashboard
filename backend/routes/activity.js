import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createSlackClient,
  getUserMessages,
  getUserReactions
} from '../utils/slackClient.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+slackAccessToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const slackClient = createSlackClient(user.slackAccessToken);

    const [messages, reactions] = await Promise.all([
      getUserMessages(slackClient, user.slackUserId),
      getUserReactions(slackClient, user.slackUserId)
    ]);

    res.json({
      messages: messages || [],
      reactions: reactions || [],
      stats: {
        totalMessages: (messages || []).length,
        totalReactions: (reactions || []).length
      }
    });
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
