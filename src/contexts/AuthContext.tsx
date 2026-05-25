import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  name: string
  email: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  setToken: (token: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('workita_token')
    if (token) {
      api.get<User>('/auth/me')
        .then(setUser)
        .catch(() => localStorage.removeItem('workita_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = () => {
    window.location.href = '/api/auth/google'
  }

  const logout = () => {
    localStorage.removeItem('workita_token')
    setUser(null)
  }

  const setToken = (token: string) => {
    localStorage.setItem('workita_token', token)
    api.get<User>('/auth/me').then(setUser).catch(console.error)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
