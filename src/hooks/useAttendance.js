import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Coalesces rapid realtime events into a single fetch
function useDebouncedCallback(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export function useAttendance() {
  const [confirmed, setConfirmed] = useState([])
  const [maybe, setMaybe] = useState([])

  const fetchAttendance = useCallback(async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('name, status')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('fetchAttendance:', error.message)
      return
    }

    setConfirmed(data.filter(r => r.status === 'confirmed').map(r => r.name))
    setMaybe(data.filter(r => r.status === 'maybe').map(r => r.name))
  }, [])

  // 400 ms debounce — burst of realtime events becomes one SELECT
  const debouncedFetch = useDebouncedCallback(fetchAttendance, 400)

  // Case-insensitive upsert: delete any existing name match, then insert fresh row
  const upsertPlayer = useCallback(async (name, status) => {
    await supabase.from('attendance').delete().ilike('name', name)
    const { error } = await supabase.from('attendance').insert({ name, status })
    if (error) throw error
  }, [])

  const deletePlayer = useCallback(async (name) => {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .ilike('name', name)
    if (error) throw error
  }, [])

  useEffect(() => {
    fetchAttendance()

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        debouncedFetch,
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchAttendance, debouncedFetch])

  return { confirmed, maybe, upsertPlayer, deletePlayer }
}
