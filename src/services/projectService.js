import api from './api'

export const projectService = {
  getProjects: async () => api.get('/projects'),
  getProjectById: async (id) => api.get(`/projects/${id}`),
  updateProject: async (id, payload) => api.patch(`/projects/${id}`, payload),
}
