import api from './api'

export const proposalService = {
  // get proposals submitted for a challenge
  getChallengeProposals: async (challengeId) => {
    return api.get(
      `/proposals/challenge/${challengeId}`
    )
  },

  // get proposals submitted to an HEI
  getHEIProposals: async (heiId) => {
    return api.get(
      `/proposals/hei/${heiId}`
    )
  },

  // submit a proposal for a challenge and HEI
  submitProposal: async (
    challengeId,
    heiId,
    payload
  ) => {
    return api.post(
      `/proposals/?challenge_id=${challengeId}&hei_id=${heiId}`,
      payload
    )
  },

  // approve a proposal and automatically create a project
  approveProposal: async (proposalId) => {
    return api.post(
      `/proposals/${proposalId}/approve`
    )
  },
}