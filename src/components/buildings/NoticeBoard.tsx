import type { Task, TaskStatus, TaskCategory } from '../../types/database'
import type { AddTaskOptions } from '../../hooks/useTasks'
import { BuildingShell } from './BuildingShell'
import { TaskForm } from '../TaskForm'
import { TaskItem } from '../TaskItem'

const categoryColors: Record<TaskCategory, string> = {
  university: 'border-l-purple-500',
  work: 'border-l-stone',
  social: 'border-l-amber-500',
  goal: 'border-l-gold',
}

const categoryLabels: Record<TaskCategory, string> = {
  university: '🏛️ University',
  work: '⚒️ Work',
  social: '🍺 Social',
  goal: '📋 Goal',
}

interface Props {
  tasks: Task[]
  loading: boolean
  onAdd: (opts: AddTaskOptions) => Promise<void>
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
  activeTaskId: string | null
  elapsed: number
  onStartTimer: (id: string) => Promise<void>
  onStopTimer: () => Promise<void>
  onBack: () => void
}

export function NoticeBoard({ tasks, loading, onAdd, onUpdateStatus, onDelete, activeTaskId, elapsed, onStartTimer, onStopTimer, onBack }: Props) {
  const goals = tasks.filter(t => t.category === 'goal')
  const today = new Date().toISOString().slice(0, 10)
  const todaySchedule = tasks
    .filter(t => t.scheduled_date === today)
    .sort((a, b) => (a.scheduled_start ?? '').localeCompare(b.scheduled_start ?? ''))

  return (
    <BuildingShell
      icon="📋"
      name="Town Notice Board"
      subtitle="Village goals & today's schedule"
      gradient="from-stone-dark to-stone-900"
      border="border-parchment/40"
      onBack={onBack}
    >
      {/* Goals section */}
      <div className="mb-6">
        <h3 className="font-cinzel text-sm font-bold text-gold-light uppercase tracking-wider mb-3">
          🏆 Village Goals
        </h3>
        <TaskForm
          onAdd={onAdd}
          category="goal"
          titlePlaceholder="New village goal..."
        />
        {loading ? (
          <div className="text-center py-4">
            <span className="text-2xl animate-float inline-block">🔮</span>
          </div>
        ) : goals.length === 0 ? (
          <p className="font-lora italic text-parchment/50 text-sm text-center py-4">No goals posted yet.</p>
        ) : (
          <div className="space-y-2">
            {goals.map(task => (
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
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div>
        <h3 className="font-cinzel text-sm font-bold text-gold-light uppercase tracking-wider mb-3">
          📅 Today's Schedule
        </h3>
        {todaySchedule.length === 0 ? (
          <p className="font-lora italic text-parchment/50 text-sm text-center py-4">Nothing scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map(task => (
              <div key={task.id} className={`border-l-4 ${categoryColors[task.category]} rounded-r-lg`}>
                <div className="flex items-center gap-2 px-2 py-1">
                  <span className="text-[10px] font-cinzel font-bold text-parchment/50">{categoryLabels[task.category]}</span>
                  {task.scheduled_start && (
                    <span className="text-[10px] font-cinzel text-parchment/40">
                      {task.scheduled_start}{task.scheduled_end && `–${task.scheduled_end}`}
                    </span>
                  )}
                </div>
                <TaskItem
                  task={task}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                  activeTaskId={activeTaskId}
                  elapsed={elapsed}
                  onStartTimer={onStartTimer}
                  onStopTimer={onStopTimer}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </BuildingShell>
  )
}
