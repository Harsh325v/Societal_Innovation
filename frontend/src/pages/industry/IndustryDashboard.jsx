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

export default function IndustryDashboard() {
  const [projects, setProjects] = useState([])
  const [collaborations, setCollaborations] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // get the logged-in industry user
        const userResponse = await api.get('/auth/me')
        const user = userResponse.data

        setCurrentUser(user)

        // get all real projects
        const projectResponse = await api.get('/projects/')
        const projectData = projectResponse.data

        setProjects(projectData)

        // get collaboration offers for all projects
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
            'Could not load industry dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // collaborations submitted by this industry account
  const myCollaborations = collaborations.filter(
    (collaboration) =>
      collaboration.industry_user_id === currentUser?.id
  )

  // accepted collaborations from this industry account
  const activeCollaborations = myCollaborations.filter(
    (collaboration) =>
      collaboration.status === 'ACCEPTED'
  ).length

  // projects supported by this industry account
  const supportedProjectIds = new Set(
    myCollaborations
      .filter(
        (collaboration) =>
          collaboration.status === 'ACCEPTED'
      )
      .map((collaboration) => collaboration.project_id)
  )

  const projectsSupported = supportedProjectIds.size

  // calculate total funding from accepted funding offers
  const fundingSupport = myCollaborations
    .filter(
      (collaboration) =>
        collaboration.status === 'ACCEPTED' &&
        collaboration.support_type === 'FUNDING'
    )
    .reduce(
      (total, collaboration) =>
        total + (collaboration.funding_amount || 0),
      0
    )

  const formatFunding = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    }

    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }

    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }

    return `₹${amount}`
  }

  const dashboardCards = [
    {
      icon: BriefcaseBusiness,
      label: 'Available opportunities',
      value: projects.length,
      accent: 'slate',
    },
    {
      icon: TrendingUp,
      label: 'Active collaborations',
      value: activeCollaborations,
      accent: 'cyan',
    },
    {
      icon: BarChart3,
      label: 'Projects supported',
      value: projectsSupported,
      accent: 'emerald',
    },
    {
      icon: HandCoins,
      label: 'Funding support',
      value: formatFunding(fundingSupport),
      accent: 'violet',
    },
  ]

  return (
    <div className="space-y-6">

      {/* page heading */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Industry dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Collaboration opportunities
        </h1>
      </div>

      {/* loading state */}
      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading industry dashboard...
          </p>
        </div>
      )}

      {/* error state */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* real statistics */}
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

          {/* real project opportunities */}
          <Card title="Recommended matches">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

                <h3 className="font-semibold text-slate-900">
                  No projects available yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  New collaboration opportunities will
                  appear here when projects are created.
                </p>

              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">

                {projects.slice(0, 6).map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >

                    <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      Project #{project.id}
                    </div>

                    <div className="mt-3 text-xl font-semibold text-slate-900">
                      {project.title}
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                        {project.status}
                      </span>

                      <span className="text-xs text-slate-500">
                        Challenge #{project.challenge_id}
                      </span>

                    </div>

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