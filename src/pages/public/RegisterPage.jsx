import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { useAuth } from '../../context/AuthContext'
import { mockUsers } from '../../data/mockData'

const roleOptions = [
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'HEI_ADMIN', label: 'University' },
  { value: 'INDUSTRY', label: 'Industry' },
]

export default function RegisterPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', role: 'CITIZEN' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const userMap = {
      CITIZEN: mockUsers.citizen,
      HEI_ADMIN: mockUsers.university,
      INDUSTRY: mockUsers.industry,
    }
    const user = { ...userMap[form.role], name: form.name || userMap[form.role].name, email: form.email || userMap[form.role].email }
    signIn(user)
    if (user.role === 'CITIZEN') navigate('/citizen/dashboard')
    if (user.role === 'HEI_ADMIN') navigate('/university/dashboard')
    if (user.role === 'INDUSTRY') navigate('/industry/dashboard')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Create account</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Register to join the innovation network</h1>

        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <Select label="Role" options={roleOptions} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Work email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" placeholder="Create a password" />
          <Input label="Organization" placeholder="Optional" />
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">Create account</Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login/citizen" className="font-semibold text-slate-900 underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
