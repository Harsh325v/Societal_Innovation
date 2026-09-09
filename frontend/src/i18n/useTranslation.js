import { useLanguage } from '../context/LanguageContext'
import { translations } from './translations'

const fallbackTranslations = {
  en: {
    backToMyProblems: 'Back to My Problems',
    status: 'Status',
    category: 'Category',
    priority: 'Priority',
    location: 'Location',
    university: 'University',
    department: 'Department',
    experts: 'Experts',
    deployment: 'Deployment',
    confidence: 'Confidence',
    recommendation: 'Recommendation',
    observation: 'Observation',
  },

  hi: {
    backToMyProblems: 'मेरी समस्याओं पर वापस जाएँ',
    status: 'स्थिति',
    category: 'श्रेणी',
    priority: 'प्राथमिकता',
    location: 'स्थान',
    university: 'विश्वविद्यालय',
    department: 'विभाग',
    experts: 'विशेषज्ञ',
    deployment: 'परिनियोजन',
    confidence: 'विश्वास स्तर',
    recommendation: 'सुझाव',
    observation: 'अवलोकन',
  },
}

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key) => {
    return (
      translations[language]?.[key] ||
      translations.en?.[key] ||
      fallbackTranslations[language]?.[key] ||
      fallbackTranslations.en?.[key] ||
      key
    )
  }

  return { t, language }
}