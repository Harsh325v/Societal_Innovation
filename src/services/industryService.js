import api from './api'

export const industryService = {
  getOpportunities: async () => api.get('/industry/opportunities'),
  getProjects: async () => api.get('/industry/projects'),
  collaborate: async (payload) => api.post('/industry/collaborations', payload),
}
