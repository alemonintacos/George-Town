import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus, TaskCategory } from '../types/database'

export interface AddTaskOptions {
  title: string
  description: string
  category?: TaskCategory
  subcategory?: string
  scheduledDate?: string
  scheduledStart?: string
  scheduledEnd?: string
  repeatDays?: number[]
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTasks(data as Task[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = async (opts: AddTaskOptions) => {
    if (!supabase) {
      console.error('Supabase not configured')
      return
    }
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: opts.title,
        description: opts.description || null,
        status: 'todo' as TaskStatus,
        category: opts.category ?? 'goal',
        subcategory: opts.subcategory || null,
        scheduled_date: opts.scheduledDate || null,
        scheduled_start: opts.scheduledStart || null,
        scheduled_end: opts.scheduledEnd || null,
        repeat_days: opts.repeatDays?.length ? opts.repeatDays : null,
        completed_at: null,
      })
      .select()
      .single()
    if (error) {
      console.error('Failed to add task:', error)
      alert(`Failed to add task: ${error.message}`)
      return
    }
    if (data) setTasks(prev => [data as Task, ...prev])
  }

  const updateStatus = async (id: string, status: TaskStatus) => {
    if (!supabase) return
    const update: Record<string, unknown> = { status }
    if (status === 'done') update.completed_at = new Date().toISOString()
    else update.completed_at = null

    const { data } = await supabase
      .from('tasks')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (data) setTasks(prev => prev.map(t => t.id === id ? data as Task : t))
  }

  const updateTask = async (id: string, fields: Partial<Pick<Task, 'title' | 'description' | 'category' | 'subcategory' | 'scheduled_date' | 'scheduled_start' | 'scheduled_end' | 'repeat_days'>>) => {
    if (!supabase) return
    const { data } = await supabase
      .from('tasks')
      .update(fields as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single()
    if (data) setTasks(prev => prev.map(t => t.id === id ? data as Task : t))
  }

  const deleteTask = async (id: string) => {
    if (!supabase) return
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, loading, addTask, updateStatus, updateTask, deleteTask, refetch: fetchTasks }
}
