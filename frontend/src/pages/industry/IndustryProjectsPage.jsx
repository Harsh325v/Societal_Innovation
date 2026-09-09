import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2 } from 'lucide-react'

import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { industryService } from '../../services/industryService'
import { useTranslation } from '../../i18n/useTranslation'

export default function IndustryProjectsPage() {
  const { t, language } = useTranslation()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Get the real projects from our backend
        const response = await industryService.getProjects()
        setProjects(response.data)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            t('couldNotLoadProjects')
        )
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [language])

  const getProjectTitle = (project) => {
    if (language === 'hi') {
      return (
        project.title_hi ||
        project.title ||
        t('project')
      )
    }

    return (
      project.title_en ||
      project.title ||
      t('project')
    )
  }

  const getProjectDescription = (project) => {
    if (language === 'hi') {
      return (
        project.description_hi ||
        project.description ||
        ''
      )
    }

    return (
      project.description_en ||
      project.description ||
      ''
    )
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          {t('loadingProjects')}
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

      {/* PAGE HEADING */}

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {language === 'hi'
            ? 'उद्योग परियोजना खोज'
            : 'Industry discovery'}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {language === 'hi'
            ? 'प्रासंगिक परियोजनाएँ'
            : 'Relevant projects'}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {language === 'hi'
            ? 'सक्रिय विश्वविद्यालय परियोजनाओं को देखें और उद्योग सहयोग के अवसर खोजें।'
            : 'Explore active university projects and find opportunities for industry collaboration.'}
        </p>
      </div>

      {/* NO PROJECTS */}

      {projects.length === 0 ? (

        <Card
          title={
            language === 'hi'
              ? 'कोई परियोजना उपलब्ध नहीं है'
              : 'No projects available'
          }
        >
          <p className="text-sm text-slate-500">
            {language === 'hi'
              ? 'सहयोग के लिए अभी कोई सक्रिय परियोजना उपलब्ध नहीं है।'
              : 'There are no active projects available for collaboration yet.'}
          </p>
        </Card>

      ) : (

        <div className="grid gap-5 lg:grid-cols-2">

          {projects.map((project) => (

            <Card key={project.id}>

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    {t('project')} #{project.id}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    {getProjectTitle(project)}
                  </h2>

                </div>

                <Badge status={project.status} />

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {getProjectDescription(project)}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {/* HEI */}

                <div className="rounded-xl bg-slate-50 p-3">

                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-500">

                    <Building2 className="h-4 w-4" />

                    {t('hei')}

                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {t('hei')} #{project.hei_id}
                  </p>

                </div>

                {/* CHALLENGE */}

                <div className="rounded-xl bg-slate-50 p-3">

                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t('challenge')}
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    #{project.challenge_id}
                  </p>

                </div>

              </div>

              {/* COLLABORATE */}

              <div className="mt-5 flex justify-end">

                <Link
                  to={`/projects/${project.id}/collaborate`}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {language === 'hi'
                    ? 'देखें और सहयोग करें'
                    : 'View & collaborate'}

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