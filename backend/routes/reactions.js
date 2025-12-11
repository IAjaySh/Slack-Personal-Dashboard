import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createSlackClient, getThreadReactions } from '../utils/slackClient.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { channel, thread_ts } = req.query;

    if (!channel || !thread_ts) {
      return res.status(400).json({
        error: 'Missing required parameters: channel and thread_ts'
      });
    }

    const user = await User.findById(req.userId).select('+slackAccessToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const slackClient = createSlackClient(user.slackAccessToken);
    const reactions = await getThreadReactions(slackClient, channel, thread_ts);

    res.json(reactions);
  } catch (error) {
    console.error('Reactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
