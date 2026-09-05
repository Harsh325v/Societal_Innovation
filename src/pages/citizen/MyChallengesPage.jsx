import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ChallengeCard from '../../components/challenges/ChallengeCard'
import { mockChallenges, domains, districts } from '../../data/mockData'

const priorities = ['High', 'Medium', 'Low']

export default function MyChallengesPage() {
  const [filters, setFilters] = useState({ status: 'all', domain: 'all', district: 'all', priority: 'all' })

  const filtered = mockChallenges.filter((challenge) => {
    const matchStatus = filters.status === 'all' || challenge.status === filters.status
    const matchDomain = filters.domain === 'all' || challenge.domain === filters.domain
    const matchDistrict = filters.district === 'all' || challenge.district === filters.district
    const matchPriority = filters.priority === 'all' || challenge.priority === filters.priority
    return matchStatus && matchDomain && matchDistrict && matchPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Citizen</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My challenges</h1>
        </div>
        <Button>New challenge</Button>
      </div>

      <Card title="Filters">
        <div className="grid gap-4 md:grid-cols-4">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">All status</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="VALIDATED">Validated</option>
            <option value="ASSIGNED">Assigned</option>
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={filters.domain} onChange={(e) => setFilters({ ...filters, domain: e.target.value })}>
            <option value="all">All domains</option>
            {domains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
            <option value="all">All districts</option>
            {districts.map((district) => <option key={district} value={district}>{district}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="all">All priority</option>
            {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}
      </div>
    </div>
  )
}
