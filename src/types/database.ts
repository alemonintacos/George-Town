export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskCategory = 'university' | 'work' | 'social' | 'goal'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  category: TaskCategory
  subcategory: string | null
  scheduled_date: string | null
  scheduled_start: string | null
  scheduled_end: string | null
  repeat_days: number[] | null
  created_at: string
  completed_at: string | null
}

export interface TimeEntry {
  id: string
  task_id: string
  start_time: string
  end_time: string | null
  duration_seconds: number | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Task, 'id'>>
        Relationships: []
      }
      time_entries: {
        Row: TimeEntry
        Insert: Omit<TimeEntry, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<TimeEntry, 'id'>>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
