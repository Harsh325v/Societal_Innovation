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

  // update project lifecycle status
  updateProjectStatus: async (id, status) => {
    return api.patch(`/projects/${id}/status`, null, {
      params: { status },
    })
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

  // get tasks of a project
  getProjectTasks: async (projectId) => {
    return api.get(`/projects/${projectId}/tasks`)
  },

  // create a task
  createProjectTask: async (projectId, payload) => {
    return api.post(
      `/projects/${projectId}/tasks`,
      null,
      {
        params: payload,
      }
    )
  },

  // update task status
  updateTaskStatus: async (taskId, status) => {
    return api.patch(`/projects/tasks/${taskId}/status`, null, {
      params: { status },
    })
  },

  // get project impact
  getProjectImpact: async (projectId) => {
    return api.get(`/projects/${projectId}/impact`)
  },

  // create project impact
  createProjectImpact: async (projectId, payload) => {
    return api.post(`/projects/${projectId}/impact`, payload)
  },
}