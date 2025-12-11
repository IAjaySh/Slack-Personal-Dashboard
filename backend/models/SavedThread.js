import mongoose from 'mongoose';

const savedThreadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  channelName: String,
  threadTs: {
    type: String,
    required: true
  },
  threadTitle: String,
  threadUrl: String,
  reactionCount: Number,
  savedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SavedThread', savedThreadSchema);
