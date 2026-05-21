import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pollsApi } from '../api/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CYCLE = ['yes', 'maybe', 'no', null]
const STATUS_STYLE = {
  yes:   'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
  maybe: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
  no:    'bg-red-500/20 border-red-500/50 text-red-400',
  null:  'bg-white/5 border-white/10 text-slate-400',
}
const STATUS_LABEL = { yes: '✓ Yes', maybe: '~ Maybe', no: '✗ No', null: 'Click to vote' }

export default function VotePoll() {
  const { token } = useParams()
  const [poll, setPoll]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [votes, setVotes]   = useState({})  // slotId -> status string
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  useEffect(() => {
    pollsApi.get(token)
      .then(r => {
        setPoll(r.data)
        const init = {}
        r.data.slots.forEach(s => { init[s.id] = null })
        setVotes(init)
      })
      .catch(() => toast.error('Poll not found'))
      .finally(() => setLoading(false))
  }, [token])

  const cycleVote = (slotId) => {
    setVotes(prev => {
      const cur = prev[slotId]
      const idx = STATUS_CYCLE.indexOf(cur)
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
      return { ...prev, [slotId]: next }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Please enter your name'); return }
    const voteList = Object.entries(votes)
      .filter(([, s]) => s !== null)
      .map(([slot_id, status]) => ({ slot_id: Number(slot_id), status }))

    setSubmitting(true)
    try {
      await pollsApi.respond(token, {
        respondent_name: name.trim(),
        respondent_email: email.trim(),
        votes: voteList,
      })
      toast.success('Response submitted!')
      setSubmitted(true)
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!poll) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl text-white font-bold">Poll not found</h2>
        <p className="text-slate-400 mt-2">This link may have expired or been removed.</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="card p-10 text-center max-w-md w-full animate-slide-up">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Response Submitted!</h2>
        <p className="text-slate-400 mt-2 mb-6">Thanks, {name}. Your availability has been recorded.</p>
        <div className="flex gap-3 justify-center">
          <Link to={`/poll/${token}/results`} className="btn-primary">View Live Results</Link>
          <button onClick={() => { setSubmitted(false); setVotes(Object.fromEntries(poll.slots.map(s => [s.id, null]))) }} className="btn-secondary">
            Edit Response
          </button>
        </div>
      </div>
    </div>
  )

  const isClosed = poll.status !== 'open'

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-700 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-8">
          {/* Home button */}
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className={poll.status === 'open' ? 'badge-open' : poll.status === 'finalized' ? 'badge-final' : 'badge-closed'}>
              {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
            </span>
            {poll.deadline && (
              <span className="text-xs text-slate-500">
                Closes {format(new Date(poll.deadline), 'dd MMM yyyy')}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">{poll.title}</h1>
          {poll.description && <p className="text-slate-400 mt-2">{poll.description}</p>}
          <div className="mt-4">
            <Link to={`/poll/${token}/results`} className="btn-secondary text-sm inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View live results
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {isClosed ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-lg font-semibold text-white">This poll is {poll.status}</h2>
            <p className="text-slate-400 mt-2">Voting is no longer available.</p>
            <Link to={`/poll/${token}/results`} className="btn-primary inline-flex mt-4">See Results</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {/* Name / email */}
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-white">Your details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Your name *</label>
                  <input className="input" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Email (optional)</label>
                  <input type="email" className="input" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Slots */}
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-1">Select your availability</h2>
              <p className="text-xs text-slate-500 mb-5">Click each slot to cycle: <span className="text-emerald-400">Yes</span> → <span className="text-amber-400">Maybe</span> → <span className="text-red-400">No</span> → clear</p>
              <div className="space-y-3">
                {poll.slots.map(slot => {
                  const status = votes[slot.id]
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => cycleVote(slot.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${STATUS_STYLE[status]}`}
                    >
                      <span className="font-medium">{slot.label}</span>
                      <span className="text-sm font-semibold shrink-0 ml-3">
                        {STATUS_LABEL[status]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={submitting} className="btn-gold flex items-center gap-2">
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : 'Submit Availability'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
