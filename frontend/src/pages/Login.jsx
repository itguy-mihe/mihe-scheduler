import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')   // 'login' | 'register'

  // Login state
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // Register state
  const [regName, setRegName]         = useState('')
  const [regEmail, setRegEmail]       = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm]   = useState('')

  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (regPassword !== regConfirm) {
      toast.error('Passwords do not match')
      return
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await authApi.register({ email: regEmail, name: regName, password: regPassword, role: 'user' })
      toast.success('Account created! Please sign in.')
      setEmail(regEmail)
      setPassword('')
      setMode('login')
      setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirm('')
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-900/50 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">MIHE Scheduler</h1>
          <p className="text-slate-400 mt-2 text-sm">Melbourne Institute of Higher Education</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-navy-800 border border-white/10 p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="card p-8">
          {mode === 'login' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@mihe.edu.au"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : 'Sign in'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Full name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Jane Smith"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@mihe.edu.au"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Min. 6 characters"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Re-enter password"
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : 'Create Account'}
                </button>
              </form>
              <p className="mt-4 text-xs text-center text-slate-500">
                New accounts are created as standard users.
                Contact admin for elevated access.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">
            Default admin: <span className="text-slate-400 font-mono">admin@mihe.edu.au</span> / <span className="text-slate-400 font-mono">admin123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
