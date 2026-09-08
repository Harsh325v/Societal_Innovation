import {
  Plus,
  FileText,
  CheckCircle2,
  Clock3,
  ArrowRight,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import api from '../../services/api'

export default function CitizenDashboard() {
  const [challenges, setChallenges] = useState([])
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
            'Could not load your problems.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [])

  const totalChallenges = challenges.length

  const activeChallenges = challenges.filter(
    (challenge) =>
      challenge.status === 'OPEN'
  ).length

  const resolvedChallenges = challenges.filter(
    (challenge) =>
      challenge.status === 'RESOLVED'
  ).length

  const highPriorityChallenges =
    challenges.filter(
      (challenge) =>
        (challenge.priority_score || 0) >= 70
    ).length

  const getPriority = (score) => {
    if (score >= 70) {
      return {
        label: 'High priority',
        className:
          'bg-red-50 text-red-700 border-red-200',
      }
    }

    if (score >= 40) {
      return {
        label: 'Medium priority',
        className:
          'bg-amber-50 text-amber-700 border-amber-200',
      }
    }

    return {
      label: 'Low priority',
      className:
        'bg-slate-50 text-slate-600 border-slate-200',
    }
  }

  const getStatus = (status) => {
    if (status === 'RESOLVED') {
      return {
        label: 'Resolved',
        className:
          'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
      }
    }

    return {
      label: 'Under review',
      className:
        'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock3,
    }
  }

  const getLocation = (challenge) => {
    return [
      challenge.locality,
      challenge.block,
      challenge.district,
    ]
      .filter(Boolean)
      .join(', ')
  }

  const recentChallenges =
    challenges.slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* WELCOME */}

      <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">

        <div className="max-w-2xl">

          <p className="text-sm font-medium text-slate-300">
            Welcome to Sahyog Jharkhand
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Report a problem.
            <br />
            Help improve your community.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Tell us about a problem in your area.
            Sahyog helps connect it with the right
            experts, universities and organisations.
          </p>

          <Link
            to="/citizen/challenges/new"
            className="mt-6 inline-block"
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report a Problem
            </Button>
          </Link>

        </div>

      </div>


      {/* QUICK STATS */}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SimpleStat
            icon={FileText}
            label="Problems reported"
            value={totalChallenges}
          />

          <SimpleStat
            icon={Clock3}
            label="Being worked on"
            value={activeChallenges}
          />

          <SimpleStat
            icon={CheckCircle2}
            label="Resolved"
            value={resolvedChallenges}
          />

          <SimpleStat
            icon={AlertCircle}
            label="High priority"
            value={highPriorityChallenges}
          />

        </div>
      )}


      {/* LOADING */}

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">

          <p className="text-sm text-slate-500">
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


      {/* RECENT PROBLEMS */}

      {!loading && !error && (
        <Card
          title="Your recent problems"
          subtitle="See what is happening with the problems you reported."
        >

          {recentChallenges.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                <FileText className="h-5 w-5 text-slate-500" />

              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                You haven't reported a problem yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                If you notice a problem in your
                village, town or district, report it
                here and Sahyog will help take it
                forward.
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

          ) : (

            <div className="grid gap-4">

              {recentChallenges.map(
                (challenge) => {

                  const priority =
                    getPriority(
                      challenge.priority_score ||
                        0
                    )

                  const status =
                    getStatus(
                      challenge.status
                    )

                  const StatusIcon =
                    status.icon

                  const location =
                    getLocation(challenge)

                  return (
                    <div
                      key={challenge.id}
                      className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                    >

                      {/* TOP */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0">

                          <h3 className="text-lg font-semibold text-slate-900">
                            {challenge.title}
                          </h3>

                          {location && (
                            <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">

                              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                              <span>
                                {location}
                              </span>

                            </div>
                          )}

                        </div>


                        {/* STATUS */}

                        <div
                          className={`flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >

                          <StatusIcon className="h-3.5 w-3.5" />

                          {status.label}

                        </div>

                      </div>


                      {/* DETAILS */}

                      <div className="mt-4 flex flex-wrap gap-2">

                        {challenge.category && (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            {challenge.category}
                          </span>
                        )}

                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${priority.className}`}
                        >
                          {priority.label}
                        </span>

                        {challenge.created_at && (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                            Reported{' '}
                            {new Date(
                              challenge.created_at
                            ).toLocaleDateString()}
                          </span>
                        )}

                      </div>


                      {/* ACTION */}

                      <div className="mt-5 border-t border-slate-100 pt-4">

                        <Link
                          to={`/challenges/${challenge.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
                        >
                          View problem progress

                          <ArrowRight className="h-4 w-4" />

                        </Link>

                      </div>

                    </div>
                  )
                }
              )}

            </div>

          )}

          {/* VIEW ALL */}

          {challenges.length > 4 && (
            <div className="mt-5 border-t border-slate-100 pt-5">

              <Link
                to="/citizen/challenges"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                View all my problems

                <ArrowRight className="h-4 w-4" />

              </Link>

            </div>
          )}

        </Card>
      )}


      {/* HOW SAHYOG WORKS */}

      {!loading && !error && (
        <Card
          title="How Sahyog works"
          subtitle="Your problem doesn't stop after you report it."
        >

          <div className="grid gap-4 md:grid-cols-3">

            <HowItWorks
              number="1"
              title="You report"
              description="Tell us about a problem in your area."
            />

            <HowItWorks
              number="2"
              title="Sahyog connects"
              description="The problem is matched with suitable experts and organisations."
            />

            <HowItWorks
              number="3"
              title="A solution is developed"
              description="Experts work towards research, testing and real-world deployment."
            />

          </div>

        </Card>
      )}

    </div>
  )
}


/* ---------------------------------------
   SIMPLE STAT
--------------------------------------- */

function SimpleStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

          <Icon className="h-5 w-5 text-slate-600" />

        </div>

        <div>

          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  )
}


/* ---------------------------------------
   HOW IT WORKS
--------------------------------------- */

function HowItWorks({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">

        {number}

      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  )
}