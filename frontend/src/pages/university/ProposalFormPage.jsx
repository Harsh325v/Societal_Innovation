import { useEffect, useState } from 'react'
import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'

import { challengeService } from '../../services/challengeService'
import { heiService } from '../../services/heiService'
import api from '../../services/api'
import { useTranslation } from '../../i18n/useTranslation'

export default function ProposalFormPage() {
  const { t, language } = useTranslation()

  const { challengeId } = useParams()
  const [searchParams] = useSearchParams()

  const recommendedHeiId =
    searchParams.get('heiId')

  const [challenge, setChallenge] = useState(null)
  const [hei, setHei] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    solution: '',
  })

  const getChallengeTitle = (data) => {
    if (language === 'hi') {
      return (
        data?.title_hi ||
        data?.title_en ||
        data?.title
      )
    }

    return (
      data?.title_en ||
      data?.title ||
      data?.title_hi
    )
  }

  const getChallengeDescription = (data) => {
    if (language === 'hi') {
      return (
        data?.description_hi ||
        data?.description_en ||
        data?.description
      )
    }

    return (
      data?.description_en ||
      data?.description ||
      data?.description_hi
    )
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const userResponse =
          await api.get('/auth/me')

        const user = userResponse.data

        setCurrentUser(user)

        if (!user.hei_id) {
          throw new Error(
            language === 'hi'
              ? 'आपका विश्वविद्यालय खाता किसी HEI से जुड़ा नहीं है।'
              : 'Your university account is not linked to an HEI.'
          )
        }

        const ownHeiId = user.hei_id

        const challengeResponse =
          await challengeService.getChallengeById(
            challengeId
          )

        const challengeData =
          challengeResponse.data

        setChallenge(challengeData)

        const heiResponse =
          await heiService.getHEIById(ownHeiId)

        setHei(heiResponse.data)

        const localizedTitle =
          getChallengeTitle(challengeData)

        const localizedDescription =
          getChallengeDescription(challengeData)

        setForm({
          title:
            language === 'hi'
              ? `समाधान प्रस्ताव: ${localizedTitle}`
              : `Solution proposal for ${localizedTitle}`,
          description:
            localizedDescription || '',
          solution: '',
        })

        if (
          recommendedHeiId &&
          Number(recommendedHeiId) !== Number(ownHeiId)
        ) {
          setError(
            language === 'hi'
              ? 'यह सिफारिश किसी अन्य HEI की है। आप केवल अपने HEI के लिए प्रस्ताव जमा कर सकते हैं।'
              : 'This recommendation belongs to another HEI. You can only submit a proposal for your own HEI.'
          )
        }
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            err.message ||
            t('couldNotLoadProblem')
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [
    challengeId,
    recommendedHeiId,
    language,
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser?.hei_id) {
      setError(
        language === 'hi'
          ? 'आपका विश्वविद्यालय खाता किसी HEI से जुड़ा नहीं है।'
          : 'Your university account is not linked to an HEI.'
      )
      return
    }

    if (
      !form.title.trim() ||
      !form.solution.trim()
    ) {
      setError(
        language === 'hi'
          ? 'कृपया प्रस्ताव का शीर्षक और समाधान भरें।'
          : 'Please fill in the proposal title and solution.'
      )
      return
    }

    setError('')
    setSubmitting(true)

    try {
      await api.post(
        `/proposals/?challenge_id=${challengeId}&hei_id=${currentUser.hei_id}`,
        {
          title: form.title,
          description: form.description,
          proposed_solution: form.solution,
        }
      )

      setSubmitted(true)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          (language === 'hi'
            ? 'प्रस्ताव जमा नहीं किया जा सका।'
            : 'Could not submit the proposal.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          {language === 'hi'
            ? 'प्रस्ताव फ़ॉर्म लोड हो रहा है...'
            : 'Loading proposal form...'}
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">

        <h2 className="text-3xl font-bold text-emerald-900">
          {language === 'hi'
            ? 'प्रस्ताव सफलतापूर्वक जमा किया गया'
            : 'Proposal submitted successfully'}
        </h2>

        <p className="mt-3 text-emerald-700">
          {language === 'hi'
            ? 'आपका प्रस्ताव समीक्षा के लिए बैकएंड में भेज दिया गया है।'
            : 'Your proposal has been submitted to the backend for review.'}
        </p>

        <div className="mt-6 flex justify-center gap-3">

          <Link to="/university/challenges">
            <Button variant="secondary">
              {language === 'hi'
                ? 'समस्याओं पर वापस जाएँ'
                : 'Back to challenges'}
            </Button>
          </Link>

          <Link to="/university/projects">
            <Button>
              {language === 'hi'
                ? 'परियोजनाएँ देखें'
                : 'View projects'}
            </Button>
          </Link>

        </div>
      </div>
    )
  }

  const challengeTitle =
    getChallengeTitle(challenge)

  return (
    <div className="space-y-6">

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {language === 'hi'
            ? 'प्रस्ताव'
            : 'Proposal'}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {language === 'hi'
            ? 'समाधान प्रस्ताव जमा करें'
            : 'Submit a solution proposal'}
        </h1>
      </div>

      <Card
        title={
          language === 'hi'
            ? 'जमा करने का विवरण'
            : 'Submission details'
        }
      >

        <div className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              {t('challenge')}
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {challengeTitle}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {t('challenge')} #{challengeId}
            </p>

          </div>

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              {language === 'hi'
                ? 'आपका HEI'
                : 'Your HEI'}
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {hei?.name ||
                `HEI #${currentUser?.hei_id}`}
            </p>

            {hei && (
              <p className="mt-1 text-sm text-slate-500">
                {hei.district}, {hei.state}
              </p>
            )}

          </div>

        </div>

      </Card>

      <Card
        title={
          language === 'hi'
            ? 'प्रस्ताव का विवरण'
            : 'Proposal details'
        }
      >

        <form
          className="grid gap-5"
          onSubmit={handleSubmit}
        >

          <Input
            label={
              language === 'hi'
                ? 'प्रस्ताव का शीर्षक'
                : 'Proposal title'
            }
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          <label className="block text-sm font-medium text-slate-700">

            <span className="mb-2 block">
              {language === 'hi'
                ? 'समस्या की समझ'
                : 'Problem understanding'}
            </span>

            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

          </label>

          <label className="block text-sm font-medium text-slate-700">

            <span className="mb-2 block">
              {language === 'hi'
                ? 'प्रस्तावित समाधान'
                : 'Proposed solution'}
            </span>

            <textarea
              rows={6}
              value={form.solution}
              onChange={(e) =>
                setForm({
                  ...form,
                  solution: e.target.value,
                })
              }
              placeholder={
                language === 'hi'
                  ? 'बताएं कि आपका विश्वविद्यालय इस समस्या को कैसे हल करने का प्रस्ताव करता है...'
                  : 'Explain how your university proposes to solve this challenge...'
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end">

            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? language === 'hi'
                  ? 'जमा किया जा रहा है...'
                  : 'Submitting...'
                : language === 'hi'
                  ? 'प्रस्ताव जमा करें'
                  : 'Submit proposal'}
            </Button>

          </div>

        </form>

      </Card>

    </div>
  )
}