import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Step 1: Redirect to Slack OAuth
router.get('/slack', (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = process.env.SLACK_REDIRECT_URI;

  const scopes = [
    'channels:history',
    'channels:read',
    'reactions:read',
    'search:read',
    'users:read',
    'users:read.email',
    'chat:write'
  ].join(' '); // SPACE, not comma

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${redirectUri}`;

  res.json({ authUrl: slackAuthUrl });
});

// Step 2: Handle OAuth callback
router.get('/slack/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) return res.redirect(`http://localhost:5173/login?error=${error}`);
  if (!code) return res.redirect('http://localhost:5173/login?error=no_code');

  try {
    // STEP 2.1 — Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      null,
      {
        params: {
          client_id: process.env.SLACK_CLIENT_ID,
          client_secret: process.env.SLACK_CLIENT_SECRET,
          redirect_uri: process.env.SLACK_REDIRECT_URI,
          code
        }
      }
    );

    if (!tokenResponse.data.ok) {
      throw new Error(tokenResponse.data.error);
    }

    const botToken = tokenResponse.data.access_token; // xoxb
    const authedUser = tokenResponse.data.authed_user; // user info here
    const userId = authedUser.id;
    const userToken = authedUser.access_token; // xoxp

    // STEP 2.2 — Fetch user profile
    const profileResponse = await axios.get('https://slack.com/api/users.info', {
      params: { user: userId },
      headers: { Authorization: `Bearer ${botToken}` }
    });

    const profile = profileResponse.data.user;

    // STEP 2.3 — Upsert user into DB
    let dbUser = await User.findOne({ slackUserId: userId });

    if (!dbUser) {
      dbUser = new User({
        slackUserId: userId,
        slackTeamId: tokenResponse.data.team.id,
        name: profile.real_name,
        email: profile.profile.email,
        avatar: profile.profile.image_192,
        slackAccessToken: userToken,
        botToken: botToken,
        lastSync: new Date()
      });
    } else {
      dbUser.slackAccessToken = userToken;
      dbUser.botToken = botToken;
      dbUser.lastSync = new Date();
    }

    await dbUser.save();

    // STEP 2.4 — Create JWT
    const jwtToken = jwt.sign(
      { userId: dbUser._id, slackUserId: dbUser.slackUserId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // STEP 2.5 — Redirect to frontend
    res.redirect(`http://localhost:5173/dashboard?token=${jwtToken}&userId=${dbUser._id}`);

  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect(`http://localhost:5173/login?error=${error.message}`);
  }
});

export default router;
