import api from './api'

export const heiService = {
  getRecommendedChallenges: async () => api.get('/hei/challenges'),
  getProjects: async () => api.get('/hei/projects'),
  submitProposal: async (payload) => api.post('/hei/proposals', payload),
}
