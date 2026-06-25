import { useState, useCallback } from 'react'
import Hero from './components/Hero'
import ProgressBar from './components/ProgressBar'
import RSVPForm from './components/RSVPForm'
import PlayerLists from './components/PlayerLists'
import MapSection from './components/MapSection'
import PaymentSection from './components/PaymentSection'
import Toast from './components/Toast'
import { useAttendance } from './hooks/useAttendance'
import { formatKickoff } from './lib/matchDate'

export default function App() {
  const { confirmed, maybe, maxPlayers, matchSettings, upsertPlayer, deletePlayer } = useAttendance()
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type) => {
    setToast({ msg, type, id: Date.now() })
  }, [])

  const handleRSVP = useCallback(async (name, status, whatsapp) => {
    try {
      if (status === 'cancelled') {
        await deletePlayer(name)
        showToast(`${name} removed from lists`, 'red')
      } else {
        await upsertPlayer(name, status, whatsapp)
        if (status === 'confirmed') {
          showToast(`${name} confirmed ✓`, 'green')
        } else {
          showToast(`${name} — marked as maybe`, 'amber')
        }
      }
    } catch (err) {
      if (err.message === 'LOCKED') {
        showToast(`${name} is locked — contact the organizer to change this`, 'red')
      } else {
        throw err
      }
    }
  }, [upsertPlayer, deletePlayer, showToast])

  const fmt = formatKickoff(matchSettings.kickoffAt, matchSettings.durationMinutes)

  return (
    <>
      <Hero kickoffAt={matchSettings.kickoffAt} durationMinutes={matchSettings.durationMinutes} />
      <main>
        <div className="section" style={{ paddingBottom: 0 }}>
          <div className="section-title">Squad Status</div>
          <ProgressBar count={confirmed.length} maxPlayers={maxPlayers} />
        </div>
        <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="section-title" style={{ marginTop: '2rem' }}>Your Response</div>
          <RSVPForm onRSVP={handleRSVP} />
        </div>
        <div className="section">
          <div className="section-title">Player Lists</div>
          <PlayerLists confirmed={confirmed} maybe={maybe} />
        </div>
        <PaymentSection />
        <MapSection
          locationName={matchSettings.locationName}
          mapEmbedUrl={matchSettings.mapEmbedUrl}
          directionsUrl={matchSettings.directionsUrl}
        />
      </main>
      <footer>
        {fmt
          ? `${fmt.weekdayLong} ${fmt.day} ${fmt.month} · ${fmt.startLabel} – ${fmt.endLabel} · Update your response at any time.`
          : 'Update your response at any time.'}
      </footer>
      <Toast toast={toast} />
    </>
  )
}
