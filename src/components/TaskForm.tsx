import { useState } from 'react'
import type { TaskCategory } from '../types/database'
import type { AddTaskOptions } from '../hooks/useTasks'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface Props {
  onAdd: (opts: AddTaskOptions) => Promise<void>
  category?: TaskCategory
  showTimeFields?: boolean
  titlePlaceholder?: string
  subcategoryOptions?: { value: string; label: string }[]
  headerText?: string
  hideTitle?: boolean
}

export function TaskForm({ onAdd, category, showTimeFields, titlePlaceholder, subcategoryOptions, headerText, hideTitle }: Props) {
  const [title, setTitle] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const [scheduledEnd, setScheduledEnd] = useState('')
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [showRepeat, setShowRepeat] = useState(false)
  const [showRequired, setShowRequired] = useState(false)

  const toggleDay = (day: number) => {
    setRepeatDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // When hideTitle is true, use the dropdown label as the title
    let effectiveTitle = title.trim()
    if (hideTitle && subcategoryOptions) {
      const selected = subcategoryOptions.find(o => o.value === subcategory)
      effectiveTitle = selected?.label ?? subcategory
    }
    if (!effectiveTitle) return
    await onAdd({
      title: effectiveTitle,
      description: hideTitle ? '' : (subcategory || ''),
      category,
      subcategory: subcategory || undefined,
      scheduledDate: scheduledDate || undefined,
      scheduledStart: scheduledStart || undefined,
      scheduledEnd: scheduledEnd || undefined,
      repeatDays: repeatDays.length ? repeatDays : undefined,
      showRequired: showRequired || undefined,
    })
    setTitle('')
    setSubcategory('')
    setScheduledDate('')
    setScheduledStart('')
    setScheduledEnd('')
    setRepeatDays([])
    setShowRepeat(false)
    setShowRequired(false)
  }

  return (
    <form onSubmit={handleSubmit} className="form-board rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📝</span>
        <span className="font-heading text-xs font-bold text-wood-dark uppercase tracking-wider">
          {headerText ?? 'Add New Task'}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {!hideTitle && (
          <input
            type="text"
            placeholder={titlePlaceholder ?? 'Task title...'}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-earth/30 rounded-lg text-sm font-body text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-focus"
          />
        )}
        {subcategoryOptions ? (
          <select
            value={subcategory}
            onChange={e => setSubcategory(e.target.value)}
            className="px-3 py-2 bg-white border border-earth/30 rounded-lg text-sm font-body text-text-dark focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <option value="">Type...</option>
            {subcategoryOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Details (optional)"
            value={subcategory}
            onChange={e => setSubcategory(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-earth/30 rounded-lg text-sm font-body text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-focus"
          />
        )}
        <input
          type="date"
          value={scheduledDate}
          onChange={e => setScheduledDate(e.target.value)}
          className="px-3 py-2 bg-white border border-earth/30 rounded-lg text-sm font-body text-text-dark focus:outline-none focus:ring-2 focus:ring-focus"
        />
        {showTimeFields && (
          <>
            <input
              type="time"
              value={scheduledStart}
              onChange={e => setScheduledStart(e.target.value)}
              className="px-2 py-2 bg-white border border-earth/30 rounded-lg text-sm font-body text-text-dark focus:outline-none focus:ring-2 focus:ring-focus"
            />
            <input
              type="time"
              value={scheduledEnd}
              onChange={e => setScheduledEnd(e.target.value)}
              className="px-2 py-2 bg-white border border-earth/30 rounded-lg text-sm font-body text-text-dark focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </>
        )}
        <button
          type="button"
          onClick={() => setShowRepeat(prev => !prev)}
          className={`px-2 py-2 rounded-lg text-xs font-heading font-bold border transition-colors ${
            showRepeat || repeatDays.length
              ? 'bg-sunshine/20 border-sunshine/50 text-wood-dark'
              : 'bg-cream-dark border-earth/20 text-text-light hover:bg-wood/10'
          }`}
          title="Set repeating schedule"
        >
          🔁
        </button>
        {category !== 'goal' && (
          <button
            type="button"
            onClick={() => setShowRequired(prev => !prev)}
            className={`px-2 py-2 rounded-lg text-sm font-bold border transition-colors ${
              showRequired
                ? 'bg-berry/20 border-berry/50 text-berry'
                : 'bg-cream-dark border-earth/20 text-text-light hover:bg-wood/10'
            }`}
            title="Show in Required Tasks"
          >
            ❗
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-grass text-white font-heading text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:bg-grass-dark hover:scale-105 transition-all"
        >
          ✅ Add
        </button>
      </div>
      {showRepeat && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-heading font-bold text-text-mid">Repeat:</span>
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`w-7 h-7 rounded-full text-[10px] font-heading font-bold transition-colors ${
                repeatDays.includes(i)
                  ? 'bg-sunshine text-wood-dark'
                  : 'bg-cream-dark text-text-light hover:bg-wood/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
