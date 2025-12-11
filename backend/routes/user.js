import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createSlackClient, getUserIdentity } from '../utils/slackClient.js';

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      slackUserId: user.slackUserId,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+slackAccessToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const slackClient = createSlackClient(user.slackAccessToken);
    const identity = await getUserIdentity(slackClient);

    user.lastSync = new Date();
    await user.save();

    res.json({
      message: 'Synced successfully',
      nextSync: user.lastSync
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
