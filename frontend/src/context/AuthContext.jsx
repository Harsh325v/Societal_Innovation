import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sih_user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sih_token') || null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('sih_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('sih_user')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('sih_token', token)
    } else {
      localStorage.removeItem('sih_token')
    }
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role,
      setUser,
      setToken,

      // save the real backend user + JWT after login
      signIn: (nextUser, nextToken) => {
        setUser(nextUser)
        setToken(nextToken)
      },

      // clear the real session completely
      signOut: () => {
        setUser(null)
        setToken(null)
        authService.logout()
      },
    }),
    [user, token],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}