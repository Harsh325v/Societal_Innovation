import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

const loginRoles = {
  citizen: {
    label: 'Citizen',
    role: 'CITIZEN',
    email: 'citizen_test@gmail.com',
    password: 'Test@12345',
    dashboard: '/citizen/dashboard',
  },
  university: {
    label: 'University',
    role: 'HEI_ADMIN',
    email: 'uni_test@gmail.com',
    password: 'Test@12345',
    dashboard: '/university/dashboard',
  },
  industry: {
    label: 'Industry',
    role: 'INDUSTRY_ADMIN',
    email: 'industry_test@gmail.com',
    password: 'Test@12345',
    dashboard: '/industry/dashboard',
  },
  government: {
    label: 'Government',
    role: 'GOVERNMENT',
    email: 'govt_test@gmail.com',
    password: 'Test@12345',
    dashboard: '/government/dashboard',
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { role = 'citizen' } = useParams()
  const { signIn } = useAuth()

  const loginRole = loginRoles[role] || loginRoles.citizen

  const [form, setForm] = useState({
    email: loginRole.email,
    password: loginRole.password,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // update the form whenever the user switches workspace
  useEffect(() => {
    setForm({
      email: loginRole.email,
      password: loginRole.password,
    })

    // clear any old login error when switching workspace
    setError('')
  }, [loginRole.email, loginRole.password])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      // first login and get the JWT from our backend
      const loginData = await authService.login(
        form.email,
        form.password
      )

      // save the token so axios can use it for future requests
      localStorage.setItem('sih_token', loginData.access_token)

      // get the actual logged-in user from the backend
      const currentUser = await authService.me()

      // store the real user + token in our auth context
      signIn(currentUser, loginData.access_token)

      // send the user to their workspace
      navigate(loginRole.dashboard)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
        'Login failed. Please check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const useDemoAccount = () => {
    setForm({
      email: loginRole.email,
      password: loginRole.password,
    })

    setError('')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg lg:grid-cols-2">

        {/* left side */}
        <div className="bg-slate-900 p-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
            Welcome back
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            {loginRole.label} sign in.
          </h1>

          <p className="mt-4 max-w-sm text-slate-300">
            Access the {loginRole.label.toLowerCase()} workspace and continue
            building real impact solutions.
          </p>

          {/* demo account card */}
          <button
            type="button"
            onClick={useDemoAccount}
            className="mt-10 w-full rounded-2xl bg-white/5 p-5 text-left transition hover:bg-white/10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Demo account
            </p>

            <p className="mt-2 font-medium text-white">
              {loginRole.email}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Click to use this demo account
            </p>
          </button>
        </div>

        {/* right side */}
        <form className="p-8 sm:p-10" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-slate-900">
            {loginRole.label} login
          </h2>

          <div className="mt-6 space-y-5">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" />
              Remember me
            </label>

            <span className="text-slate-400">
              Password reset unavailable
            </span>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Switch workspace
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(loginRoles).map(([key, item]) => (
                <Link
                  key={key}
                  to={`/login/${key}`}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    key === role
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            No account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-slate-900 underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}