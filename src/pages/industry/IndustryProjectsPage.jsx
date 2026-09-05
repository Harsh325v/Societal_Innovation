import { projects } from '../../data/mockData'
import ProjectCard from '../../components/projects/ProjectCard'

export default function IndustryProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Industry discovery</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Relevant projects</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  )
}
