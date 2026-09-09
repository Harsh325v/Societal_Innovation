import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  FileText,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Clock3,
  ArrowLeft,
  Users,
  Building2,
  AlertCircle,
  Microscope,
} from 'lucide-react'

import Badge from '../../components/common/Badge'
import Card from '../../components/common/Card'
import { challengeService } from '../../services/challengeService'
import { heiService } from '../../services/heiService'
import { useTranslation } from '../../i18n/useTranslation'

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const { t, language } = useTranslation()

  const [challenge, setChallenge] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [heiMatches, setHeiMatches] = useState([])
  const [heiDetails, setHeiDetails] = useState({})
  const [facultyMatches, setFacultyMatches] = useState([])
  const [scientistReviews, setScientistReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setLoading(true)
        setError('')

        const challengeResponse =
          await challengeService.getChallengeById(id)

        const aiResponse =
          await challengeService.getAIAnalysis(id)

        const matchesResponse =
          await challengeService.getHEIMatches(id)

        const facultyResponse =
          await challengeService.getFacultyMatches(id)

        const scientistResponse = await fetch(
          `http://127.0.0.1:8000/api/v1/scientist-reviews/challenge/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )

        const challengeData = challengeResponse.data
        const heiMatchData = matchesResponse.data || []
        const facultyMatchData = facultyResponse.data || []

        const scientistReviewData = scientistResponse.ok
          ? await scientistResponse.json()
          : []

        setChallenge(challengeData)
        setAiAnalysis(aiResponse.data)
        setHeiMatches(heiMatchData)
        setFacultyMatches(facultyMatchData)

        setScientistReviews(
          Array.isArray(scientistReviewData)
            ? scientistReviewData
            : []
        )

        const details = {}

        await Promise.all(
          heiMatchData.map(async (match) => {
            try {
              const heiResponse =
                await heiService.getHEIById(match.hei_id)

              details[match.hei_id] = heiResponse.data
            } catch (err) {
              console.error(
                `Could not load HEI ${match.hei_id}`,
                err
              )
            }
          })
        )

        setHeiDetails(details)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            t('couldNotLoadProblem') ||
            'Could not load problem details.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenge()
  }, [id])

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

    return (
      labels[status] ||
      String(status || '')
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    )
  }

  const getProgress = () => {
    const status = challenge?.status

    if (status === 'RESOLVED' || status === 'COMPLETED') return 6
    if (status === 'DEPLOYED') return 5
    if (status === 'PILOT') return 4
    if (status === 'TESTING') return 3

    if (
      status === 'PROTOTYPE' ||
      status === 'IN_PROGRESS'
    ) {
      return 2
    }

    if (facultyMatches.length > 0) return 2
    if (heiMatches.length > 0) return 1

    return 0
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          {t('loadingProblems') || 'Loading your problem...'}
        </p>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">
          {error || t('problemNotFound') || 'Problem not found.'}
        </p>
      </div>
    )
  }

  const progress = getProgress()

  const priorityScore =
    aiAnalysis?.priority_score ??
    challenge.priority_score ??
    0

  const priority =
    priorityScore >= 70
      ? t('highPriority')
      : priorityScore >= 40
        ? t('mediumPriority')
        : t('lowPriority')

  const displayTitle =
    language === 'hi'
      ? challenge.title_hi || challenge.title
      : challenge.title_en || challenge.title

  const displayDescription =
    language === 'hi'
      ? challenge.description_hi || challenge.description
      : challenge.description_en || challenge.description

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        to="/citizen/challenges"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToMyProblems') || 'Back to My Problems'}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {t('reportedProblem') || 'Your reported problem'}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {displayTitle}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {t('problemNumber') || 'Problem'} #{challenge.id}
          </p>
        </div>

        <span className="w-fit">
          <Badge status={challenge.status} />
        </span>
      </div>

      <Card
        title={t('whatHappensNext')}
        subtitle={
          t('journeyDescription') ||
          'We will update this journey as your problem moves forward.'
        }
      >
        <div className="space-y-6">
          <div className="space-y-5">
            <ProgressStep
              completed={progress >= 0}
              active={progress === 0}
              icon={FileText}
              title={t('problemSubmitted') || 'Problem submitted'}
              description={
                t('problemReceived') ||
                'Your problem has been received by Sahyog.'
              }
            />

            <ProgressStep
              completed={progress >= 1}
              active={progress === 1}
              icon={Building2}
              title={t('universityMatching')}
              description={
                heiMatches.length > 0
                  ? language === 'hi'
                    ? `${heiMatches.length} उपयुक्त विश्वविद्यालय मिले।`
                    : `${heiMatches.length} suitable university recommendation${
                        heiMatches.length > 1 ? 's' : ''
                      } found.`
                  : t('lookingForUniversities') ||
                    'Sahyog is looking for suitable universities.'
              }
            />

            <ProgressStep
              completed={progress >= 2}
              active={progress === 2}
              icon={UserCheck}
              title={t('expertMatching') || 'Expert matching'}
              description={
                facultyMatches.length > 0
                  ? language === 'hi'
                    ? `${facultyMatches.length} उपयुक्त विशेषज्ञ मिले।`
                    : `${facultyMatches.length} suitable faculty member${
                        facultyMatches.length > 1 ? 's' : ''
                      } found.`
                  : t('expertsCanBeIdentified') ||
                    'Suitable experts can be identified based on the problem.'
              }
            />

            <ProgressStep
              completed={progress >= 3}
              active={progress === 3}
              icon={Sparkles}
              title={t('solutionDevelopment') || 'Solution development'}
              description={
                t('solutionDevelopmentDescription') ||
                'The problem can move into research and solution development.'
              }
            />

            <ProgressStep
              completed={progress >= 4}
              active={progress === 4}
              icon={Clock3}
              title={t('testingPilot') || 'Testing / pilot'}
              description={
                t('testingPilotDescription') ||
                'The solution is tested before wider deployment.'
              }
            />

            <ProgressStep
              completed={progress >= 5}
              active={progress === 5}
              icon={MapPin}
              title={t('deployment')}
              description={
                t('deploymentDescription') ||
                'The solution reaches the community.'
              }
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {t('status')}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {getStatusLabel(challenge.status)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title={t('whatYouReported') || 'What you reported'}>
          <div className="space-y-5">
            <p className="text-sm leading-7 text-slate-600">
              {displayDescription}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailBox
                label={t('category')}
                value={
                  challenge.category ||
                  t('beingAnalyzed') ||
                  'Being analyzed'
                }
              />

              <DetailBox
                label={t('priority')}
                value={`${priority} (${Math.round(
                  priorityScore
                )}/100)`}
              />

              <DetailBox
                label={t('reportedOn') || 'Reported on'}
                value={
                  challenge.created_at
                    ? new Date(
                        challenge.created_at
                      ).toLocaleDateString(
                        language === 'hi' ? 'hi-IN' : 'en-IN'
                      )
                    : 'N/A'
                }
              />

              <DetailBox
                label={t('peopleAffected')}
                value={
                  challenge.people_affected ??
                  (t('notProvided') || 'Not provided')
                }
              />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin className="h-4 w-4" />
                {t('location')}
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {[
                  challenge.locality,
                  challenge.block,
                  challenge.district,
                ]
                  .filter(Boolean)
                  .join(', ') ||
                  t('locationNotProvided')}
              </p>
            </div>
          </div>
        </Card>

        <Card title={t('sahyogAnalysis') || 'Sahyog analysis'}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Sparkles className="h-4 w-4" />
                {t('category')}
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {aiAnalysis?.category ||
                  challenge.category ||
                  t('beingAnalyzed') ||
                  'Being analyzed'}
              </p>

              {aiAnalysis?.category_confidence != null && (
                <p className="mt-1 text-xs text-slate-500">
                  {t('confidence') || 'Confidence'}:{' '}
                  {Math.round(
                    aiAnalysis.category_confidence * 100
                  )}
                  %
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4" />
                {t('priority')}
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {priority}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {t('aiPriorityScore') || 'AI priority score'}:{' '}
                {Math.round(priorityScore)}/100
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Sparkles className="h-4 w-4" />
                {t('duplicateCheck') || 'Duplicate check'}
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {aiAnalysis?.is_duplicate
                  ? t('similarProblemFound') ||
                    'Similar problem found'
                  : t('noDuplicateFound') ||
                    'No duplicate found'}
              </p>

              {aiAnalysis?.duplicate_score != null && (
                <p className="mt-1 text-xs text-slate-500">
                  {t('similarity') || 'Similarity'}:{' '}
                  {aiAnalysis.duplicate_score}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card
        title={t('universitiesThatMayHelp') || 'Universities that may help'}
        subtitle={
          t('universitiesDescription') ||
          'Sahyog looks for institutions with relevant expertise and resources.'
        }
      >
        {heiMatches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <Building2 className="mx-auto h-7 w-7 text-slate-400" />

            <p className="mt-3 text-sm text-slate-500">
              {t('universityMatchingUnavailable') ||
                'University matching information is not available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {heiMatches.map((match) => {
              const hei = heiDetails[match.hei_id]

              return (
                <div
                  key={match.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {hei?.name ||
                        `${t('university') || 'University'} #${
                          match.hei_id
                        }`}
                    </h3>

                    <span className="w-fit rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                      {match.match_score}% {t('match') || 'match'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {t('whyThisUniversity') ||
                        'Why this university?'}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {match.match_reason ||
                        t('matchedBasedOnExpertise') ||
                        'Matched based on expertise and available resources.'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card
        title={t('expertsWhoMayHelp') || 'Experts who may help'}
        subtitle={
          t('expertsDescription') ||
          'Faculty are matched using expertise, department, research areas and location.'
        }
      >
        {facultyMatches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <Users className="mx-auto h-7 w-7 text-slate-400" />

            <p className="mt-3 text-sm text-slate-500">
              {t('noFacultyMatches') ||
                'No faculty matches are available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {facultyMatches.map((faculty) => (
              <div
                key={faculty.faculty_id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {faculty.faculty_name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {faculty.designation ||
                        t('faculty') ||
                        'Faculty'}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                    {faculty.match_score}%
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-800">
                      {t('university')}:
                    </span>{' '}
                    {faculty.hei_name || 'N/A'}
                  </p>

                  <p>
                    <span className="font-medium text-slate-800">
                      {t('department') || 'Department'}:
                    </span>{' '}
                    {faculty.department_name || 'N/A'}
                  </p>
                </div>

                {faculty.match_reason && (
                  <div className="mt-4 rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {t('whyThisExpert') ||
                        'Why this expert?'}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {faculty.match_reason}
                    </p>
                  </div>
                )}

                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {t('recommendationRank') ||
                    'Recommendation rank'}{' '}
                  #{faculty.rank}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title={t('scientistReview')}
        subtitle={
          t('scientistReviewDescription') ||
          'Scientists can provide expert observations and recommendations for reported problems.'
        }
      >
        {scientistReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <Microscope className="mx-auto h-7 w-7 text-slate-400" />

            <p className="mt-3 text-sm text-slate-500">
              {t('noScientificReview') ||
                'No scientific expert review is available yet.'}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {t('scientistCanReview') ||
                'A scientist can review this problem and provide a recommendation.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scientistReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                      <Microscope className="h-5 w-5 text-indigo-700" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {t('scientificExpert') ||
                          'Scientific Expert'}
                      </p>

                      {review.expertise_area && (
                        <p className="text-xs text-slate-500">
                          {review.expertise_area}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
                    {Math.round(
                      review.confidence * 100
                    )}
                    % {t('confidence') || 'confidence'}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {t('observation') || 'Observation'}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {review.observation}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {t('recommendation') ||
                      'Recommendation'}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {review.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={t('needHelp') || 'Need help?'}>
        <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {t('haveQuestion') ||
                'Have a question about your problem?'}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t('assistantHelpDescription') ||
                'The Sahyog Assistant will help you understand the reporting and solution process.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new Event('open-sahyog-chat')
              )
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            {t('askSahyog')}
          </button>
        </div>
      </Card>
    </div>
  )
}

function ProgressStep({
  completed,
  active,
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            completed
              ? 'bg-slate-900 text-white'
              : active
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-400'
          }`}
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="pb-5">
        <p
          className={`font-semibold ${
            active
              ? 'text-slate-900'
              : 'text-slate-700'
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <span className="block text-xs uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>

      <span className="mt-2 block text-base font-semibold text-slate-900">
        {value}
      </span>
    </div>
  )
}