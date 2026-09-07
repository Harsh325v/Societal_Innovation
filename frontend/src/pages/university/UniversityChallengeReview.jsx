import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'

import { challengeService } from '../../services/challengeService'
import { heiService } from '../../services/heiService'
import { proposalService } from '../../services/proposalService'

export default function UniversityChallengeReview() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [matches, setMatches] = useState([])
  const [heis, setHeis] = useState({})
  const [proposals, setProposals] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approvingProposal, setApprovingProposal] =
    useState(null)

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        // get the real challenge + AI analysis + HEI matches
        const [
          challengeResponse,
          analysisResponse,
          matchesResponse,
        ] = await Promise.all([
          challengeService.getChallengeById(id),
          challengeService.getAIAnalysis(id),
          challengeService.getHEIMatches(id),
        ])

        setChallenge(challengeResponse.data)
        setAnalysis(analysisResponse.data)
        setMatches(matchesResponse.data)

        // get proposals submitted for this challenge
        try {
          const proposalResponse =
            await proposalService.getChallengeProposals(id)

          setProposals(proposalResponse.data)
        } catch (err) {
          console.error(
            'Could not load proposals:',
            err
          )
        }

        // get the actual HEI details for every recommendation
        const heiData = {}

        await Promise.all(
          matchesResponse.data.map(async (match) => {
            try {
              const response =
                await heiService.getHEIById(match.hei_id)

              heiData[match.hei_id] = response.data
            } catch (err) {
              console.error(
                `Could not load HEI ${match.hei_id}`,
                err
              )
            }
          })
        )

        setHeis(heiData)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            'Could not load challenge details.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenge()
  }, [id])

  const handleApproveProposal = async (proposalId) => {
    try {
      setApprovingProposal(proposalId)
      setError('')

      // approve the proposal and let the backend create the project
      const response =
        await proposalService.approveProposal(
          proposalId
        )

      // take us directly to the newly created project
      navigate(
        `/projects/${response.data.project_id}`
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Could not approve the proposal.'
      )
    } finally {
      setApprovingProposal(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          Loading challenge...
        </p>
      </div>
    )
  }

  if (error && !challenge) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!challenge) {
    return null
  }

  let priority = 'Low'

  if (challenge.priority_score >= 70) {
    priority = 'High'
  } else if (challenge.priority_score >= 40) {
    priority = 'Medium'
  }

  return (
    <div className="space-y-6">

      {/* challenge heading */}
      <div className="flex items-center justify-between gap-4">

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Challenge review
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {challenge.title}
          </h1>
        </div>

        <Badge status={challenge.status} />

      </div>

      {/* challenge details */}
      <Card title="Challenge details">

        <div className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Category
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              {challenge.category || 'Not classified'}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Priority
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              {priority} ({challenge.priority_score}/100)
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Challenge ID
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              #{challenge.id}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Submitted
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-900">
              {new Date(
                challenge.created_at
              ).toLocaleDateString()}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Problem summary
            </div>

            <div className="mt-2 text-base leading-7 text-slate-700">
              {challenge.description}
            </div>
          </div>

        </div>

      </Card>

      {/* AI analysis */}
      {analysis && (
        <Card title="AI recommendation explanation">

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-900">

            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4" />
              AI assessment
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">

              <div>
                <p className="text-xs uppercase tracking-wider text-violet-600">
                  Category confidence
                </p>

                <p className="mt-1 text-lg font-bold">
                  {(
                    analysis.category_confidence * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-violet-600">
                  Priority score
                </p>

                <p className="mt-1 text-lg font-bold">
                  {analysis.priority_score}/100
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-violet-600">
                  Duplicate check
                </p>

                <p className="mt-1 text-lg font-bold">
                  {analysis.is_duplicate
                    ? 'Possible duplicate'
                    : 'No duplicate'}
                </p>
              </div>

            </div>

          </div>

        </Card>
      )}

      {/* matched HEIs */}
      <Card title="Recommended HEIs">

        {matches.length === 0 ? (
          <p className="text-sm text-slate-500">
            No HEI matches were found for this challenge.
          </p>
        ) : (
          <div className="space-y-4">

            {matches.map((match) => {
              const hei = heis[match.hei_id]

              return (
                <div
                  key={match.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        Match #{match.rank}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {hei?.name ||
                          `HEI #${match.hei_id}`}
                      </h3>

                      {hei && (
                        <p className="mt-1 text-sm text-slate-500">
                          {hei.district},{' '}
                          {hei.state}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-900">
                      {match.match_score}/100
                    </div>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {match.match_reason}
                  </p>

                  <div className="mt-4">
                    <Link
                      to={`/university/proposals/new/${challenge.id}?heiId=${match.hei_id}`}
                    >
                      <Button variant="secondary">
                        Submit proposal to this HEI
                      </Button>
                    </Link>
                  </div>

                </div>
              )
            })}

          </div>
        )}

      </Card>

      {/* submitted proposals */}
      <Card title="Submitted proposals">

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm text-slate-500">
              No proposals have been submitted for this challenge yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {proposals.map((proposal) => {

              const proposalHei =
                heis[proposal.hei_id]

              const alreadyApproved =
                proposal.status === 'APPROVED'

              return (
                <div
                  key={proposal.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        Proposal #{proposal.id}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {proposal.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {proposalHei?.name ||
                          `HEI #${proposal.hei_id}`}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                        alreadyApproved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {proposal.status}
                    </span>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {proposal.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">

                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      Proposed solution
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {proposal.proposed_solution}
                    </p>

                  </div>

                  {!alreadyApproved && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      <Button
                        disabled={
                          approvingProposal !== null
                        }
                        onClick={() =>
                          handleApproveProposal(
                            proposal.id
                          )
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />

                        {approvingProposal ===
                        proposal.id
                          ? 'Approving...'
                          : 'Approve & create project'}
                      </Button>

                      <Button
                        variant="outline"
                        disabled={
                          approvingProposal !== null
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>

                    </div>
                  )}

                </div>
              )
            })}

          </div>
        )}

      </Card>

    </div>
  )
}