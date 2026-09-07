import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import ChallengeForm from './pages/citizen/ChallengeForm'
import MyChallengesPage from './pages/citizen/MyChallengesPage'
import ChallengeDetailPage from './pages/citizen/ChallengeDetailPage'
import UniversityDashboard from './pages/university/UniversityDashboard'
import UniversityChallengesPage from './pages/university/UniversityChallengesPage'
import UniversityChallengeReview from './pages/university/UniversityChallengeReview'
import ProposalFormPage from './pages/university/ProposalFormPage'
import UniversityProjectsPage from './pages/university/UniversityProjectsPage'
import ProjectDetailPage from './pages/university/ProjectDetailPage'
import IndustryDashboard from './pages/industry/IndustryDashboard'
import IndustryProjectsPage from './pages/industry/IndustryProjectsPage'
import GovernmentDashboard from './pages/government/GovernmentDashboard'

function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {user ? <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} /> : null}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<AppShell><LandingPage /></AppShell>} />
      <Route path="/login" element={<Navigate to="/login/citizen" replace />} />
      <Route path="/login/:role" element={<AppShell><LoginPage /></AppShell>} />
      <Route path="/register" element={<AppShell><RegisterPage /></AppShell>} />
      <Route path="/citizen/dashboard" element={<ProtectedRoute allowedRoles={['CITIZEN']}><AppShell><CitizenDashboard /></AppShell></ProtectedRoute>} />
      <Route path="/citizen/challenges/new" element={<ProtectedRoute allowedRoles={['CITIZEN']}><AppShell><ChallengeForm /></AppShell></ProtectedRoute>} />
      <Route path="/citizen/challenges" element={<ProtectedRoute allowedRoles={['CITIZEN']}><AppShell><MyChallengesPage /></AppShell></ProtectedRoute>} />
      <Route path="/challenges/:id" element={<AppShell><ChallengeDetailPage /></AppShell>} />
      <Route path="/university/dashboard" element={<ProtectedRoute allowedRoles={['HEI_ADMIN', 'FACULTY']}><AppShell><UniversityDashboard /></AppShell></ProtectedRoute>} />
      <Route path="/university/challenges" element={<ProtectedRoute allowedRoles={['HEI_ADMIN', 'FACULTY']}><AppShell><UniversityChallengesPage /></AppShell></ProtectedRoute>} />
      <Route path="/university/challenges/:id" element={<ProtectedRoute allowedRoles={['HEI_ADMIN', 'FACULTY']}><AppShell><UniversityChallengeReview /></AppShell></ProtectedRoute>} />
      <Route path="/university/proposals/new/:challengeId" element={<ProtectedRoute allowedRoles={['HEI_ADMIN']}><AppShell><ProposalFormPage /></AppShell></ProtectedRoute>} />
      <Route path="/university/projects" element={<ProtectedRoute allowedRoles={['HEI_ADMIN', 'FACULTY']}><AppShell><UniversityProjectsPage /></AppShell></ProtectedRoute>} />
      <Route path="/projects/:id" element={<AppShell><ProjectDetailPage /></AppShell>} />
      <Route path="/industry/dashboard" element={<ProtectedRoute allowedRoles={['INDUSTRY']}><AppShell><IndustryDashboard /></AppShell></ProtectedRoute>} />
      <Route path="/industry/projects" element={<ProtectedRoute allowedRoles={['INDUSTRY']}><AppShell><IndustryProjectsPage /></AppShell></ProtectedRoute>} />
      <Route path="/projects/:id/collaborate" element={<ProtectedRoute allowedRoles={['INDUSTRY']}><AppShell><ProjectDetailPage collaborationMode /></AppShell></ProtectedRoute>} />
      <Route path="/government/dashboard" element={<ProtectedRoute allowedRoles={['GOVERNMENT', 'ADMIN']}><AppShell><GovernmentDashboard /></AppShell></ProtectedRoute>} />
      <Route path="*" element={<AppShell>{user ? <Navigate to={`/${user.role.toLowerCase().replace('_', '/')}/dashboard`} replace /> : <LandingPage />}</AppShell>} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
