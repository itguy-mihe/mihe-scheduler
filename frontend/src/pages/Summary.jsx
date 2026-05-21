import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { meetingsApi } from '../api/client'
import { CardSkeleton } from '../components/LoadingSkeleton'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  open:      'badge-open',
  closed:    'badge-closed',
  finalized: 'badge-final',
}

function PollSummaryCard({ meeting }) {
  return (
    <div className="card p-6 flex flex-col gap-4 hover:border-blue-500/20 transition-all">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={STATUS_BADGE[meeting.status] ?? 'badge-closed'}>
              {meeting.status}
            </span>
            <span className="text-xs text-slate-500">
              {meeting.response_count} response{meeting.response_count !== 1 ? 's' : ''}
            </span>
          </div>
          <h3 className="text-white font-semibold text-base leading-snug">{meeting.title}</h3>
          {meeting.description && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{meeting.description}</p>
          )}
        </div>
        {/* Response count circle */}
        <div className="shrink-0 w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex flex-col items-center justify-center">
          <span className="text-blue-400 font-bold text-lg leading-none">{meeting.response_count}</span>
          <span className="text-blue-400/60 text-[10px] leading-none">votes</span>
        </div>
      </div>

      {/* Deadline */}
      {meeting.deadline && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Deadline: {new Date(meeting.deadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}

      {/* Action */}
      <Link
        to={`/poll/${meeting.public_token}/results`}
        className="btn-primary text-sm text-center flex items-center justify-center gap-2 mt-auto"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        View Poll Results
      </Link>
    </div>
  )
}

export default function Summary() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    meetingsApi.list()
      .then(r => setMeetings(r.data))
      .catch(() => toast.error('Failed to load polls'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = meetings.filter(m => filter === 'all' || m.status === filter)

  const totalResponses = meetings.reduce((s, m) => s + m.response_count, 0)
  const open      = meetings.filter(m => m.status === 'open').length
  const finalized = meetings.filter(m => m.status === 'finalized').length

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Summary</h1>
        <p className="text-slate-400 text-sm mt-1">Poll results overview for all meetings</p>
      </div>

      {/* Stats */}
      {!loading && meetings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Polls',     value: meetings.length, color: 'text-white',       icon: '📋' },
            { label: 'Total Responses', value: totalResponses,  color: 'text-blue-400',    icon: '✅' },
            { label: 'Open',            value: open,            color: 'text-emerald-400', icon: '🟢' },
            { label: 'Finalized',       value: finalized,       color: 'text-amber-400',   icon: '⭐' },
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
      {!loading && meetings.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'all',       label: `All (${meetings.length})` },
            { key: 'open',      label: `Open (${open})` },
            { key: 'closed',    label: `Closed (${meetings.filter(m => m.status === 'closed').length})` },
            { key: 'finalized', label: `Finalized (${finalized})` },
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
      )}

      {/* Poll cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-slate-400 text-lg font-medium">
            {meetings.length === 0 ? 'No polls created yet' : 'No polls match this filter'}
          </p>
          {meetings.length === 0 && (
            <Link to="/meetings/new" className="btn-primary inline-flex mt-4">Create your first poll</Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <PollSummaryCard key={m.id} meeting={m} />
          ))}
        </div>
      )}
    </div>
  )
}
