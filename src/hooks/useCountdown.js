import { useState, useEffect } from 'react'

function computeCountdown(kickoffAt) {
  if (!kickoffAt) return null
  const diff = new Date(kickoffAt) - new Date()
  if (diff <= 0) return null
  const totalSecs = Math.floor(diff / 1000)
  return {
    days:  Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    mins:  Math.floor((totalSecs % 3600) / 60),
    secs:  totalSecs % 60,
  }
}

export function useCountdown(kickoffAt) {
  const [countdown, setCountdown] = useState(() => computeCountdown(kickoffAt))

  useEffect(() => {
    setCountdown(computeCountdown(kickoffAt))
    const id = setInterval(() => setCountdown(computeCountdown(kickoffAt)), 1000)
    return () => clearInterval(id)
  }, [kickoffAt])

  return countdown
}
