import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
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
