import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'

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
  const { language } = useTranslation()

  const projectTranslations = {
    en: {
      loadingProject: 'Loading project...',
      couldNotLoadProject: 'Could not load project.',
      couldNotUpdateProjectStatus: 'Could not update project status.',
      projectLifecycle: 'Project Lifecycle',
      clickStage: "Click a stage to update the project's current lifecycle status.",
      project: 'Project',
      collaborationOffers: 'Collaboration offers',
      assignedToUser: 'Assigned to:',
      university: 'University',
      startDate: 'Start date',
      notStarted: 'Not started',
      challenge: 'Challenge',
      complete: 'complete',
      overview: 'Overview',
      projectProgress: 'Project progress',
      projectMembers: 'Project members',
      hei: 'HEI',
      team: 'Team',
      noMembers: 'No project members have been added yet.',
      milestones: 'Milestones',
      cancel: 'Cancel',
      addMilestone: 'Add milestone',
      milestoneTitle: 'Milestone title',
      milestoneOrder: 'Milestone order',
      fieldAssessment: 'e.g. Field Assessment',
      description: 'Description',
      describeCompleted: 'Describe what needs to be completed...',
      dueDate: 'Due date',
      creating: 'Creating...',
      createMilestone: 'Create milestone',
      noMilestones: 'No milestones have been created for this project yet.',
      milestone: 'Milestone',
      dueDateShort: 'Due date:',
      notSet: 'Not set',
      completed: 'Completed:',
      markInProgress: 'Mark in progress',
      markCompleted: 'Mark completed',
      projectTasks: 'Project Tasks',
      addTask: 'Add task',
      taskTitle: 'Task title',
      conductSurvey: 'e.g. Conduct village survey',
      assignTo: 'Assign to',
      unassigned: 'Unassigned',
      user: 'User',
      addMembersFirst: 'Add project members first to assign a task.',
      describeDone: 'Describe what needs to be done...',
      createTask: 'Create task',
      noTasks: 'No tasks have been created for this project yet.',
      assignedTo: 'Assigned to:',
      due: 'Due:',
      projectDeliverables: 'Project Deliverables',
      addDeliverable: 'Add deliverable',
      deliverableTitle: 'Deliverable title',
      waterPrototype: 'e.g. Water monitoring prototype',
      describeOutput: 'Describe the project output...',
      submitting: 'Submitting...',
      submitDeliverable: 'Submit deliverable',
      noDeliverables: 'No deliverables have been submitted yet.',
      submitted: 'Submitted:',
      approve: 'Approve',
      reject: 'Reject',
      projectImpact: 'Project Impact',
      addImpact: 'Add impact',
      peopleBenefited: 'People benefited',
      villagesCovered: 'Villages covered',
      districtsCovered: 'Districts covered',
      costSavings: 'Cost savings',
      environmentalImpact: 'Environmental impact',
      reducedWaste: 'e.g. Reduced water wastage...',
      outcome: 'Outcome',
      describeResult: 'Describe the result of the project...',
      deploymentStatus: 'Deployment status',
      notDeployed: 'Not deployed',
      deployed: 'Deployed',
      saving: 'Saving...',
      saveImpact: 'Save impact',
      noImpact: 'No impact data has been recorded for this project yet.',
      industryCollaboration: 'Industry collaboration',
      noIndustryOffers: 'No industry collaboration offers yet.',
      accept: 'Accept',
      startCollaboration: 'Start collaboration',
      offerCollaboration: 'Offer collaboration',
      supportType: 'Support type',
      mentorship: 'Mentorship',
      funding: 'Funding',
      prototyping: 'Prototyping',
      testing: 'Testing',
      pilotDeployment: 'Pilot Deployment',
      deployment: 'Deployment',
      fundingAmount: 'Funding amount (₹)',
      collaborationDetails: 'Collaboration details',
      supportDescription: 'Describe how your organization can support this project...',
      noOffers: 'No collaboration offers have been made yet.',
      proposal: 'Proposal',
      approved: 'Approved',
      research: 'Research',
      prototype: 'Prototype',
      pilot: 'Pilot',
      inProgress: 'In progress',
      pending: 'Pending',
      submittedStatus: 'Submitted',
      rejected: 'Rejected',
      errorMilestoneTitle: 'Please enter a milestone title.',
      errorMilestoneOrder: 'Please enter the milestone order.',
      errorCreateMilestone: 'Could not create milestone.',
      errorTaskTitle: 'Please enter a task title.',
      errorCreateTask: 'Could not create task.',
      errorSaveImpact: 'Could not save project impact.',
      errorDeliverableTitle: 'Please enter a deliverable title.',
      errorSubmitDeliverable: 'Could not submit deliverable.',
      errorCollaborationDescription: 'Please describe your collaboration offer.',
      errorFundingAmount: 'Please enter the funding amount.',
      errorCollaboration: 'Could not submit collaboration offer.',
      errorUpdateCollaboration: 'Could not update collaboration.',
      errorHei: 'Could not load HEI.',
    },
    hi: {
      loadingProject: 'प्रोजेक्ट लोड हो रहा है...',
      couldNotLoadProject: 'प्रोजेक्ट लोड नहीं हो सका।',
      couldNotUpdateProjectStatus: 'प्रोजेक्ट की स्थिति अपडेट नहीं हो सकी।',
      projectLifecycle: 'प्रोजेक्ट का चरण',
      clickStage: 'प्रोजेक्ट की वर्तमान स्थिति अपडेट करने के लिए किसी चरण पर क्लिक करें।',
      project: 'प्रोजेक्ट',
      collaborationOffers: 'सहयोग प्रस्ताव',
      assignedToUser: 'सौंपा गया:',
      university: 'विश्वविद्यालय',
      startDate: 'शुरुआत की तारीख',
      notStarted: 'शुरू नहीं हुआ',
      challenge: 'समस्या',
      complete: 'पूर्ण',
      overview: 'सारांश',
      projectProgress: 'प्रोजेक्ट की प्रगति',
      projectMembers: 'प्रोजेक्ट सदस्य',
      hei: 'संस्थान',
      team: 'टीम',
      noMembers: 'अभी तक कोई प्रोजेक्ट सदस्य नहीं जोड़ा गया है।',
      milestones: 'माइलस्टोन',
      cancel: 'रद्द करें',
      addMilestone: 'माइलस्टोन जोड़ें',
      milestoneTitle: 'माइलस्टोन का नाम',
      milestoneOrder: 'माइलस्टोन क्रम',
      fieldAssessment: 'जैसे: क्षेत्र का आकलन',
      description: 'विवरण',
      describeCompleted: 'बताएँ कि क्या पूरा करना है...',
      dueDate: 'अंतिम तारीख',
      creating: 'बनाया जा रहा है...',
      createMilestone: 'माइलस्टोन बनाएँ',
      noMilestones: 'इस प्रोजेक्ट के लिए अभी कोई माइलस्टोन नहीं बनाया गया है।',
      milestone: 'माइलस्टोन',
      dueDateShort: 'अंतिम तारीख:',
      notSet: 'तय नहीं है',
      completed: 'पूरा हुआ:',
      markInProgress: 'काम शुरू करें',
      markCompleted: 'पूरा हुआ चिह्नित करें',
      projectTasks: 'प्रोजेक्ट कार्य',
      addTask: 'कार्य जोड़ें',
      taskTitle: 'कार्य का नाम',
      conductSurvey: 'जैसे: गाँव का सर्वेक्षण करें',
      assignTo: 'किसे सौंपें',
      unassigned: 'किसी को नहीं सौंपा',
      user: 'उपयोगकर्ता',
      addMembersFirst: 'कार्य सौंपने के लिए पहले प्रोजेक्ट सदस्य जोड़ें।',
      describeDone: 'बताएँ कि क्या करना है...',
      createTask: 'कार्य बनाएँ',
      noTasks: 'इस प्रोजेक्ट के लिए अभी कोई कार्य नहीं बनाया गया है।',
      assignedTo: 'सौंपा गया:',
      due: 'अंतिम तारीख:',
      projectDeliverables: 'प्रोजेक्ट डिलिवरेबल्स',
      addDeliverable: 'डिलिवरेबल जोड़ें',
      deliverableTitle: 'डिलिवरेबल का नाम',
      waterPrototype: 'जैसे: पानी की निगरानी का प्रोटोटाइप',
      describeOutput: 'प्रोजेक्ट के परिणाम का विवरण दें...',
      submitting: 'जमा किया जा रहा है...',
      submitDeliverable: 'डिलिवरेबल जमा करें',
      noDeliverables: 'अभी तक कोई डिलिवरेबल जमा नहीं किया गया है।',
      submitted: 'जमा किया गया:',
      approve: 'स्वीकृत करें',
      reject: 'अस्वीकार करें',
      projectImpact: 'प्रोजेक्ट का प्रभाव',
      addImpact: 'प्रभाव जोड़ें',
      peopleBenefited: 'लाभ पाने वाले लोग',
      villagesCovered: 'कवर किए गए गाँव',
      districtsCovered: 'कवर किए गए जिले',
      costSavings: 'लागत में बचत',
      environmentalImpact: 'पर्यावरणीय प्रभाव',
      reducedWaste: 'जैसे: पानी की बर्बादी कम हुई...',
      outcome: 'परिणाम',
      describeResult: 'प्रोजेक्ट के परिणाम का वर्णन करें...',
      deploymentStatus: 'परिनियोजन स्थिति',
      notDeployed: 'परिनियोजित नहीं',
      deployed: 'परिनियोजित',
      saving: 'सहेजा जा रहा है...',
      saveImpact: 'प्रभाव सहेजें',
      noImpact: 'इस प्रोजेक्ट के लिए अभी कोई प्रभाव डेटा दर्ज नहीं किया गया है।',
      industryCollaboration: 'उद्योग सहयोग',
      noIndustryOffers: 'अभी कोई उद्योग सहयोग प्रस्ताव नहीं है।',
      accept: 'स्वीकार करें',
      startCollaboration: 'सहयोग शुरू करें',
      offerCollaboration: 'सहयोग का प्रस्ताव दें',
      supportType: 'सहायता का प्रकार',
      mentorship: 'मार्गदर्शन',
      funding: 'वित्तीय सहायता',
      prototyping: 'प्रोटोटाइप बनाना',
      testing: 'परीक्षण',
      pilotDeployment: 'पायलट परिनियोजन',
      deployment: 'परिनियोजन',
      fundingAmount: 'वित्तीय सहायता राशि (₹)',
      collaborationDetails: 'सहयोग का विवरण',
      supportDescription: 'बताएँ कि आपका संगठन इस प्रोजेक्ट में कैसे सहायता कर सकता है...',
      noOffers: 'अभी तक कोई सहयोग प्रस्ताव नहीं दिया गया है।',
      proposal: 'प्रस्ताव',
      approved: 'स्वीकृत',
      research: 'अनुसंधान',
      prototype: 'प्रोटोटाइप',
      pilot: 'पायलट',
      inProgress: 'प्रगति में',
      pending: 'लंबित',
      submittedStatus: 'जमा किया गया',
      rejected: 'अस्वीकृत',
      errorMilestoneTitle: 'कृपया माइलस्टोन का नाम दर्ज करें।',
      errorMilestoneOrder: 'कृपया माइलस्टोन क्रम दर्ज करें।',
      errorCreateMilestone: 'माइलस्टोन नहीं बनाया जा सका।',
      errorTaskTitle: 'कृपया कार्य का नाम दर्ज करें।',
      errorCreateTask: 'कार्य नहीं बनाया जा सका।',
      errorSaveImpact: 'प्रोजेक्ट का प्रभाव सहेजा नहीं जा सका।',
      errorDeliverableTitle: 'कृपया डिलिवरेबल का नाम दर्ज करें।',
      errorSubmitDeliverable: 'डिलिवरेबल जमा नहीं किया जा सका।',
      errorCollaborationDescription: 'कृपया अपने सहयोग प्रस्ताव का विवरण दें।',
      errorFundingAmount: 'कृपया वित्तीय सहायता राशि दर्ज करें।',
      errorCollaboration: 'सहयोग प्रस्ताव जमा नहीं किया जा सका।',
      errorUpdateCollaboration: 'सहयोग अपडेट नहीं किया जा सका।',
      errorHei: 'संस्थान लोड नहीं हो सका।',
    },
  }

  const tr = (key) =>
    projectTranslations[language]?.[key] ||
    projectTranslations.en[key] ||
    key

  const statusLabel = (status) => {
    const labels = {
      PROPOSAL: tr('proposal'),
      APPROVED: tr('approved'),
      RESEARCH: tr('research'),
      PROTOTYPE: tr('prototype'),
      TESTING: tr('testing'),
      PILOT: tr('pilot'),
      DEPLOYED: tr('deployed'),
      COMPLETED: tr('completed'),
      IN_PROGRESS: tr('inProgress'),
      PENDING: tr('pending'),
      SUBMITTED: tr('submittedStatus'),
      REJECTED: tr('rejected'),
      ACCEPTED: tr('accept'),
    }
    return labels[status] || status
  }

  const supportTypeLabel = (type) => {
    const labels = {
      MENTORSHIP: tr('mentorship'),
      FUNDING: tr('funding'),
      PROTOTYPING: tr('prototyping'),
      TESTING: tr('testing'),
      PILOT: tr('pilotDeployment'),
      DEPLOYMENT: tr('deployment'),
    }
    return labels[type] || type
  }

  const formatDate = (value) =>
    new Date(value).toLocaleDateString(
      language === 'hi' ? 'hi-IN' : 'en-IN'
    )

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
            tr('couldNotLoadProject')
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
          tr('couldNotUpdateProjectStatus')
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
        tr('errorMilestoneTitle')
      )

      return

    }

    if (!milestoneForm.milestone_order) {

      setError(
        tr('errorMilestoneOrder')
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
          tr('errorCreateMilestone')
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
        tr('errorTaskTitle')
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
          tr('errorCreateTask')
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
          tr('errorSaveImpact')
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
          tr('errorDeliverableTitle')
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
            tr('errorSubmitDeliverable')
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
          tr('errorCollaborationDescription')
        )

        return

      }

      if (
        collaborationForm.support_type ===
          'FUNDING' &&
        !collaborationForm.funding_amount
      ) {

        setError(
          tr('errorFundingAmount')
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
            tr('errorCollaboration')
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
            tr('errorUpdateCollaboration')
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
          {tr('loadingProject')}</p>

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
              {tr('project')} #{project.id}
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
              {tr('university')}</div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              {hei?.name ||
                `${tr('hei')} #${project.hei_id}`}
            </div>

          </div>


          <div className="rounded-2xl bg-slate-50 p-4">

            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              {tr('startDate')}</div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              {project.start_date
                ? formatDate(project.start_date)
                : tr('notStarted')}
            </div>

          </div>


          <div className="rounded-2xl bg-slate-50 p-4">

            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              {tr('challenge')}</div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              #{project.challenge_id}
            </div>

          </div>

        </div>

      </div>


      {/* PROJECT LIFECYCLE */}

      <Card title={tr('projectLifecycle')}>

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
                        {statusLabel(status)}
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
          {tr('clickStage')}</p>

      </Card>


      {/* OVERVIEW + TEAM */}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        <Card title={tr('overview')}>

          <div className="space-y-5">

            <div className="flex items-center justify-between text-sm text-slate-600">

              <span>
                {tr('projectProgress')}</span>

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
                  {tr('projectMembers')}</div>

                <div className="mt-1 font-semibold text-slate-900">
                  {members.length}
                </div>

              </div>


              <div className="rounded-2xl border border-slate-200 p-4">

                <Building2 className="h-5 w-5 text-slate-500" />

                <div className="mt-3 text-sm text-slate-500">
                  {tr('hei')}</div>

                <div className="mt-1 font-semibold text-slate-900">
                  {hei?.code ||
                    `${tr('hei')} #${project.hei_id}`}
                </div>

              </div>

            </div>

          </div>

        </Card>


        <Card title={tr('team')}>

          {members.length === 0 ? (

            <p className="text-sm text-slate-500">
              {tr('noMembers')}</p>

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

      <Card title={tr('milestones')}>

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
                ? tr('cancel')
                : tr('addMilestone')}
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
                  {tr('milestoneTitle')}</label>

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
                  placeholder={tr('fieldAssessment')}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  {tr('milestoneOrder')}</label>

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
                {tr('description')}</label>

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
                placeholder={tr('describeCompleted')}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                {tr('dueDate')}</label>

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
                  ? tr('creating')
                  : tr('createMilestone')}
              </Button>

            </div>

          </form>

        )}


        {milestones.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

            <p className="text-sm text-slate-500">
              {tr('noMilestones')}</p>

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
                        {statusLabel(milestone.status)}
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
                          ? formatDate(milestone.due_date)
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
                            {tr('markInProgress')}</Button>

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
                            {tr('markCompleted')}</Button>

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

      <Card title={tr('projectTasks')}>

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
                ? tr('cancel')
                : tr('addTask')}
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
                  {tr('taskTitle')}</label>

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
                  placeholder={tr('conductSurvey')}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                />

              </div>


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  {tr('assignTo')}</label>

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
                    {tr('unassigned')}</option>

                  {members.map(
                    (member) => (

                      <option
                        key={member.id}
                        value={
                          member.user_id
                        }
                      >
                        {tr('user')} #
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
                    {tr('addMembersFirst')}</p>

                )}

              </div>

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                {tr('description')}</label>

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
                placeholder={tr('describeDone')}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                {tr('dueDate')}</label>

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
                  ? tr('creating')
                  : tr('createTask')}
              </Button>

            </div>

          </form>

        )}


        {tasks.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

            <p className="text-sm text-slate-500">
              {tr('noTasks')}</p>

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
                        {tr('assignedToUser')} {tr('user')} #
                        {task.assigned_to}
                      </p>

                    )}


                    {task.due_date && (

                      <p className="mt-2 text-xs text-slate-500">
                        {tr('due')}{' '}
                        {formatDate(task.due_date)}
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
                    {statusLabel(task.status)}
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
                        {tr('markInProgress')}</Button>

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

                      {tr('markCompleted')}</Button>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </Card>


      {/* DELIVERABLES */}

      <Card title={tr('projectDeliverables')}>

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
                ? tr('cancel')
                : tr('addDeliverable')}
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
                {tr('deliverableTitle')}</label>

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
                placeholder={tr('waterPrototype')}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                {tr('description')}</label>

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
                placeholder={tr('describeOutput')}
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
                  ? tr('submitting')
                  : tr('submitDeliverable')}
              </Button>

            </div>

          </form>

        )}


        {deliverables.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

            <p className="text-sm text-slate-500">
              {tr('noDeliverables')}</p>

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
                          {tr('submitted')}{' '}
                          {formatDate(deliverable.submitted_at)}
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
                      {statusLabel(deliverable.status)}
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
                        {tr('approve')}</Button>


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
                        {tr('reject')}</Button>

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </Card>


      {/* PROJECT IMPACT */}

      <Card title={tr('projectImpact')}>

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
                ? tr('cancel')
                : tr('addImpact')}
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
                  {tr('peopleBenefited')}</label>

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
                  {tr('villagesCovered')}</label>

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
                  {tr('districtsCovered')}</label>

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
                  {tr('costSavings')} (₹)
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
                {tr('environmentalImpact')}</label>

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
                placeholder={tr('reducedWaste')}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                {tr('outcome')}</label>

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
                placeholder={tr('describeResult')}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
              />

            </div>


            <div className="mt-4">

              <label className="block text-sm font-medium text-slate-700">
                {tr('deploymentStatus')}</label>

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
                  {tr('notDeployed')}</option>

                <option value="DEPLOYED">
                  {tr('deployed')}</option>

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
                  ? tr('saving')
                  : tr('saveImpact')}
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
                  {tr('peopleBenefited')}</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {Number(
                    impact.people_benefited
                  ).toLocaleString('en-IN')}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  {tr('villagesCovered')}</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {impact.villages_covered}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  {tr('districtsCovered')}</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {impact.districts_covered}
                </p>

              </div>


              <div className="rounded-2xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  {tr('costSavings')}</p>

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
                  {tr('outcome')}</p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {impact.outcome}
                </p>

              </div>

            )}


            {impact.environmental_impact && (

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">

                <p className="text-sm font-semibold text-slate-900">
                  {tr('environmentalImpact')}</p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {impact.environmental_impact}
                </p>

              </div>

            )}


            <div className="mt-4">

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                {statusLabel(impact.deployment_status)}
              </span>

            </div>

          </>

        ) : null}

      </Card>


      {/* HEI INDUSTRY COLLABORATION */}

      {!collaborationMode && (

        <Card title={tr('industryCollaboration')}>

          {collaborations.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

              <p className="text-sm text-slate-500">
                {tr('noIndustryOffers')}</p>

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
                          {supportTypeLabel(
                            collaboration.support_type
                          )}
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
                          {tr('accept')}</Button>


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
                          {tr('reject')}</Button>

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
                          {tr('startCollaboration')}</Button>

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

                          {tr('markCompleted')}</Button>

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

          <Card title={tr('offerCollaboration')}>

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
                    {tr('supportType')}</label>

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
                      {tr('mentorship')}</option>

                    <option value="FUNDING">
                      {tr('funding')}</option>

                    <option value="PROTOTYPING">
                      {tr('prototyping')}</option>

                    <option value="TESTING">
                      {tr('testing')}</option>

                    <option value="PILOT">
                      {tr('pilotDeployment')}</option>

                    <option value="DEPLOYMENT">
                      {tr('deployment')}</option>

                  </select>

                </div>


                {collaborationForm.support_type ===
                  'FUNDING' && (

                  <div className="rounded-2xl border border-slate-200 p-4">

                    <HandCoins className="h-5 w-5 text-slate-500" />

                    <label className="mt-3 block text-sm font-medium text-slate-700">
                      {tr('fundingAmount')}</label>

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
                  {tr('collaborationDetails')}</label>

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
                  placeholder={tr('supportDescription')}
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
                    ? tr('submitting')
                    : tr('offerCollaboration')}
                </Button>

              </div>

            </form>

          </Card>


          <Card title={tr('collaborationOffers')}>

            {collaborations.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">

                <p className="text-sm text-slate-500">
                  {tr('noOffers')}</p>

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
                          {statusLabel(
                            collaboration.status
                          )}
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