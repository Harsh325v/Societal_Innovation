import { ArrowRight, Building2, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../common/Badge'
import ProgressBar from '../common/ProgressBar'

export default function ProjectCard({ project }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{project.domain}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{project.name}</h3>
        </div>
        <Badge status={project.status} />
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {project.university}</div>
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Deadline: {project.deadline}</div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm"><span>Progress</span><span>{project.progress}%</span></div>
        <ProgressBar value={project.progress} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm text-slate-500">Industry: {project.industryPartner}</span>
        <Link to={`/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          Open project <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
