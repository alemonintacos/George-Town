import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskCategory } from '../types/database'

interface Countdown {
  id: string
  title: string
  target: string // ISO datetime string
}

function loadCountdowns(): Countdown[] {
  try {
    return JSON.parse(localStorage.getItem('gt_countdowns') ?? '[]')
  } catch { return [] }
}

function saveCountdowns(c: Countdown[]) {
  localStorage.setItem('gt_countdowns', JSON.stringify(c))
}

function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return 'Arrived!'
  const s = Math.floor(diffMs / 1000)
  const days = Math.floor(s / 86400)
  const hrs = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  if (days > 0) return `${days}d ${hrs}h ${mins}m`
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
  return `${mins}m ${secs}s`
}

const categoryConfig: Record<TaskCategory, { icon: string; label: string; dot: string }> = {
  university: { icon: '📚', label: 'University', dot: 'bg-school' },
  work: { icon: '🔨', label: 'Work', dot: 'bg-workshop' },
  social: { icon: '🍻', label: 'Social', dot: 'bg-saloon' },
  goal: { icon: '📌', label: 'Goal', dot: 'bg-bulletin' },
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function toDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDate(s: string) {
  return new Date(s + 'T00:00:00')
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function shortDate(d: Date) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`
}

function getWeekDates(startDate: Date, realToday: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startDate, i)
    const str = toDateStr(d)
    return { date: d, str, label: DAY_NAMES[d.getDay()], isToday: str === realToday }
  })
}

function getMonthGrid(year: number, month: number, realToday: string) {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { day: number | null; str: string; isToday: boolean }[] = []

  for (let i = 0; i < startOffset; i++) cells.push({ day: null, str: '', isToday: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, str, isToday: str === realToday })
  }
  return cells
}

function formatDayLabel(dateStr: string, realToday: string) {
  if (dateStr === realToday) return 'Today'
  const tomorrow = toDateStr(addDays(new Date(), 1))
  if (dateStr === tomorrow) return 'Tomorrow'
  const yesterday = toDateStr(addDays(new Date(), -1))
  if (dateStr === yesterday) return 'Yesterday'
  const d = parseDate(dateStr)
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`
}

function isCurrentWeek(weekStart: Date) {
  const now = new Date()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
  return toDateStr(weekStart) === toDateStr(thisWeekStart)
}

interface Props {
  tasks: Task[]
}

export function Dashboard({ tasks }: Props) {
  const realToday = toDateStr(new Date())

  // Day view state — stored as a date string so month cells can set it directly
  const [viewingDate, setViewingDate] = useState(realToday)
  const isViewingToday = viewingDate === realToday

  // Calendar view state
  const [calMode, setCalMode] = useState<'week' | 'month'>('week')
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    return d
  })
  const [monthYear, setMonthYear] = useState(() => new Date().getFullYear())
  const [monthMonth, setMonthMonth] = useState(() => new Date().getMonth())

  // Day schedule
  const dayTasks = tasks
    .filter(t => t.scheduled_date === viewingDate)
    .sort((a, b) => (a.scheduled_start ?? '99').localeCompare(b.scheduled_start ?? '99'))

  // Week data
  const week = getWeekDates(weekStart, realToday)
  const weekByDay = week.map(day => ({
    ...day,
    tasks: tasks
      .filter(t => t.scheduled_date === day.str)
      .sort((a, b) => (a.scheduled_start ?? '99').localeCompare(b.scheduled_start ?? '99')),
  }))

  // Week header label
  const weekLabel = isCurrentWeek(weekStart)
    ? 'This Week'
    : `${shortDate(week[0].date)} – ${shortDate(week[6].date)}`

  // Month data
  const monthGrid = getMonthGrid(monthYear, monthMonth, realToday)
  const monthTaskMap = new Map<string, Task[]>()
  for (const t of tasks) {
    if (!t.scheduled_date) continue
    if (!t.scheduled_date.startsWith(`${monthYear}-${String(monthMonth + 1).padStart(2, '0')}`)) continue
    const arr = monthTaskMap.get(t.scheduled_date) ?? []
    arr.push(t)
    monthTaskMap.set(t.scheduled_date, arr)
  }

  // Required tasks
  const rangeEnd = calMode === 'week' ? week[6].str : `${monthYear}-${String(monthMonth + 1).padStart(2, '0')}-31`
  const required = tasks.filter(t => {
    if (t.status === 'done') return false
    if (!t.scheduled_date) return true
    return t.scheduled_date <= rangeEnd
  }).sort((a, b) => {
    const aDate = a.scheduled_date ?? '9999'
    const bDate = b.scheduled_date ?? '9999'
    return aDate.localeCompare(bDate)
  })

  // Split required tasks: notice board (goal) vs others with show_required
  const requiredGoals = required.filter(t => t.category === 'goal')
  const requiredOthers = required.filter(t => t.category !== 'goal' && t.show_required)

  // Countdowns
  const [countdowns, setCountdowns] = useState<Countdown[]>(loadCountdowns)
  const [cdTitle, setCdTitle] = useState('')
  const [cdDate, setCdDate] = useState('')
  const [cdTime, setCdTime] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    if (countdowns.length === 0) return
    const iv = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [countdowns.length])

  const addCountdown = useCallback(() => {
    if (!cdTitle.trim() || !cdDate) return
    const target = cdTime ? `${cdDate}T${cdTime}` : `${cdDate}T00:00:00`
    const next = [...countdowns, { id: Date.now().toString(), title: cdTitle.trim(), target }]
    setCountdowns(next)
    saveCountdowns(next)
    setCdTitle('')
    setCdDate('')
    setCdTime('')
  }, [cdTitle, cdDate, cdTime, countdowns])

  const removeCountdown = useCallback((id: string) => {
    const next = countdowns.filter(c => c.id !== id)
    setCountdowns(next)
    saveCountdowns(next)
  }, [countdowns])

  const shiftDay = (n: number) => setViewingDate(prev => toDateStr(addDays(parseDate(prev), n)))
  const prevWeek = () => setWeekStart(prev => addDays(prev, -7))
  const nextWeek = () => setWeekStart(prev => addDays(prev, 7))
  const prevMonth = () => {
    if (monthMonth === 0) { setMonthYear(y => y - 1); setMonthMonth(11) }
    else setMonthMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (monthMonth === 11) { setMonthYear(y => y + 1); setMonthMonth(0) }
    else setMonthMonth(m => m + 1)
  }

  const navBtn = "px-1.5 py-0.5 text-[10px] font-heading font-bold text-text-mid hover:text-wood-dark hover:bg-wood/10 rounded transition-colors"

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🏡</span>
        <div>
          <h2 className="font-heading text-xl font-bold text-wood-dark">
            Town Square
          </h2>
          <p className="font-body italic text-text-mid text-xs">
            The heart of George Town — your schedule at a glance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left column: Day + Calendar */}
        <div className="space-y-4">
          {/* Day Schedule */}
          <div className="bg-sky-light/30 border-2 border-sky-blue/40 rounded-xl p-4 shadow-[2px_2px_8px_rgba(107,66,38,0.1)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-wood-dark uppercase tracking-wider">
                📅 {formatDayLabel(viewingDate, realToday)}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => shiftDay(-1)} className={navBtn}>◀</button>
                {!isViewingToday && (
                  <button onClick={() => setViewingDate(realToday)} className={`${navBtn} text-focus`}>today</button>
                )}
                <button onClick={() => shiftDay(1)} className={navBtn}>▶</button>
              </div>
            </div>
            {dayTasks.length === 0 ? (
              <p className="font-body italic text-text-light text-xs">No events scheduled.</p>
            ) : (
              <div className="space-y-1.5">
                {dayTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${categoryConfig[t.category].dot}`} />
                    {t.scheduled_start && (
                      <span className="text-[10px] font-pixel text-text-mid w-[70px] shrink-0">
                        {t.scheduled_start}{t.scheduled_end ? `–${t.scheduled_end}` : ''}
                      </span>
                    )}
                    <span className={`text-xs font-body truncate ${t.status === 'done' ? 'line-through text-text-light' : 'text-text-dark'}`}>
                      {t.title}
                    </span>
                    {t.subcategory && (
                      <span className="text-[9px] font-heading text-text-light uppercase shrink-0">{t.subcategory}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-cream border-2 border-wood/30 rounded-xl p-4 shadow-[2px_2px_8px_rgba(107,66,38,0.1)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-wood-dark uppercase tracking-wider">
                🗓️ {calMode === 'week' ? weekLabel : `${MONTH_NAMES[monthMonth]} ${monthYear}`}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={calMode === 'week' ? prevWeek : prevMonth} className={navBtn}>◀</button>
                <button
                  onClick={() => setCalMode(m => m === 'week' ? 'month' : 'week')}
                  className={`${navBtn} text-focus`}
                >
                  {calMode === 'week' ? 'month' : 'week'}
                </button>
                <button onClick={calMode === 'week' ? nextWeek : nextMonth} className={navBtn}>▶</button>
              </div>
            </div>

            {calMode === 'week' ? (
              <div className="space-y-2">
                {weekByDay.map(day => (
                  <div key={day.str} className="flex gap-2">
                    <span className={`text-[10px] font-pixel w-8 shrink-0 pt-0.5 ${day.isToday ? 'text-grass-dark font-bold' : 'text-text-light'}`}>
                      {day.label}
                    </span>
                    {day.tasks.length === 0 ? (
                      <span className="text-[10px] font-body italic text-text-light/40">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {day.tasks.map(t => (
                          <span
                            key={t.id}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-body ${
                              t.status === 'done' ? 'bg-done/10 text-text-light line-through' : 'bg-wood/10 text-text-dark'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${categoryConfig[t.category].dot}`} />
                            {t.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Month grid */
              <div>
                <div className="grid grid-cols-7 gap-px mb-1">
                  {DAY_NAMES.map(d => (
                    <span key={d} className="text-[9px] font-heading text-text-light text-center">{d.slice(0, 2)}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {monthGrid.map((cell, i) => {
                    if (cell.day === null) return <div key={`empty-${i}`} />
                    const cellTasks = monthTaskMap.get(cell.str) ?? []
                    const isSelected = cell.str === viewingDate

                    // Determine which task type indicators to show
                    const hasWork = cellTasks.some(t => t.category === 'work')
                    const hasTest = cellTasks.some(t => t.category === 'university' && t.subcategory === 'test')
                    const hasClass = cellTasks.some(t => t.category === 'university' && t.subcategory === 'class')
                    const hasSocial = cellTasks.some(t => t.category === 'social')

                    const indicators: string[] = []
                    if (hasWork) indicators.push('border-workshop')
                    if (hasTest) indicators.push('border-sunshine')
                    if (hasClass) indicators.push('border-grass')
                    if (hasSocial) indicators.push('border-saloon')

                    return (
                      <button
                        key={cell.str}
                        type="button"
                        onClick={() => setViewingDate(cell.str)}
                        className={`relative p-1 rounded text-center min-h-[32px] transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-school/15 ring-1 ring-school/40'
                            : cell.isToday
                              ? 'bg-sunshine/20 ring-1 ring-sunshine/50'
                              : 'hover:bg-wood/10'
                        }`}
                      >
                        {/* Stacked colored borders for task types */}
                        {indicators.length > 0 && (
                          <div className="absolute inset-0 flex flex-col rounded overflow-hidden pointer-events-none">
                            {indicators.map((borderClass, idx) => (
                              <div
                                key={idx}
                                className={`flex-1 border-2 ${borderClass} rounded`}
                                style={{ opacity: 0.6 }}
                              />
                            ))}
                          </div>
                        )}
                        <span className={`relative z-10 text-[10px] font-pixel ${
                          isSelected ? 'text-school font-bold'
                            : cell.isToday ? 'text-wood-dark font-bold'
                            : 'text-text-mid'
                        }`}>
                          {cell.day}
                        </span>
                        {cellTasks.length > 0 && (
                          <div className="relative z-10 flex justify-center gap-0.5 mt-0.5 flex-wrap">
                            {cellTasks.slice(0, 3).map(t => (
                              <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${categoryConfig[t.category].dot}`} />
                            ))}
                            {cellTasks.length > 3 && (
                              <span className="text-[7px] text-text-light font-heading">+{cellTasks.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Required Tasks + Countdown */}
        <div className="space-y-4">
          <div className="bg-saloon/10 border-2 border-saloon/30 rounded-xl p-4 shadow-[2px_2px_8px_rgba(107,66,38,0.1)]">
            <h3 className="font-heading text-sm font-bold text-wood-dark uppercase tracking-wider mb-3">
              📋 Required Tasks
            </h3>

            {/* Notice Board (Goal) tasks - prominent */}
            {requiredGoals.length > 0 && (
              <div className="space-y-2 mb-4">
                {requiredGoals.map(t => {
                  const overdue = t.scheduled_date && t.scheduled_date < realToday
                  return (
                    <div key={t.id} className="flex items-center gap-2 p-2 bg-bulletin/10 border border-bulletin/30 rounded-lg">
                      <span className="text-lg">📌</span>
                      <span className={`text-sm font-body font-semibold truncate flex-1 ${
                        t.status === 'in_progress' ? 'text-active' : 'text-text-dark'
                      }`}>
                        {t.title}
                      </span>
                      {overdue && (
                        <span className="text-[9px] font-heading font-bold text-overdue uppercase">overdue</span>
                      )}
                      {t.scheduled_date && !overdue && (
                        <span className="text-[10px] font-pixel text-text-light">{t.scheduled_date.slice(5)}</span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-heading font-bold uppercase ${
                        t.status === 'in_progress' ? 'bg-active/20 text-active' : 'bg-todo/15 text-todo'
                      }`}>
                        {t.status === 'in_progress' ? 'active' : 'todo'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Other tasks marked as show_required */}
            {requiredOthers.length > 0 && (
              <div className="space-y-1.5">
                {requiredOthers.map(t => {
                  const overdue = t.scheduled_date && t.scheduled_date < realToday
                  return (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${categoryConfig[t.category].dot}`} />
                      <span className={`text-xs font-body truncate flex-1 ${
                        t.status === 'in_progress' ? 'text-active' : 'text-text-dark'
                      }`}>
                        {t.title}
                      </span>
                      {overdue && (
                        <span className="text-[9px] font-heading font-bold text-overdue uppercase">overdue</span>
                      )}
                      {t.scheduled_date && !overdue && (
                        <span className="text-[10px] font-pixel text-text-light">{t.scheduled_date.slice(5)}</span>
                      )}
                      {!t.scheduled_date && (
                        <span className="text-[10px] font-heading text-text-light italic">no date</span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-heading font-bold uppercase ${
                        t.status === 'in_progress' ? 'bg-active/20 text-active' : 'bg-todo/15 text-todo'
                      }`}>
                        {t.status === 'in_progress' ? 'active' : 'todo'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {requiredGoals.length === 0 && requiredOthers.length === 0 && (
              <p className="font-body italic text-text-light text-xs">All tasks done! Enjoy the sunshine.</p>
            )}
          </div>

          {/* Countdown */}
          <div className="bg-berry/10 border-2 border-berry/30 rounded-xl p-4 shadow-[2px_2px_8px_rgba(107,66,38,0.1)]">
            <h3 className="font-heading text-sm font-bold text-wood-dark uppercase tracking-wider mb-3">
              ⏳ Countdown
            </h3>

            {countdowns.length > 0 && (
              <div className="space-y-2 mb-4">
                {countdowns.map(cd => {
                  const diff = new Date(cd.target).getTime() - Date.now()
                  const arrived = diff <= 0
                  return (
                    <div key={cd.id} className="flex items-center gap-2">
                      <span className={`text-xs font-body truncate flex-1 ${arrived ? 'text-grass-dark' : 'text-text-dark'}`}>
                        {cd.title}
                      </span>
                      <span className={`font-pixel font-bold text-sm tracking-wide ${arrived ? 'text-grass-dark animate-pulse' : 'text-text-mid'}`}>
                        {formatCountdown(diff)}
                      </span>
                      <button
                        onClick={() => removeCountdown(cd.id)}
                        className="text-[10px] text-overdue/50 hover:text-overdue transition-colors"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex gap-1.5 flex-wrap items-center">
              <input
                type="text"
                placeholder="Title..."
                value={cdTitle}
                onChange={e => setCdTitle(e.target.value)}
                className="flex-1 min-w-[80px] px-2 py-1.5 bg-white border border-earth/30 rounded-lg text-xs font-body text-text-dark placeholder:text-text-light focus:outline-none focus:ring-1 focus:ring-focus"
              />
              <input
                type="date"
                value={cdDate}
                onChange={e => setCdDate(e.target.value)}
                className="px-2 py-1.5 bg-white border border-earth/30 rounded-lg text-xs font-body text-text-dark focus:outline-none focus:ring-1 focus:ring-focus"
              />
              <input
                type="time"
                value={cdTime}
                onChange={e => setCdTime(e.target.value)}
                className="px-2 py-1.5 bg-white border border-earth/30 rounded-lg text-xs font-body text-text-dark focus:outline-none focus:ring-1 focus:ring-focus"
              />
              <button
                onClick={addCountdown}
                className="px-3 py-1.5 bg-berry text-white font-heading text-xs font-bold rounded-lg hover:bg-berry/80 transition-all"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
