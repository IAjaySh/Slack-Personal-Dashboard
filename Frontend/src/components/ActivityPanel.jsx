import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export default function ActivityPanel() {
    const { token } = useAuth()
    const [activity, setActivity] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchActivity()
    }, [token])

    const fetchActivity = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`\${API_URL}/activity`, {
                headers: { Authorization: `Bearer \${token}` }
            })
            setActivity(response.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch activity')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-8">Loading activity...</div>

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">
                        {activity?.stats?.totalMessages || 0}
                    </div>
                    <div className="text-gray-700 font-medium">Messages Sent</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">
                        {activity?.stats?.totalReactions || 0}
                    </div>
                    <div className="text-gray-700 font-medium">Reactions Added</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600">
                        {(activity?.messages?.length || 0) + (activity?.reactions?.length || 0)}
                    </div>
                    <div className="text-gray-700 font-medium">Total Activity</div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-lg mb-4">Recent Messages</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activity?.messages?.length ? (
                        activity.messages.slice(0, 10).map((msg, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="text-sm text-gray-700">{msg.text}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(msg.ts * 1000).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">No messages found</div>
                    )}
                </div>
            </div>

            <div>
                <button
                    onClick={fetchActivity}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    🔄 Refresh Activity
                </button>
            </div>
        </div>
    )
}
