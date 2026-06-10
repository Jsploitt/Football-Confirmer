import { useState, useEffect } from 'react'

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    if (!toast) return
    setCurrent(toast)
    // Brief false → true cycle so the CSS slide-in transition always fires
    setVisible(false)
    const t1 = setTimeout(() => setVisible(true), 16)
    const t2 = setTimeout(() => setVisible(false), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [toast?.id])

  return (
    <div
      className={`toast${current ? ` toast-${current.type}` : ''}${visible ? ' show' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className={`toast-dot${current ? ` dot-${current.type}` : ''}`} />
      <span>{current?.msg}</span>
    </div>
  )
}
