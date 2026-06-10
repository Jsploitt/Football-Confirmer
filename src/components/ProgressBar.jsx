export default function ProgressBar({ count, maxPlayers = 14 }) {
  const pct = Math.min((count / maxPlayers) * 100, 100)
  const reached = count >= maxPlayers
  const needed = maxPlayers - count

  return (
    <div className="progress-wrap">
      <div className="progress-header">
        <span className="progress-label">Confirmed Players</span>
        <span className={`progress-count${reached ? ' reached' : ''}`}>
          <span>{count}</span>&nbsp;/ {maxPlayers}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-bar${reached ? ' reached' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`progress-note${reached ? ' ready' : ''}`}>
        {reached
          ? '✓ Squad is full — match is on!'
          : `Need ${needed} more confirmed player${needed !== 1 ? 's' : ''} to lock in the match.`
        }
      </div>
    </div>
  )
}
