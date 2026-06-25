import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAttendance } from '../hooks/useAttendance'
import { formatKickoff } from '../lib/matchDate'

const SESSION_KEY = 'ffc_admin_session'

function getInitial(name) {
  return (name.trim()[0] || '?').toUpperCase()
}

function buildWhatsAppLink(whatsapp, name, matchSettings) {
  const digits = whatsapp.replace(/[^\d]/g, '')
  const fmt = formatKickoff(matchSettings.kickoffAt, matchSettings.durationMinutes)
  const whenText = fmt ? `${fmt.weekdayLong} ${fmt.day} ${fmt.month}, ${fmt.startLabel}–${fmt.endLabel}` : 'the upcoming match'
  const message = `Hey ${name}! Quick reminder about the match — ${whenText}${matchSettings.locationName ? ` at ${matchSettings.locationName}` : ''}. See you on the pitch!`
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

function PlayerRow({ name, whatsapp, paid, onTogglePaid, matchSettings }) {
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
          href={buildWhatsAppLink(whatsapp, name, matchSettings)}
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

// timestamptz <-> <input type="datetime-local"> conversions, both in local time
function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocalValue(localString) {
  if (!localString) return null
  return new Date(localString).toISOString()
}

function MatchSettingsForm({ matchSettings, updateMatchSettings }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (matchSettings.id !== null && form === null) {
      setForm({
        maxPlayers: matchSettings.maxPlayers,
        kickoffLocal: toDatetimeLocalValue(matchSettings.kickoffAt),
        durationMinutes: matchSettings.durationMinutes,
        locationName: matchSettings.locationName,
        locationAddress: matchSettings.locationAddress,
        mapEmbedUrl: matchSettings.mapEmbedUrl,
        directionsUrl: matchSettings.directionsUrl,
      })
    }
  }, [matchSettings, form])

  if (!form) return null

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setStatus('')
    try {
      await updateMatchSettings({
        maxPlayers: Number(form.maxPlayers) || 14,
        kickoffAt: fromDatetimeLocalValue(form.kickoffLocal),
        durationMinutes: Number(form.durationMinutes) || 90,
        locationName: form.locationName,
        locationAddress: form.locationAddress,
        mapEmbedUrl: form.mapEmbedUrl,
        directionsUrl: form.directionsUrl,
      })
      setStatus('Saved — public page updated.')
    } catch {
      setStatus('Failed to save. Please try again.')
    } finally {
      setSaving(false)
      setTimeout(() => setStatus(''), 4000)
    }
  }

  return (
    <form className="admin-settings-card" onSubmit={handleSubmit}>
      <div className="admin-settings-grid">
        <label className="admin-field">
          <span className="admin-field-label">Number of players</span>
          <input
            type="number"
            className="rsvp-input"
            min={2}
            step={1}
            value={form.maxPlayers}
            onChange={e => set('maxPlayers', e.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Kickoff date & time</span>
          <input
            type="datetime-local"
            className="rsvp-input"
            value={form.kickoffLocal}
            onChange={e => set('kickoffLocal', e.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Duration (minutes)</span>
          <input
            type="number"
            className="rsvp-input"
            min={15}
            step={15}
            value={form.durationMinutes}
            onChange={e => set('durationMinutes', e.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Location name</span>
          <input
            type="text"
            className="rsvp-input"
            placeholder="e.g. Al-Rawad Fields — Riyadh"
            value={form.locationName}
            onChange={e => set('locationName', e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Location address</span>
          <input
            type="text"
            className="rsvp-input"
            placeholder="e.g. Riyadh, Saudi Arabia"
            value={form.locationAddress}
            onChange={e => set('locationAddress', e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Google Maps embed URL</span>
          <input
            type="url"
            className="rsvp-input"
            placeholder="https://maps.google.com/maps?q=...&output=embed"
            value={form.mapEmbedUrl}
            onChange={e => set('mapEmbedUrl', e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Directions link</span>
          <input
            type="url"
            className="rsvp-input"
            placeholder="https://maps.app.goo.gl/..."
            value={form.directionsUrl}
            onChange={e => set('directionsUrl', e.target.value)}
          />
        </label>
      </div>
      <div className="admin-settings-footer">
        <button className="btn btn-confirmed" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save match settings'}
        </button>
        {status && <span className="admin-settings-status">{status}</span>}
      </div>
    </form>
  )
}

function AdminDashboard({ onLogout }) {
  const {
    confirmedRecords, maybeRecords, paidPlayers, togglePaid, matchSettings, updateMatchSettings,
  } = useAttendance()
  const isPaid = name => paidPlayers.has(name.toLowerCase())

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-login-title">Admin Dashboard</h1>
        <button className="btn btn-cancelled" onClick={onLogout}>Log out</button>
      </div>

      <div className="section-title">Match Settings</div>
      <MatchSettingsForm matchSettings={matchSettings} updateMatchSettings={updateMatchSettings} />

      <div className="section-title" style={{ marginTop: '2rem' }}>Confirmed ({confirmedRecords.length})</div>
      <div className="admin-list">
        {confirmedRecords.length === 0 && <div className="empty-state"><div>No players yet</div></div>}
        {confirmedRecords.map(r => (
          <PlayerRow key={r.name} name={r.name} whatsapp={r.whatsapp} paid={isPaid(r.name)} onTogglePaid={togglePaid} matchSettings={matchSettings} />
        ))}
      </div>

      <div className="section-title" style={{ marginTop: '2rem' }}>Maybe ({maybeRecords.length})</div>
      <div className="admin-list">
        {maybeRecords.length === 0 && <div className="empty-state"><div>No players yet</div></div>}
        {maybeRecords.map(r => (
          <PlayerRow key={r.name} name={r.name} whatsapp={r.whatsapp} paid={isPaid(r.name)} onTogglePaid={togglePaid} matchSettings={matchSettings} />
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
