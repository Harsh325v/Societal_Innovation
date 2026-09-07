import { Plus, TrendingUp, FileText, CheckCircle2, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import Badge from '../../components/common/Badge'
import api from '../../services/api'

const statIcons = [
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
]

export default function CitizenDashboard() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        // get the real challenges from postgres
        const response = await api.get('/challenges/')
        setChallenges(response.data)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not load dashboard data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  const totalChallenges = challenges.length

  const activeChallenges = challenges.filter(
    (challenge) => challenge.status === 'OPEN'
  ).length

  const resolvedChallenges = challenges.filter(
    (challenge) => challenge.status === 'RESOLVED'
  ).length

  const highPriorityChallenges = challenges.filter(
    (challenge) => (challenge.priority_score || 0) >= 70
  ).length

  const dashboardCards = [
    {
      label: 'Total challenges',
      value: totalChallenges,
      change: 'Submitted by you',
    },
    {
      label: 'Active challenges',
      value: activeChallenges,
      change: 'Currently open',
    },
    {
      label: 'Resolved',
      value: resolvedChallenges,
      change: 'Successfully resolved',
    },
    {
      label: 'High priority',
      value: highPriorityChallenges,
      change: 'Priority score ≥ 70',
    },
  ]

  const challengeRows = challenges.slice(0, 5).map(
    (challenge) => ({
      id: challenge.id,
      title: challenge.title,
      domain: challenge.category || 'Uncategorized',
      district: 'Not available',
      priority:
        (challenge.priority_score || 0) >= 70
          ? 'High'
          : (challenge.priority_score || 0) >= 40
            ? 'Medium'
            : 'Low',
      status:
        challenge.status === 'OPEN'
          ? 'UNDER_REVIEW'
          : challenge.status,
      submittedDate: challenge.created_at
        ? new Date(
            challenge.created_at
          ).toLocaleDateString()
        : '',
    })
  )

  return (
    <div className="space-y-6">

      {/* page heading */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Citizen dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Your impact overview
          </h1>
        </div>

        <Link to="/citizen/challenges/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report a Challenge
          </Button>
        </Link>
      </div>

      {/* loading state */}
      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      )}

      {/* error state */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* real statistics */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            {dashboardCards.map((card, index) => (
              <StatCard
                key={card.label}
                icon={statIcons[index]}
                label={card.label}
                value={card.value}
                change={card.change}
                accent={
                  index % 2 === 0
                    ? 'slate'
                    : 'cyan'
                }
              />
            ))}

          </div>

          {/* recent real challenges */}
          <Card
            title="Recent challenges"
            subtitle="Latest submissions and status progress"
          >

            {challengeRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

                <h3 className="font-semibold text-slate-900">
                  No challenges yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Report a societal problem to get started.
                </p>

                <Link
                  to="/citizen/challenges/new"
                  className="mt-4 inline-block"
                >
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Report a Challenge
                  </Button>
                </Link>

              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'title',
                    header: 'Challenge',
                  },
                  {
                    key: 'domain',
                    header: 'Domain',
                  },
                  {
                    key: 'district',
                    header: 'District',
                  },
                  {
                    key: 'priority',
                    header: 'Priority',
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (row) => (
                      <Badge status={row.status} />
                    ),
                  },
                  {
                    key: 'submittedDate',
                    header: 'Date',
                  },
                ]}
                rows={challengeRows}
              />
            )}

          </Card>
        </>
      )}

    </div>
  )
}