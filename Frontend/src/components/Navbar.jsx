import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3000/api'

export default function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      fetchUserProfile()
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`\${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer \${token}` }
      })
      setUser(response.data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!token) return null

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-600">📊 Slack Dashboard</h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              {user.avatar && <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />}
              <span className="text-gray-700">{user.name}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
