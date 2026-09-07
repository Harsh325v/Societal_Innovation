import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { mockChallenges } from '../../data/mockData'

export default function UniversityChallengesPage() {
  const [filters, setFilters] = useState({ domain: 'all', district: 'all', priority: 'all' })

  const filtered = mockChallenges.filter((challenge) => {
    const domainMatch = filters.domain === 'all' || challenge.domain === filters.domain
    const districtMatch = filters.district === 'all' || challenge.district === filters.district
    const priorityMatch = filters.priority === 'all' || challenge.priority === filters.priority
    return domainMatch && districtMatch && priorityMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">University</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Recommended challenges</h1>
        </div>
      </div>

      <Card title="Filters">
        <div className="grid gap-4 md:grid-cols-3">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={filters.domain} onChange={(e) => setFilters({ ...filters, domain: e.target.value })}>
            <option value="all">All domains</option>
            <option value="Water Management">Water Management</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Agriculture">Agriculture</option>
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
            <option value="all">All districts</option>
            <option value="Ranchi">Ranchi</option>
            <option value="Giridih">Giridih</option>
            <option value="Khunti">Khunti</option>
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="all">All priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((challenge) => (
          <div key={challenge.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.15em] text-slate-500">{challenge.domain}</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{challenge.title}</h3>
              </div>
              <Badge status={challenge.status} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <div>District: {challenge.district}</div>
              <div>Priority: {challenge.priority}</div>
              <div>AI match score: 92%</div>
              <div>Date: {challenge.submittedDate}</div>
            </div>
            <div className="mt-5 flex justify-end">
              <Link to={`/university/challenges/${challenge.id}`}><Button variant="secondary">View</Button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
