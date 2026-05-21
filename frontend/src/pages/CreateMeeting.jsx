import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { meetingsApi } from '../api/client'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const TIMEZONES = [
  'Australia/Melbourne',
  'Australia/Sydney',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Pacific/Auckland',
  'Asia/Singapore',
  'UTC',
]

function SlotRow({ slot, index, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-navy-800 rounded-xl border border-white/5 animate-slide-up">
      <span className="text-slate-500 text-sm w-5 shrink-0">{index + 1}</span>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label text-xs">Date</label>
          <input
            type="date"
            className="input py-2 text-sm"
            value={slot.date}
            onChange={e => onChange({ ...slot, date: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-xs">Start time</label>
          <input
            type="time"
            className="input py-2 text-sm"
            value={slot.start}
            onChange={e => onChange({ ...slot, start: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-xs">End time</label>
          <input
            type="time"
            className="input py-2 text-sm"
            value={slot.end}
            onChange={e => onChange({ ...slot, end: e.target.value })}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10 shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

const emptySlot = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return { date: format(tomorrow, 'yyyy-MM-dd'), start: '10:00', end: '11:00' }
}

export default function CreateMeeting() {
  const navigate = useNavigate()
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [deadline, setDeadline] = useState('')
  const [tz, setTz]             = useState('Australia/Melbourne')
  const [slots, setSlots]       = useState([emptySlot()])
  const [loading, setLoading]   = useState(false)

  const addSlot  = () => setSlots(prev => [...prev, emptySlot()])
  const remSlot  = (i) => setSlots(prev => prev.filter((_, j) => j !== i))
  const upSlot   = (i, s) => setSlots(prev => prev.map((old, j) => j === i ? s : old))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (slots.length === 0) { toast.error('Add at least one time slot'); return }

    const payload = {
      title,
      description: desc,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      timezone: tz,
      slots: slots.map(s => {
        const start = new Date(`${s.date}T${s.start}:00`)
        const end   = new Date(`${s.date}T${s.end}:00`)
        return {
          start_utc: start.toISOString(),
          end_utc:   end.toISOString(),
          label: `${format(start, 'EEE dd MMM h:mm a')} – ${format(end, 'h:mm a')}`,
        }
      }),
    }

    setLoading(true)
    try {
      const r = await meetingsApi.create(payload)
      toast.success('Poll created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create Meeting Poll</h1>
        <p className="text-slate-400 text-sm mt-1">Add time options and share the link with your team</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Details */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-white border-b border-white/10 pb-3">Poll Details</h2>

          <div>
            <label className="label">Meeting title *</label>
            <input
              className="input"
              placeholder="e.g. Q3 Strategy Review"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What is this meeting about?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Response deadline</label>
              <input
                type="datetime-local"
                className="input"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Timezone</label>
              <select
                className="input"
                value={tz}
                onChange={e => setTz(e.target.value)}
              >
                {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-semibold text-white">Time Options</h2>
            <span className="text-xs text-slate-500">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3">
            {slots.map((s, i) => (
              <SlotRow
                key={i}
                slot={s}
                index={i}
                onChange={s => upSlot(i, s)}
                onRemove={() => remSlot(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addSlot}
            className="w-full py-3 border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-xl text-slate-400 hover:text-blue-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add time slot
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Create Poll
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
