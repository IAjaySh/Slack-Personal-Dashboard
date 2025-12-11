import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export default function ReactionTracker() {
    const { token } = useAuth()
    const [threadUrl, setThreadUrl] = useState('')
    const [reactions, setReactions] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const extractThreadInfo = (url) => {
        // Extract from Slack thread URL: https://workspace.slack.com/archives/C123/p1234567890123456?thread_ts=1234567890.123456
        const archivesMatch = url.match(/archives\/([A-Z0-9]+)/);
        const threadMatch = url.match(/thread_ts=([0-9.]+)/);

        if (archivesMatch && threadMatch) {
            return {
                channel: archivesMatch,
                thread_ts: threadMatch
            }
        }
        return null
    }

    const handleTrackReactions = async (e) => {
        e.preventDefault()
        setError('')
        setReactions(null)

        const info = extractThreadInfo(threadUrl)
        if (!info) {
            setError('Invalid thread URL. Please paste a valid Slack thread URL.')
            return
        }

        try {
            setLoading(true)
            const response = await axios.get(
                `\${API_URL}/reactions?channel=\${info.channel}&thread_ts=\${info.thread_ts}`,
                { headers: { Authorization: `Bearer \${token}` } }
            )
            setReactions(response.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch reactions')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleTrackReactions} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste Thread URL
                    </label>
                    <input
                        type="text"
                        value={threadUrl}
                        onChange={(e) => setThreadUrl(e.target.value)}
                        placeholder="https://workspace.slack.com/archives/C123/p1234567890?thread_ts=..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !threadUrl}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition"
                >
                    {loading ? 'Loading...' : 'Track Reactions'}
                </button>
            </form>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {reactions && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        📊 Reactions Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded border border-gray-200">
                            <div className="text-2xl font-bold text-purple-600">
                                {reactions.totalReactions}
                            </div>
                            <div className="text-sm text-gray-600">Total Reactions</div>
                        </div>
                        <div className="bg-white p-4 rounded border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">
                                {reactions.totalMessages}
                            </div>
                            <div className="text-sm text-gray-600">Messages in Thread</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {reactions.reactions.map((reaction, idx) => (
                            <div key={idx} className="bg-white p-4 rounded border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg">
                                            :{reaction.emoji}: × {reaction.count}
                                        </div>
                                        <div className="text-sm text-gray-600">{reaction.text}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">
                                            {reaction.users.length} user{reaction.users.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
