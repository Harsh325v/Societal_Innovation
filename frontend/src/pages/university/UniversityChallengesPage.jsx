import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { challengeService } from '../../services/challengeService'

export default function UniversityChallengesPage() {
  const [filters, setFilters] = useState({
    domain: 'all',
    priority: 'all',
  })

  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        // get the real challenges from our backend
        const response = await challengeService.getChallenges()

        setChallenges(response.data)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not load challenges.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  const filtered = challenges.filter((challenge) => {
    // filter using the AI-generated category
    const domainMatch =
      filters.domain === 'all' ||
      challenge.category === filters.domain

    // convert the backend priority score into the UI priority levels
    let priority = 'Low'

    if (challenge.priority_score >= 70) {
      priority = 'High'
    } else if (challenge.priority_score >= 40) {
      priority = 'Medium'
    }

    const priorityMatch =
      filters.priority === 'all' ||
      priority === filters.priority

    return domainMatch && priorityMatch
  })

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          Loading challenges...
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            University
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Recommended challenges
          </h1>
        </div>
      </div>

      <Card title="Filters">
        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={filters.domain}
            onChange={(e) =>
              setFilters({
                ...filters,
                domain: e.target.value,
              })
            }
          >
            <option value="all">All domains</option>
            <option value="Water Management">
              Water Management
            </option>
            <option value="Healthcare">Healthcare</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Education">Education</option>
            <option value="Environment">Environment</option>
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={filters.priority}
            onChange={(e) =>
              setFilters({
                ...filters,
                priority: e.target.value,
              })
            }
          >
            <option value="all">All priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((challenge) => {
          // turn the backend score into a readable priority
          let priority = 'Low'

          if (challenge.priority_score >= 70) {
            priority = 'High'
          } else if (challenge.priority_score >= 40) {
            priority = 'Medium'
          }

          return (
            <div
              key={challenge.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    {challenge.category}
                  </div>

                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {challenge.title}
                  </h3>
                </div>

                <Badge status={challenge.status} />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <div>
                  Priority: {priority} ({challenge.priority_score}/100)
                </div>

                <div>
                  Challenge ID: #{challenge.id}
                </div>

                <div>
                  Date:{' '}
                  {new Date(
                    challenge.created_at
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Link
                  to={`/university/challenges/${challenge.id}`}
                >
                  <Button variant="secondary">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            No challenges match the selected filters.
          </p>
        </div>
      )}
    </div>
  )
}