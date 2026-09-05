import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, FileText, Sparkles, UserCheck } from 'lucide-react'
import Badge from '../../components/common/Badge'
import Card from '../../components/common/Card'
import { mockChallenges } from '../../data/mockData'

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const challenge = useMemo(() => mockChallenges.find((item) => item.id === id) || mockChallenges[0], [id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Challenge</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{challenge.title}</h1>
        </div>
        <Badge status={challenge.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Challenge overview">
          <div className="space-y-5 text-sm text-slate-600">
            <p>{challenge.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.15em] text-slate-500">Domain</span><span className="mt-2 block text-base font-semibold text-slate-900">{challenge.domain}</span></div>
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.15em] text-slate-500">Priority</span><span className="mt-2 block text-base font-semibold text-slate-900">{challenge.priority}</span></div>
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.15em] text-slate-500">Location</span><span className="mt-2 block text-base font-semibold text-slate-900">{challenge.district}, {challenge.block}</span></div>
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.15em] text-slate-500">Submitted date</span><span className="mt-2 block text-base font-semibold text-slate-900">{challenge.submittedDate}</span></div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4" /> Location details</div>
              <div className="text-sm text-slate-600">Locality: {challenge.locality}</div>
              <div className="mt-1 text-sm text-slate-600">Latitude: {challenge.location.lat} · Longitude: {challenge.location.lng}</div>
            </div>
          </div>
        </Card>

        <Card title="Evidence">
          <div className="space-y-3 text-sm text-slate-600">
            {challenge.evidence.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><FileText className="h-4 w-4 text-slate-500" /> {item}</div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="AI analysis">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Sparkles className="h-4 w-4" /> Category</div>
            <div className="mt-3 text-xl font-bold text-slate-900">{challenge.aiAnalysis.category}</div>
            <div className="mt-1 text-sm text-slate-600">Confidence: {challenge.aiAnalysis.confidence}%</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><UserCheck className="h-4 w-4" /> Priority</div>
            <div className="mt-3 text-xl font-bold text-slate-900">{challenge.aiAnalysis.priority}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><Sparkles className="h-4 w-4" /> Duplicate status</div>
            <div className="mt-3 text-xl font-bold text-slate-900">{challenge.aiAnalysis.duplicateStatus}</div>
          </div>
        </div>
      </Card>

      <Card title="Recommended universities">
        <div className="grid gap-4 lg:grid-cols-2">
          {challenge.recommendedUniversities.map((university) => (
            <div key={university.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{university.name}</h3>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">Match Score: {university.matchScore}%</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">Why this university?</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {university.expertise.map((item) => (<li key={item}>{item}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
