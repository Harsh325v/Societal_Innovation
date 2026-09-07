import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import {
  BarChart3,
  Building2,
  CircleDashed,
  MapPinned,
  ShieldCheck,
  Users,
} from 'lucide-react'

import api from '../../services/api'

const COLORS = [
  '#0f172a',
  '#2563eb',
  '#14b8a6',
  '#f59e0b',
  '#a78bfa',
]

export default function GovernmentDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // get the real government dashboard data from postgres
        const response = await api.get('/government/dashboard')

        setDashboard(response.data)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not load government dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          Loading government dashboard...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  const stats = dashboard.stats

  const domainData = dashboard.domainData || []
  const statusData = dashboard.statusData || []
  const projectData = dashboard.projectData || []

  const challengeDensity =
    dashboard.challengeDensity || []

  const universityParticipation =
    dashboard.universityParticipation || []

  const industryParticipation =
    dashboard.industryParticipation || []

  const impact = dashboard.impact || {}

  return (
    <div className="space-y-6">

      {/* page heading */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Government overview
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Social innovation intelligence
        </h1>
      </div>

      {/* challenge and project statistics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={CircleDashed}
          label="Total challenges"
          value={stats.totalChallenges}
          accent="slate"
        />

        <StatCard
          icon={ShieldCheck}
          label="Active challenges"
          value={stats.activeChallenges}
          accent="cyan"
        />

        <StatCard
          icon={Users}
          label="Resolved challenges"
          value={stats.resolvedChallenges}
          accent="emerald"
        />

        <StatCard
          icon={Building2}
          label="Active projects"
          value={stats.activeProjects}
          accent="violet"
        />

      </div>

      {/* participation statistics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          label="Universities participating"
          value={stats.universitiesParticipating}
          accent="slate"
        />

        <StatCard
          icon={Building2}
          label="Industry partners"
          value={stats.industryPartners}
          accent="cyan"
        />

        <StatCard
          icon={BarChart3}
          label="Solutions deployed"
          value={stats.solutionsDeployed}
          accent="emerald"
        />

        <StatCard
          icon={MapPinned}
          label="People benefited"
          value={stats.peopleBenefited.toLocaleString()}
          accent="violet"
        />

      </div>

      {/* challenges section */}
      <div
        id="challenges"
        className="grid gap-6 xl:grid-cols-2 scroll-mt-6"
      >

        <Card title="Challenges by domain">

          {domainData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-500">
              No challenge data available yet.
            </div>
          ) : (
            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={domainData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {domainData.map((entry, index) => (
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

        <div
          id="district-map"
          className="scroll-mt-6"
        >
          <Card title="Challenges by district">

            {challengeDensity.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                District data will appear once challenge locations are tracked.
              </div>
            ) : (
              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={challengeDensity}>

                    <XAxis dataKey="district" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill="#0f172a"
                      radius={[8, 8, 0, 0]}
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>
            )}

          </Card>
        </div>

      </div>

      {/* challenge status and project progress */}
      <div className="grid gap-6 xl:grid-cols-2">

        <Card title="Challenge status">

          {statusData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-500">
              No challenge status data available yet.
            </div>
          ) : (
            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={statusData}>

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          )}

        </Card>

        <Card title="Project progress">

          {projectData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-500">
              No project data available yet.
            </div>
          ) : (
            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={projectData}>

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#14b8a6"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          )}

        </Card>

      </div>

      {/* university and industry participation */}
      <div className="grid gap-6 lg:grid-cols-2">

        <Card title="University participation">

          {universityParticipation.length === 0 ? (
            <p className="text-sm text-slate-500">
              No university projects yet.
            </p>
          ) : (
            <div className="space-y-3">

              {universityParticipation.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >

                  <span className="font-medium text-slate-700">
                    {item.name}
                  </span>

                  <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                    {item.projects} projects
                  </span>

                </div>
              ))}

            </div>
          )}

        </Card>

        <Card title="Industry participation">

          {industryParticipation.length === 0 ? (
            <p className="text-sm text-slate-500">
              No industry collaborations yet.
            </p>
          ) : (
            <div className="space-y-3">

              {industryParticipation.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >

                  <span className="font-medium text-slate-700">
                    {item.name}
                  </span>

                  <span className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">
                    {item.collaborations} collaborations
                  </span>

                </div>
              ))}

            </div>
          )}

        </Card>

      </div>

      {/* social impact */}
      <div
        id="impact"
        className="scroll-mt-6"
      >
        <Card title="Social impact">

          <div className="grid gap-4 md:grid-cols-4">

            <div className="rounded-2xl bg-slate-50 p-4">

              <div className="text-sm text-slate-500">
                People benefited
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {impact.peopleBenefited.toLocaleString()}
              </div>

            </div>

            <div className="rounded-2xl bg-slate-50 p-4">

              <div className="text-sm text-slate-500">
                Projects deployed
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {impact.projectsDeployed}
              </div>

            </div>

            <div className="rounded-2xl bg-slate-50 p-4">

              <div className="text-sm text-slate-500">
                Problems resolved
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {impact.problemsResolved}
              </div>

            </div>

            <div className="rounded-2xl bg-slate-50 p-4">

              <div className="text-sm text-slate-500">
                Districts covered
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {impact.districtsCovered}
              </div>

            </div>

          </div>

        </Card>
      </div>

    </div>
  )
}