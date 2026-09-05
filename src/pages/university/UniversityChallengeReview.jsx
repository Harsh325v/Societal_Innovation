import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { mockChallenges } from '../../data/mockData'

export default function UniversityChallengeReview() {
  const { id } = useParams()
  const challenge = mockChallenges.find((item) => item.id === id) || mockChallenges[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Challenge review</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{challenge.title}</h1>
        </div>
        <Badge status={challenge.status} />
      </div>

      <Card title="Challenge details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">District</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{challenge.district}, {challenge.block}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Priority</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{challenge.priority}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Problem summary</div>
            <div className="mt-2 text-base text-slate-700">{challenge.description}</div>
          </div>
        </div>
      </Card>

      <Card title="AI recommendation explanation">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-900">
          <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4" /> AI assessment</div>
          <p className="mt-3 leading-7">
            This challenge aligns strongly with the university’s water systems and rural infrastructure expertise. The issue shows a clear need for low-cost monitoring, field diagnostics, and scalable implementation support in the target district.
          </p>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Accept Challenge</Button>
        <Button variant="outline"><XCircle className="mr-2 h-4 w-4" /> Reject Challenge</Button>
        <Link to={`/university/proposals/new/${challenge.id}`}><Button variant="secondary"><CheckCircle2 className="mr-2 h-4 w-4" /> Submit Proposal</Button></Link>
      </div>
    </div>
  )
}
