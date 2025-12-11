import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createSlackClient, getUserMentions } from '../utils/slackClient.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+slackAccessToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const slackClient = createSlackClient(user.slackAccessToken);
    const mentions = await getUserMentions(slackClient, user.slackUserId);

    res.json({ mentions, total: mentions.length });
  } catch (error) {
    console.error('Mentions error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
