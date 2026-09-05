import api from './api'

export const dashboardService = {
  getCitizenDashboard: async () => api.get('/dashboard/citizen'),
  getUniversityDashboard: async () => api.get('/dashboard/university'),
  getIndustryDashboard: async () => api.get('/dashboard/industry'),
  getGovernmentDashboard: async () => api.get('/dashboard/government'),
}
