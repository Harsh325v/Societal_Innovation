import { BarChart3, FolderKanban, Gauge, GraduationCap } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'

const pieData = [
  { name: 'Water', value: 32 },
  { name: 'Healthcare', value: 24 },
  { name: 'Agriculture', value: 21 },
  { name: 'Education', value: 15 },
  { name: 'Others', value: 8 },
]

const barData = [
  { name: 'Jan', value: 4 },
  { name: 'Feb', value: 7 },
  { name: 'Mar', value: 6 },
  { name: 'Apr', value: 9 },
  { name: 'May', value: 8 },
  { name: 'Jun', value: 12 },
]

const COLORS = ['#0f172a', '#2563eb', '#14b8a6', '#f59e0b', '#a78bfa']

export default function UniversityDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">University dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Partner impact overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard icon={Gauge} label="Assigned challenges" value={18} accent="slate" />
        <StatCard icon={FolderKanban} label="Pending reviews" value={7} accent="amber" />
        <StatCard icon={FolderKanban} label="Active projects" value={11} accent="cyan" />
        <StatCard icon={Gauge} label="Completed" value={6} accent="emerald" />
        <StatCard icon={GraduationCap} label="Student teams" value={14} accent="violet" />
        <StatCard icon={BarChart3} label="Industry collaborations" value={9} accent="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Challenges by domain">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={3}>
                  {pieData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly project activity">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#0f172a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
