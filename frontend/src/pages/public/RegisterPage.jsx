import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

const roleOptions = [
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'HEI_ADMIN', label: 'University' },
  { value: 'INDUSTRY', label: 'Industry' },
]

export default function RegisterPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CITIZEN',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      // backend uses INDUSTRY_ADMIN instead of the frontend's INDUSTRY role
      const backendRole =
        form.role === 'INDUSTRY' ? 'INDUSTRY_ADMIN' : form.role

      // create the account in PostgreSQL through FastAPI
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: backendRole,
      })

      // login immediately after successful registration
      const loginData = await authService.login(
        form.email,
        form.password
      )

      // save the real JWT
      localStorage.setItem('sih_token', loginData.access_token)

      // get the real user from the backend
      const currentUser = await authService.me()

      // store the real user in our auth context
      signIn(currentUser, loginData.access_token)

      // send the user to their workspace
      if (backendRole === 'CITIZEN') {
        navigate('/citizen/dashboard')
      } else if (backendRole === 'HEI_ADMIN') {
        navigate('/university/dashboard')
      } else if (backendRole === 'INDUSTRY_ADMIN') {
        navigate('/industry/dashboard')
      }
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Create account
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Register to join the innovation network
        </h1>

        <form
          className="mt-8 grid gap-5 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div className="md:col-span-2">
            <Select
              label="Role"
              options={roleOptions}
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            />
          </div>

          <Input
            label="Full name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <Input
            label="Work email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <Input
            label="Organization"
            placeholder="Optional"
          />

          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login/citizen"
            className="font-semibold text-slate-900 underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}