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
  const [records, setRecords] = useState([]) // [{ name, status, whatsapp }]
  const [maxPlayers, setMaxPlayers] = useState(14)
  const [paidPlayers, setPaidPlayers] = useState(new Set())

  const fetchAttendance = useCallback(async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('name, status, whatsapp')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('fetchAttendance:', error.message)
      return
    }

    setRecords(data)
  }, [])

  const fetchPayments = useCallback(async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('name')
      .eq('paid', true)
    if (error) { console.error('fetchPayments:', error.message); return }
    setPaidPlayers(new Set(data.map(r => r.name.toLowerCase())))
  }, [])

  const togglePaid = useCallback(async (name, currentlyPaid) => {
    if (currentlyPaid) {
      await supabase.from('payments').delete().eq('name', name)
    } else {
      await supabase.from('payments').upsert({ name, paid: true }, { onConflict: 'name' })
    }
    // optimistic update
    setPaidPlayers(prev => {
      const next = new Set(prev)
      if (currentlyPaid) next.delete(name.toLowerCase())
      else next.add(name.toLowerCase())
      return next
    })
  }, [])

  const fetchConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('config')
      .select('max_players')
      .single()
    if (error) {
      console.error('fetchConfig:', error.message)
      return
    }
    if (data) setMaxPlayers(data.max_players)
  }, [])

  // 400 ms debounce — burst of realtime events becomes one SELECT
  const debouncedFetch = useDebouncedCallback(fetchAttendance, 400)

  // Case-insensitive upsert: delete any existing name match, then insert fresh row
  const upsertPlayer = useCallback(async (name, status, whatsapp) => {
    await supabase.from('attendance').delete().ilike('name', name)
    const { error } = await supabase.from('attendance').insert({ name, status, whatsapp })
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
    fetchConfig()
    fetchAttendance()
    fetchPayments()

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        debouncedFetch,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'config' },
        fetchConfig,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        fetchPayments,
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchAttendance, fetchConfig, fetchPayments, debouncedFetch])

  const confirmed = records.filter(r => r.status === 'confirmed').map(r => r.name)
  const maybe = records.filter(r => r.status === 'maybe').map(r => r.name)
  const confirmedRecords = records.filter(r => r.status === 'confirmed')
  const maybeRecords = records.filter(r => r.status === 'maybe')

  return {
    confirmed,
    maybe,
    confirmedRecords,
    maybeRecords,
    maxPlayers,
    paidPlayers,
    upsertPlayer,
    deletePlayer,
    togglePaid,
  }
}
