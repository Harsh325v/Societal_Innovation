import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight, Plus } from 'lucide-react'

import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import api from '../../services/api'

const priorities = ['High', 'Medium', 'Low']

export default function MyChallengesPage() {
  const [challenges, setChallenges] = useState([])
  const [filters, setFilters] = useState({
    status: 'all',
    domain: 'all',
    priority: 'all',
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        // get real challenges from postgres
        const response = await api.get('/challenges/')

        setChallenges(response.data)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not load your challenges.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  // convert the backend priority score into the labels used by the UI
  const getPriority = (score) => {
    if (score >= 70) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }

  // backend currently uses OPEN as the initial challenge status
  const getStatusLabel = (status) => {
    if (status === 'OPEN') return 'Open'
    if (status === 'RESOLVED') return 'Resolved'

    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  // get the unique domains that actually exist in the database
  const domains = [
    ...new Set(
      challenges
        .map((challenge) => challenge.category)
        .filter(Boolean)
    ),
  ]

  const filtered = challenges.filter((challenge) => {
    const priority = getPriority(challenge.priority_score)

    const matchStatus =
      filters.status === 'all' ||
      challenge.status === filters.status

    const matchDomain =
      filters.domain === 'all' ||
      challenge.category === filters.domain

    const matchPriority =
      filters.priority === 'all' ||
      priority === filters.priority

    return matchStatus && matchDomain && matchPriority
  })

  return (
    <div className="space-y-6">

      {/* page heading */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Citizen
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My challenges
          </h1>
        </div>

        <Link to="/citizen/challenges/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New challenge
          </Button>
        </Link>
      </div>

      {/* filters */}
      <Card title="Filters">
        <div className="grid gap-4 md:grid-cols-3">

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={filters.status}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                status: e.target.value,
              }))
            }
          >
            <option value="all">All status</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={filters.domain}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                domain: e.target.value,
              }))
            }
          >
            <option value="all">All domains</option>

            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={filters.priority}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                priority: e.target.value,
              }))
            }
          >
            <option value="all">All priority</option>

            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

        </div>
      </Card>

      {/* loading */}
      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading your challenges...
          </p>
        </div>
      )}

      {/* error */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* challenges */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">

          {filtered.map((challenge) => {
            const priority = getPriority(
              challenge.priority_score
            )

            return (
              <div
                key={challenge.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      {challenge.category || 'Uncategorized'}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {challenge.title}
                    </h2>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                    {getStatusLabel(challenge.status)}
                  </span>

                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {challenge.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" />

                  {[
                    challenge.locality,
                    challenge.block,
                    challenge.district,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Location not provided'}
                </div>

                <div className="mt-5 flex items-center justify-between">

                  <div>
                    <span className="text-sm text-slate-500">
                      Priority:{' '}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {priority}
                    </span>
                  </div>

                  <span className="text-sm text-slate-500">
                    {challenge.created_at
                      ? new Date(
                          challenge.created_at
                        ).toLocaleDateString()
                      : ''}
                  </span>

                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    AI Priority: {Math.round(
                      challenge.priority_score || 0
                    )}
                  </span>

                  <Link
                    to={`/challenges/${challenge.id}`}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>

              </div>
            )
          })}

        </div>
      )}

      {/* empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">

          <h2 className="text-lg font-semibold text-slate-900">
            No challenges found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            You haven't submitted any challenges yet.
          </p>

          <Link
            to="/citizen/challenges/new"
            className="mt-5 inline-block"
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report a challenge
            </Button>
          </Link>

        </div>
      )}

    </div>
  )
}