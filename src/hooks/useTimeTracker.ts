import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { TimeEntry } from '../types/database'

export function useTimeTracker() {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const startRef = useRef<Date | null>(null)
  const intervalRef = useRef<number | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!supabase) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', today.toISOString())
      .order('start_time', { ascending: false })
    if (data) setEntries(data as TimeEntry[])
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  useEffect(() => {
    if (activeTaskId && startRef.current) {
      intervalRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current!.getTime()) / 1000))
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeTaskId])

  const start = async (taskId: string) => {
    if (!supabase || activeTaskId) return
    const now = new Date()
    const { data } = await supabase
      .from('time_entries')
      .insert({ task_id: taskId, start_time: now.toISOString(), end_time: null, duration_seconds: null })
      .select()
      .single()
    if (data) {
      startRef.current = now
      setActiveTaskId(taskId)
      setActiveEntryId((data as TimeEntry).id)
      setElapsed(0)
    }
  }

  const stop = async () => {
    if (!supabase || !activeEntryId || !startRef.current) return
    const now = new Date()
    const duration = Math.floor((now.getTime() - startRef.current.getTime()) / 1000)
    await supabase
      .from('time_entries')
      .update({ end_time: now.toISOString(), duration_seconds: duration })
      .eq('id', activeEntryId)
    setActiveTaskId(null)
    setActiveEntryId(null)
    setElapsed(0)
    startRef.current = null
    if (intervalRef.current) clearInterval(intervalRef.current)
    await fetchEntries()
  }

  const todayTotal = entries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)

  return { activeTaskId, elapsed, entries, todayTotal, start, stop }
}
