import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { mockUsers } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'

const loginRoles = {
  citizen: { label: 'Citizen', role: 'CITIZEN', email: 'citizen@sihportal.in', dashboard: '/citizen/dashboard' },
  university: { label: 'University', role: 'HEI_ADMIN', email: 'admin@nitjsr.ac.in', dashboard: '/university/dashboard' },
  industry: { label: 'Industry', role: 'INDUSTRY', email: 'partnership@greentech.in', dashboard: '/industry/dashboard' },
  government: { label: 'Government', role: 'GOVERNMENT', email: 'admin@jharinnovate.in', dashboard: '/government/dashboard' },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { role = 'citizen' } = useParams()
  const { signIn } = useAuth()
  const loginRole = loginRoles[role] || loginRoles.citizen
  const [form, setForm] = useState({ email: loginRole.email, password: 'password123' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const selectedUser = Object.values(mockUsers).find((user) => user.email === form.email && user.role === loginRole.role)
      || Object.values(mockUsers).find((user) => user.role === loginRole.role)
    signIn(selectedUser)
    navigate(loginRole.dashboard)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg lg:grid-cols-2">
        <div className="bg-slate-900 p-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Welcome back</p>
          <h1 className="mt-4 text-4xl font-bold">{loginRole.label} sign in.</h1>
          <p className="mt-4 max-w-sm text-slate-300">Access the {loginRole.label.toLowerCase()} workspace and continue building real impact solutions.</p>
          <div className="mt-10 space-y-4 text-sm text-slate-200">
            <div className="rounded-2xl bg-white/5 p-4">{loginRole.label} demo: {loginRole.email}</div>
          </div>
        </div>

        <form className="p-8 sm:p-10" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-slate-900">{loginRole.label} login</h2>
          <div className="mt-6 space-y-5">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" /> Remember me</label>
            <a href="#" className="text-slate-700 underline">Forgot password?</a>
          </div>

          <Button type="submit" className="mt-6 w-full">Login</Button>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Switch workspace</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(loginRoles).map(([key, item]) => (
                <Link
                  key={key}
                  to={`/login/${key}`}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${key === role ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-slate-900 underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
