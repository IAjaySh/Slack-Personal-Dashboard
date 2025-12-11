import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists in URL or localStorage
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    const urlUserId = params.get('userId')

    if (urlToken) {
      localStorage.setItem('token', urlToken)
      localStorage.setItem('userId', urlUserId)
      setToken(urlToken)
      // Clean URL
      window.history.replaceState({}, document.title, '/dashboard')
    } else {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
      }
    }
    setLoading(false)
  }, [])

  const login = (token, userId) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    setToken(token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
