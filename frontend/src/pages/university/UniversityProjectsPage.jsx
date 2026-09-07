import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { projectService } from '../../services/projectService'

export default function UniversityProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // get the real projects from postgres
        const response = await projectService.getProjects()
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
        <p className="text-red-600">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Project portfolio
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Managed initiatives
        </h1>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            No projects have been created yet.
          </p>

          <Link
            to="/university/challenges"
            className="mt-4 inline-block"
          >
            <Button variant="secondary">
              Browse challenges
            </Button>
          </Link>
        </div>
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

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {project.description}
              </p>

              <div className="mt-4 grid gap-2 text-sm text-slate-500">
                <div>
                  Challenge: #{project.challenge_id}
                </div>

                <div>
                  HEI: #{project.hei_id}
                </div>

                {project.start_date && (
                  <div>
                    Started:{' '}
                    {new Date(
                      project.start_date
                    ).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <Link to={`/projects/${project.id}`}>
                  <Button variant="secondary">
                    View project
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}