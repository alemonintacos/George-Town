import type { Task, TaskStatus } from '../../types/database'
import type { AddTaskOptions } from '../../hooks/useTasks'
import { BuildingShell } from './BuildingShell'
import { TaskForm } from '../TaskForm'
import { TaskList } from '../TaskList'

const subcategoryOptions = [
  { value: 'class', label: '📖 Class' },
  { value: 'test', label: '📝 Test' },
  { value: 'study', label: '📚 Study' },
]

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

export function UniversitySchool({ tasks, loading, onAdd, onUpdateStatus, onDelete, activeTaskId, elapsed, onStartTimer, onStopTimer, onBack }: Props) {
  const filtered = tasks.filter(t => t.category === 'university')

  return (
    <BuildingShell
      icon="🏛️"
      name="University School"
      subtitle="📚 Study sessions, classes & assignments 🎓"
      gradient="from-purple-950 to-indigo-950"
      border="border-purple-500/60"
      onBack={onBack}
    >
      <TaskForm
        onAdd={onAdd}
        category="university"
        showTimeFields
        titlePlaceholder="Class or study session..."
        subcategoryOptions={subcategoryOptions}
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
      />
    </BuildingShell>
  )
}
