import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAttendance } from '../hooks/useAttendance'

const SESSION_KEY = 'ffc_admin_session'

function getInitial(name) {
  return (name.trim()[0] || '?').toUpperCase()
}

function buildWhatsAppLink(whatsapp, name) {
  const digits = whatsapp.replace(/[^\d]/g, '')
  const message = `Hey ${name}! 👋 Quick reminder about the match — Thursday 25 June, 9:00–10:30 PM. See you on the pitch! ⚽`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: rpcError } = await supabase.rpc('verify_admin_login', {
        p_username: username.trim(),
        p_password: password,
      })
      if (rpcError) throw rpcError
      if (data === true) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        onLogin()
      } else {
        setError('Invalid username or password.')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1 className="admin-login-title">Admin Login</h1>
        <input
          type="text"
          className="rsvp-input"
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="rsvp-input"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn btn-confirmed" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Log in'}
        </button>
        {error && <div className="rsvp-error" role="alert">{error}</div>}
      </form>
    </div>
  )
}

function PlayerRow({ name, whatsapp, paid, onTogglePaid }) {
  return (
    <div className="admin-row">
      <div className="player-avatar player-avatar-confirmed">{getInitial(name)}</div>
      <span className="admin-row-name">{name}</span>
      <button
        className={`paid-badge ${paid ? 'paid-badge--paid' : 'paid-badge--unpaid'}`}
        onClick={() => onTogglePaid(name, paid)}
      >
        {paid ? '✓ Paid' : 'Not paid'}
      </button>
      {whatsapp ? (
        <a
          className="remind-btn"
          href={buildWhatsAppLink(whatsapp, name)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Remind
        </a>
      ) : (
        <span className="remind-btn remind-btn--disabled" title="No WhatsApp number on file">Remind</span>
      )}
    </div>
  )
}

function AdminDashboard({ onLogout }) {
  const { confirmedRecords, maybeRecords, paidPlayers, togglePaid } = useAttendance()
  const isPaid = name => paidPlayers.has(name.toLowerCase())

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-login-title">Admin Dashboard</h1>
        <button className="btn btn-cancelled" onClick={onLogout}>Log out</button>
      </div>

      <div className="section-title">Confirmed ({confirmedRecords.length})</div>
      <div className="admin-list">
        {confirmedRecords.length === 0 && <div className="empty-state"><div>No players yet</div></div>}
        {confirmedRecords.map(r => (
          <PlayerRow key={r.name} name={r.name} whatsapp={r.whatsapp} paid={isPaid(r.name)} onTogglePaid={togglePaid} />
        ))}
      </div>

      <div className="section-title" style={{ marginTop: '2rem' }}>Maybe ({maybeRecords.length})</div>
      <div className="admin-list">
        {maybeRecords.length === 0 && <div className="empty-state"><div>No players yet</div></div>}
        {maybeRecords.map(r => (
          <PlayerRow key={r.name} name={r.name} whatsapp={r.whatsapp} paid={isPaid(r.name)} onTogglePaid={togglePaid} />
        ))}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true')

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }, [])

  return authed
    ? <AdminDashboard onLogout={handleLogout} />
    : <AdminLogin onLogin={() => setAuthed(true)} />
}
