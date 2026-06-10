import { useState } from 'react'

function sanitizeName(raw) {
  return raw.trim().replace(/\s+/g, ' ')
}

export default function RSVPForm({ onRSVP }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleClick(status) {
    const clean = sanitizeName(name)
    setError('')

    if (!clean) {
      setError('Enter your name before selecting a status.')
      return
    }

    setLoading(true)
    try {
      await onRSVP(clean, status)
      setName('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rsvp-card">
      <div className="rsvp-input-wrap">
        <input
          type="text"
          className="rsvp-input"
          placeholder="Enter your name…"
          maxLength={60}
          autoComplete="off"
          aria-label="Player name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleClick('confirmed')}
        />
      </div>
      <div className="rsvp-actions">
        <button
          className="btn btn-confirmed"
          onClick={() => handleClick('confirmed')}
          disabled={loading}
          aria-label="Mark as confirmed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Confirmed
        </button>
        <button
          className="btn btn-maybe"
          onClick={() => handleClick('maybe')}
          disabled={loading}
          aria-label="Mark as maybe"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Maybe
        </button>
        <button
          className="btn btn-cancelled"
          onClick={() => handleClick('cancelled')}
          disabled={loading}
          aria-label="Cancel attendance"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Out
        </button>
      </div>
      <div className="rsvp-error" role="alert" aria-live="polite">{error}</div>
    </div>
  )
}
