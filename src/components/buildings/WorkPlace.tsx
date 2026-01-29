import type { Task, TaskStatus } from '../../types/database'
import type { AddTaskOptions } from '../../hooks/useTasks'
import { BuildingShell } from './BuildingShell'
import { TaskForm } from '../TaskForm'
import { TaskList } from '../TaskList'

const subcategoryOptions = [
  { value: 'exodus', label: '🚀 Exodus' },
  { value: 'on-site', label: '🏢 On-Site' },
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

export function WorkPlace({ tasks, loading, onAdd, onUpdateStatus, onDelete, activeTaskId, elapsed, onStartTimer, onStopTimer, onBack }: Props) {
  const filtered = tasks.filter(t => t.category === 'work')

  return (
    <BuildingShell
      icon="🔨"
      name="Work Place"
      subtitle="🔧 Shifts, projects & deadlines 💼"
      gradient="bg-workshop/10"
      border="border-workshop"
      onBack={onBack}
    >
      <TaskForm
        onAdd={onAdd}
        category="work"
        showTimeFields
        subcategoryOptions={subcategoryOptions}
        headerText="Log Work"
        hideTitle
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
