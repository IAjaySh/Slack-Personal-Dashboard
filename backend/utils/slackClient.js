import axios from 'axios';

const SLACK_API_BASE = 'https://slack.com/api/';

export const createSlackClient = (accessToken) => {
    return axios.create({
        baseURL: SLACK_API_BASE,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
};

// Get reactions for a specific message/thread
export const getThreadReactions = async (client, channel, threadTs) => {
    try {
        const response = await client.get('conversations.replies', {
            params: {
                channel,
                ts: threadTs
            }
        });

        if (!response.data.ok) {
            throw new Error(response.data.error);
        }

        const messages = response.data.messages || [];
        const reactionsData = [];

        for (const msg of messages) {
            if (msg.reactions) {
                msg.reactions.forEach(reaction => {
                    reactionsData.push({
                        emoji: reaction.name,
                        count: reaction.count,
                        users: reaction.users || [],
                        messageTs: msg.ts,
                        text: msg.text || ''
                    });
                });
            }
        }

        return {
            threadTs,
            channel,
            totalMessages: messages.length,
            reactions: reactionsData,
            totalReactions: reactionsData.length
        };
    } catch (error) {
        throw new Error(`Failed to get thread reactions: \${error.message}`);
    }
};

// Get user mentions
export const getUserMentions = async (client, userId) => {
    try {
        const response = await client.get('search.messages', {
            params: {
                query: `<@\${userId}>`,
                count: 20,
                sort: 'timestamp'
            }
        });

        if (!response.data.ok) {
            throw new Error(response.data.error);
        }

        const messages = response.data.messages?.matches || [];

        return messages.map(msg => ({
            text: msg.text,
            channel: msg.channel?.name,
            channelId: msg.channel?.id,
            timestamp: msg.ts,
            permalink: msg.permalink,
            user: msg.user,
            username: msg.username
        }));
    } catch (error) {
        throw new Error(`Failed to get mentions: ${error.message}`);
    }
};

// Get user's recent messages
export const getUserMessages = async (client, userId) => {
    try {
        const response = await client.get('search.messages', {
            params: {
                query: `from:<@\${userId}>`,
                count: 20,
                sort: 'timestamp'
            }
        });

        if (!response.data.ok) {
            throw new Error(response.data.error);
        }

        return response.data.messages?.matches || [];
    } catch (error) {
        throw new Error(`Failed to get user messages: ${error.message}`);
    }
};

// Get user's reactions
export const getUserReactions = async (client, userId) => {
    try {
        const response = await client.get('reactions.list', {
            params: {
                user: userId,
                count: 20
            }
        });

        if (!response.data.ok) {
            throw new Error(response.data.error);
        }

        return response.data.items || [];
    } catch (error) {
        throw new Error(`Failed to get user reactions: ${error.message}`);
    }
};

// Get user identity
export const getUserIdentity = async (client) => {
    try {
        const response = await client.get('users.identity');

        if (!response.data.ok) {
            throw new Error(response.data.error);
        }

        return {
            userId: response.data.user_id,
            teamId: response.data.team_id,
            userName: response.data.user?.name,
            userEmail: response.data.user?.email,
            avatar: response.data.user?.image_24 || response.data.user?.image_192
        };
    } catch (error) {
        throw new Error(`Failed to get user identity: ${error.message}`);
    }
};
