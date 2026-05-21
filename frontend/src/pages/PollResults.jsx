import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pollsApi } from '../api/client'
import { useWebSocket } from '../hooks/useWebSocket'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function SlotBar({ slot, max }) {
  const pct = max > 0 ? (slot.yes_count / max) * 100 : 0
  return (
    <div className="p-5 bg-navy-800 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-white text-sm">{slot.label}</span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-400 font-semibold">{slot.yes_count} yes</span>
          {slot.maybe_count > 0 && <span className="text-amber-400">{slot.maybe_count} maybe</span>}
          {slot.no_count > 0 && <span className="text-slate-500">{slot.no_count} no</span>}
        </div>
      </div>
      <div className="h-2.5 bg-navy-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {(slot.yes_names.length > 0 || slot.maybe_names.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {slot.yes_names.map(n => (
            <span key={n} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs border border-emerald-500/20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              {n}
            </span>
          ))}
          {slot.maybe_names.map(n => (
            <span key={n} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs border border-amber-500/20">
              ~ {n}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PollResults() {
  const { token } = useParams()
  const [poll, setPoll]       = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveIndicator, setLiveIndicator] = useState(false)

  useEffect(() => {
    Promise.all([pollsApi.get(token), pollsApi.results(token)])
      .then(([pr, rr]) => { setPoll(pr.data); setResults(rr.data) })
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false))
  }, [token])

  // WebSocket live updates
  useWebSocket(token, useCallback((msg) => {
    if (msg.type === 'update') {
      setResults(msg.results)
      setLiveIndicator(true)
      setTimeout(() => setLiveIndicator(false), 2000)
    }
  }, []))

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/poll/${token}`)
    toast.success('Vote link copied!')
  }

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const maxYes = results ? Math.max(...results.slots.map(s => s.yes_count), 1) : 1
  const sortedSlots = results ? [...results.slots].sort((a, b) => b.yes_count - a.yes_count) : []
  const bestSlot = sortedSlots[0]

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-700 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className={poll?.status === 'open' ? 'badge-open' : poll?.status === 'finalized' ? 'badge-final' : 'badge-closed'}>
              {poll?.status}
            </span>
            {/* Live pulse */}
            <span className={`flex items-center gap-1.5 text-xs transition-opacity duration-500 ${liveIndicator ? 'opacity-100 text-emerald-400' : 'opacity-50 text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${liveIndicator ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              {liveIndicator ? 'Updated!' : 'Live'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{poll?.title} — Results</h1>
          <p className="text-slate-400 mt-1 text-sm">{results?.total_responses ?? 0} response{results?.total_responses !== 1 ? 's' : ''} so far</p>

          <div className="flex gap-3 mt-4">
            <button onClick={copyLink} className="btn-secondary text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Share vote link
            </button>
            <Link to={`/poll/${token}`} className="btn-primary text-sm">Vote</Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* Best slot callout */}
        {bestSlot && bestSlot.yes_count > 0 && (
          <div className="card p-5 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Best time slot
            </div>
            <p className="text-white font-medium">{bestSlot.label}</p>
            <p className="text-emerald-400/80 text-sm mt-0.5">{bestSlot.yes_count} people available</p>
          </div>
        )}

        {/* Respondents */}
        {results?.respondents?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-3 text-sm">
              Respondents ({results.respondents.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {results.respondents.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-navy-800 rounded-full border border-white/10 text-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {r.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-white">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slots */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4 text-sm">Availability by time slot</h2>
          {sortedSlots.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No responses yet. Share the vote link to collect availability.</p>
          ) : (
            <div className="space-y-3">
              {sortedSlots.map(slot => (
                <SlotBar key={slot.id} slot={slot} max={maxYes} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
