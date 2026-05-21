import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { meetingsApi } from '../api/client'

const statusBadge = {
  open:      <span className="badge-open">Open</span>,
  closed:    <span className="badge-closed">Closed</span>,
  finalized: <span className="badge-final">Finalized</span>,
}

export default function PollCard({ meeting, onDelete, onClose }) {
  const pollUrl = `${window.location.origin}/poll/${meeting.public_token}`

  const copyLink = () => {
    navigator.clipboard.writeText(pollUrl)
    toast.success('Link copied to clipboard!')
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${meeting.title}"? This cannot be undone.`)) return
    try {
      await meetingsApi.delete(meeting.id)
      toast.success('Meeting deleted')
      onDelete?.(meeting.id)
    } catch {
      toast.error('Failed to delete meeting')
    }
  }

  const handleClose = async () => {
    try {
      await meetingsApi.close(meeting.id)
      toast.success('Poll closed')
      onClose?.(meeting.id)
    } catch {
      toast.error('Failed to close poll')
    }
  }

  return (
    <div className="card p-6 hover:border-blue-500/30 transition-all duration-200 hover:shadow-blue-900/20 hover:shadow-2xl animate-slide-up group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
            {meeting.title}
          </h3>
          {meeting.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{meeting.description}</p>
          )}
        </div>
        {statusBadge[meeting.status] ?? <span className="badge-closed">{meeting.status}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {meeting.response_count} response{meeting.response_count !== 1 ? 's' : ''}
        </span>
        {meeting.deadline && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deadline: {format(new Date(meeting.deadline), 'dd MMM yyyy')}
          </span>
        )}
        <span>Created {format(new Date(meeting.created_at), 'dd MMM')}</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
        <button onClick={copyLink} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Link
        </button>

        <Link to={`/poll/${meeting.public_token}/results`} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Results
        </Link>

        <Link to={`/poll/${meeting.public_token}`} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Poll
        </Link>

        <div className="ml-auto flex gap-2">
          {meeting.status === 'open' && (
            <button onClick={handleClose} className="btn-secondary text-xs py-2 px-3 text-amber-400 hover:text-amber-300">
              Close
            </button>
          )}
          <button onClick={handleDelete} className="btn-danger text-xs py-2 px-3">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
