import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import { governmentStats, challengeDensity } from '../../data/mockData'
import { BarChart3, Building2, CircleDashed, MapPinned, ShieldCheck, Users } from 'lucide-react'

const domainData = [
  { name: 'Water', value: 32 },
  { name: 'Healthcare', value: 27 },
  { name: 'Agriculture', value: 18 },
  { name: 'Education', value: 13 },
  { name: 'Others', value: 10 },
]

const statusData = [
  { name: 'Active', value: 42 },
  { name: 'Resolved', value: 29 },
  { name: 'Proposed', value: 28 },
]

const projectData = [
  { name: 'Proposed', value: 18 },
  { name: 'Active', value: 38 },
  { name: 'Completed', value: 21 },
  { name: 'Deployed', value: 12 },
]

const COLORS = ['#0f172a', '#2563eb', '#14b8a6', '#f59e0b', '#a78bfa']

export default function GovernmentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Government overview</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Social innovation intelligence</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CircleDashed} label="Total challenges" value={governmentStats.totalChallenges} accent="slate" />
        <StatCard icon={ShieldCheck} label="Active challenges" value={governmentStats.activeChallenges} accent="cyan" />
        <StatCard icon={Users} label="Resolved challenges" value={governmentStats.resolvedChallenges} accent="emerald" />
        <StatCard icon={Building2} label="Active projects" value={governmentStats.activeProjects} accent="violet" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Universities participating" value={governmentStats.universitiesParticipating} accent="slate" />
        <StatCard icon={Building2} label="Industry partners" value={governmentStats.industryPartners} accent="cyan" />
        <StatCard icon={BarChart3} label="Solutions deployed" value={governmentStats.solutionsDeployed} accent="emerald" />
        <StatCard icon={MapPinned} label="People benefited" value={governmentStats.peopleBenefited.toLocaleString()} accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Challenges by domain">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={domainData} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {domainData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Challenges by district">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={challengeDensity}>
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0f172a" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Challenge status">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Project progress">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#14b8a6" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="University participation">
          <div className="space-y-3">
            {['NIT Jamshedpur', 'BIT Mesra', 'RVS College', 'GGS College'].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{item}</span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{12 - index} projects</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Industry participation">
          <div className="space-y-3">
            {['Jharkhand GreenTech', 'CareNest Health', 'Sustainable Edge', 'Urban Grid Labs'].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{item}</span>
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">{8 - index} collaborations</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Social impact">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">People benefited</div><div className="mt-2 text-2xl font-bold text-slate-900">186,400</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Projects deployed</div><div className="mt-2 text-2xl font-bold text-slate-900">12</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Problems resolved</div><div className="mt-2 text-2xl font-bold text-slate-900">29</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Districts covered</div><div className="mt-2 text-2xl font-bold text-slate-900">18</div></div>
        </div>
      </Card>
    </div>
  )
}
