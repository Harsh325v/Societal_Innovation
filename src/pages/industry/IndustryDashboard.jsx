import { BarChart3, BriefcaseBusiness, HandCoins, TrendingUp } from 'lucide-react'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'

export default function IndustryDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Industry dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Collaboration opportunities</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BriefcaseBusiness} label="Available opportunities" value={16} accent="slate" />
        <StatCard icon={TrendingUp} label="Active collaborations" value={9} accent="cyan" />
        <StatCard icon={BarChart3} label="Projects supported" value={11} accent="emerald" />
        <StatCard icon={HandCoins} label="Funding support" value="₹64L" accent="violet" />
      </div>

      <Card title="Recommended matches">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Water Management</div>
            <div className="mt-3 text-xl font-semibold text-slate-900">WaterGrid for Rural Ranchi</div>
            <p className="mt-3 text-sm text-slate-600">Strong fit for sensors, water-tech, and pilot deployment support.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Healthcare</div>
            <div className="mt-3 text-xl font-semibold text-slate-900">Arogya Connect</div>
            <p className="mt-3 text-sm text-slate-600">Opportunity for digital health workflows and remote screening systems.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
