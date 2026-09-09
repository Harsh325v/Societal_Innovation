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
import { useTranslation } from '../../i18n/useTranslation'

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
  const { t, language } = useTranslation()

  const [dashboard, setDashboard] = useState(null)
  const [districtProjects, setDistrictProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/government/dashboard'
        )

        setDashboard(response.data)

        try {
          const districtResponse =
            await api.get('/government/districts')

          const districts =
            districtResponse.data || []

          const projectResults =
            await Promise.all(
              districts.map(async (district) => {
                try {
                  const detailResponse =
                    await api.get(
                      `/government/districts/${encodeURIComponent(
                        district.district
                      )}`
                    )

                  return {
                    district: district.district,
                    challenges:
                      district.challenges || 0,
                    projects:
                      detailResponse.data.projects || 0,
                  }
                } catch {
                  return {
                    district: district.district,
                    challenges:
                      district.challenges || 0,
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
            t('couldNotLoadGovernmentDashboard')
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [language])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          {t('loadingGovernmentDashboard')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  const stats = dashboard.stats || {}

  const domainData =
    dashboard.domainData || []

  const statusData =
    dashboard.statusData || []

  const rawProjectData =
    dashboard.projectData || []

  const universityParticipation =
    dashboard.universityParticipation || []

  const industryParticipation =
    dashboard.industryParticipation || []

  const impact =
    dashboard.impact || {}

  const challengeDensity = (
    dashboard.challengeDensity || []
  ).map((item) => ({
    ...item,
    value: item.challenges || 0,
  }))

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
        Environment_and_Climate:
          'पर्यावरण और जलवायु',
        Other: 'अन्य',
      }

      return (
        hindiCategories[category] ||
        category
      )
    }

    return category
  }

  const getStatusLabel = (status) => {
    const labels = {
      OPEN: t('open'),
      RESOLVED: t('resolved'),
      IN_REVIEW: t('underReview'),
      PROPOSAL: t('proposal'),
      APPROVED: t('approved'),
      RESEARCH: t('research'),
      PROTOTYPE: t('prototype'),
      TESTING: t('testing'),
      PILOT: t('pilotStage'),
      DEPLOYED: t('solutionDeployed'),
      COMPLETED: t('completed'),
      IN_PROGRESS: t('solutionInProgress'),
    }

    return (
      labels[status] ||
      String(status || '')
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        )
    )
  }

  const projectData =
    LIFECYCLE_ORDER.map((status) => {
      const found =
        rawProjectData.find(
          (item) => item.name === status
        )

      return {
        name: getStatusLabel(status),
        value: found?.value || 0,
      }
    })

  const translatedDomainData =
    domainData.map((item) => ({
      ...item,
      name: getCategoryLabel(item.name),
    }))

  const translatedStatusData =
    statusData.map((item) => ({
      ...item,
      name: getStatusLabel(item.name),
    }))

  return (
    <div className="space-y-6">

      {/* PAGE HEADING */}

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {t('governmentOverview')}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t('socialInnovationIntelligence')}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {t('governmentDashboardDescription')}
        </p>
      </div>


      {/* BASIC STATISTICS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={CircleDashed}
          label={t('totalChallenges')}
          value={stats.totalChallenges || 0}
          accent="slate"
        />

        <StatCard
          icon={ShieldCheck}
          label={t('activeChallenges')}
          value={stats.activeChallenges || 0}
          accent="cyan"
        />

        <StatCard
          icon={Users}
          label={t('resolvedChallenges')}
          value={stats.resolvedChallenges || 0}
          accent="emerald"
        />

        <StatCard
          icon={Building2}
          label={t('activeProjects')}
          value={stats.activeProjects || 0}
          accent="violet"
        />

      </div>


      {/* PARTICIPATION + DEPLOYMENT */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          label={t('universitiesParticipating')}
          value={
            stats.universitiesParticipating || 0
          }
          accent="slate"
        />

        <StatCard
          icon={Building2}
          label={t('industryPartners')}
          value={stats.industryPartners || 0}
          accent="cyan"
        />

        <StatCard
          icon={BarChart3}
          label={t('solutionsDeployed')}
          value={stats.solutionsDeployed || 0}
          accent="emerald"
        />

        <StatCard
          icon={Users}
          label={t('peopleBenefited')}
          value={(
            stats.peopleBenefited || 0
          ).toLocaleString(
            language === 'hi'
              ? 'hi-IN'
              : 'en-IN'
          )}
          accent="violet"
        />

      </div>


      {/* REAL IMPACT STATISTICS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          label={t('peopleBenefited')}
          value={(
            impact.peopleBenefited || 0
          ).toLocaleString(
            language === 'hi'
              ? 'hi-IN'
              : 'en-IN'
          )}
          accent="emerald"
        />

        <StatCard
          icon={TreePine}
          label={t('villagesCovered')}
          value={(
            impact.villagesCovered || 0
          ).toLocaleString(
            language === 'hi'
              ? 'hi-IN'
              : 'en-IN'
          )}
          accent="cyan"
        />

        <StatCard
          icon={MapPinned}
          label={t('districtsCovered')}
          value={impact.districtsCovered || 0}
          accent="violet"
        />

        <StatCard
          icon={IndianRupee}
          label={t('costSavings')}
          value={`₹${(
            impact.costSavings || 0
          ).toLocaleString(
            language === 'hi'
              ? 'hi-IN'
              : 'en-IN'
          )}`}
          accent="slate"
        />

      </div>


      {/* FUNDING */}

      <Card title={t('industryFunding')}>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">

          <div>

            <p className="text-sm text-slate-500">
              {t('totalIndustryFunding')}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹{(
                stats.totalFunding || 0
              ).toLocaleString(
                language === 'hi'
                  ? 'hi-IN'
                  : 'en-IN'
              )}
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

        <Card title={t('challengesByDomain')}>

          {translatedDomainData.length === 0 ? (

            <div className="flex h-72 items-center justify-center text-sm text-slate-500">
              {t('noChallengeData')}
            </div>

          ) : (

            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={translatedDomainData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >

                    {translatedDomainData.map(
                      (entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}

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

          <Card title={t('challengesByDistrict')}>

            {challengeDensity.length === 0 ? (

              <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                {t('districtDataDescription')}
              </div>

            ) : (

              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={challengeDensity}
                  >

                    <XAxis dataKey="district" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name={t('challenges')}
                      fill="#0f172a"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>
            )}

          </Card>

        </div>

      </div>


      {/* PROJECTS BY DISTRICT */}

      <Card title={t('projectsByDistrict')}>

        {districtProjects.length === 0 ? (

          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            {t('noDistrictProjectData')}
          </div>

        ) : (

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={districtProjects}
              >

                <XAxis dataKey="district" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="challenges"
                  name={t('challenges')}
                  fill="#2563eb"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />

                <Bar
                  dataKey="projects"
                  name={t('projects')}
                  fill="#14b8a6"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>
        )}

      </Card>


      {/* CHALLENGE STATUS + PROJECT LIFECYCLE */}

      <div className="grid gap-6 xl:grid-cols-2">

        <Card title={t('challengeStatus')}>

          {translatedStatusData.length === 0 ? (

            <div className="flex h-72 items-center justify-center text-sm text-slate-500">
              {t('noChallengeStatusData')}
            </div>

          ) : (

            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={translatedStatusData}
                >

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name={t('challenges')}
                    fill="#2563eb"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>
          )}

        </Card>


        <Card title={t('projectLifecycle')}>

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
                  name={t('projects')}
                  fill="#14b8a6"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </Card>

      </div>


      {/* LIFECYCLE SUMMARY */}

      <Card title={t('projectLifecycleSummary')}>

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

        <Card title={t('universityParticipation')}>

          {universityParticipation.length === 0 ? (

            <p className="text-sm text-slate-500">
              {t('noUniversityProjects')}
            </p>

          ) : (

            <div className="space-y-3">

              {universityParticipation.map(
                (item) => (

                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >

                    <span className="font-medium text-slate-700">
                      {item.name}
                    </span>

                    <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                      {item.projects}{' '}
                      {t('projects')}
                    </span>

                  </div>

                )
              )}

            </div>
          )}

        </Card>


        <Card title={t('industryParticipation')}>

          {industryParticipation.length === 0 ? (

            <p className="text-sm text-slate-500">
              {t('noIndustryCollaborations')}
            </p>

          ) : (

            <div className="space-y-3">

              {industryParticipation.map(
                (item) => (

                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >

                    <span className="font-medium text-slate-700">
                      {item.name}
                    </span>

                    <span className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">
                      {item.collaborations}{' '}
                      {t('collaborations')}
                    </span>

                  </div>

                )
              )}

            </div>
          )}

        </Card>

      </div>


      {/* SOCIAL IMPACT */}

      <div
        id="impact"
        className="scroll-mt-6"
      >

        <Card title={t('socialImpact')}>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

            <ImpactBox
              label={t('peopleBenefited')}
              value={(
                impact.peopleBenefited || 0
              ).toLocaleString(
                language === 'hi'
                  ? 'hi-IN'
                  : 'en-IN'
              )}
            />

            <ImpactBox
              label={t('villagesCovered')}
              value={(
                impact.villagesCovered || 0
              ).toLocaleString(
                language === 'hi'
                  ? 'hi-IN'
                  : 'en-IN'
              )}
            />

            <ImpactBox
              label={t('districtsCovered')}
              value={
                impact.districtsCovered || 0
              }
            />

            <ImpactBox
              label={t('projectsDeployed')}
              value={
                impact.projectsDeployed || 0
              }
            />

            <ImpactBox
              label={t('costSavings')}
              value={`₹${(
                impact.costSavings || 0
              ).toLocaleString(
                language === 'hi'
                  ? 'hi-IN'
                  : 'en-IN'
              )}`}
            />

          </div>

        </Card>

      </div>

    </div>
  )
}


function ImpactBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="text-sm text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </div>

    </div>
  )
}