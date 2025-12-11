import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      navigate('/dashboard')
    }
  }, [token, navigate])

  const handleSlackLogin = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`\${API_URL}/auth/slack`)
      window.location.href = response.data.authUrl
    } catch (err) {
      setError('Failed to start login. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Slack Dashboard
          </h1>
          <p className="text-gray-600">
            Track reactions, mentions, and your activity
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleSlackLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : '🚀 Login with Slack'}
        </button>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ Track reactions on threads</li>
            <li>✅ View all mentions</li>
            <li>✅ See your activity</li>
            <li>✅ Save important threads</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
