import { ArrowUpRight, Plus, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import Badge from '../../components/common/Badge'
import { dashboardCards, mockChallenges } from '../../data/mockData'

const statIcons = [TrendingUp, TrendingUp, TrendingUp, TrendingUp]

export default function CitizenDashboard() {
  const challengeRows = mockChallenges.slice(0, 3).map((challenge) => ({
    ...challenge,
    priority: challenge.priority,
    status: challenge.status,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Citizen dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Your impact overview</h1>
        </div>
        <Link to="/citizen/challenges/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Report a Challenge
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card, index) => (
          <StatCard key={card.label} icon={statIcons[index]} label={card.label} value={card.value} change={card.change} accent={index % 2 === 0 ? 'slate' : 'cyan'} />
        ))}
      </div>

      <Card title="Recent challenges" subtitle="Latest submissions and status progress">
        <DataTable
          columns={[
            { key: 'title', header: 'Challenge' },
            { key: 'domain', header: 'Domain' },
            { key: 'district', header: 'District' },
            { key: 'priority', header: 'Priority' },
            { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
            { key: 'submittedDate', header: 'Date' },
          ]}
          rows={challengeRows}
        />
      </Card>
    </div>
  )
}
