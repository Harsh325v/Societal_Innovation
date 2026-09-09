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
import { useTranslation } from '../../i18n/useTranslation'

const priorities = ['High', 'Medium', 'Low']

export default function MyChallengesPage() {
  const { t, language } = useTranslation()

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
        setLoading(true)
        setError('')

        const response = await api.get('/challenges/')

        setChallenges(response.data || [])
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            t('couldNotLoadProblems')
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [language])

  const getPriority = (score) => {
    if (score >= 70) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }

  const getPriorityLabel = (priority) => {
    if (priority === 'High') return t('highPriority')
    if (priority === 'Medium') return t('mediumPriority')
    return t('lowPriority')
  }

  const getStatusLabel = (status) => {
    const labels = {
      OPEN: t('underReview'),
      RESOLVED: t('resolved'),
      IN_REVIEW: t('underReview'),
      UNIVERSITY_MATCHED: t('universityMatched'),
      FACULTY_MATCHED: t('expertMatched'),
      IN_PROGRESS: t('solutionInProgress'),
      PROTOTYPE: t('solutionBeingBuilt'),
      TESTING: t('beingTested'),
      PILOT: t('pilotStage'),
      DEPLOYED: t('solutionDeployed'),
      COMPLETED: t('completed'),
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

  const getCategoryLabel = (category) => {
    if (!category) {
      return ''
    }

    if (language === 'hi') {
      const hindiCategories = {
        Environment: 'पर्यावरण',
        Water: 'जल',
        Agriculture: 'कृषि',
        Health: 'स्वास्थ्य',
        Education: 'शिक्षा',
        Infrastructure: 'बुनियादी ढाँचा',
        Sanitation: 'स्वच्छता',
        Energy: 'ऊर्जा',
        Transport: 'परिवहन',
        Waste: 'कचरा प्रबंधन',
        Environment_and_Climate: 'पर्यावरण और जलवायु',
      }

      return hindiCategories[category] || category
    }

    return category
  }

  const getDisplayTitle = (challenge) => {
    if (language === 'hi') {
      return (
        challenge.title_hi ||
        challenge.title ||
        t('problemNumber')
      )
    }

    return (
      challenge.title_en ||
      challenge.title ||
      t('problemNumber')
    )
  }

  const getDisplayDescription = (challenge) => {
    if (language === 'hi') {
      return (
        challenge.description_hi ||
        challenge.description ||
        ''
      )
    }

    return (
      challenge.description_en ||
      challenge.description ||
      ''
    )
  }

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

    if (
      status === 'RESOLVED' ||
      status === 'COMPLETED'
    ) {
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

      const searchableText = [
        challenge.title,
        challenge.title_en,
        challenge.title_hi,
        challenge.description,
        challenge.description_en,
        challenge.description_hi,
        challenge.district,
        challenge.block,
        challenge.locality,
        challenge.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchSearch =
        !searchText ||
        searchableText.includes(searchText)

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
            {t('citizen')}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {t('myProblems')}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {t('myProblemsDescription')}
          </p>

        </div>

        <Link to="/citizen/challenges/new">

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('reportProblem')}
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
                {t('beingWorkedOn')}
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
                {t('resolved')}
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
                {t('highPriority')}
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
        title={t('findProblem')}
        subtitle={t('findProblemDescription')}
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
              placeholder={t('searchProblemPlaceholder')}
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
                {t('allStatus')}
              </option>

              <option value="OPEN">
                {t('underReview')}
              </option>

              <option value="RESOLVED">
                {t('resolved')}
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
                {t('allCategories')}
              </option>

              {domains.map((domain) => (

                <option
                  key={domain}
                  value={domain}
                >
                  {getCategoryLabel(domain)}
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
                {t('allPriority')}
              </option>

              {priorities.map((priority) => (

                <option
                  key={priority}
                  value={priority}
                >
                  {getPriorityLabel(priority)}
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
            {t('loadingProblems')}
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

              const displayTitle =
                getDisplayTitle(challenge)

              const displayDescription =
                getDisplayDescription(challenge)

              return (

                <div
                  key={challenge.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                        {getCategoryLabel(
                          challenge.category
                        ) ||
                          t('problemReported')}
                      </p>

                      <h2 className="mt-2 text-xl font-semibold text-slate-900">
                        {displayTitle}
                      </h2>

                    </div>


                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        challenge.status === 'RESOLVED' ||
                        challenge.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : challenge.status === 'DEPLOYED'
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

                  {displayDescription && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {displayDescription}
                    </p>
                  )}


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
                        t('locationNotProvided')}
                    </span>

                  </div>


                  {/* SIMPLE PROGRESS */}

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {t('whatHappensNext')}
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
                        {t('submitted')}
                      </span>

                      <span>
                        {t('review')}
                      </span>

                      <span>
                        {t('experts')}
                      </span>

                      <span>
                        {t('solution')}
                      </span>

                      <span>
                        {t('testing')}
                      </span>

                      <span>
                        {t('deployment')}
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
                            : priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {getPriorityLabel(priority)}
                      </span>


                      {challenge.created_at && (

                        <span className="text-xs text-slate-500">

                          {t('reported')}{' '}

                          {new Date(
                            challenge.created_at
                          ).toLocaleDateString(
                            language === 'hi'
                              ? 'hi-IN'
                              : 'en-IN'
                          )}

                        </span>

                      )}

                    </div>


                    <Link
                      to={`/challenges/${challenge.id}`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >

                      {t('viewProgress')}

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
              {t('noProblemsFound')}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {t('noProblemsMatching')}
            </p>

            <Link
              to="/citizen/challenges/new"
              className="mt-5 inline-block"
            >

              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('reportProblem')}
              </Button>

            </Link>

          </div>

        )}

    </div>
  )
}