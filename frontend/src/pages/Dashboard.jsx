import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { meetingsApi } from '../api/client'
import PollCard from '../components/PollCard'
import { CardSkeleton } from '../components/LoadingSkeleton'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    meetingsApi.list()
      .then(r => setMeetings(r.data))
      .catch(() => toast.error('Failed to load meetings'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = meetings.filter(m => filter === 'all' || m.status === filter)

  const handleDelete = (id) => setMeetings(prev => prev.filter(m => m.id !== id))
  const handleClose  = (id) => setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'closed' } : m))

  const counts = {
    all:       meetings.length,
    open:      meetings.filter(m => m.status === 'open').length,
    closed:    meetings.filter(m => m.status === 'closed').length,
    finalized: meetings.filter(m => m.status === 'finalized').length,
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-blue-400">{user?.name}</span>
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/meetings/new" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Poll
          </Link>
        )}
      </div>

      {/* Stats row */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Polls',  value: counts.all,       color: 'text-white',        icon: '📊' },
            { label: 'Open',         value: counts.open,      color: 'text-emerald-400',  icon: '✅' },
            { label: 'Closed',       value: counts.closed,    color: 'text-slate-400',    icon: '🔒' },
            { label: 'Finalized',    value: counts.finalized, color: 'text-gold-400',     icon: '⭐' },
          ].map(s => (
            <div key={s.label} className="card p-5 hover:border-blue-500/20 transition-colors">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'all',       label: `All (${counts.all})` },
          { key: 'open',      label: `Open (${counts.open})` },
          { key: 'closed',    label: `Closed (${counts.closed})` },
          { key: 'finalized', label: `Finalized (${counts.finalized})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meeting cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-slate-400 text-lg font-medium">No meetings yet</p>
          {user?.role === 'admin' && (
            <Link to="/meetings/new" className="btn-primary inline-flex mt-4 gap-2 items-center">
              Create your first poll
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <PollCard
              key={m.id}
              meeting={m}
              onDelete={handleDelete}
              onClose={handleClose}
            />
          ))}
        </div>
      )}
    </div>
  )
}
