import { useState, useCallback } from 'react'
import Hero from './components/Hero'
import ProgressBar from './components/ProgressBar'
import RSVPForm from './components/RSVPForm'
import PlayerLists from './components/PlayerLists'
import MapSection from './components/MapSection'
import PaymentSection from './components/PaymentSection'
import Toast from './components/Toast'
import { useAttendance } from './hooks/useAttendance'

export default function App() {
  const { confirmed, maybe, maxPlayers, paidPlayers, upsertPlayer, deletePlayer, togglePaid } = useAttendance()
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type) => {
    setToast({ msg, type, id: Date.now() })
  }, [])

  const handleRSVP = useCallback(async (name, status) => {
    if (status === 'cancelled') {
      await deletePlayer(name)
      showToast(`${name} removed from lists`, 'red')
    } else {
      await upsertPlayer(name, status)
      if (status === 'confirmed') {
        showToast(`${name} confirmed ✓`, 'green')
      } else {
        showToast(`${name} — marked as maybe`, 'amber')
      }
    }
  }, [upsertPlayer, deletePlayer, showToast])

  return (
    <>
      <Hero />
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
          <PlayerLists confirmed={confirmed} maybe={maybe} paidPlayers={paidPlayers} onTogglePaid={togglePaid} />
        </div>
        <PaymentSection />
        <MapSection />
      </main>
      <footer>
        Thursday 25 June · 9:00–10:30 PM · Update your response at any time.
      </footer>
      <Toast toast={toast} />
    </>
  )
}
