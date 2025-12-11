import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export default function MentionsTracker() {
    const { token } = useAuth()
    const [mentions, setMentions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchMentions()
    }, [token])

    const fetchMentions = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`\${API_URL}/mentions`, {
                headers: { Authorization: `Bearer \${token}` }
            })
            setMentions(response.data.mentions)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch mentions')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-8">Loading mentions...</div>

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">All Your Mentions</h3>
                <button
                    onClick={fetchMentions}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                >
                    🔄 Refresh
                </button>
            </div>

            {mentions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    No mentions found
                </div>
            ) : (
                <div className="space-y-3">
                    {mentions.map((mention, idx) => (
                        <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <div className="font-semibold text-gray-800">
                                #{mention.channel}
                            </div>
                            <div className="text-gray-700 my-2">{mention.text}</div>
                            <div className="text-xs text-gray-500">
                                by @{mention.username} · {new Date(mention.timestamp * 1000).toLocaleDateString()}
                            </div>
                            {mention.permalink && (
                                <a
                                    href={mention.permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:underline text-sm"
                                >
                                    View in Slack →
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
