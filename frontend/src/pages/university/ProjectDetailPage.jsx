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


export default function ProjectDetailPage({
  collaborationMode = false,
}) {

  const { id } = useParams()

  const [project, setProject] = useState(null)

  const [hei, setHei] = useState(null)

  const [members, setMembers] = useState([])

  const [milestones, setMilestones] = useState([])

  const [tasks, setTasks] = useState([])

  const [deliverables, setDeliverables] = useState([])

  const [collaborations, setCollaborations] =
    useState([])

  const [impact, setImpact] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  const [milestoneLoading, setMilestoneLoading] =
    useState(false)

  const [collaborationLoading, setCollaborationLoading] =
    useState(false)

  const [deliverableLoading, setDeliverableLoading] =
    useState(false)

  const [taskLoading, setTaskLoading] =
    useState(false)

  const [statusLoading, setStatusLoading] =
    useState(false)

  const [impactLoading, setImpactLoading] =
    useState(false)


  const [showMilestoneForm, setShowMilestoneForm] =
    useState(false)

  const [showDeliverableForm, setShowDeliverableForm] =
    useState(false)

  const [showTaskForm, setShowTaskForm] =
    useState(false)

  const [showImpactForm, setShowImpactForm] =
    useState(false)


  const [milestoneForm, setMilestoneForm] =
    useState({
      title: '',
      description: '',
      milestone_order: '',
      due_date: '',
    })


  const [deliverableForm, setDeliverableForm] =
    useState({
      title: '',
      description: '',
    })


  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
  })


  const [impactForm, setImpactForm] =
    useState({
      people_benefited: '',
      villages_covered: '',
      districts_covered: '',
      cost_savings: '',
      environmental_impact: '',
      outcome: '',
      deployment_status: 'NOT_DEPLOYED',
    })


  const [collaborationForm, setCollaborationForm] =
    useState({
      support_type: 'MENTORSHIP',
      funding_amount: '',
      description: '',
    })


  // -----------------------------
  // LOAD PROJECT
  // -----------------------------

  useEffect(() => {

    const loadProject = async () => {

      try {

        const projectResponse =
          await projectService.getProjectById(id)

        const projectData =
          projectResponse.data

        setProject(projectData)


        // HEI

        try {

          const heiResponse =
            await heiService.getHEIById(
              projectData.hei_id
            )

          setHei(heiResponse.data)

        } catch (err) {

          console.error(
            'Could not load HEI:',
            err
          )

        }


        // MEMBERS

        try {

          const membersResponse =
            await projectService.getProjectMembers(
              id
            )

          setMembers(
            membersResponse.data
          )

        } catch (err) {

          console.error(
            'Could not load members:',
            err
          )

        }


        // MILESTONES

        try {

          const milestoneResponse =
            await api.get(
              `/projects/${id}/milestones`
            )

          setMilestones(
            milestoneResponse.data
          )

        } catch (err) {

          console.error(
            'Could not load milestones:',
            err
          )

        }


        // TASKS

        try {

          const taskResponse =
            await projectService.getProjectTasks(
              id
            )

          setTasks(
            taskResponse.data
          )

        } catch (err) {

          console.error(
            'Could not load tasks:',
            err
          )

        }


        // DELIVERABLES

        try {

          const deliverableResponse =
            await api.get(
              `/projects/${id}/deliverables`
            )

          setDeliverables(
            deliverableResponse.data
          )

        } catch (err) {

          console.error(
            'Could not load deliverables:',
            err
          )

        }


        // IMPACT

        try {

          const impactResponse =
            await projectService.getProjectImpact(
              id
            )

          setImpact(
            impactResponse.data
          )

        } catch (err) {

          // Impact may not exist yet.

          setImpact(null)

        }


        // INDUSTRY COLLABORATIONS

        try {

          const collaborationResponse =
            await industryService.getProjectCollaborations(
              id
            )

          setCollaborations(
            collaborationResponse.data
          )

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


  // -----------------------------
  // PROJECT LIFECYCLE
  // -----------------------------

  const updateProjectStatus = async (
    status
  ) => {

    try {

      setStatusLoading(true)

      setError('')

      const response =
        await projectService.updateProjectStatus(
          id,
          status
        )

      setProject(
        response.data
      )

    } catch (err) {

      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not update project status.'
      )

    } finally {

      setStatusLoading(false)

    }

  }


  // -----------------------------
  // MILESTONES
  // -----------------------------

  const handleMilestoneSubmit = async (
    e
  ) => {

    e.preventDefault()

    if (!milestoneForm.title.trim()) {

      setError(
        'Please enter a milestone title.'
      )

      return

    }

    if (!milestoneForm.milestone_order) {

      setError(
        'Please enter the milestone order.'
      )

      return

    }

    setError('')

    setMilestoneLoading(true)

    try {

      const response =
        await api.post(
          `/projects/${id}/milestones`,
          {
            title:
              milestoneForm.title,

            description:
              milestoneForm.description ||
              null,

            milestone_order:
              Number(
                milestoneForm.milestone_order
              ),

            due_date:
              milestoneForm.due_date
                ? `${milestoneForm.due_date}T00:00:00`
                : null,
          }
        )

      setMilestones(
        (current) => [
          ...current,
          response.data,
        ]
      )

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


  const updateMilestoneStatus = async (
    milestoneId,
    status
  ) => {

    try {

      setMilestoneLoading(true)

      setError('')

      const response =
        await api.patch(
          `/projects/milestones/${milestoneId}/status`,
          null,
          {
            params: {
              status,
            },
          }
        )

      setMilestones(
        (current) =>
          current.map(
            (milestone) =>
              milestone.id ===
              milestoneId
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


  // -----------------------------
  // TASKS
  // -----------------------------

  const handleTaskSubmit = async (
    e
  ) => {

    e.preventDefault()

    if (!taskForm.title.trim()) {

      setError(
        'Please enter a task title.'
      )

      return

    }

    setError('')

    setTaskLoading(true)

    try {

      const response =
        await projectService.createProjectTask(
          id,
          {
            title:
              taskForm.title,

            description:
              taskForm.description ||
              null,

            assigned_to:
              taskForm.assigned_to
                ? Number(
                    taskForm.assigned_to
                  )
                : null,

            due_date:
              taskForm.due_date
                ? `${taskForm.due_date}T00:00:00`
                : null,
          }
        )

      setTasks(
        (current) => [
          response.data,
          ...current,
        ]
      )

      setTaskForm({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
      })

      setShowTaskForm(false)

    } catch (err) {

      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not create task.'
      )

    } finally {

      setTaskLoading(false)

    }

  }


  const updateTaskStatus = async (
    taskId,
    status
  ) => {

    try {

      setTaskLoading(true)

      setError('')

      const response =
        await projectService.updateTaskStatus(
          taskId,
          status
        )

      setTasks(
        (current) =>
          current.map(
            (task) =>
              task.id === taskId
                ? response.data
                : task
          )
      )

    } catch (err) {

      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not update task.'
      )

    } finally {

      setTaskLoading(false)

    }

  }


  // -----------------------------
  // IMPACT
  // -----------------------------

  const handleImpactSubmit = async (
    e
  ) => {

    e.preventDefault()

    setError('')

    setImpactLoading(true)

    try {

      const response =
        await projectService.createProjectImpact(
          id,
          {
            people_benefited:
              Number(
                impactForm.people_benefited ||
                  0
              ),

            villages_covered:
              Number(
                impactForm.villages_covered ||
                  0
              ),

            districts_covered:
              Number(
                impactForm.districts_covered ||
                  0
              ),

            cost_savings:
              Number(
                impactForm.cost_savings ||
                  0
              ),

            environmental_impact:
              impactForm.environmental_impact ||
              null,

            outcome:
              impactForm.outcome ||
              null,

            deployment_status:
              impactForm.deployment_status,
          }
        )

      setImpact(
        response.data
      )

      setImpactForm({
        people_benefited: '',
        villages_covered: '',
        districts_covered: '',
        cost_savings: '',
        environmental_impact: '',
        outcome: '',
        deployment_status:
          'NOT_DEPLOYED',
      })

      setShowImpactForm(false)

    } catch (err) {

      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not save project impact.'
      )

    } finally {

      setImpactLoading(false)

    }

  }


  // -----------------------------
  // DELIVERABLES
  // -----------------------------

  const handleDeliverableSubmit =
    async (e) => {

      e.preventDefault()

      if (!deliverableForm.title.trim()) {

        setError(
          'Please enter a deliverable title.'
        )

        return

      }

      setError('')

      setDeliverableLoading(true)

      try {

        const response =
          await api.post(
            `/projects/${id}/deliverables`,
            {
              title:
                deliverableForm.title,

              description:
                deliverableForm.description ||
                null,
            }
          )

        setDeliverables(
          (current) => [
            response.data,
            ...current,
          ]
        )

        setDeliverableForm({
          title: '',
          description: '',
        })

        setShowDeliverableForm(false)

      } catch (err) {

        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not submit deliverable.'
        )

      } finally {

        setDeliverableLoading(false)

      }

    }


  const updateDeliverableStatus =
    async (
      deliverableId,
      status
    ) => {

      try {

        setDeliverableLoading(true)

        setError('')

        const response =
          await api.patch(
            `/projects/deliverables/${deliverableId}/status`,
            null,
            {
              params: {
                status,
              },
            }
          )

        setDeliverables(
          (current) =>
            current.map(
              (deliverable) =>
                deliverable.id ===
                deliverableId
                  ? response.data
                  : deliverable
            )
        )

      } catch (err) {

        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not update deliverable.'
        )

      } finally {

        setDeliverableLoading(false)

      }

    }


  // -----------------------------
  // INDUSTRY COLLABORATION
  // -----------------------------

  const handleCollaborationSubmit =
    async (e) => {

      e.preventDefault()

      if (
        !collaborationForm.description.trim()
      ) {

        setError(
          'Please describe your collaboration offer.'
        )

        return

      }

      if (
        collaborationForm.support_type ===
          'FUNDING' &&
        !collaborationForm.funding_amount
      ) {

        setError(
          'Please enter the funding amount.'
        )

        return

      }

      setError('')

      setCollaborationLoading(true)

      try {

        const response =
          await industryService.collaborate(
            id,
            {
              support_type:
                collaborationForm.support_type,

              funding_amount:
                collaborationForm.support_type ===
                'FUNDING'
                  ? Number(
                      collaborationForm.funding_amount
                    )
                  : null,

              description:
                collaborationForm.description,
            }
          )

        setCollaborations(
          (current) => [
            response.data,
            ...current,
          ]
        )

        setCollaborationForm({
          support_type:
            'MENTORSHIP',

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


  const updateCollaborationStatus =
    async (
      collaborationId,
      status
    ) => {

      try {

        setCollaborationLoading(true)

        setError('')

        const response =
          await industryService.updateCollaborationStatus(
            collaborationId,
            status
          )

        setCollaborations(
          (current) =>
            current.map(
              (collaboration) =>
                collaboration.id ===
                collaborationId
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


  // -----------------------------
  // LOADING / ERROR
  // -----------------------------

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


  const completedMilestones =
    milestones.filter(
      (milestone) =>
        milestone.status ===
        'COMPLETED'
    ).length


  const progress =
    milestones.length > 0
      ? Math.round(
          (completedMilestones /
            milestones.length) *
            100
        )
      : 0


  const lifecycleStatuses = [
    'PROPOSAL',
    'APPROVED',
    'RESEARCH',
    'PROTOTYPE',
    'TESTING',
    'PILOT',
    'DEPLOYED',
    'COMPLETED',
  ]


  const currentStatusIndex =
    lifecycleStatuses.indexOf(
      project.status
    )


  return (
    <div className="space-y-6">

      {/* PROJECT HEADER */}

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
              {hei?.name ||
                `HEI #${project.hei_id}`}
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


      {/* PROJECT LIFECYCLE */}

      <Card title="Project Lifecycle">

        <div className="overflow-x-auto pb-2">

          <div className="flex min-w-[850px] items-center">

            {lifecycleStatuses.map(
              (status, index) => {

                const completed =
                  index <
                  currentStatusIndex

                const current =
                  index ===
                  currentStatusIndex

                return (
                  <div
                    key={status}
                    className="flex flex-1 items-center"
                  >

                    <button
                      disabled={
                        statusLoading
                      }
                      onClick={() =>
                        updateProjectStatus(
                          status
                        )
                      }
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        current
                          ? 'bg-slate-900 text-white'
                          : completed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {completed
                        ? '✓'
                        : index + 1}
                    </button>

                    <div className="ml-2 min-w-0">

                      <p
                        className={`text-xs font-semibold ${
                          current
                            ? 'text-slate-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {status}
                      </p>

                    </div>

                    {index <
                      lifecycleStatuses.length -
                        1 && (

                      <div className="mx-2 h-px flex-1 bg-slate-200" />

                    )}

                  </div>
                )

              }
            )}

          </div>

        </div>


        <p className="mt-4 text-sm text-slate-500">
          Click a stage to update the
          project's current lifecycle status.
        </p>

      </Card>


      {/* OVERVIEW + TEAM */}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        <Card title="Overview">

          <div className="space-y-5">

            <div className="flex items-center justify-between text-sm text-slate-600">

              <span>
                Project progress
              </span>

              <span>
                {progress}%
              </span>

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
                  {hei?.code ||
                    `HEI #${project.hei_id}`}
                </div>

              </div>

            </div>

          </div>

        </Card>


        <Card title="Team">

          {members.length === 0 ? (

            <p className="text-sm text-slate-500">
              No project members have been
              added yet.
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


      {/* MILESTONES */}

      <Card title="Milestones">

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}


        {!collaborationMode && (

          <div className="mb-5 flex justify-end">

            <Button
              variant="secondary"
              onClick={() =>
                setShowMilestoneForm(
                  (current) =>
                    !current
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />

              {showMilestoneForm
                ? 'Cancel'
                : 'Add milestone'}
            </Button>

          </div>

        )}


        {showMilestoneForm &&
          !collaborationMode && (

          <form
            onSubmit={
              handleMilestoneSubmit
            }
            className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >

            <div className="grid gap-4 md:grid-cols-2">

              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Milestone title
                </label>

                <input
                  type="text"
                  value={
                    milestoneForm.title
                  }
                  onChange={(e) =>
                    setMilestoneForm(
                      (current) => ({
                        ...current,
                        title:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Field Assessment"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Milestone order
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    milestoneForm.milestone_order
                  }
                  onChange={(e) =>
                    setMilestoneForm(
                      (current) => ({
                        ...current,
                        milestone_order:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="1"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows={4}
                value={
                  milestoneForm.description
                }
                onChange={(e) =>
                  setMilestoneForm(
                    (current) => ({
                      ...current,
                      description:
                        e.target.value,
                    })
                  )
                }
                placeholder="Describe what needs to be completed..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Due date
              </label>

              <input
                type="date"
                value={
                  milestoneForm.due_date
                }
                onChange={(e) =>
                  setMilestoneForm(
                    (current) => ({
                      ...current,
                      due_date:
                        e.target.value,
                    })
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm md:w-1/2"
              />

            </div>


            <div className="mt-5 flex justify-end">

              <Button
                disabled={
                  milestoneLoading
                }
              >
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
              No milestones have been
              created for this project yet.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {milestones.map(
              (milestone, index) => (

                <div
                  key={milestone.id}
                  className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        milestone.status ===
                        'COMPLETED'
                          ? 'bg-emerald-500 text-white'
                          : milestone.status ===
                              'IN_PROGRESS'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {milestone.status ===
                      'COMPLETED'
                        ? '✓'
                        : milestone.status ===
                            'IN_PROGRESS'
                          ? '→'
                          : '○'}
                    </div>


                    {index <
                      milestones.length - 1 && (

                      <div className="mt-1 h-10 w-px bg-slate-200" />

                    )}

                  </div>


                  <div className="flex-1">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                          Milestone{' '}
                          {
                            milestone.milestone_order
                          }
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


                    {!collaborationMode && (

                      <div className="mt-4 flex flex-wrap gap-2">

                        {milestone.status !==
                          'IN_PROGRESS' && (

                          <Button
                            variant="secondary"
                            disabled={
                              milestoneLoading
                            }
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


                        {milestone.status !==
                          'COMPLETED' && (

                          <Button
                            disabled={
                              milestoneLoading
                            }
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

              )
            )}

          </div>

        )}

      </Card>
            {/* TASKS */}

      <Card title="Project Tasks">

        {!collaborationMode && (
          <div className="mb-5 flex justify-end">

            <Button
              variant="secondary"
              onClick={() =>
                setShowTaskForm(
                  (current) => !current
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />

              {showTaskForm
                ? 'Cancel'
                : 'Add task'}
            </Button>

          </div>
        )}


        {showTaskForm &&
          !collaborationMode && (

          <form
            onSubmit={handleTaskSubmit}
            className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >

            <div className="grid gap-4 md:grid-cols-2">

              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Task title
                </label>

                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm(
                      (current) => ({
                        ...current,
                        title:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Conduct village survey"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Assign to
                </label>

                <select
                  value={taskForm.assigned_to}
                  onChange={(e) =>
                    setTaskForm(
                      (current) => ({
                        ...current,
                        assigned_to:
                          e.target.value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                >

                  <option value="">
                    Unassigned
                  </option>

                  {members.map(
                    (member) => (

                      <option
                        key={member.id}
                        value={
                          member.user_id
                        }
                      >
                        User #
                        {member.user_id}

                        {member.role
                          ? ` (${member.role})`
                          : ''}
                      </option>

                    )
                  )}

                </select>


                {members.length === 0 && (

                  <p className="mt-2 text-xs text-slate-500">
                    Add project members first
                    to assign a task.
                  </p>

                )}

              </div>

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows={4}
                value={
                  taskForm.description
                }
                onChange={(e) =>
                  setTaskForm(
                    (current) => ({
                      ...current,
                      description:
                        e.target.value,
                    })
                  )
                }
                placeholder="Describe what needs to be done..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Due date
              </label>

              <input
                type="date"
                value={
                  taskForm.due_date
                }
                onChange={(e) =>
                  setTaskForm(
                    (current) => ({
                      ...current,
                      due_date:
                        e.target.value,
                    })
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm md:w-1/2"
              />

            </div>


            <div className="mt-5 flex justify-end">

              <Button
                disabled={taskLoading}
              >
                {taskLoading
                  ? 'Creating...'
                  : 'Create task'}
              </Button>

            </div>

          </form>

        )}


        {tasks.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

            <p className="text-sm text-slate-500">
              No tasks have been created
              for this project yet.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {tasks.map((task) => (

              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 p-4"
              >

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="font-semibold text-slate-900">
                      {task.title}
                    </p>


                    {task.description && (

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {task.description}
                      </p>

                    )}


                    {task.assigned_to && (

                      <p className="mt-2 text-xs text-slate-500">
                        Assigned to: User #
                        {task.assigned_to}
                      </p>

                    )}


                    {task.due_date && (

                      <p className="mt-2 text-xs text-slate-500">
                        Due:{' '}
                        {new Date(
                          task.due_date
                        ).toLocaleDateString()}
                      </p>

                    )}

                  </div>


                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                      task.status ===
                      'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : task.status ===
                            'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {task.status}
                  </span>

                </div>


                {!collaborationMode &&
                  task.status !==
                    'COMPLETED' && (

                  <div className="mt-4 flex flex-wrap gap-2">

                    {task.status !==
                      'IN_PROGRESS' && (

                      <Button
                        variant="secondary"
                        disabled={
                          taskLoading
                        }
                        onClick={() =>
                          updateTaskStatus(
                            task.id,
                            'IN_PROGRESS'
                          )
                        }
                      >
                        Mark in progress
                      </Button>

                    )}


                    <Button
                      disabled={
                        taskLoading
                      }
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          'COMPLETED'
                        )
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />

                      Mark completed
                    </Button>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </Card>


      {/* DELIVERABLES */}

      <Card title="Project Deliverables">

        {!collaborationMode && (

          <div className="mb-5 flex justify-end">

            <Button
              variant="secondary"
              onClick={() =>
                setShowDeliverableForm(
                  (current) => !current
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />

              {showDeliverableForm
                ? 'Cancel'
                : 'Add deliverable'}
            </Button>

          </div>

        )}


        {showDeliverableForm &&
          !collaborationMode && (

          <form
            onSubmit={
              handleDeliverableSubmit
            }
            className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >

            <div>

              <label className="block text-sm font-medium text-slate-700">
                Deliverable title
              </label>

              <input
                type="text"
                value={
                  deliverableForm.title
                }
                onChange={(e) =>
                  setDeliverableForm(
                    (current) => ({
                      ...current,
                      title:
                        e.target.value,
                    })
                  )
                }
                placeholder="e.g. Water monitoring prototype"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows={4}
                value={
                  deliverableForm.description
                }
                onChange={(e) =>
                  setDeliverableForm(
                    (current) => ({
                      ...current,
                      description:
                        e.target.value,
                    })
                  )
                }
                placeholder="Describe the project output..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-5 flex justify-end">

              <Button
                disabled={
                  deliverableLoading
                }
              >
                {deliverableLoading
                  ? 'Submitting...'
                  : 'Submit deliverable'}
              </Button>

            </div>

          </form>

        )}


        {deliverables.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

            <p className="text-sm text-slate-500">
              No deliverables have been
              submitted yet.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {deliverables.map(
              (deliverable) => (

                <div
                  key={deliverable.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="font-semibold text-slate-900">
                        {deliverable.title}
                      </p>


                      {deliverable.description && (

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {deliverable.description}
                        </p>

                      )}


                      {deliverable.submitted_at && (

                        <p className="mt-2 text-xs text-slate-500">
                          Submitted:{' '}
                          {new Date(
                            deliverable.submitted_at
                          ).toLocaleDateString()}
                        </p>

                      )}

                    </div>


                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                        deliverable.status ===
                        'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : deliverable.status ===
                              'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : deliverable.status ===
                                'SUBMITTED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {deliverable.status}
                    </span>

                  </div>


                  {!collaborationMode &&
                    deliverable.status ===
                      'SUBMITTED' && (

                    <div className="mt-4 flex flex-wrap gap-2">

                      <Button
                        disabled={
                          deliverableLoading
                        }
                        onClick={() =>
                          updateDeliverableStatus(
                            deliverable.id,
                            'APPROVED'
                          )
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>


                      <Button
                        variant="secondary"
                        disabled={
                          deliverableLoading
                        }
                        onClick={() =>
                          updateDeliverableStatus(
                            deliverable.id,
                            'REJECTED'
                          )
                        }
                      >
                        Reject
                      </Button>

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </Card>


      {/* PROJECT IMPACT */}

      <Card title="Project Impact">

        {!collaborationMode && !impact && (

          <div className="mb-5 flex justify-end">

            <Button
              variant="secondary"
              onClick={() =>
                setShowImpactForm(
                  (current) => !current
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />

              {showImpactForm
                ? 'Cancel'
                : 'Add impact'}
            </Button>

          </div>

        )}


        {showImpactForm &&
          !impact &&
          !collaborationMode && (

          <form
            onSubmit={handleImpactSubmit}
            className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >

            <div className="grid gap-4 md:grid-cols-2">

              <div>

                <label className="block text-sm font-medium text-slate-700">
                  People benefited
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    impactForm.people_benefited
                  }
                  onChange={(e) =>
                    setImpactForm(
                      (current) => ({
                        ...current,
                        people_benefited:
                          e.target.value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Villages covered
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    impactForm.villages_covered
                  }
                  onChange={(e) =>
                    setImpactForm(
                      (current) => ({
                        ...current,
                        villages_covered:
                          e.target.value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Districts covered
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    impactForm.districts_covered
                  }
                  onChange={(e) =>
                    setImpactForm(
                      (current) => ({
                        ...current,
                        districts_covered:
                          e.target.value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Cost savings (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    impactForm.cost_savings
                  }
                  onChange={(e) =>
                    setImpactForm(
                      (current) => ({
                        ...current,
                        cost_savings:
                          e.target.value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Environmental impact
              </label>

              <textarea
                rows={3}
                value={
                  impactForm.environmental_impact
                }
                onChange={(e) =>
                  setImpactForm(
                    (current) => ({
                      ...current,
                      environmental_impact:
                        e.target.value,
                    })
                  )
                }
                placeholder="e.g. Reduced water wastage..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Outcome
              </label>

              <textarea
                rows={3}
                value={
                  impactForm.outcome
                }
                onChange={(e) =>
                  setImpactForm(
                    (current) => ({
                      ...current,
                      outcome:
                        e.target.value,
                    })
                  )
                }
                placeholder="Describe the result of the project..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                Deployment status
              </label>

              <select
                value={
                  impactForm.deployment_status
                }
                onChange={(e) =>
                  setImpactForm(
                    (current) => ({
                      ...current,
                      deployment_status:
                        e.target.value,
                    })
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              >

                <option value="NOT_DEPLOYED">
                  Not deployed
                </option>

                <option value="DEPLOYED">
                  Deployed
                </option>

              </select>

            </div>


            {error && (

              <p className="mt-4 text-sm text-red-600">
                {error}
              </p>

            )}


            <div className="mt-5 flex justify-end">

              <Button
                disabled={impactLoading}
              >
                {impactLoading
                  ? 'Saving...'
                  : 'Save impact'}
              </Button>

            </div>

          </form>

        )}


        {!impact && !showImpactForm ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

            <p className="text-sm text-slate-500">
              No impact data has been recorded
              for this project yet.
            </p>

          </div>

        ) : impact ? (

          <>

            <div className="grid gap-4 md:grid-cols-4">

              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  People benefited
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {Number(
                    impact.people_benefited
                  ).toLocaleString('en-IN')}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  Villages covered
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {impact.villages_covered}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  Districts covered
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {impact.districts_covered}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  Cost savings
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  ₹
                  {Number(
                    impact.cost_savings
                  ).toLocaleString('en-IN')}
                </p>

              </div>

            </div>


            {impact.outcome && (

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">

                <p className="text-sm font-semibold text-slate-900">
                  Outcome
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {impact.outcome}
                </p>

              </div>

            )}


            {impact.environmental_impact && (

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">

                <p className="text-sm font-semibold text-slate-900">
                  Environmental impact
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {impact.environmental_impact}
                </p>

              </div>

            )}


            <div className="mt-4">

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                {impact.deployment_status}
              </span>

            </div>

          </>

        ) : null}

      </Card>


      {/* HEI INDUSTRY COLLABORATION */}

      {!collaborationMode && (

        <Card title="Industry collaboration">

          {collaborations.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

              <p className="text-sm text-slate-500">
                No industry collaboration
                offers yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {collaborations.map(
                (collaboration) => (

                  <div
                    key={collaboration.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                          {
                            collaboration.support_type
                          }
                        </p>

                        {collaboration.funding_amount !==
                          null && (

                          <p className="mt-1 font-semibold text-slate-900">
                            ₹
                            {Number(
                              collaboration.funding_amount
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </p>

                        )}

                      </div>


                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          collaboration.status ===
                          'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : collaboration.status ===
                                'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-700'
                              : collaboration.status ===
                                  'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : collaboration.status ===
                                    'REJECTED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {
                          collaboration.status
                        }
                      </span>

                    </div>


                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {
                        collaboration.description
                      }
                    </p>


                    {collaboration.status ===
                      'PENDING' && (

                      <div className="mt-4 flex flex-wrap gap-2">

                        <Button
                          disabled={
                            collaborationLoading
                          }
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
                          disabled={
                            collaborationLoading
                          }
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


                    {collaboration.status ===
                      'ACCEPTED' && (

                      <div className="mt-4">

                        <Button
                          disabled={
                            collaborationLoading
                          }
                          onClick={() =>
                            updateCollaborationStatus(
                              collaboration.id,
                              'IN_PROGRESS'
                            )
                          }
                        >
                          Start collaboration
                        </Button>

                      </div>

                    )}


                    {collaboration.status ===
                      'IN_PROGRESS' && (

                      <div className="mt-4">

                        <Button
                          disabled={
                            collaborationLoading
                          }
                          onClick={() =>
                            updateCollaborationStatus(
                              collaboration.id,
                              'COMPLETED'
                            )
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />

                          Mark completed
                        </Button>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </Card>

      )}


      {/* INDUSTRY COLLABORATION MODE */}

      {collaborationMode && (
        <>

          <Card title="Offer collaboration">

            <form
              onSubmit={
                handleCollaborationSubmit
              }
              className="space-y-5"
            >

              <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 p-4">

                  <Handshake className="h-5 w-5 text-slate-500" />

                  <label className="mt-3 block text-sm font-medium text-slate-700">
                    Support type
                  </label>

                  <select
                    value={
                      collaborationForm.support_type
                    }
                    onChange={(e) =>
                      setCollaborationForm(
                        (current) => ({
                          ...current,
                          support_type:
                            e.target.value,
                          funding_amount:
                            '',
                        })
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
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

                    <option value="DEPLOYMENT">
                      Deployment
                    </option>

                  </select>

                </div>


                {collaborationForm.support_type ===
                  'FUNDING' && (

                  <div className="rounded-2xl border border-slate-200 p-4">

                    <HandCoins className="h-5 w-5 text-slate-500" />

                    <label className="mt-3 block text-sm font-medium text-slate-700">
                      Funding amount (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        collaborationForm.funding_amount
                      }
                      onChange={(e) =>
                        setCollaborationForm(
                          (current) => ({
                            ...current,
                            funding_amount:
                              e.target.value,
                          })
                        )
                      }
                      placeholder="e.g. 500000"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
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
                  value={
                    collaborationForm.description
                  }
                  onChange={(e) =>
                    setCollaborationForm(
                      (current) => ({
                        ...current,
                        description:
                          e.target.value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                  placeholder="Describe how your organization can support this project..."
                />

              </div>


              {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>

              )}


              <div className="flex justify-end">

                <Button
                  disabled={
                    collaborationLoading
                  }
                >
                  {collaborationLoading
                    ? 'Submitting...'
                    : 'Offer collaboration'}
                </Button>

              </div>

            </form>

          </Card>


          <Card title="Collaboration offers">

            {collaborations.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

                <p className="text-sm text-slate-500">
                  No collaboration offers
                  have been made yet.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {collaborations.map(
                  (collaboration) => (

                    <div
                      key={collaboration.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                            {
                              collaboration.support_type
                            }
                          </p>

                          {collaboration.funding_amount !==
                            null && (

                            <p className="mt-1 text-lg font-semibold text-slate-900">
                              ₹
                              {Number(
                                collaboration.funding_amount
                              ).toLocaleString(
                                'en-IN'
                              )}
                            </p>

                          )}

                        </div>


                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                            collaboration.status ===
                            'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : collaboration.status ===
                                  'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-700'
                                : collaboration.status ===
                                    'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : collaboration.status ===
                                      'REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {
                            collaboration.status
                          }
                        </span>

                      </div>


                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {
                          collaboration.description
                        }
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </Card>

        </>
      )}

    </div>
  )
}