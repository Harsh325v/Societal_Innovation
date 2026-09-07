import api from './api'

export const industryService = {
  // get all projects so industry can find collaboration opportunities
  getProjects: async () => {
    return api.get('/projects/')
  },

  // get one project
  getProjectById: async (id) => {
    return api.get(`/projects/${id}`)
  },

  // get collaboration offers for a project
  getProjectCollaborations: async (projectId) => {
    return api.get(
      `/industry-collaborations/project/${projectId}`
    )
  },

  // offer support to a project
  collaborate: async (projectId, payload) => {
    return api.post(
      `/industry-collaborations/project/${projectId}`,
      payload
    )
  },

  // accept or reject a collaboration offer
  updateCollaborationStatus: async (collaborationId, status) => {
    return api.patch(
      `/industry-collaborations/${collaborationId}/status`,
      null,
      {
        params: {
          status,
        },
      }
    )
  },
}