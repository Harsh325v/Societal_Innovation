import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock3,
  Search,
  CircleAlert,
} from 'lucide-react'

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

  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await api.get('/challenges/')

        setChallenges(response.data || [])
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not load your problems.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  const getPriority = (score) => {
    if (score >= 70) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }

  /*
   * Convert technical backend statuses into
   * simple citizen-friendly language.
   */
  const getStatusLabel = (status) => {
    const labels = {
      OPEN: 'Under review',
      RESOLVED: 'Resolved',
      IN_REVIEW: 'Under review',
      UNIVERSITY_MATCHED: 'University matched',
      FACULTY_MATCHED: 'Expert matched',
      IN_PROGRESS: 'Solution in progress',
      PROTOTYPE: 'Solution being built',
      TESTING: 'Being tested',
      PILOT: 'Pilot stage',
      DEPLOYED: 'Solution deployed',
      COMPLETED: 'Completed',
    }

    if (labels[status]) {
      return labels[status]
    }

    return String(status || '')
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }

  /*
   * Used to decide which step of the citizen journey
   * should be highlighted.
   *
   * This is mainly a UI representation. It does not
   * change the backend status.
   */
  const getProgressStep = (status) => {
    const steps = [
      'OPEN',
      'UNIVERSITY_MATCHED',
      'FACULTY_MATCHED',
      'IN_PROGRESS',
      'TESTING',
      'DEPLOYED',
      'COMPLETED',
    ]

    const index = steps.indexOf(status)

    if (status === 'RESOLVED') {
      return steps.length - 1
    }

    return index >= 0 ? index : 0
  }

  const domains = useMemo(
    () => [
      ...new Set(
        challenges
          .map((challenge) => challenge.category)
          .filter(Boolean)
      ),
    ],
    [challenges]
  )

  const filtered = useMemo(() => {
    return challenges.filter((challenge) => {
      const priority = getPriority(
        challenge.priority_score || 0
      )

      const matchStatus =
        filters.status === 'all' ||
        challenge.status === filters.status

      const matchDomain =
        filters.domain === 'all' ||
        challenge.category === filters.domain

      const matchPriority =
        filters.priority === 'all' ||
        priority === filters.priority

      const searchText = search
        .trim()
        .toLowerCase()

      const matchSearch =
        !searchText ||
        challenge.title
          ?.toLowerCase()
          .includes(searchText) ||
        challenge.description
          ?.toLowerCase()
          .includes(searchText) ||
        challenge.district
          ?.toLowerCase()
          .includes(searchText) ||
        challenge.block
          ?.toLowerCase()
          .includes(searchText) ||
        challenge.locality
          ?.toLowerCase()
          .includes(searchText)

      return (
        matchStatus &&
        matchDomain &&
        matchPriority &&
        matchSearch
      )
    })
  }, [challenges, filters, search])

  const activeCount = challenges.filter(
    (challenge) =>
      challenge.status !== 'RESOLVED' &&
      challenge.status !== 'COMPLETED'
  ).length

  const resolvedCount = challenges.filter(
    (challenge) =>
      challenge.status === 'RESOLVED' ||
      challenge.status === 'COMPLETED'
  ).length

  const highPriorityCount = challenges.filter(
    (challenge) =>
      getPriority(
        challenge.priority_score || 0
      ) === 'High'
  ).length

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Citizen
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Problems
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            See the problems you reported and
            follow what happens next.
          </p>

        </div>


        <Link to="/citizen/challenges/new">

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report a Problem
          </Button>

        </Link>

      </div>


      {/* SIMPLE SUMMARY */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-slate-100 p-3">
              <Clock3 className="h-5 w-5 text-slate-700" />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Being worked on
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {activeCount}
              </p>

            </div>

          </div>

        </div>


        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-emerald-50 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                Resolved
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {resolvedCount}
              </p>

            </div>

          </div>

        </div>


        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-amber-50 p-3">
              <CircleAlert className="h-5 w-5 text-amber-600" />
            </div>

            <div>

              <p className="text-sm text-slate-500">
                High priority
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {highPriorityCount}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* SEARCH + FILTERS */}

      <Card
        title="Find a problem"
        subtitle="Search or filter the problems you have reported."
      >

        <div className="space-y-4">

          <div className="relative">

            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by problem, village or district..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

          </div>


          <div className="grid gap-3 md:grid-cols-3">

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

              <option value="all">
                All status
              </option>

              <option value="OPEN">
                Under review
              </option>

              <option value="RESOLVED">
                Resolved
              </option>

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

              <option value="all">
                All categories
              </option>

              {domains.map((domain) => (

                <option
                  key={domain}
                  value={domain}
                >
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

              <option value="all">
                All priority
              </option>

              {priorities.map((priority) => (

                <option
                  key={priority}
                  value={priority}
                >
                  {priority}
                </option>

              ))}

            </select>

          </div>

        </div>

      </Card>


      {/* LOADING */}

      {loading && (

        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">

          <p className="text-slate-500">
            Loading your problems...
          </p>

        </div>

      )}


      {/* ERROR */}

      {!loading && error && (

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">

          <p className="text-sm text-red-600">
            {error}
          </p>

        </div>

      )}


      {/* PROBLEM LIST */}

      {!loading &&
        !error &&
        filtered.length > 0 && (

          <div className="space-y-5">

            {filtered.map((challenge) => {

              const priority = getPriority(
                challenge.priority_score || 0
              )

              const progressStep =
                getProgressStep(
                  challenge.status
                )

              return (

                <div
                  key={challenge.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                        {challenge.category ||
                          'Problem reported'}
                      </p>

                      <h2 className="mt-2 text-xl font-semibold text-slate-900">
                        {challenge.title}
                      </h2>

                    </div>


                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        challenge.status ===
                          'RESOLVED' ||
                        challenge.status ===
                          'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : challenge.status ===
                              'DEPLOYED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {getStatusLabel(
                        challenge.status
                      )}
                    </span>

                  </div>


                  {/* DESCRIPTION */}

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                    {challenge.description}
                  </p>


                  {/* LOCATION */}

                  <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">

                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      {[
                        challenge.locality,
                        challenge.block,
                        challenge.district,
                      ]
                        .filter(Boolean)
                        .join(', ') ||
                        'Location not provided'}
                    </span>

                  </div>


                  {/* SIMPLE PROGRESS */}

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      What happens next
                    </p>


                    <div className="mt-4 flex items-center">

                      <div className="flex flex-1 items-center">

                        <div
                          className={`h-3 w-3 rounded-full ${
                            progressStep >= 0
                              ? 'bg-slate-900'
                              : 'bg-slate-300'
                          }`}
                        />

                        <div
                          className={`h-1 flex-1 ${
                            progressStep >= 1
                              ? 'bg-slate-900'
                              : 'bg-slate-200'
                          }`}
                        />

                      </div>


                      <div className="flex flex-1 items-center">

                        <div
                          className={`h-3 w-3 rounded-full ${
                            progressStep >= 1
                              ? 'bg-slate-900'
                              : 'bg-slate-300'
                          }`}
                        />

                        <div
                          className={`h-1 flex-1 ${
                            progressStep >= 2
                              ? 'bg-slate-900'
                              : 'bg-slate-200'
                          }`}
                        />

                      </div>


                      <div className="flex flex-1 items-center">

                        <div
                          className={`h-3 w-3 rounded-full ${
                            progressStep >= 2
                              ? 'bg-slate-900'
                              : 'bg-slate-300'
                          }`}
                        />

                        <div
                          className={`h-1 flex-1 ${
                            progressStep >= 3
                              ? 'bg-slate-900'
                              : 'bg-slate-200'
                          }`}
                        />

                      </div>


                      <div className="flex flex-1 items-center">

                        <div
                          className={`h-3 w-3 rounded-full ${
                            progressStep >= 3
                              ? 'bg-slate-900'
                              : 'bg-slate-300'
                          }`}
                        />

                        <div
                          className={`h-1 flex-1 ${
                            progressStep >= 4
                              ? 'bg-slate-900'
                              : 'bg-slate-200'
                          }`}
                        />

                      </div>


                      <div className="flex flex-1 items-center">

                        <div
                          className={`h-3 w-3 rounded-full ${
                            progressStep >= 4
                              ? 'bg-slate-900'
                              : 'bg-slate-300'
                          }`}
                        />

                        <div
                          className={`h-1 flex-1 ${
                            progressStep >= 5
                              ? 'bg-slate-900'
                              : 'bg-slate-200'
                          }`}
                        />

                      </div>


                      <div
                        className={`h-3 w-3 rounded-full ${
                          progressStep >= 5
                            ? 'bg-slate-900'
                            : 'bg-slate-300'
                        }`}
                      />

                    </div>


                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-slate-500 sm:grid-cols-6">

                      <span>
                        Submitted
                      </span>

                      <span>
                        Review
                      </span>

                      <span>
                        Experts
                      </span>

                      <span>
                        Solution
                      </span>

                      <span>
                        Testing
                      </span>

                      <span>
                        Deployment
                      </span>

                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          priority === 'High'
                            ? 'bg-red-50 text-red-700'
                            : priority ===
                                'Medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {priority} priority
                      </span>


                      {challenge.created_at && (

                        <span className="text-xs text-slate-500">
                          Reported{' '}
                          {new Date(
                            challenge.created_at
                          ).toLocaleDateString()}
                        </span>

                      )}

                    </div>


                    <Link
                      to={`/challenges/${challenge.id}`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      View progress
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                  </div>

                </div>

              )
            })}

          </div>

        )}


      {/* EMPTY STATE */}

      {!loading &&
        !error &&
        filtered.length === 0 && (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

              <MapPin className="h-6 w-6 text-slate-500" />

            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No problems found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not reported a problem
              matching these filters yet.
            </p>

            <Link
              to="/citizen/challenges/new"
              className="mt-5 inline-block"
            >

              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report a Problem
              </Button>

            </Link>

          </div>

        )}

    </div>
  )
}