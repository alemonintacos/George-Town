import type { Task, TaskStatus, TaskCategory } from '../types/database'

const statusConfig: Record<TaskStatus, { label: string; icon: string; bg: string; text: string }> = {
  todo: { label: 'Todo', icon: '📋', bg: 'bg-todo/15', text: 'text-todo' },
  in_progress: { label: 'Active', icon: '🔥', bg: 'bg-active/15', text: 'text-active' },
  done: { label: 'Done', icon: '⭐', bg: 'bg-done/15', text: 'text-done' },
}

const categoryBorder: Record<TaskCategory, string> = {
  university: 'border-l-school',
  work: 'border-l-workshop',
  social: 'border-l-saloon',
  goal: 'border-l-bulletin',
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: null,
}

const nextLabels: Record<TaskStatus, string> = {
  todo: '▶ Start',
  in_progress: '⭐ Done!',
  done: '',
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Props {
  task: Task
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
  activeTaskId: string | null
  elapsed: number
  onStartTimer: (id: string) => Promise<void>
  onStopTimer: () => Promise<void>
  showTimer?: boolean
}

export function TaskItem({ task, onUpdateStatus, onDelete, activeTaskId, elapsed, onStartTimer, onStopTimer, showTimer = true }: Props) {
  const isTimerActive = activeTaskId === task.id
  const next = nextStatus[task.status]
  const status = statusConfig[task.status]
  // Only show timer for university study tasks
  const canShowTimer = showTimer && task.category === 'university' && task.subcategory === 'study'

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border border-l-4 ${categoryBorder[task.category]} transition-all ${
      isTimerActive
        ? 'bg-active/10 border-active/30 shadow-[0_0_12px_rgba(244,169,64,0.15)]'
        : task.status === 'done'
          ? 'bg-cream-dark/50 border-earth/10'
          : 'bg-white border-earth/20'
    }`}>
      <span className="text-lg">{status.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-body font-semibold truncate ${
            task.status === 'done' ? 'line-through text-text-light' : 'text-text-dark'
          }`}>
            {task.title}
          </p>
          {task.subcategory && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold uppercase bg-earth/10 text-text-mid shrink-0">
              {task.subcategory}
            </span>
          )}
        </div>
        {task.description && task.description !== task.subcategory && (
          <p className="text-xs font-body italic text-text-light truncate">{task.description}</p>
        )}
      </div>

      {task.scheduled_date && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-pixel font-bold bg-sky-light/40 text-focus shrink-0">
          {task.scheduled_date}
          {task.scheduled_start && ` ${task.scheduled_start}`}
          {task.scheduled_end && `–${task.scheduled_end}`}
        </span>
      )}

      {task.repeat_days && task.repeat_days.length > 0 && (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold bg-sunshine/15 text-wood-dark shrink-0" title={`Repeats: ${task.repeat_days.map(d => DAY_LABELS[d]).join(', ')}`}>
          🔁 {task.repeat_days.map(d => DAY_LABELS[d]).join(' ')}
        </span>
      )}

      <span className={`px-2 py-0.5 rounded-full text-[10px] font-pixel font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
        {status.label}
      </span>

      {canShowTimer && isTimerActive && (
        <span className="text-sm font-pixel font-bold text-active animate-pulse">{formatTime(elapsed)}</span>
      )}

      {canShowTimer && task.status !== 'done' && (
        isTimerActive ? (
          <button onClick={onStopTimer} className="px-2 py-1 text-xs font-heading font-bold bg-overdue text-white rounded-lg hover:bg-overdue/80 transition-colors">
            ⏹ Stop
          </button>
        ) : (
          <button
            onClick={() => onStartTimer(task.id)}
            disabled={activeTaskId !== null}
            className="px-2 py-1 text-xs font-heading font-bold bg-focus/20 text-focus rounded-lg hover:bg-focus/30 disabled:opacity-30 transition-colors"
          >
            ⏱ Track
          </button>
        )
      )}

      {next && (
        <button
          onClick={() => onUpdateStatus(task.id, next)}
          className="px-2 py-1 text-xs font-heading font-bold bg-grass/20 text-grass-dark rounded-lg hover:bg-grass/30 transition-colors"
        >
          {nextLabels[task.status]}
        </button>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="px-2 py-1 text-xs text-overdue/50 hover:text-overdue hover:bg-overdue/10 rounded-lg transition-colors"
        title="Delete task"
      >
        🗑️
      </button>
    </div>
  )
}
