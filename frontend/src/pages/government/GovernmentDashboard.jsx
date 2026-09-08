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
  Legend,
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
  IndianRupee,
  TreePine,
} from 'lucide-react'

import api from '../../services/api'

const COLORS = [
  '#0f172a',
  '#2563eb',
  '#14b8a6',
  '#f59e0b',
  '#a78bfa',
  '#ef4444',
  '#6366f1',
  '#10b981',
]

const LIFECYCLE_ORDER = [
  'PROPOSAL',
  'APPROVED',
  'RESEARCH',
  'PROTOTYPE',
  'TESTING',
  'PILOT',
  'DEPLOYED',
  'COMPLETED',
]

export default function GovernmentDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [districtProjects, setDistrictProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Main government dashboard
        const response = await api.get('/government/dashboard')

        setDashboard(response.data)

        // Load district information
        try {
          const districtResponse = await api.get('/government/districts')

          const districts = districtResponse.data || []

          const projectResults = await Promise.all(
            districts.map(async (district) => {
              try {
                const detailResponse = await api.get(
                  `/government/districts/${encodeURIComponent(
                    district.district
                  )}`
                )

                return {
                  district: district.district,
                  challenges: district.challenges || 0,
                  projects: detailResponse.data.projects || 0,
                }
              } catch {
                return {
                  district: district.district,
                  challenges: district.challenges || 0,
                  projects: 0,
                }
              }
            })
          )

          setDistrictProjects(projectResults)
        } catch (districtError) {
          console.error(
            'Could not load district data:',
            districtError
          )
        }
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

  const stats = dashboard.stats || {}

  const domainData = dashboard.domainData || []
  const statusData = dashboard.statusData || []
  const rawProjectData = dashboard.projectData || []

  const universityParticipation =
    dashboard.universityParticipation || []

  const industryParticipation =
    dashboard.industryParticipation || []

  const impact = dashboard.impact || {}

  /*
   * Backend sends district data as:
   *
   * {
   *   district: "Ranchi",
   *   challenges: 1
   * }
   *
   * Recharts needs the actual property name.
   */
  const challengeDensity = (
    dashboard.challengeDensity || []
  ).map((item) => ({
    ...item,
    value: item.challenges || 0,
  }))

  /*
   * Make sure every lifecycle stage appears,
   * even if its count is 0.
   */
  const projectData = LIFECYCLE_ORDER.map((status) => {
    const found = rawProjectData.find(
      (item) => item.name === status
    )

    return {
      name: status,
      value: found?.value || 0,
    }
  })

  return (
    <div className="space-y-6">

      {/* PAGE HEADING */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Government overview
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Social innovation intelligence
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Monitor challenges, projects, collaboration and
          real-world social impact across Jharkhand.
        </p>
      </div>

      {/* BASIC STATISTICS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={CircleDashed}
          label="Total challenges"
          value={stats.totalChallenges || 0}
          accent="slate"
        />

        <StatCard
          icon={ShieldCheck}
          label="Active challenges"
          value={stats.activeChallenges || 0}
          accent="cyan"
        />

        <StatCard
          icon={Users}
          label="Resolved challenges"
          value={stats.resolvedChallenges || 0}
          accent="emerald"
        />

        <StatCard
          icon={Building2}
          label="Active projects"
          value={stats.activeProjects || 0}
          accent="violet"
        />

      </div>

      {/* PARTICIPATION + DEPLOYMENT */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          label="Universities participating"
          value={stats.universitiesParticipating || 0}
          accent="slate"
        />

        <StatCard
          icon={Building2}
          label="Industry partners"
          value={stats.industryPartners || 0}
          accent="cyan"
        />

        <StatCard
          icon={BarChart3}
          label="Solutions deployed"
          value={stats.solutionsDeployed || 0}
          accent="emerald"
        />

        <StatCard
          icon={Users}
          label="People benefited"
          value={(stats.peopleBenefited || 0).toLocaleString()}
          accent="violet"
        />

      </div>

      {/* REAL IMPACT STATISTICS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          label="People benefited"
          value={(impact.peopleBenefited || 0).toLocaleString()}
          accent="emerald"
        />

        <StatCard
          icon={TreePine}
          label="Villages covered"
          value={(impact.villagesCovered || 0).toLocaleString()}
          accent="cyan"
        />

        <StatCard
          icon={MapPinned}
          label="Districts covered"
          value={impact.districtsCovered || 0}
          accent="violet"
        />

        <StatCard
          icon={IndianRupee}
          label="Cost savings"
          value={`₹${(impact.costSavings || 0).toLocaleString()}`}
          accent="slate"
        />

      </div>

      {/* FUNDING */}
      <Card title="Industry funding">

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">

          <div>
            <p className="text-sm text-slate-500">
              Total funding contributed through industry
              collaborations
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹{(stats.totalFunding || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <IndianRupee className="h-7 w-7 text-slate-700" />
          </div>

        </div>

      </Card>

      {/* CHALLENGES BY DOMAIN + DISTRICT */}
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
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {domainData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />

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
                District data will appear once challenge
                locations are tracked.
              </div>
            ) : (
              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={challengeDensity}>

                    <XAxis dataKey="district" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Challenges"
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

      {/* PROJECTS BY DISTRICT */}
      <Card title="Projects by district">

        {districtProjects.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            No district project data available yet.
          </div>
        ) : (
          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={districtProjects}>

                <XAxis dataKey="district" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="challenges"
                  name="Challenges"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="projects"
                  name="Projects"
                  fill="#14b8a6"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        )}

      </Card>

      {/* CHALLENGE STATUS + PROJECT LIFECYCLE */}
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

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Challenges"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          )}

        </Card>

        <Card title="Project lifecycle">

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={projectData}>

                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  fontSize={11}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Projects"
                  fill="#14b8a6"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </Card>

      </div>

      {/* LIFECYCLE SUMMARY */}
      <Card title="Project lifecycle summary">

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">

          {projectData.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl bg-slate-50 p-4 text-center"
            >

              <p className="text-xs font-medium text-slate-500">
                {item.name}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {item.value}
              </p>

            </div>
          ))}

        </div>

      </Card>

      {/* UNIVERSITY + INDUSTRY PARTICIPATION */}
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

      {/* SOCIAL IMPACT */}
      <div
        id="impact"
        className="scroll-mt-6"
      >
        <Card title="Social impact">

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">
                People benefited
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {(impact.peopleBenefited || 0).toLocaleString()}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">
                Villages covered
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {(impact.villagesCovered || 0).toLocaleString()}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">
                Districts covered
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {impact.districtsCovered || 0}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">
                Projects deployed
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {impact.projectsDeployed || 0}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">
                Cost savings
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                ₹{(impact.costSavings || 0).toLocaleString()}
              </div>
            </div>

          </div>

        </Card>
      </div>

    </div>
  )
}