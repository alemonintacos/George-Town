import type { Task, TaskStatus } from '../../types/database'
import type { AddTaskOptions } from '../../hooks/useTasks'
import { BuildingShell } from './BuildingShell'
import { TaskForm } from '../TaskForm'
import { TaskList } from '../TaskList'

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

export function TavernPub({ tasks, loading, onAdd, onUpdateStatus, onDelete, activeTaskId, elapsed, onStartTimer, onStopTimer, onBack }: Props) {
  const filtered = tasks.filter(t => t.category === 'social')

  return (
    <BuildingShell
      icon="🍻"
      name="Saloon"
      subtitle="🎉 Social events & celebrations 🎊"
      gradient="bg-saloon/10"
      border="border-saloon"
      onBack={onBack}
    >
      <TaskForm
        onAdd={onAdd}
        category="social"
        showTimeFields
        titlePlaceholder="Social event..."
      />
      <TaskList
        tasks={filtered}
        loading={loading}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDelete}
        activeTaskId={activeTaskId}
        elapsed={elapsed}
        onStartTimer={onStartTimer}
        onStopTimer={onStopTimer}
        showFilters={false}
      />
    </BuildingShell>
  )
}
