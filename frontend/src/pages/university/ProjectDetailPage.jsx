import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Building2,
  Users,
  HandCoins,
  CheckCircle2,
  Handshake,
  Plus,
} from 'lucide-react'

import Badge from '../../components/common/Badge'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import { projectService } from '../../services/projectService'
import { heiService } from '../../services/heiService'
import { industryService } from '../../services/industryService'
import api from '../../services/api'

export default function ProjectDetailPage({ collaborationMode = false }) {
  const { id } = useParams()

  const [project, setProject] = useState(null)
  const [hei, setHei] = useState(null)
  const [members, setMembers] = useState([])
  const [milestones, setMilestones] = useState([])
  const [collaborations, setCollaborations] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [milestoneLoading, setMilestoneLoading] = useState(false)
  const [collaborationLoading, setCollaborationLoading] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    milestone_order: '',
    due_date: '',
  })

  const [collaborationForm, setCollaborationForm] = useState({
    support_type: 'MENTORSHIP',
    funding_amount: '',
    description: '',
  })

  useEffect(() => {
    const loadProject = async () => {
      try {
        // get the real project from postgres
        const projectResponse =
          await projectService.getProjectById(id)

        const projectData = projectResponse.data
        setProject(projectData)

        // get the HEI that owns the project
        try {
          const heiResponse =
            await heiService.getHEIById(projectData.hei_id)

          setHei(heiResponse.data)
        } catch (err) {
          console.error('Could not load HEI:', err)
        }

        // get project members
        try {
          const membersResponse =
            await projectService.getProjectMembers(id)

          setMembers(membersResponse.data)
        } catch (err) {
          console.error('Could not load members:', err)
        }

        // get project milestones
        try {
          const milestoneResponse =
            await api.get(`/projects/${id}/milestones`)

          setMilestones(milestoneResponse.data)
        } catch (err) {
          console.error('Could not load milestones:', err)
        }

        // get industry collaboration offers
        try {
          const collaborationResponse =
            await industryService.getProjectCollaborations(id)

          setCollaborations(collaborationResponse.data)
        } catch (err) {
          console.error(
            'Could not load collaborations:',
            err
          )
        }
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not load project.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id])

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault()

    if (!milestoneForm.title.trim()) {
      setError('Please enter a milestone title.')
      return
    }

    if (!milestoneForm.milestone_order) {
      setError('Please enter the milestone order.')
      return
    }

    setError('')
    setMilestoneLoading(true)

    try {
      // create the milestone directly from the project page
      const response = await api.post(
        `/projects/${id}/milestones`,
        {
          title: milestoneForm.title,
          description: milestoneForm.description || null,
          milestone_order: Number(
            milestoneForm.milestone_order
          ),
          due_date: milestoneForm.due_date
            ? `${milestoneForm.due_date}T00:00:00`
            : null,
        }
      )

      // add the new milestone immediately
      setMilestones((current) => [
        ...current,
        response.data,
      ])

      // clear the form
      setMilestoneForm({
        title: '',
        description: '',
        milestone_order: '',
        due_date: '',
      })

      setShowMilestoneForm(false)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not create milestone.'
      )
    } finally {
      setMilestoneLoading(false)
    }
  }

  const updateMilestoneStatus = async (milestoneId, status) => {
    try {
      setMilestoneLoading(true)
      setError('')

      // update the milestone in the backend
      const response = await api.patch(
        `/projects/milestones/${milestoneId}/status`,
        null,
        {
          params: {
            status,
          },
        }
      )

      // update only the changed milestone on the screen
      setMilestones((current) =>
        current.map((milestone) =>
          milestone.id === milestoneId
            ? response.data
            : milestone
        )
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not update milestone.'
      )
    } finally {
      setMilestoneLoading(false)
    }
  }

  const handleCollaborationSubmit = async (e) => {
    e.preventDefault()

    // make sure the industry user explains the offer
    if (!collaborationForm.description.trim()) {
      setError('Please describe your collaboration offer.')
      return
    }

    // funding offers need an amount
    if (
      collaborationForm.support_type === 'FUNDING' &&
      !collaborationForm.funding_amount
    ) {
      setError('Please enter the funding amount.')
      return
    }

    setError('')
    setCollaborationLoading(true)

    try {
      // send the collaboration offer to our backend
      const response =
        await industryService.collaborate(id, {
          support_type: collaborationForm.support_type,
          funding_amount:
            collaborationForm.support_type === 'FUNDING'
              ? Number(collaborationForm.funding_amount)
              : null,
          description:
            collaborationForm.description,
        })

      // show the new offer immediately
      setCollaborations((current) => [
        response.data,
        ...current,
      ])

      // clear the form after successful submission
      setCollaborationForm({
        support_type: 'MENTORSHIP',
        funding_amount: '',
        description: '',
      })
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not submit collaboration offer.'
      )
    } finally {
      setCollaborationLoading(false)
    }
  }

  const updateCollaborationStatus = async (
    collaborationId,
    status
  ) => {
    try {
      setCollaborationLoading(true)
      setError('')

      // update the collaboration status in the backend
      const response =
        await industryService.updateCollaborationStatus(
          collaborationId,
          status
        )

      // update the offer on the screen immediately
      setCollaborations((current) =>
        current.map((collaboration) =>
          collaboration.id === collaborationId
            ? response.data
            : collaboration
        )
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not update collaboration.'
      )
    } finally {
      setCollaborationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          Loading project...
        </p>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    )
  }

  if (!project) {
    return null
  }

  // calculate project progress from completed milestones
  const completedMilestones = milestones.filter(
    (milestone) => milestone.status === 'COMPLETED'
  ).length

  const progress =
    milestones.length > 0
      ? Math.round(
          (completedMilestones / milestones.length) * 100
        )
      : 0

  return (
    <div className="space-y-6">

      {/* project heading */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Project #{project.id}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge status={project.status} />

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
              {progress}% complete
            </span>
          </div>

        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              University
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              {hei?.name || `HEI #${project.hei_id}`}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Start date
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              {project.start_date
                ? new Date(
                    project.start_date
                  ).toLocaleDateString()
                : 'Not started'}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Challenge
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              #{project.challenge_id}
            </div>
          </div>

        </div>
      </div>

      {/* overview + team */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        <Card title="Overview">
          <div className="space-y-5">

            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Project progress</span>
              <span>{progress}%</span>
            </div>

            <ProgressBar
              value={progress}
              color="bg-emerald-500"
            />

            <p className="text-sm leading-6 text-slate-600">
              {project.description}
            </p>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 p-4">
                <Users className="h-5 w-5 text-slate-500" />

                <div className="mt-3 text-sm text-slate-500">
                  Project members
                </div>

                <div className="mt-1 font-semibold text-slate-900">
                  {members.length}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <Building2 className="h-5 w-5 text-slate-500" />

                <div className="mt-3 text-sm text-slate-500">
                  HEI
                </div>

                <div className="mt-1 font-semibold text-slate-900">
                  {hei?.code || `HEI #${project.hei_id}`}
                </div>
              </div>

            </div>
          </div>
        </Card>

        <Card title="Team">

          {members.length === 0 ? (
            <p className="text-sm text-slate-500">
              No project members have been added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl bg-slate-50 p-3"
                >
                  <div className="font-semibold text-slate-900">
                    User #{member.user_id}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          )}

        </Card>
      </div>

      {/* milestones */}
      <Card title="Milestones">

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* add milestone button */}
        {!collaborationMode && (
          <div className="mb-5 flex justify-end">
            <Button
              variant="secondary"
              onClick={() =>
                setShowMilestoneForm((current) => !current)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {showMilestoneForm
                ? 'Cancel'
                : 'Add milestone'}
            </Button>
          </div>
        )}

        {/* add milestone form */}
        {showMilestoneForm && !collaborationMode && (
          <form
            onSubmit={handleMilestoneSubmit}
            className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="grid gap-4 md:grid-cols-2">

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Milestone title
                </label>

                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Field Assessment"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Milestone order
                </label>

                <input
                  type="number"
                  min="1"
                  value={milestoneForm.milestone_order}
                  onChange={(e) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      milestone_order: e.target.value,
                    }))
                  }
                  placeholder="1"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
                />
              </div>

            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows={4}
                value={milestoneForm.description}
                onChange={(e) =>
                  setMilestoneForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what needs to be completed..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">
                Due date
              </label>

              <input
                type="date"
                value={milestoneForm.due_date}
                onChange={(e) =>
                  setMilestoneForm((current) => ({
                    ...current,
                    due_date: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 md:w-1/2"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <Button disabled={milestoneLoading}>
                {milestoneLoading
                  ? 'Creating...'
                  : 'Create milestone'}
              </Button>
            </div>
          </form>
        )}

        {milestones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-500">
              No milestones have been created for this project yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="flex gap-4 rounded-2xl border border-slate-200 p-4"
              >

                <div className="flex flex-col items-center">
                  <div
                    className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      milestone.status === 'COMPLETED'
                        ? 'bg-emerald-500 text-white'
                        : milestone.status === 'IN_PROGRESS'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {milestone.status === 'COMPLETED'
                      ? '✓'
                      : milestone.status === 'IN_PROGRESS'
                        ? '→'
                        : '○'}
                  </div>

                  {index < milestones.length - 1 && (
                    <div className="mt-1 h-10 w-px bg-slate-200" />
                  )}
                </div>

                <div className="flex-1">

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        Milestone {milestone.milestone_order}
                      </p>

                      <div className="mt-1 font-semibold text-slate-900">
                        {milestone.title}
                      </div>
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      {milestone.status}
                    </span>
                  </div>

                  {milestone.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {milestone.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">

                    <span>
                      Due date:{' '}
                      {milestone.due_date
                        ? new Date(
                            milestone.due_date
                          ).toLocaleDateString()
                        : 'Not set'}
                    </span>

                    {milestone.completed_at && (
                      <span>
                        Completed:{' '}
                        {new Date(
                          milestone.completed_at
                        ).toLocaleDateString()}
                      </span>
                    )}

                  </div>

                  {/* industry users can view but not edit milestones */}
                  {!collaborationMode && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {milestone.status !== 'IN_PROGRESS' && (
                        <Button
                          variant="secondary"
                          disabled={milestoneLoading}
                          onClick={() =>
                            updateMilestoneStatus(
                              milestone.id,
                              'IN_PROGRESS'
                            )
                          }
                        >
                          Mark in progress
                        </Button>
                      )}

                      {milestone.status !== 'COMPLETED' && (
                        <Button
                          disabled={milestoneLoading}
                          onClick={() =>
                            updateMilestoneStatus(
                              milestone.id,
                              'COMPLETED'
                            )
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark completed
                        </Button>
                      )}

                    </div>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}

      </Card>

      {/* HEI side: review industry collaboration offers */}
      {!collaborationMode && (
        <Card title="Industry collaboration">

          {collaborations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm text-slate-500">
                No industry collaboration offers yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {collaborations.map((collaboration) => (
                <div
                  key={collaboration.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        {collaboration.support_type}
                      </p>

                      {collaboration.funding_amount !== null && (
                        <p className="mt-1 font-semibold text-slate-900">
                          ₹
                          {collaboration.funding_amount.toLocaleString(
                            'en-IN'
                          )}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                        collaboration.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : collaboration.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {collaboration.status}
                    </span>

                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {collaboration.description}
                  </p>

                  {/* only pending offers can be accepted or rejected */}
                  {collaboration.status === 'PENDING' && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      <Button
                        disabled={collaborationLoading}
                        onClick={() =>
                          updateCollaborationStatus(
                            collaboration.id,
                            'ACCEPTED'
                          )
                        }
                      >
                        Accept
                      </Button>

                      <Button
                        variant="secondary"
                        disabled={collaborationLoading}
                        onClick={() =>
                          updateCollaborationStatus(
                            collaboration.id,
                            'REJECTED'
                          )
                        }
                      >
                        Reject
                      </Button>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </Card>
      )}

      {/* industry side: create a collaboration offer */}
      {collaborationMode && (
        <>
          <Card title="Offer collaboration">
            <form
              onSubmit={handleCollaborationSubmit}
              className="space-y-5"
            >

              <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 p-4">
                  <Handshake className="h-5 w-5 text-slate-500" />

                  <label className="mt-3 block text-sm font-medium text-slate-700">
                    Support type
                  </label>

                  <select
                    value={collaborationForm.support_type}
                    onChange={(e) =>
                      setCollaborationForm((current) => ({
                        ...current,
                        support_type: e.target.value,
                        funding_amount: '',
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
                  >
                    <option value="MENTORSHIP">
                      Mentorship
                    </option>

                    <option value="FUNDING">
                      Funding
                    </option>

                    <option value="PROTOTYPING">
                      Prototyping
                    </option>

                    <option value="TESTING">
                      Testing
                    </option>

                    <option value="PILOT">
                      Pilot Deployment
                    </option>
                  </select>
                </div>

                {collaborationForm.support_type === 'FUNDING' && (
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <HandCoins className="h-5 w-5 text-slate-500" />

                    <label className="mt-3 block text-sm font-medium text-slate-700">
                      Funding amount (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={collaborationForm.funding_amount}
                      onChange={(e) =>
                        setCollaborationForm((current) => ({
                          ...current,
                          funding_amount: e.target.value,
                        }))
                      }
                      placeholder="e.g. 500000"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
                    />
                  </div>
                )}

              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Collaboration details
                </label>

                <textarea
                  rows={5}
                  value={collaborationForm.description}
                  onChange={(e) =>
                    setCollaborationForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
                  placeholder="Describe how your organization can support this project..."
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <Button disabled={collaborationLoading}>
                  {collaborationLoading
                    ? 'Submitting...'
                    : 'Offer collaboration'}
                </Button>
              </div>

            </form>
          </Card>

          {/* industry can see all offers for this project */}
          <Card title="Collaboration offers">

            {collaborations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
                <p className="text-sm text-slate-500">
                  No collaboration offers have been made yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {collaborations.map((collaboration) => (
                  <div
                    key={collaboration.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                          {collaboration.support_type}
                        </p>

                        {collaboration.funding_amount !== null && (
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            ₹
                            {collaboration.funding_amount.toLocaleString(
                              'en-IN'
                            )}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          collaboration.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : collaboration.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {collaboration.status}
                      </span>

                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {collaboration.description}
                    </p>

                  </div>
                ))}

              </div>
            )}

          </Card>
        </>
      )}

    </div>
  )
}