import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  ShieldCheck,
  Users,
  MapPinned,
  FolderKanban,
  LogOut,
  Sparkles,
  Microscope,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const menu = {
  CITIZEN: [
    {
      label: 'Dashboard',
      to: '/citizen/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'My Challenges',
      to: '/citizen/challenges',
      icon: FileText,
      end: true,
    },
    {
      label: 'Report Challenge',
      to: '/citizen/challenges/new',
      icon: Sparkles,
      end: true,
    },
  ],

  HEI_ADMIN: [
    {
      label: 'Dashboard',
      to: '/university/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Discover Challenges',
      to: '/university/challenges',
      icon: FileText,
      end: true,
    },
    {
      label: 'Projects',
      to: '/university/projects',
      icon: FolderKanban,
      end: true,
    },
  ],

  FACULTY: [
    {
      label: 'Dashboard',
      to: '/university/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Assigned Projects',
      to: '/university/projects',
      icon: FolderKanban,
      end: true,
    },
    {
      label: 'Students',
      to: '/university/dashboard',
      icon: Users,
      end: true,
    },
  ],

  INDUSTRY_ADMIN: [
    {
      label: 'Dashboard',
      to: '/industry/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Discover Projects',
      to: '/industry/projects',
      icon: BriefcaseBusiness,
      end: true,
    },
  ],

  GOVERNMENT: [
    {
      label: 'Dashboard',
      to: '/government/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Challenges',
      to: '/government/dashboard#challenges',
      icon: FileText,
      section: 'challenges',
    },
    {
      label: 'District Map',
      to: '/government/dashboard#district-map',
      icon: MapPinned,
      section: 'district-map',
    },
    {
      label: 'Impact',
      to: '/government/dashboard#impact',
      icon: ShieldCheck,
      section: 'impact',
    },
  ],

  SCIENTIST: [
    {
      label: 'Dashboard',
      to: '/scientist/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Review Problems',
      to: '/scientist/dashboard',
      icon: Microscope,
      end: true,
    },
  ],
}

export default function Sidebar({ visible, onClose }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const items = user
    ? menu[user.role] || menu.CITIZEN
    : menu.CITIZEN

  const handleSectionClick = (event, item) => {
    if (!item.section) {
      onClose()
      return
    }

    event.preventDefault()

    if (location.pathname !== '/government/dashboard') {
      navigate(`/government/dashboard#${item.section}`)
      onClose()
      return
    }

    window.history.pushState(
      {},
      '',
      `/government/dashboard#${item.section}`
    )

    const section = document.getElementById(item.section)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }

    onClose()
  }

  return (
    <aside
      className={`${
        visible ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-slate-50 p-4 transition-transform lg:translate-x-0 lg:static lg:z-auto`}
    >
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Role Portal
          </h2>
        </div>

        <button
          type="button"
          className="text-sm text-slate-500 lg:hidden"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <nav className="space-y-1">
        {items.map(
          ({
            label,
            to,
            icon: Icon,
            end,
            section,
          }) => {
            const isGovernmentSection =
              user?.role === 'GOVERNMENT' && section

            const isSectionActive =
              isGovernmentSection &&
              location.hash === `#${section}`

            return (
              <NavLink
                key={`${label}-${to}`}
                to={to}
                end={end}
                onClick={(event) => {
                  if (isGovernmentSection) {
                    handleSectionClick(event, {
                      section,
                    })
                  } else {
                    onClose()
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isSectionActive ||
                    (isActive && !isGovernmentSection)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            )
          }
        )}
      </nav>

      {user && (
        <button
          type="button"
          onClick={signOut}
          className="mt-8 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      )}
    </aside>
  )
}