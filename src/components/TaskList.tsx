import { useState } from 'react'
import type { Task, TaskStatus } from '../types/database'
import { TaskItem } from './TaskItem'

const filters: { label: string; value: TaskStatus | 'all'; icon: string }[] = [
  { label: 'All Quests', value: 'all', icon: '🗺️' },
  { label: 'Awaiting', value: 'todo', icon: '📋' },
  { label: 'In Battle', value: 'in_progress', icon: '⚔️' },
  { label: 'Conquered', value: 'done', icon: '🏆' },
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
}

export function TaskList({ tasks, loading, onUpdateStatus, onDelete, activeTaskId, elapsed, onStartTimer, onStopTimer }: Props) {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  if (loading) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl animate-float inline-block">🔮</span>
        <p className="font-lora italic text-parchment/60 text-sm mt-2">Consulting the oracle...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-cinzel font-bold rounded-full transition-all ${
              filter === f.value
                ? 'bg-gradient-to-r from-gold to-gold-light text-tavern shadow-md'
                : 'bg-parchment/15 text-parchment/60 hover:bg-parchment/25 hover:text-parchment/80'
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">🍻</span>
            <p className="font-lora italic text-parchment/50 text-sm mt-2">
              The quest board is empty. Post a new adventure!
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
            />
          ))
        )}
      </div>
    </div>
  )
}
