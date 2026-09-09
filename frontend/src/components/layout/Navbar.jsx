import { Menu, Bell, LogOut, Moon, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../i18n/useTranslation'

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, language } = useTranslation()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const roleLabels = {
    CITIZEN: language === 'hi' ? 'नागरिक' : 'Citizen',
    UNIVERSITY: language === 'hi' ? 'विश्वविद्यालय' : 'University',
    HEI_ADMIN: language === 'hi' ? 'विश्वविद्यालय प्रशासक' : 'HEI Admin',
    FACULTY: language === 'hi' ? 'शिक्षक' : 'Faculty',
    STUDENT: language === 'hi' ? 'छात्र' : 'Student',
    INDUSTRY: language === 'hi' ? 'उद्योग' : 'Industry',
    INDUSTRY_ADMIN: language === 'hi' ? 'उद्योग प्रशासक' : 'Industry Admin',
    GOVERNMENT: language === 'hi' ? 'सरकार' : 'Government',
    SCIENTIST: language === 'hi' ? 'वैज्ञानिक' : 'Scientist',
    SUPER_ADMIN: language === 'hi' ? 'सुपर एडमिन' : 'Super Admin',
  }

  const getRoleLabel = (role) => {
    return roleLabels[role] || role
  }

  const nextTheme =
    theme === 'dark'
      ? language === 'hi'
        ? 'लाइट'
        : 'light'
      : language === 'hi'
        ? 'डार्क'
        : 'dark'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-300 p-2 text-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              SJ
            </div>

            <div className="text-base font-bold !text-black">
              Sahyog Jharkhand
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            to="/"
            className="text-sm font-semibold !text-black hover:text-slate-950"
          >
            {language === 'hi' ? 'होम' : 'Home'}
          </Link>

          <Link
            to="/citizen/dashboard"
            className="text-sm font-semibold !text-black hover:text-slate-950"
          >
            {t('citizen')}
          </Link>

          <Link
            to="/university/dashboard"
            className="text-sm font-semibold !text-black hover:text-slate-950"
          >
            {t('university')}
          </Link>

          <Link
            to="/industry/dashboard"
            className="text-sm font-semibold !text-black hover:text-slate-950"
          >
            {language === 'hi' ? 'उद्योग' : 'Industry'}
          </Link>

          <Link
            to="/government/dashboard"
            className="text-sm font-semibold !text-black hover:text-slate-950"
          >
            {language === 'hi' ? 'सरकार' : 'Government'}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              language === 'hi'
                ? `${nextTheme} मोड पर स्विच करें`
                : `Switch to ${nextTheme} mode`
            }
            title={
              language === 'hi'
                ? `${nextTheme} मोड पर स्विच करें`
                : `Switch to ${nextTheme} mode`
            }
            className="rounded-xl border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
            title={language === 'hi' ? 'सूचनाएँ' : 'Notifications'}
          >
            <Bell className="h-4 w-4" />
          </button>

          {user ? (
            <>
              <div className="hidden items-center gap-3 md:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="text-left">
                  <div className="text-sm font-semibold !text-black">
                    {user.username}
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.14em] !text-black">
                    {getRoleLabel(user.role)}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="hidden md:inline-flex"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {language === 'hi' ? 'लॉग आउट' : 'Logout'}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login/citizen">
                <Button variant="secondary" size="sm">
                  {language === 'hi' ? 'लॉगिन' : 'Login'}
                </Button>
              </Link>

              <Link to="/register">
                <Button size="sm">
                  {language === 'hi' ? 'रजिस्टर' : 'Register'}
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}