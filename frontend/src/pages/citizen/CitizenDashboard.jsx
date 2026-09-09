import {
  Plus,
  FileText,
  CheckCircle2,
  Clock3,
  ArrowRight,
  MapPin,
  AlertCircle,
  Bell,
  MessageSquare,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import api from '../../services/api'
import { useTranslation } from '../../i18n/useTranslation'

export default function CitizenDashboard() {
  const { t, language } = useTranslation()

  const [challenges, setChallenges] = useState([])
  const [notifications, setNotifications] = useState([])

  const [loading, setLoading] = useState(true)
  const [notificationsLoading, setNotificationsLoading] =
    useState(true)

  const [error, setError] = useState('')
  const [notificationsError, setNotificationsError] =
    useState('')

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

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true)
        setNotificationsError('')

        const response = await api.get(
          '/sms-notifications/me'
        )

        setNotifications(response.data || [])
      } catch (err) {
        console.error(err)

        setNotificationsError(
          err.response?.data?.detail ||
            (language === 'hi'
              ? 'सूचनाएँ लोड नहीं की जा सकीं।'
              : 'Could not load notifications.')
        )
      } finally {
        setNotificationsLoading(false)
      }
    }

    loadNotifications()
  }, [language])

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

  const getPriority = (score) => {
    if (score >= 70) {
      return {
        label: t('highPriority'),
        className:
          'bg-red-50 text-red-700 border-red-200',
      }
    }

    if (score >= 40) {
      return {
        label: t('mediumPriority'),
        className:
          'bg-amber-50 text-amber-700 border-amber-200',
      }
    }

    return {
      label: t('lowPriority'),
      className:
        'bg-slate-50 text-slate-600 border-slate-200',
    }
  }

  const getStatus = (status) => {
    if (status === 'RESOLVED') {
      return {
        label: t('resolved'),
        className:
          'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle2,
      }
    }

    return {
      label: t('underReview'),
      className:
        'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock3,
    }
  }

  const getCategory = (category) => {
    if (!category) return ''

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
      }

      return hindiCategories[category] || category
    }

    return category
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

  const getNotificationTitle = (type) => {
    if (language === 'hi') {
      if (type === 'PROBLEM_REPORTED') {
        return 'समस्या दर्ज की गई'
      }

      if (type === 'SOLUTION_DEPLOYED') {
        return 'समाधान तैनात किया गया'
      }

      return 'सूचना'
    }

    if (type === 'PROBLEM_REPORTED') {
      return 'Problem Reported'
    }

    if (type === 'SOLUTION_DEPLOYED') {
      return 'Solution Deployed'
    }

    return 'Notification'
  }

  const getNotificationStatus = (sent) => {
    if (sent) {
      return {
        label:
          language === 'hi'
            ? 'भेजा गया'
            : 'Sent',
        className:
          'bg-green-50 text-green-700 border-green-200',
      }
    }

    return {
      label:
        language === 'hi'
          ? 'लंबित'
          : 'Pending',
      className:
        'bg-amber-50 text-amber-700 border-amber-200',
    }
  }

  const recentChallenges = challenges.slice(0, 4)

  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* WELCOME */}

      <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="max-w-2xl">

          <p className="text-sm font-medium text-slate-300">
            {t('welcomeToSahyog')}
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {t('reportProblemHeading')}
            <br />
            {t('helpImproveCommunity')}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            {t('reportProblemDescription')}
          </p>

          <Link
            to="/citizen/challenges/new"
            className="mt-6 inline-block"
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('reportProblem')}
            </Button>
          </Link>

        </div>
      </div>

      {/* QUICK STATS */}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SimpleStat
            icon={FileText}
            label={t('problemsReported')}
            value={totalChallenges}
          />

          <SimpleStat
            icon={Clock3}
            label={t('beingWorkedOn')}
            value={activeChallenges}
          />

          <SimpleStat
            icon={CheckCircle2}
            label={t('resolved')}
            value={resolvedChallenges}
          />

          <SimpleStat
            icon={AlertCircle}
            label={t('highPriority')}
            value={highPriorityChallenges}
          />

        </div>
      )}

      {/* SMS NOTIFICATIONS */}

      <Card
        title={
          language === 'hi'
            ? 'SMS सूचनाएँ'
            : 'SMS Updates'
        }
        subtitle={
          language === 'hi'
            ? 'आपकी समस्या और समाधान से जुड़ी महत्वपूर्ण सूचनाएँ'
            : 'Important updates about your reported problems and solutions'
        }
      >

        {notificationsLoading ? (

          <div className="rounded-2xl border border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500">
              {language === 'hi'
                ? 'सूचनाएँ लोड हो रही हैं...'
                : 'Loading notifications...'}
            </p>
          </div>

        ) : notificationsError ? (

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-600">
              {notificationsError}
            </p>
          </div>

        ) : recentNotifications.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Bell className="h-5 w-5 text-slate-500" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {language === 'hi'
                ? 'अभी कोई सूचना नहीं'
                : 'No notifications yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {language === 'hi'
                ? 'आपकी समस्या की प्रगति होने पर आपको यहाँ अपडेट दिखाई देंगे।'
                : 'You will see updates here as your reported problems progress.'}
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {recentNotifications.map(
              (notification) => {

                const notificationStatus =
                  getNotificationStatus(
                    notification.sent
                  )

                return (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
                  >

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <MessageSquare className="h-5 w-5 text-slate-600" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                          <h3 className="font-semibold text-slate-900">
                            {getNotificationTitle(
                              notification.notification_type
                            )}
                          </h3>

                          <span
                            className={`w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${notificationStatus.className}`}
                          >
                            {notificationStatus.label}
                          </span>

                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>

                        {notification.created_at && (
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(
                              notification.created_at
                            ).toLocaleString(
                              language === 'hi'
                                ? 'hi-IN'
                                : 'en-IN'
                            )}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                )
              }
            )}

          </div>
        )}

      </Card>

      {/* LOADING */}

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
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

      {/* RECENT PROBLEMS */}

      {!loading && !error && (
        <Card
          title={t('yourRecentProblems')}
          subtitle={t('recentProblemsSubtitle')}
        >

          {recentChallenges.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {t('noProblemsReported')}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {t('noProblemsDescription')}
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

          ) : (

            <div className="grid gap-4">

              {recentChallenges.map((challenge) => {

                const priority = getPriority(
                  challenge.priority_score || 0
                )

                const status = getStatus(
                  challenge.status
                )

                const StatusIcon = status.icon

                const location = getLocation(
                  challenge
                )

                const displayTitle =
                  getDisplayTitle(challenge)

                return (
                  <div
                    key={challenge.id}
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <h3 className="text-lg font-semibold text-slate-900">
                          {displayTitle}
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
                          {getCategory(
                            challenge.category
                          )}
                        </span>
                      )}

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>

                      {challenge.created_at && (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">

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

                    {/* ACTION */}

                    <div className="mt-5 border-t border-slate-100 pt-4">

                      <Link
                        to={`/challenges/${challenge.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
                      >

                        {t('viewProblemProgress')}

                        <ArrowRight className="h-4 w-4" />

                      </Link>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

          {/* VIEW ALL */}

          {challenges.length > 4 && (
            <div className="mt-5 border-t border-slate-100 pt-5">

              <Link
                to="/citizen/challenges"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >

                {t('viewAllProblems')}

                <ArrowRight className="h-4 w-4" />

              </Link>

            </div>
          )}

        </Card>
      )}

      {/* HOW SAHYOG WORKS */}

      {!loading && !error && (
        <Card
          title={t('howSahyogWorks')}
          subtitle={t('problemDoesntStop')}
        >

          <div className="grid gap-4 md:grid-cols-3">

            <HowItWorks
              number="1"
              title={t('youReport')}
              description={t('youReportDescription')}
            />

            <HowItWorks
              number="2"
              title={t('sahyogConnects')}
              description={t('sahyogConnectsDescription')}
            />

            <HowItWorks
              number="3"
              title={t('solutionDeveloped')}
              description={t('solutionDevelopedDescription')}
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