import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockUsers } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sih_user')
    return saved ? JSON.parse(saved) : mockUsers.citizen
  })

  const [token, setToken] = useState(() => localStorage.getItem('sih_token') || 'mock-token')

  useEffect(() => {
    localStorage.setItem('sih_user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('sih_token', token)
    }
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role,
      setUser,
      setToken,
      signIn: (nextUser, nextToken = 'mock-token') => {
        setUser(nextUser)
        setToken(nextToken)
      },
      signOut: () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('sih_token')
        localStorage.removeItem('sih_user')
      },
    }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
