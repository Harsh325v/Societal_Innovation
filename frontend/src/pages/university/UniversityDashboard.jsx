import {
  BarChart3,
  FolderKanban,
  Gauge,
  GraduationCap,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useEffect, useState } from 'react'

import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import api from '../../services/api'
import { useTranslation } from '../../i18n/useTranslation'

const COLORS = [
  '#0f172a',
  '#2563eb',
  '#14b8a6',
  '#f59e0b',
  '#a78bfa',
]

export default function UniversityDashboard() {
  const { t, language } = useTranslation()

  const [challenges, setChallenges] = useState([])
  const [projects, setProjects] = useState([])
  const [proposals, setProposals] = useState([])
  const [members, setMembers] = useState([])
  const [collaborations, setCollaborations] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const [challengeResponse, projectResponse] =
          await Promise.all([
            api.get('/challenges/'),
            api.get('/projects/'),
          ])

        const challengeData = challengeResponse.data
        const projectData = projectResponse.data

        setChallenges(challengeData)
        setProjects(projectData)

        const proposalResults = await Promise.all(
          challengeData.map(async (challenge) => {
            try {
              const response = await api.get(
                `/proposals/challenge/${challenge.id}`
              )

              return response.data
            } catch (err) {
              console.error(
                `Could not load proposals for challenge ${challenge.id}`,
                err
              )

              return []
            }
          })
        )

        setProposals(proposalResults.flat())

        const projectResults = await Promise.all(
          projectData.map(async (project) => {
            let projectMembers = []
            let projectCollaborations = []

            try {
              const response = await api.get(
                `/project-members/project/${project.id}`
              )

              projectMembers = response.data
            } catch (err) {
              console.error(
                `Could not load members for project ${project.id}`,
                err
              )
            }

            try {
              const response = await api.get(
                `/industry-collaborations/project/${project.id}`
              )

              projectCollaborations = response.data
            } catch (err) {
              console.error(
                `Could not load collaborations for project ${project.id}`,
                err
              )
            }

            return {
              members: projectMembers,
              collaborations: projectCollaborations,
            }
          })
        )

        setMembers(
          projectResults.flatMap(
            (result) => result.members
          )
        )

        setCollaborations(
          projectResults.flatMap(
            (result) => result.collaborations
          )
        )
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            t('couldNotLoadUniversityDashboard')
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [language])

  const assignedChallenges = challenges.filter(
    (challenge) => challenge.status !== 'RESOLVED'
  ).length

  const pendingReviews = proposals.filter(
    (proposal) => proposal.status === 'PENDING'
  ).length

  const activeProjects = projects.filter(
    (project) => project.status === 'ACTIVE'
  ).length

  const completedProjects = projects.filter(
    (project) => project.status === 'COMPLETED'
  ).length

  const studentTeams = new Set(
    members
      .filter((member) => member.role === 'STUDENT')
      .map((member) => member.user_id)
  ).size

  const activeCollaborations = collaborations.filter(
    (collaboration) =>
      collaboration.status === 'ACCEPTED'
  ).length

  const getCategoryLabel = (category) => {
    if (!category) return t('other')

    if (language === 'hi') {
      const hindiCategories = {
        Environment: 'पर्यावरण',
        Water: 'जल',
        Agriculture: 'कृषि',
        Health: 'स्वास्थ्य',
        Education: 'शिक्षा',
        Infrastructure: 'बुनियादी ढाँचा',
        Sanitation: 'स्वच्छता',
        Energy: 'ऊर्जा',
        Transport: 'परिवहन',
        Waste: 'कचरा प्रबंधन',
        Environment_and_Climate: 'पर्यावरण और जलवायु',
        Other: 'अन्य',
      }

      return hindiCategories[category] || category
    }

    return category
  }

  const domainCounts = {}

  challenges.forEach((challenge) => {
    const domain = challenge.category || 'Other'

    domainCounts[domain] =
      (domainCounts[domain] || 0) + 1
  })

  const pieData = Object.entries(domainCounts).map(
    ([name, value]) => ({
      name: getCategoryLabel(name),
      value,
    })
  )

  const monthNames =
    language === 'hi'
      ? [
          'जन',
          'फ़र',
          'मार्च',
          'अप्रैल',
          'मई',
          'जून',
          'जुल',
          'अग',
          'सित',
          'अक्टू',
          'नव',
          'दिस',
        ]
      : [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]

  const currentYear = new Date().getFullYear()

  const monthlyCounts = monthNames.map(
    (name, index) => ({
      name,
      value: projects.filter((project) => {
        if (!project.created_at) return false

        const date = new Date(project.created_at)

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === index
        )
      }).length,
    })
  )

  const dashboardCards = [
    {
      label: t('assignedChallenges'),
      value: assignedChallenges,
      icon: Gauge,
      accent: 'slate',
    },
    {
      label: t('pendingReviews'),
      value: pendingReviews,
      icon: FolderKanban,
      accent: 'amber',
    },
    {
      label: t('activeProjects'),
      value: activeProjects,
      icon: FolderKanban,
      accent: 'cyan',
    },
    {
      label: t('completed'),
      value: completedProjects,
      icon: Gauge,
      accent: 'emerald',
    },
    {
      label: t('studentTeams'),
      value: studentTeams,
      icon: GraduationCap,
      accent: 'violet',
    },
    {
      label: t('industryCollaborations'),
      value: activeCollaborations,
      icon: BarChart3,
      accent: 'slate',
    },
  ]

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">
          {t('loadingUniversityDashboard')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADING */}

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {t('universityDashboard')}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t('partnerImpactOverview')}
        </h1>
      </div>


      {/* STATISTICS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">

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


      <div className="grid gap-6 xl:grid-cols-2">

        {/* CHALLENGES BY DOMAIN */}

        <Card title={t('challengesByDomain')}>

          {pieData.length === 0 ? (

            <div className="flex h-72 items-center justify-center">

              <p className="text-sm text-slate-500">
                {t('noChallengeData')}
              </p>

            </div>

          ) : (

            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                  >

                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>
          )}

        </Card>


        {/* MONTHLY PROJECT ACTIVITY */}

        <Card title={t('monthlyProjectActivity')}>

          {projects.length === 0 ? (

            <div className="flex h-72 items-center justify-center">

              <p className="text-sm text-slate-500">
                {t('noProjectsCreated')}
              </p>

            </div>

          ) : (

            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={monthlyCounts}>

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill="#0f172a"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>
          )}

        </Card>

      </div>

    </div>
  )
}