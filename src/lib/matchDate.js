export function formatKickoff(kickoffAt, durationMinutes) {
  if (!kickoffAt) return null
  const start = new Date(kickoffAt)
  const end = new Date(start.getTime() + (durationMinutes ?? 90) * 60000)
  const timeFmt = { hour: 'numeric', minute: '2-digit' }
  return {
    weekdayShort: start.toLocaleDateString('en-US', { weekday: 'short' }),
    weekdayLong: start.toLocaleDateString('en-US', { weekday: 'long' }),
    day: start.getDate(),
    month: start.toLocaleDateString('en-US', { month: 'long' }),
    startLabel: start.toLocaleTimeString('en-US', timeFmt),
    endLabel: end.toLocaleTimeString('en-US', timeFmt),
  }
}
