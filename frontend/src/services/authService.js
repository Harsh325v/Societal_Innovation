import api from './api'

export const authService = {
  // login gives us the JWT token
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // get the actual logged-in user using the JWT
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  register: async (payload) => {
    const response = await api.post('/auth/register', payload)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('sih_token')
    localStorage.removeItem('sih_user')
  },
}