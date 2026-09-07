import { useParams, Link } from 'react-router-dom'
import { Building2, Clock3, Users, HandCoins, CheckCircle2 } from 'lucide-react'
import Badge from '../../components/common/Badge'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import { projects } from '../../data/mockData'

export default function ProjectDetailPage({ collaborationMode = false }) {
  const { id } = useParams()
  const project = projects.find((item) => item.id === id) || projects[0]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Project</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={project.status} />
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{project.progress}% complete</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.15em] text-slate-500">University</div><div className="mt-2 text-lg font-semibold text-slate-900">{project.university}</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.15em] text-slate-500">Start date</div><div className="mt-2 text-lg font-semibold text-slate-900">{project.startDate}</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.15em] text-slate-500">Expected completion</div><div className="mt-2 text-lg font-semibold text-slate-900">{project.expectedCompletion}</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.15em] text-slate-500">Industry partner</div><div className="mt-2 text-lg font-semibold text-slate-900">{project.industryPartner}</div></div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Overview">
          <div className="space-y-5">
            <div className="flex items-center justify-between text-sm text-slate-600"><span>Project progress</span><span>{project.progress}%</span></div>
            <ProgressBar value={project.progress} color="bg-emerald-500" />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4"><Users className="h-5 w-5 text-slate-500" /><div className="mt-3 text-sm text-slate-500">Faculty mentor</div><div className="mt-1 font-semibold text-slate-900">Dr. Neelam Sinha</div></div>
              <div className="rounded-2xl border border-slate-200 p-4"><Users className="h-5 w-5 text-slate-500" /><div className="mt-3 text-sm text-slate-500">Project lead</div><div className="mt-1 font-semibold text-slate-900">A. Singh</div></div>
              <div className="rounded-2xl border border-slate-200 p-4"><Building2 className="h-5 w-5 text-slate-500" /><div className="mt-3 text-sm text-slate-500">Students</div><div className="mt-1 font-semibold text-slate-900">7 active</div></div>
            </div>
          </div>
        </Card>

        <Card title="Tabs">
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-slate-900 px-3 py-2 font-medium text-white">Overview</div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">Team</div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">Milestones</div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">Updates</div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">Industry</div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">Outcomes</div>
          </div>
        </Card>
      </div>

      <Card title="Milestones">
        <div className="space-y-4">
          {project.milestones.map((milestone, idx) => (
            <div key={milestone.name} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col items-center">
                <div className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${milestone.status === 'done' ? 'bg-emerald-500 text-white' : milestone.status === 'active' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {milestone.status === 'done' ? '✓' : milestone.status === 'active' ? '→' : '○'}
                </div>
                {idx < project.milestones.length - 1 ? <div className="mt-1 h-10 w-px bg-slate-200" /> : null}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-slate-900">{milestone.name}</div>
                  <span className="text-xs uppercase tracking-[0.15em] text-slate-500">{milestone.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{milestone.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>Due date: {milestone.dueDate}</span>
                  <span>Progress: {milestone.progress}%</span>
                </div>
                <div className="mt-2"><ProgressBar value={milestone.progress} color="bg-cyan-500" /></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {collaborationMode ? (
        <Card title="Offer collaboration">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4"><HandCoins className="h-5 w-5 text-slate-500" /><div className="mt-3 text-sm text-slate-500">Funding</div><div className="mt-1 font-semibold text-slate-900">₹12,00,000</div></div>
              <div className="rounded-2xl border border-slate-200 p-4"><CheckCircle2 className="h-5 w-5 text-slate-500" /><div className="mt-3 text-sm text-slate-500">Support type</div><div className="mt-1 font-semibold text-slate-900">Mentorship, prototyping, testing</div></div>
            </div>
            <textarea rows={5} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800" defaultValue="We can support the project with low-cost sensor kits, prototype testing, and a field deployment plan for a pilot in Ranchi." />
            <div className="flex justify-end"><Link to="/industry/dashboard"><Button>Offer collaboration</Button></Link></div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
