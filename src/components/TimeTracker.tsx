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
    <div className="mb-6 stone-wall rounded-2xl p-5 text-center relative overflow-hidden">
      <div className="absolute top-2 left-4 text-lg animate-flicker">🕯️</div>
      <div className="absolute top-2 right-4 text-lg animate-flicker" style={{ animationDelay: '1s' }}>🕯️</div>

      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-2xl">🕰️</span>
        <h3 className="font-cinzel text-sm font-bold text-gold-light uppercase tracking-wider">
          The Clocktower Inn
        </h3>
      </div>

      <p className="font-lora italic text-parchment/60 text-xs mb-3">
        Time flows as the sands decree...
      </p>

      <div className="font-cinzel text-4xl font-black text-gold-light drop-shadow-[0_0_12px_rgba(255,215,0,0.4)] mb-2 tracking-widest">
        {formatTime(elapsed)}
      </div>

      <p className="font-lora text-parchment/80 text-sm mb-3">
        ⚔️ <span className="italic">{task?.title ?? 'Unknown Quest'}</span>
      </p>

      <button
        onClick={onStop}
        className="px-5 py-2 bg-gradient-to-r from-crimson to-crimson-light text-white font-cinzel text-sm font-bold rounded-lg shadow-lg hover:shadow-crimson-light/30 hover:scale-105 transition-all"
      >
        🛑 Halt thy Clock
      </button>
    </div>
  )
}
