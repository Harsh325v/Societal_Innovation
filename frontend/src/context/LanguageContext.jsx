import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sahyog_language') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('sahyog_language', language)
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isHindi: language === 'hi',
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}