import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  slackUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  slackTeamId: String,
  name: String,
  email: String,
  avatar: String,
  slackAccessToken: {
    type: String,
    required: true,
    select: false // Don't return token by default
  },
  slackRefreshToken: {
    type: String,
    select: false
  },
  tokenExpiresAt: Date,
  lastSync: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
