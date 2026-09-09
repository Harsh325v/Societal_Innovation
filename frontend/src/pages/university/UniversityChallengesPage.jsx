import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { challengeService } from '../../services/challengeService'
import { useTranslation } from '../../i18n/useTranslation'

export default function UniversityChallengesPage() {
  const { t, language } = useTranslation()

  const [filters, setFilters] = useState({
    domain: 'all',
    priority: 'all',
  })

  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response =
          await challengeService.getChallenges()

        setChallenges(response.data)
      } catch (err) {
        console.error(err)

        setError(
          err.response?.data?.detail ||
            t('couldNotLoadProblems')
        )
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [t])

  const getChallengeTitle = (challenge) => {
    if (language === 'hi') {
      return (
        challenge.title_hi ||
        challenge.title_en ||
        challenge.title
      )
    }

    return (
      challenge.title_en ||
      challenge.title ||
      challenge.title_hi
    )
  }

  const getCategoryLabel = (category) => {
    if (!category) return t('other')

    const hindiCategories = {
      'Water Management': 'जल प्रबंधन',
      Healthcare: 'स्वास्थ्य सेवा',
      Agriculture: 'कृषि',
      Education: 'शिक्षा',
      Environment: 'पर्यावरण',
      Energy: 'ऊर्जा',
      Infrastructure: 'बुनियादी ढाँचा',
      Sanitation: 'स्वच्छता',
      Transport: 'परिवहन',
      Waste: 'कचरा प्रबंधन',
    }

    if (language === 'hi') {
      return hindiCategories[category] || category
    }

    return category
  }

  const getPriorityLabel = (priority) => {
    if (language === 'hi') {
      const labels = {
        High: 'उच्च',
        Medium: 'मध्यम',
        Low: 'कम',
      }

      return labels[priority] || priority
    }

    return priority
  }

  const getPriority = (score) => {
    if (score >= 70) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }

  const filtered = challenges.filter((challenge) => {
    const domainMatch =
      filters.domain === 'all' ||
      challenge.category === filters.domain

    const priority = getPriority(
      challenge.priority_score || 0
    )

    const priorityMatch =
      filters.priority === 'all' ||
      priority === filters.priority

    return domainMatch && priorityMatch
  })

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">
          {t('loading')}
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

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {t('university')}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {t('recommendedMatches')}
          </h1>
        </div>
      </div>

      <Card title={t('search')}>
        <div className="grid gap-4 md:grid-cols-2">

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={filters.domain}
            onChange={(e) =>
              setFilters({
                ...filters,
                domain: e.target.value,
              })
            }
          >
            <option value="all">
              {language === 'hi'
                ? 'सभी डोमेन'
                : 'All domains'}
            </option>

            <option value="Water Management">
              {getCategoryLabel('Water Management')}
            </option>

            <option value="Healthcare">
              {getCategoryLabel('Healthcare')}
            </option>

            <option value="Agriculture">
              {getCategoryLabel('Agriculture')}
            </option>

            <option value="Education">
              {getCategoryLabel('Education')}
            </option>

            <option value="Environment">
              {getCategoryLabel('Environment')}
            </option>
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={filters.priority}
            onChange={(e) =>
              setFilters({
                ...filters,
                priority: e.target.value,
              })
            }
          >
            <option value="all">
              {language === 'hi'
                ? 'सभी प्राथमिकताएँ'
                : 'All priority'}
            </option>

            <option value="High">
              {language === 'hi' ? 'उच्च' : 'High'}
            </option>

            <option value="Medium">
              {language === 'hi'
                ? 'मध्यम'
                : 'Medium'}
            </option>

            <option value="Low">
              {language === 'hi' ? 'कम' : 'Low'}
            </option>
          </select>

        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">

        {filtered.map((challenge) => {
          const priority = getPriority(
            challenge.priority_score || 0
          )

          return (
            <div
              key={challenge.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">

                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    {getCategoryLabel(challenge.category)}
                  </div>

                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {getChallengeTitle(challenge)}
                  </h3>
                </div>

                <Badge status={challenge.status} />

              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600">

                <div>
                  {t('priority')}:{' '}
                  {getPriorityLabel(priority)} (
                  {challenge.priority_score}/100)
                </div>

                <div>
                  {t('challenge')} #{challenge.id}
                </div>

                <div>
                  {language === 'hi'
                    ? 'तारीख'
                    : 'Date'}
                  :{' '}
                  {new Date(
                    challenge.created_at
                  ).toLocaleDateString(
                    language === 'hi'
                      ? 'hi-IN'
                      : 'en-IN'
                  )}
                </div>

              </div>

              <div className="mt-5 flex justify-end">
                <Link
                  to={`/university/challenges/${challenge.id}`}
                >
                  <Button variant="secondary">
                    {t('viewProgress')}
                  </Button>
                </Link>
              </div>

            </div>
          )
        })}

      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            {language === 'hi'
              ? 'चयनित फ़िल्टर से कोई समस्या मेल नहीं खाती।'
              : 'No challenges match the selected filters.'}
          </p>
        </div>
      )}

    </div>
  )
}