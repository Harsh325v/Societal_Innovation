import api from './api'

export const projectService = {
  // get all projects
  getProjects: async () => {
    return api.get('/projects/')
  },

  // get one project
  getProjectById: async (id) => {
    return api.get(`/projects/${id}`)
  },

  // update a project
  updateProject: async (id, payload) => {
    return api.patch(`/projects/${id}`, payload)
  },

  // get all members of a project
  getProjectMembers: async (projectId) => {
    return api.get(`/project-members/project/${projectId}`)
  },

  // add a member to a project
  addProjectMember: async (projectId, payload) => {
    return api.post(
      `/project-members/project/${projectId}`,
      payload
    )
  },
}