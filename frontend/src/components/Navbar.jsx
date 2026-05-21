import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/dashboard',    label: 'Dashboard', always: true },
  { to: '/meetings/new', label: 'New Poll',  adminOnly: true },
  { to: '/summary',      label: 'Summary',   adminOnly: true },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const links = navLinks.filter(l => l.always || (l.adminOnly && user?.role === 'admin'))

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:shadow-blue-700/50 transition-shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-white text-sm leading-none">MIHE</span>
            <span className="block text-xs text-slate-400 leading-none">Meeting Scheduler</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                pathname === l.to
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 leading-none mt-0.5 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
