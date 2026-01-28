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
    })
    setTitle('')
    setSubcategory('')
    setScheduledDate('')
    setScheduledStart('')
    setScheduledEnd('')
    setRepeatDays([])
    setShowRepeat(false)
  }

  return (
    <form onSubmit={handleSubmit} className="quest-scroll rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✒️</span>
        <span className="font-cinzel text-xs font-bold text-leather uppercase tracking-wider">
          {headerText ?? 'Post a New Quest'}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {!hideTitle && (
          <input
            type="text"
            placeholder={titlePlaceholder ?? 'Quest title...'}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 bg-parchment/60 border border-leather/30 rounded-lg text-sm font-lora text-tavern placeholder:text-leather/40 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        )}
        {subcategoryOptions ? (
          <select
            value={subcategory}
            onChange={e => setSubcategory(e.target.value)}
            className="px-3 py-2 bg-parchment/60 border border-leather/30 rounded-lg text-sm font-lora text-tavern focus:outline-none focus:ring-2 focus:ring-gold"
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
            className="flex-1 min-w-[140px] px-3 py-2 bg-parchment/60 border border-leather/30 rounded-lg text-sm font-lora text-tavern placeholder:text-leather/40 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        )}
        <input
          type="date"
          value={scheduledDate}
          onChange={e => setScheduledDate(e.target.value)}
          className="px-3 py-2 bg-parchment/60 border border-leather/30 rounded-lg text-sm font-lora text-tavern focus:outline-none focus:ring-2 focus:ring-gold"
        />
        {showTimeFields && (
          <>
            <input
              type="time"
              value={scheduledStart}
              onChange={e => setScheduledStart(e.target.value)}
              className="px-2 py-2 bg-parchment/60 border border-leather/30 rounded-lg text-sm font-lora text-tavern focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <input
              type="time"
              value={scheduledEnd}
              onChange={e => setScheduledEnd(e.target.value)}
              className="px-2 py-2 bg-parchment/60 border border-leather/30 rounded-lg text-sm font-lora text-tavern focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </>
        )}
        <button
          type="button"
          onClick={() => setShowRepeat(prev => !prev)}
          className={`px-2 py-2 rounded-lg text-xs font-cinzel font-bold border transition-colors ${
            showRepeat || repeatDays.length
              ? 'bg-gold/20 border-gold/50 text-leather'
              : 'bg-parchment/40 border-leather/20 text-leather/50 hover:bg-parchment/60'
          }`}
          title="Set repeating schedule"
        >
          🔁
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-forest-dark to-forest text-white font-cinzel text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          📌 Post
        </button>
      </div>
      {showRepeat && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-cinzel font-bold text-leather/70">Repeat:</span>
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`w-7 h-7 rounded-full text-[10px] font-cinzel font-bold transition-colors ${
                repeatDays.includes(i)
                  ? 'bg-gold text-tavern'
                  : 'bg-parchment/40 text-leather/50 hover:bg-parchment/60'
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
