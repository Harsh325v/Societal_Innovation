import ProjectCard from '../../components/projects/ProjectCard'
import { projects } from '../../data/mockData'

export default function UniversityProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Project portfolio</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Managed initiatives</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  )
}
