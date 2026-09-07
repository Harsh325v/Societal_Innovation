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

const COLORS = [
  '#0f172a',
  '#2563eb',
  '#14b8a6',
  '#f59e0b',
  '#a78bfa',
]

export default function UniversityDashboard() {
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
        // get real challenges and projects from postgres
        const [challengeResponse, projectResponse] =
          await Promise.all([
            api.get('/challenges/'),
            api.get('/projects/'),
          ])

        const challengeData = challengeResponse.data
        const projectData = projectResponse.data

        setChallenges(challengeData)
        setProjects(projectData)

        // get proposals for each real challenge
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

        const allProposals = proposalResults.flat()
        setProposals(allProposals)

        // get members and industry collaborations for each real project
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
            'Could not load university dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // count real challenge states
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

  // count unique project members
  const studentTeams = new Set(
    members
      .filter((member) => member.role === 'STUDENT')
      .map((member) => member.user_id)
  ).size

  const activeCollaborations = collaborations.filter(
    (collaboration) =>
      collaboration.status === 'ACCEPTED'
  ).length

  // build real domain data from challenge categories
  const domainCounts = {}

  challenges.forEach((challenge) => {
    const domain = challenge.category || 'Other'

    domainCounts[domain] =
      (domainCounts[domain] || 0) + 1
  })

  const pieData = Object.entries(domainCounts).map(
    ([name, value]) => ({
      name,
      value,
    })
  )

  // build project activity from actual project creation dates
  const monthNames = [
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
      label: 'Assigned challenges',
      value: assignedChallenges,
      icon: Gauge,
      accent: 'slate',
    },
    {
      label: 'Pending reviews',
      value: pendingReviews,
      icon: FolderKanban,
      accent: 'amber',
    },
    {
      label: 'Active projects',
      value: activeProjects,
      icon: FolderKanban,
      accent: 'cyan',
    },
    {
      label: 'Completed',
      value: completedProjects,
      icon: Gauge,
      accent: 'emerald',
    },
    {
      label: 'Student teams',
      value: studentTeams,
      icon: GraduationCap,
      accent: 'violet',
    },
    {
      label: 'Industry collaborations',
      value: activeCollaborations,
      icon: BarChart3,
      accent: 'slate',
    },
  ]

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">
          Loading university dashboard...
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

      {/* page heading */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          University dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Partner impact overview
        </h1>
      </div>

      {/* real statistics */}
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

        {/* real challenge categories */}
        <Card title="Challenges by domain">

          {pieData.length === 0 ? (
            <div className="flex h-72 items-center justify-center">
              <p className="text-sm text-slate-500">
                No challenge data available yet.
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

        {/* real project activity */}
        <Card title="Monthly project activity">

          {projects.length === 0 ? (
            <div className="flex h-72 items-center justify-center">
              <p className="text-sm text-slate-500">
                No projects created yet.
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