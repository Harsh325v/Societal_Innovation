import { MapPin, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../common/Badge'

export default function ChallengeCard({ challenge }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{challenge.domain}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{challenge.title}</h3>
        </div>
        <Badge status={challenge.status} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <MapPin className="h-4 w-4" />
        {challenge.district}, {challenge.block}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Priority: <strong>{challenge.priority}</strong></span>
        <span>{challenge.submittedDate}</span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">AI Match: {challenge.aiAnalysis?.confidence || 92}%</span>
        <Link to={`/challenges/${challenge.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          View details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
