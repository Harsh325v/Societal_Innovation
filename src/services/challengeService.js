import api from './api'

export const challengeService = {
  getChallenges: async () => api.get('/challenges'),
  getChallengeById: async (id) => api.get(`/challenges/${id}`),
  submitChallenge: async (payload) => api.post('/challenges', payload),
  getRecommendedUniversities: async (challengeId) => api.get(`/challenges/${challengeId}/universities`),
}
