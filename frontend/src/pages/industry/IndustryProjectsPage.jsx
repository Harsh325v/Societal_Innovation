import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2 } from 'lucide-react'

import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { industryService } from '../../services/industryService'

export default function IndustryProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // get the real projects from our backend
        const response = await industryService.getProjects()
        setProjects(response.data)
      } catch (err) {
        console.error(err)
        setError(
          err.response?.data?.detail ||
            'Could not load projects.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          Loading projects...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Industry discovery
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Relevant projects
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Explore active university projects and find
          opportunities for industry collaboration.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card title="No projects available">
          <p className="text-sm text-slate-500">
            There are no active projects available for
            collaboration yet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    Project #{project.id}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    {project.title}
                  </h2>
                </div>

                <Badge status={project.status} />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {project.description}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <Building2 className="h-4 w-4" />
                    HEI
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    HEI #{project.hei_id}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    Challenge
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    #{project.challenge_id}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Link
                  to={`/projects/${project.id}/collaborate`}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  View & collaborate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}