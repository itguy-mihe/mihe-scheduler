import { useEffect, useState } from 'react'
import { meetingsApi } from '../api/client'
import toast from 'react-hot-toast'
import { StatSkeleton } from '../components/LoadingSkeleton'

function StatCard({ label, value, icon, color = 'text-white', sub }) {
  return (
    <div className="card p-6 hover:border-blue-500/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function MeetingBar({ title, responses, maxResponses, status }) {
  const pct = maxResponses > 0 ? (responses / maxResponses) * 100 : 0
  const statusColors = {
    open:      'bg-emerald-500',
    closed:    'bg-slate-500',
    finalized: 'bg-amber-500',
  }
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-white font-medium truncate">{title}</span>
          <span className="text-sm text-slate-400 shrink-0 ml-2">{responses}</span>
        </div>
        <div className="h-1.5 bg-navy-900 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${statusColors[status] ?? 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    meetingsApi.analytics()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const maxResponses = data ? Math.max(...data.by_meeting.map(m => m.responses), 1) : 1

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of all meeting polls</p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
          </div>
        </>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Meetings"   value={data.total_meetings}   icon="📅" />
            <StatCard label="Total Responses"  value={data.total_responses}  icon="✅" color="text-blue-400" />
            <StatCard label="Open Polls"       value={data.open_polls}       icon="🟢" color="text-emerald-400" />
            <StatCard label="Completed Polls"  value={data.closed_polls}     icon="🏁" color="text-slate-400" />
          </div>

          {data.total_meetings > 0 && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="card p-6">
                <h2 className="font-semibold text-white mb-1 text-sm">Avg responses per poll</h2>
                <p className="text-4xl font-bold text-blue-400 mt-2">
                  {data.total_meetings > 0
                    ? (data.total_responses / data.total_meetings).toFixed(1)
                    : '—'}
                </p>
                <p className="text-slate-500 text-xs mt-1">across all polls</p>
              </div>

              <div className="card p-6">
                <h2 className="font-semibold text-white mb-1 text-sm">Completion rate</h2>
                <p className="text-4xl font-bold text-gold-400 mt-2">
                  {data.total_meetings > 0
                    ? `${Math.round((data.closed_polls / data.total_meetings) * 100)}%`
                    : '—'}
                </p>
                <p className="text-slate-500 text-xs mt-1">polls closed or finalized</p>
              </div>
            </div>
          )}

          {data.by_meeting.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-4 text-sm">Responses per meeting</h2>
              <div>
                {[...data.by_meeting]
                  .sort((a, b) => b.responses - a.responses)
                  .map(m => (
                    <MeetingBar
                      key={m.title}
                      title={m.title}
                      responses={m.responses}
                      maxResponses={maxResponses}
                      status={m.status}
                    />
                  ))}
              </div>
            </div>
          )}

          {data.total_meetings === 0 && (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-slate-400">No meetings created yet. Analytics will appear here once polls are created.</p>
            </div>
          )}
        </>
      ) : (
        <div className="card p-8 text-center text-slate-500">Failed to load analytics data.</div>
      )}
    </div>
  )
}
