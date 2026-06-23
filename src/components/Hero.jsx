import { useCountdown } from '../hooks/useCountdown'
import { formatKickoff } from '../lib/matchDate'

const pad = n => String(n).padStart(2, '0')

export default function Hero({ kickoffAt, durationMinutes }) {
  const countdown = useCountdown(kickoffAt)
  const fmt = formatKickoff(kickoffAt, durationMinutes)

  return (
    <header className="hero pitch-bg">
      <div className="pitch-circle" />
      <div className="hero-content">

        <div className="hero-eyebrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a10 10 0 0 1 6.76 2.64M12 2a10 10 0 0 0-6.76 2.64M5.24 4.64A10 10 0 0 0 2 12m3.24-7.36L9 9m6-4.36L15 9m-3 3 3-4.36M9 9l3 3-3.76 5.64M15 9l-3 3 3.76 5.64M8.24 17.64A10 10 0 0 0 12 22a10 10 0 0 0 3.76-.36M8.24 17.64H15.76"/>
          </svg>
          Matchday RSVP
        </div>

        <h1 className="hero-title">
          {fmt ? (
            <>
              {fmt.weekdayShort}<span>,</span><br />
              <span>{fmt.day}</span> {fmt.month}
            </>
          ) : (
            'Loading…'
          )}
        </h1>

        <div className="hero-meta">
          <span className="hero-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {fmt ? `${fmt.startLabel} – ${fmt.endLabel}` : '—'}
          </span>
          <span className="hero-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            View on Map ↓
          </span>
        </div>

        <div className="countdown-wrap">
          <div className="scoreboard">
            <div className="scoreboard-label">⚡ Kickoff Countdown</div>
            {countdown === null ? (
              <div className="countdown-started">MATCH IN PROGRESS ⚽</div>
            ) : (
              <div className="countdown-units">
                <div className="cd-unit">
                  <div className="cd-digits">{pad(countdown.days)}</div>
                  <div className="cd-label">Days</div>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-unit">
                  <div className="cd-digits">{pad(countdown.hours)}</div>
                  <div className="cd-label">Hrs</div>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-unit">
                  <div className="cd-digits">{pad(countdown.mins)}</div>
                  <div className="cd-label">Min</div>
                </div>
                <span className="cd-sep">:</span>
                <div className="cd-unit">
                  <div className="cd-digits">{pad(countdown.secs)}</div>
                  <div className="cd-label">Sec</div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
