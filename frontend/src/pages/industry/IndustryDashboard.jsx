import {
  BarChart3,
  BriefcaseBusiness,
  HandCoins,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import api from '../../services/api'
import { useTranslation } from '../../i18n/useTranslation'

export default function IndustryDashboard() {
  const { t, language } = useTranslation()

  const [projects, setProjects] = useState([])
  const [collaborations, setCollaborations] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const userResponse = await api.get('/auth/me')
        const user = userResponse.data

        setCurrentUser(user)

        const projectResponse = await api.get('/projects/')
        const projectData = projectResponse.data

        setProjects(projectData)

        const collaborationResults = await Promise.all(
          projectData.map(async (project) => {
            try {
              const response = await api.get(
                `/industry-collaborations/project/${project.id}`
              )

              return response.data
            } catch (err) {
              console.error(
                `Could not load collaborations for project ${project.id}`,
                err
              )

              return []
            }
          })
        )

        setCollaborations(
          collaborationResults.flat()
        )
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            t('couldNotLoadIndustryDashboard')
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [language])

  const myCollaborations = collaborations.filter(
    (collaboration) =>
      collaboration.industry_user_id === currentUser?.id
  )

  const activeCollaborations = myCollaborations.filter(
    (collaboration) =>
      collaboration.status === 'ACCEPTED'
  ).length

  const supportedProjectIds = new Set(
    myCollaborations
      .filter(
        (collaboration) =>
          collaboration.status === 'ACCEPTED'
      )
      .map(
        (collaboration) =>
          collaboration.project_id
      )
  )

  const projectsSupported =
    supportedProjectIds.size

  const fundingSupport = myCollaborations
    .filter(
      (collaboration) =>
        collaboration.status === 'ACCEPTED' &&
        collaboration.support_type === 'FUNDING'
    )
    .reduce(
      (total, collaboration) =>
        total +
        (collaboration.funding_amount || 0),
      0
    )

  const formatFunding = (amount) => {
    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(1)}Cr`
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(1)}L`
    }

    if (amount >= 1000) {
      return `₹${(
        amount / 1000
      ).toFixed(1)}K`
    }

    return `₹${amount}`
  }

  const getProjectStatusLabel = (status) => {
    const labels = {
      PROPOSAL: t('proposal'),
      APPROVED: t('approved'),
      RESEARCH: t('research'),
      PROTOTYPE: t('prototype'),
      TESTING: t('testing'),
      PILOT: t('pilotStage'),
      DEPLOYED: t('solutionDeployed'),
      COMPLETED: t('completed'),
      ACTIVE: t('active'),
      IN_PROGRESS: t('statusInProgress'),
      PENDING: t('statusPending'),
      ACCEPTED: t('statusAccepted'),
      REJECTED: t('statusRejected'),
    }

    return labels[status] || status
  }

  const getProjectTitle = (project) => {
    if (language === 'hi') {
      return (
        project.title_hi ||
        project.title ||
        t('project')
      )
    }

    return (
      project.title_en ||
      project.title ||
      t('project')
    )
  }

  const getProjectDescription = (project) => {
    if (language === 'hi') {
      return (
        project.description_hi ||
        project.description ||
        ''
      )
    }

    return (
      project.description_en ||
      project.description ||
      ''
    )
  }

  const dashboardCards = [
    {
      icon: BriefcaseBusiness,
      label: t('availableOpportunities'),
      value: projects.length,
      accent: 'slate',
    },
    {
      icon: TrendingUp,
      label: t('activeCollaborations'),
      value: activeCollaborations,
      accent: 'cyan',
    },
    {
      icon: BarChart3,
      label: t('projectsSupported'),
      value: projectsSupported,
      accent: 'emerald',
    },
    {
      icon: HandCoins,
      label: t('fundingSupport'),
      value: formatFunding(fundingSupport),
      accent: 'violet',
    },
  ]

  return (
    <div className="space-y-6">

      {/* PAGE HEADING */}

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {t('industryDashboard')}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t('collaborationOpportunities')}
        </h1>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            {t('loadingIndustryDashboard')}
          </p>
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>

          {/* STATISTICS */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardCards.map((card) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                accent={card.accent}
              />
            ))}
          </div>

          {/* PROJECT OPPORTUNITIES */}

          <Card title={t('recommendedMatches')}>

            {projects.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

                <h3 className="font-semibold text-slate-900">
                  {t('noProjectsAvailable')}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {t('newCollaborationOpportunities')}
                </p>

              </div>

            ) : (

              <div className="grid gap-4 lg:grid-cols-2">

                {projects.slice(0, 6).map(
                  (project) => (

                    <div
                      key={project.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >

                      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        {t('project')} #{project.id}
                      </div>

                      <div className="mt-3 text-xl font-semibold text-slate-900">
                        {getProjectTitle(project)}
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {getProjectDescription(project)}
                      </p>

                      <div className="mt-4 flex items-center justify-between">

                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                          {getProjectStatusLabel(
                            project.status
                          )}
                        </span>

                        <span className="text-xs text-slate-500">
                          {t('challenge')} #{project.challenge_id}
                        </span>

                      </div>

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