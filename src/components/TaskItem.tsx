import type { Task, TaskStatus, TaskCategory } from '../types/database'

const statusConfig: Record<TaskStatus, { label: string; icon: string; bg: string; text: string }> = {
  todo: { label: 'Awaiting', icon: '📋', bg: 'bg-purple-900/60', text: 'text-purple-200' },
  in_progress: { label: 'In Battle', icon: '⚔️', bg: 'bg-amber-900/60', text: 'text-amber-200' },
  done: { label: 'Conquered', icon: '🏆', bg: 'bg-emerald-900/60', text: 'text-emerald-200' },
}

const categoryBorder: Record<TaskCategory, string> = {
  university: 'border-l-purple-500',
  work: 'border-l-stone',
  social: 'border-l-amber-500',
  goal: 'border-l-gold',
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: null,
}

const nextLabels: Record<TaskStatus, string> = {
  todo: '⚔️ Begin',
  in_progress: '🏆 Complete',
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
        ? 'bg-gold/10 border-gold/40 shadow-[0_0_12px_rgba(218,165,32,0.15)]'
        : task.status === 'done'
          ? 'bg-parchment/30 border-leather/10'
          : 'bg-parchment/50 border-leather/20'
    }`}>
      <span className="text-lg">{status.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-lora font-semibold truncate ${
            task.status === 'done' ? 'line-through text-leather/40' : 'text-tavern'
          }`}>
            {task.title}
          </p>
          {task.subcategory && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-cinzel font-bold uppercase bg-leather/10 text-leather/60 shrink-0">
              {task.subcategory}
            </span>
          )}
        </div>
        {task.description && task.description !== task.subcategory && (
          <p className="text-xs font-lora italic text-leather/50 truncate">{task.description}</p>
        )}
      </div>

      {task.scheduled_date && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-cinzel font-bold bg-sky-900/60 text-sky-200 shrink-0">
          {task.scheduled_date}
          {task.scheduled_start && ` ${task.scheduled_start}`}
          {task.scheduled_end && `–${task.scheduled_end}`}
        </span>
      )}

      {task.repeat_days && task.repeat_days.length > 0 && (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-cinzel font-bold bg-gold/15 text-gold shrink-0" title={`Repeats: ${task.repeat_days.map(d => DAY_LABELS[d]).join(', ')}`}>
          🔁 {task.repeat_days.map(d => DAY_LABELS[d]).join(' ')}
        </span>
      )}

      <span className={`px-2 py-0.5 rounded-full text-[10px] font-cinzel font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
        {status.label}
      </span>

      {canShowTimer && isTimerActive && (
        <span className="text-sm font-cinzel font-bold text-gold animate-pulse">{formatTime(elapsed)}</span>
      )}

      {canShowTimer && task.status !== 'done' && (
        isTimerActive ? (
          <button onClick={onStopTimer} className="px-2 py-1 text-xs font-cinzel font-bold bg-crimson/80 text-white rounded-lg hover:bg-crimson transition-colors">
            🛑 Halt
          </button>
        ) : (
          <button
            onClick={() => onStartTimer(task.id)}
            disabled={activeTaskId !== null}
            className="px-2 py-1 text-xs font-cinzel font-bold bg-royal/60 text-purple-200 rounded-lg hover:bg-royal-light/60 disabled:opacity-30 transition-colors"
          >
            ⏳ Track
          </button>
        )
      )}

      {next && (
        <button
          onClick={() => onUpdateStatus(task.id, next)}
          className="px-2 py-1 text-xs font-cinzel font-bold bg-forest/60 text-green-200 rounded-lg hover:bg-forest-dark/80 transition-colors"
        >
          {nextLabels[task.status]}
        </button>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="px-2 py-1 text-xs text-crimson-light/70 hover:text-crimson-light hover:bg-crimson/10 rounded-lg transition-colors"
        title="Abandon quest"
      >
        💀
      </button>
    </div>
  )
}
