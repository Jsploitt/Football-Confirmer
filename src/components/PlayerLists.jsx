function getInitial(name) {
  return (name.trim()[0] || '?').toUpperCase()
}

function EmptyState() {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
      <div>No players yet</div>
    </div>
  )
}

function PaidBadge({ paid, onToggle }) {
  return (
    <button
      className={`paid-badge ${paid ? 'paid-badge--paid' : 'paid-badge--unpaid'}`}
      onClick={e => { e.stopPropagation(); onToggle() }}
      aria-label={paid ? 'Mark as not paid' : 'Mark as paid'}
      title={paid ? 'Mark as not paid' : 'Mark as paid'}
    >
      {paid ? '✓ Paid' : 'Not paid'}
    </button>
  )
}

function PlayerBadge({ name, type, paid, onTogglePaid }) {
  return (
    <div className={`player-badge player-badge-${type}`}>
      <div className={`player-avatar player-avatar-${type}`}>{getInitial(name)}</div>
      <span className="player-name">{name}</span>
      <PaidBadge paid={paid} onToggle={() => onTogglePaid(name, paid)} />
    </div>
  )
}

export default function PlayerLists({ confirmed, maybe, paidPlayers, onTogglePaid }) {
  const isPaid = name => paidPlayers.has(name.toLowerCase())

  return (
    <div className="lists-grid">

      <div className="list-card">
        <div className="list-header">
          <span className="list-title list-title-confirmed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a10 10 0 0 1 6.76 2.64M12 2a10 10 0 0 0-6.76 2.64"/>
            </svg>
            Confirmed
          </span>
          <span className="list-count list-count-confirmed">{confirmed.length}</span>
        </div>
        <div className="player-list" aria-live="polite" aria-label="Confirmed players">
          {confirmed.length === 0
            ? <EmptyState />
            : confirmed.map(name => (
                <PlayerBadge
                  key={name}
                  name={name}
                  type="confirmed"
                  paid={isPaid(name)}
                  onTogglePaid={onTogglePaid}
                />
              ))
          }
        </div>
      </div>

      <div className="list-card">
        <div className="list-header">
          <span className="list-title list-title-maybe">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Maybe
          </span>
          <span className="list-count list-count-maybe">{maybe.length}</span>
        </div>
        <div className="player-list" aria-live="polite" aria-label="Maybe players">
          {maybe.length === 0
            ? <EmptyState />
            : maybe.map(name => (
                <PlayerBadge
                  key={name}
                  name={name}
                  type="maybe"
                  paid={isPaid(name)}
                  onTogglePaid={onTogglePaid}
                />
              ))
          }
        </div>
      </div>

    </div>
  )
}
