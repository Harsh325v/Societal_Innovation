import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../i18n/useTranslation'

const API = 'http://127.0.0.1:8000'

export default function ScientistDashboard() {
  const { user, token } = useAuth()
  const { t, language } = useTranslation()

  const [challenges, setChallenges] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [reviews, setReviews] = useState([])

  const [observation, setObservation] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [confidence, setConfidence] = useState(0.8)
  const [expertiseArea, setExpertiseArea] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetchChallenges()
    }
  }, [token])

  const getChallengeTitle = (challenge) => {
    if (language === 'hi') {
      return (
        challenge.title_hi ||
        challenge.title_en ||
        challenge.title
      )
    }

    return (
      challenge.title_en ||
      challenge.title
    )
  }

  const getChallengeDescription = (challenge) => {
    if (language === 'hi') {
      return (
        challenge.description_hi ||
        challenge.description_en ||
        challenge.description
      )
    }

    return (
      challenge.description_en ||
      challenge.description
    )
  }

  const getCategoryLabel = (category) => {
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
        Environment_and_Climate:
          'पर्यावरण और जलवायु',
        Other: 'अन्य',
      }

      return (
        hindiCategories[category] ||
        category
      )
    }

    return category
  }

  const getStatusLabel = (status) => {
    const labels = {
      OPEN: t('open'),
      RESOLVED: t('resolved'),
      IN_REVIEW: t('underReview'),
      CLOSED: t('closed'),
    }

    return (
      labels[status] ||
      String(status || '')
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        )
    )
  }

  async function fetchChallenges() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API}/api/v1/challenges`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          t('couldNotLoadProblems')
        )
      }

      const data = await response.json()

      setChallenges(
        Array.isArray(data)
          ? data
          : data.challenges || []
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function selectChallenge(challenge) {
    setSelectedChallenge(challenge)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `${API}/api/v1/scientist-reviews/challenge/${challenge.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setReviews(
          Array.isArray(data) ? data : []
        )
      } else {
        setReviews([])
      }
    } catch {
      setReviews([])
    }
  }

  async function submitReview(e) {
    e.preventDefault()

    if (!selectedChallenge) return

    try {
      setSubmitting(true)
      setMessage('')
      setError('')

      const response = await fetch(
        `${API}/api/v1/scientist-reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            challenge_id: selectedChallenge.id,
            observation,
            recommendation,
            confidence: Number(confidence),
            expertise_area:
              expertiseArea || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            t('failedToSubmitReview')
        )
      }

      setMessage(
        t('expertReviewSubmitted')
      )

      setObservation('')
      setRecommendation('')
      setConfidence(0.8)
      setExpertiseArea('')

      await selectChallenge(
        selectedChallenge
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <section className="rounded-3xl bg-gradient-to-r from-indigo-700 to-blue-600 p-6 text-white shadow-lg">

        <p className="text-sm font-medium opacity-90">
          {t('scientistExpertPanel')}
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          {t('welcome')},{' '}
          {user?.name || t('scientist')} 🔬
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          {t('scientistDashboardDescription')}
        </p>

      </section>


      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            {t('problemsAvailable')}
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {challenges.length}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            {t('selectedProblem')}
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {selectedChallenge ? '1' : '0'}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            {t('reviewsSubmitted')}
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {reviews.filter(
              (review) =>
                review.scientist_id === user?.id
            ).length}
          </p>

        </div>

      </div>


      {/* MESSAGES */}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="grid gap-6 lg:grid-cols-5">

        {/* PROBLEMS */}

        <section className="lg:col-span-2">

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="mb-4">

              <h2 className="text-xl font-bold text-slate-800">
                {t('communityProblems')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('selectProblemToReview')}
              </p>

            </div>

            {loading ? (

              <p className="text-sm text-slate-500">
                {t('loadingProblems')}
              </p>

            ) : challenges.length === 0 ? (

              <div className="rounded-xl bg-slate-50 p-5 text-center">

                <p className="text-sm text-slate-500">
                  {t('noProblemsAvailable')}
                </p>

              </div>

            ) : (

              <div className="max-h-[600px] space-y-3 overflow-y-auto">

                {challenges.map(
                  (challenge) => (

                    <button
                      key={challenge.id}
                      onClick={() =>
                        selectChallenge(
                          challenge
                        )
                      }
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedChallenge?.id ===
                        challenge.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="font-semibold text-slate-800">
                          {getChallengeTitle(
                            challenge
                          )}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          #{challenge.id}
                        </span>

                      </div>

                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                        {getChallengeDescription(
                          challenge
                        )}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {challenge.category && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            {getCategoryLabel(
                              challenge.category
                            )}
                          </span>
                        )}

                        {challenge.district && (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                            📍{' '}
                            {challenge.district}
                          </span>
                        )}

                      </div>

                    </button>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* REVIEW AREA */}

        <section className="lg:col-span-3">

          {!selectedChallenge ? (

            <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm">

              <div>

                <div className="text-5xl">
                  🔬
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-800">
                  {t('selectProblem')}
                </h2>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  {t('selectProblemDescription')}
                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-5">

              {/* SELECTED PROBLEM */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {t('problem')} #
                  {selectedChallenge.id}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-800">
                  {getChallengeTitle(
                    selectedChallenge
                  )}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {getChallengeDescription(
                    selectedChallenge
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {selectedChallenge.category && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {t('domain')}:{' '}
                      {getCategoryLabel(
                        selectedChallenge.category
                      )}
                    </span>
                  )}

                  {selectedChallenge.district && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      📍{' '}
                      {selectedChallenge.district}
                    </span>
                  )}

                  {selectedChallenge.status && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {t('status')}:{' '}
                      {getStatusLabel(
                        selectedChallenge.status
                      )}
                    </span>
                  )}

                </div>

              </div>


              {/* REVIEW FORM */}

              <form
                onSubmit={submitReview}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                <h2 className="text-xl font-bold text-slate-800">
                  {t('submitExpertOpinion')}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t('expertOpinionDescription')}
                </p>

                <div className="mt-5 space-y-4">

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t('expertiseArea')}
                    </label>

                    <input
                      value={expertiseArea}
                      onChange={(e) =>
                        setExpertiseArea(
                          e.target.value
                        )
                      }
                      placeholder={t(
                        'expertiseAreaPlaceholder'
                      )}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t('scientificObservation')}
                    </label>

                    <textarea
                      required
                      value={observation}
                      onChange={(e) =>
                        setObservation(
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder={t(
                        'scientificObservationPlaceholder'
                      )}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t('recommendation')}
                    </label>

                    <textarea
                      required
                      value={recommendation}
                      onChange={(e) =>
                        setRecommendation(
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder={t(
                        'recommendationPlaceholder'
                      )}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                  </div>


                  <div>

                    <div className="flex items-center justify-between">

                      <label className="text-sm font-medium text-slate-700">
                        {t('confidence')}
                      </label>

                      <span className="font-semibold text-indigo-600">
                        {Math.round(
                          confidence * 100
                        )}
                        %
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={confidence}
                      onChange={(e) =>
                        setConfidence(
                          e.target.value
                        )
                      }
                      className="mt-3 w-full"
                    />

                  </div>


                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? t('submitting')
                      : t(
                          'submitScientificReview'
                        )}{' '}
                    {!submitting && '🔬'}
                  </button>

                </div>

              </form>


              {/* PREVIOUS REVIEWS */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <h2 className="text-xl font-bold text-slate-800">
                  {t('expertReviews')}
                </h2>

                {reviews.length === 0 ? (

                  <p className="mt-4 text-sm text-slate-500">
                    {t('noExpertReviews')}
                  </p>

                ) : (

                  <div className="mt-4 space-y-4">

                    {reviews.map(
                      (review) => (

                        <div
                          key={review.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <span className="font-semibold text-slate-800">
                              🔬{' '}
                              {t('scientist')}{' '}
                              #{review.scientist_id}
                            </span>

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                              {Math.round(
                                review.confidence *
                                  100
                              )}
                              % {t('confidence')}
                            </span>

                          </div>

                          {review.expertise_area && (
                            <p className="mt-2 text-xs font-medium text-slate-500">
                              {review.expertise_area}
                            </p>
                          )}

                          <div className="mt-3">

                            <p className="text-xs font-semibold uppercase text-slate-500">
                              {t('observation')}
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {review.observation}
                            </p>

                          </div>

                          <div className="mt-3">

                            <p className="text-xs font-semibold uppercase text-slate-500">
                              {t('recommendation')}
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {review.recommendation}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

          )}

        </section>

      </div>

    </div>
  )
}