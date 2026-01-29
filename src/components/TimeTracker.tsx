import type { Task } from '../types/database'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  activeTaskId: string | null
  elapsed: number
  tasks: Task[]
  onStop: () => Promise<void>
}

export function TimeTracker({ activeTaskId, elapsed, tasks, onStop }: Props) {
  if (!activeTaskId) return null

  const task = tasks.find(t => t.id === activeTaskId)

  return (
    <div className="mb-6 wooden-frame rounded-2xl p-5 text-center relative overflow-hidden">
      <div className="absolute top-2 left-4 text-lg animate-sway">🔔</div>
      <div className="absolute top-2 right-4 text-lg animate-sway" style={{ animationDelay: '1s' }}>🔔</div>

      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-2xl">🕰️</span>
        <h3 className="font-heading text-sm font-bold text-wood-dark uppercase tracking-wider">
          Village Clocktower
        </h3>
      </div>

      <p className="font-body italic text-text-mid text-xs mb-3">
        Time ticks as the seasons pass...
      </p>

      <div className="font-pixel text-4xl font-black text-bark drop-shadow-[0_0_12px_rgba(244,169,64,0.3)] mb-2 tracking-widest">
        {formatTime(elapsed)}
      </div>

      <p className="font-body text-text-dark text-sm mb-3">
        📝 <span className="italic">{task?.title ?? 'Unknown Task'}</span>
      </p>

      <button
        onClick={onStop}
        className="px-5 py-2 bg-overdue text-white font-heading text-sm font-bold rounded-lg shadow-lg hover:bg-overdue/80 hover:scale-105 transition-all"
      >
        ⏹ Stop Timer
      </button>
    </div>
  )
}
