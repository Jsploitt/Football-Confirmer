import { useState, useEffect } from 'react'

function getKickoffDate() {
  const now = new Date()
  const year = now.getFullYear()
  const target = new Date(year, 5, 11, 21, 0, 0) // June is month 5 (0-indexed)
  if (target < now) target.setFullYear(year + 1)
  return target
}

function computeCountdown() {
  const diff = getKickoffDate() - new Date()
  if (diff <= 0) return null
  const totalSecs = Math.floor(diff / 1000)
  return {
    days:  Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    mins:  Math.floor((totalSecs % 3600) / 60),
    secs:  totalSecs % 60,
  }
}

export function useCountdown() {
  const [countdown, setCountdown] = useState(computeCountdown)

  useEffect(() => {
    const id = setInterval(() => setCountdown(computeCountdown()), 1000)
    return () => clearInterval(id)
  }, [])

  return countdown
}
