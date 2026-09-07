import api from './api'

export const heiService = {
  // get all active HEIs
  getHEIs: async () => api.get('/heis/'),

  // get one HEI by its database ID
  getHEIById: async (id) => api.get(`/heis/${id}`),

  // these will be connected to the backend later
  getRecommendedChallenges: async () => api.get('/hei/challenges'),

  getProjects: async () => api.get('/hei/projects'),

  submitProposal: async (payload) => api.post('/hei/proposals', payload),
}