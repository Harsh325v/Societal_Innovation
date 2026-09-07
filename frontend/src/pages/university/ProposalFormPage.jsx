import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import { challengeService } from '../../services/challengeService'
import { heiService } from '../../services/heiService'
import api from '../../services/api'

export default function ProposalFormPage() {
  const { challengeId } = useParams()
  const [searchParams] = useSearchParams()

  // this is only the HEI selected from the recommendation
  const recommendedHeiId = searchParams.get('heiId')

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

  useEffect(() => {
    const loadData = async () => {
      try {
        // get the logged-in university user
        const userResponse = await api.get('/auth/me')
        const user = userResponse.data

        setCurrentUser(user)

        // university users must have an HEI assigned to them
        if (!user.hei_id) {
          throw new Error(
            'Your university account is not linked to an HEI.'
          )
        }

        // use the user's actual HEI instead of trusting the URL
        const ownHeiId = user.hei_id

        // get the real challenge from our backend
        const challengeResponse =
          await challengeService.getChallengeById(challengeId)

        setChallenge(challengeResponse.data)

        // get the logged-in user's HEI details
        const heiResponse =
          await heiService.getHEIById(ownHeiId)

        setHei(heiResponse.data)

        // pre-fill the proposal with the challenge information
        setForm({
          title: `Solution proposal for ${challengeResponse.data.title}`,
          description: challengeResponse.data.description,
          solution: '',
        })

        // warn if the selected recommendation belongs to another HEI
        if (
          recommendedHeiId &&
          Number(recommendedHeiId) !== Number(ownHeiId)
        ) {
          setError(
            'This recommendation belongs to another HEI. You can only submit a proposal for your own HEI.'
          )
        }
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            err.message ||
            'Could not load proposal details.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [challengeId, recommendedHeiId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser?.hei_id) {
      setError(
        'Your university account is not linked to an HEI.'
      )
      return
    }

    if (!form.title.trim() || !form.solution.trim()) {
      setError('Please fill in the proposal title and solution.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      // always submit using the logged-in user's real HEI
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
          'Could not submit the proposal.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          Loading proposal form...
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <h2 className="text-3xl font-bold text-emerald-900">
          Proposal submitted successfully
        </h2>

        <p className="mt-3 text-emerald-700">
          Your proposal has been submitted to the backend for review.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link to="/university/challenges">
            <Button variant="secondary">
              Back to challenges
            </Button>
          </Link>

          <Link to="/university/projects">
            <Button>
              View projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Proposal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Submit a solution proposal
        </h1>
      </div>

      {/* show which challenge and HEI this proposal belongs to */}
      <Card title="Submission details">
        <div className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Challenge
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {challenge?.title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Challenge #{challengeId}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Your HEI
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {hei?.name || `HEI #${currentUser?.hei_id}`}
            </p>

            {hei && (
              <p className="mt-1 text-sm text-slate-500">
                {hei.district}, {hei.state}
              </p>
            )}
          </div>

        </div>
      </Card>

      <Card title="Proposal details">
        <form
          className="grid gap-5"
          onSubmit={handleSubmit}
        >

          <Input
            label="Proposal title"
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
              Problem understanding
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
              Proposed solution
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
              placeholder="Explain how your university proposes to solve this challenge..."
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
                ? 'Submitting...'
                : 'Submit proposal'}
            </Button>
          </div>

        </form>
      </Card>

    </div>
  )
}