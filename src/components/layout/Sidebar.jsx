import { LayoutDashboard, FileText, Building2, BriefcaseBusiness, ShieldCheck, Users, MapPinned, FolderKanban, LogOut, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const menu = {
  CITIZEN: [
    { label: 'Dashboard', to: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'My Challenges', to: '/citizen/challenges', icon: FileText, end: true },
    { label: 'Report Challenge', to: '/citizen/challenges/new', icon: Sparkles },
  ],
  HEI_ADMIN: [
    { label: 'Dashboard', to: '/university/dashboard', icon: LayoutDashboard },
    { label: 'Discover Challenges', to: '/university/challenges', icon: FileText },
    { label: 'Projects', to: '/university/projects', icon: FolderKanban },
    { label: 'Proposals', to: '/university/proposals/new/CH-2041', icon: BriefcaseBusiness },
  ],
  FACULTY: [
    { label: 'Assigned Projects', to: '/university/projects', icon: FolderKanban },
    { label: 'Milestones', to: '/projects/PRJ-101', icon: FileText },
    { label: 'Students', to: '/university/dashboard', icon: Users },
  ],
  INDUSTRY: [
    { label: 'Dashboard', to: '/industry/dashboard', icon: LayoutDashboard },
    { label: 'Discover Projects', to: '/industry/projects', icon: BriefcaseBusiness },
    { label: 'Collaborations', to: '/projects/PRJ-101/collaborate', icon: Building2 },
  ],
  GOVERNMENT: [
    { label: 'Dashboard', to: '/government/dashboard', icon: LayoutDashboard },
    { label: 'Challenges', to: '/government/dashboard', icon: FileText },
    { label: 'District Map', to: '/government/dashboard', icon: MapPinned },
    { label: 'Impact', to: '/government/dashboard', icon: ShieldCheck },
  ],
}

export default function Sidebar({ visible, onClose }) {
  const { user, signOut } = useAuth()
  const items = user ? menu[user.role] || menu.CITIZEN : menu.CITIZEN

  return (
    <aside className={`${visible ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-slate-50 p-4 transition-transform lg:translate-x-0 lg:static lg:z-auto`}>
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Role Portal</h2>
        </div>
        <button type="button" className="text-sm text-slate-500 lg:hidden" onClick={onClose}>Close</button>
      </div>

      <nav className="space-y-1">
        {items.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
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
