import { useState } from 'react'
import type { Task, TaskStatus } from '../types/database'
import { TaskItem } from './TaskItem'

const filters: { label: string; value: TaskStatus | 'all'; icon: string }[] = [
  { label: 'All Tasks', value: 'all', icon: '📋' },
  { label: 'Todo', value: 'todo', icon: '📋' },
  { label: 'Active', value: 'in_progress', icon: '🔥' },
  { label: 'Done', value: 'done', icon: '⭐' },
]

interface Props {
  tasks: Task[]
  loading: boolean
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
  activeTaskId: string | null
  elapsed: number
  onStartTimer: (id: string) => Promise<void>
  onStopTimer: () => Promise<void>
  showFilters?: boolean
  showTimer?: boolean
}

export function TaskList({ tasks, loading, onUpdateStatus, onDelete, activeTaskId, elapsed, onStartTimer, onStopTimer, showFilters = true, showTimer = true }: Props) {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  if (loading) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl animate-bob inline-block">🌻</span>
        <p className="font-body italic text-text-mid text-sm mt-2">Loading your village...</p>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-heading font-bold rounded-full transition-all ${
                filter === f.value
                  ? 'bg-sunshine text-wood-dark shadow-md'
                  : 'bg-cream-dark text-text-mid hover:bg-wood/10 hover:text-wood-dark'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">🌾</span>
            <p className="font-body italic text-text-mid text-sm mt-2">
              Nothing here yet. Add a new task!
            </p>
          </div>
        ) : (
          filtered.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              activeTaskId={activeTaskId}
              elapsed={elapsed}
              onStartTimer={onStartTimer}
              onStopTimer={onStopTimer}
              showTimer={showTimer}
            />
          ))
        )}
      </div>
    </div>
  )
}
