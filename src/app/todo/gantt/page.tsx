"use client"

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoItem } from '@/lib/todoTypes'
import LoadingOverlay from '@/components/LoadingOverlay'

const PRIMARY_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
const SECONDARY_GRADIENT = 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'
const GLASS_BACKGROUND = 'rgba(15, 23, 42, 0.65)'
const GLASS_BORDER = '1px solid rgba(148, 163, 184, 0.2)'

const DAY_WIDTH = 72
const FALLBACK_DURATION_DAYS = 5

type StatusKey = '未着手' | '着手中' | '完了'

interface GanttTodo {
  data: TodoItem
  startDate: Date
  endDate: Date
  offsetDays: number
  durationDays: number
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function diffInDays(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY)
}

function parseDateInput(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return startOfDay(date)
}

function formatInputDate(date: Date) {
  return date.toISOString().split('T')[0]
}

const statusColors: Record<StatusKey, string> = {
  未着手: '#94a3b8',
  着手中: '#38bdf8',
  完了: '#34d399'
}

const statusGradients: Record<StatusKey, string> = {
  未着手: 'linear-gradient(135deg, rgba(148,163,184,0.45) 0%, rgba(148,163,184,0.7) 100%)',
  着手中: 'linear-gradient(135deg, rgba(56,189,248,0.45) 0%, rgba(59,130,246,0.75) 100%)',
  完了: 'linear-gradient(135deg, rgba(52,211,153,0.45) 0%, rgba(16,185,129,0.75) 100%)'
}

const priorityColors: Record<NonNullable<TodoItem['priority']> | 'none', string> = {
  high: '#f97316',
  medium: '#fbbf24',
  low: '#34d399',
  none: 'rgba(148, 163, 184, 0.6)'
}

const pageBackgroundStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '48px 16px 64px'
}

const pageContentStyle: CSSProperties = {
  width: '100%',
  maxWidth: '1240px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px'
}

const glassCardStyle: CSSProperties = {
  backgroundColor: GLASS_BACKGROUND,
  border: GLASS_BORDER,
  borderRadius: '24px',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)'
}

const pillButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 20px',
  borderRadius: '999px',
  fontWeight: 600,
  fontSize: '14px',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease'
}

export default function TodoGanttPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return window.location.href
  }, [])

  const loadTodos = useCallback(async (uid: string) => {
    const { data, error } = await supabaseTodo
      .from('todo_items')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTodos(data as TodoItem[])
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const { data } = await supabaseTodo.auth.getUser()
      const uid = data.user?.id ?? null

      if (!isMounted) return
      setUserId(uid)

      if (uid) {
        await loadTodos(uid)
      }

      setLoading(false)
    })()

    return () => {
      isMounted = false
    }
  }, [loadTodos])

  const handleSignIn = async () => {
    await supabaseTodo.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    })
  }

  const handleSignOut = async () => {
    await supabaseTodo.auth.signOut()
    setUserId(null)
    setTodos([])
  }

  const statusSummary = useMemo(() => ({
    未着手: todos.filter((todo) => todo.status === '未着手').length,
    着手中: todos.filter((todo) => todo.status === '着手中').length,
    完了: todos.filter((todo) => todo.status === '完了').length
  }), [todos])

  const ganttData = useMemo(() => {
    const customStartDate = parseDateInput(customStart)
    const customEndDate = parseDateInput(customEnd)
    const customRangeValid = !!(useCustomRange && customStartDate && customEndDate && customStartDate.getTime() <= customEndDate.getTime())
    const customRangeInvalid = useCustomRange && !customRangeValid

    if (!todos.length) {
      let start = startOfDay(new Date())
      let end = addDays(start, FALLBACK_DURATION_DAYS)

      if (customRangeValid) {
        start = customStartDate!
        end = customEndDate!
      }

      if (start.getTime() === end.getTime()) {
        end = addDays(end, FALLBACK_DURATION_DAYS)
      }

      const timelineDates = buildTimelineDates(start, end)
      const emptyToday = startOfDay(new Date())
      const todayOffset = diffInDays(start, emptyToday)
      const todayInRange = todayOffset >= 0 && todayOffset <= timelineDates.length
      return {
        items: [] as GanttTodo[],
        timelineStart: start,
        timelineEnd: end,
        timelineDates,
        timelineWidth: timelineDates.length * DAY_WIDTH,
        todayOffset,
        todayInRange,
        customRangeInvalid
      }
    }

    const baseItems = todos.map((todo) => {
      const startSource = todo.created_at ?? todo.updated_at ?? new Date().toISOString()
      const startDate = startOfDay(new Date(startSource))

      let endDate: Date

      if (todo.done_date) {
        endDate = startOfDay(new Date(todo.done_date))
      } else if (todo.due_date) {
        endDate = startOfDay(new Date(todo.due_date))
      } else if (todo.status === '着手中') {
        endDate = startOfDay(new Date())
      } else {
        endDate = addDays(startDate, FALLBACK_DURATION_DAYS)
      }

      if (endDate < startDate) {
        endDate = addDays(startDate, 1)
      }

      return {
        data: todo,
        startDate,
        endDate,
        offsetDays: 0,
        durationDays: 0
      }
    })

    let timelineStart = baseItems.reduce((min, item) => item.startDate < min ? item.startDate : min, baseItems[0].startDate)
    let timelineEnd = baseItems.reduce((max, item) => item.endDate > max ? item.endDate : max, baseItems[0].endDate)

    const today = startOfDay(new Date())

    // Always include today for context
    if (today < timelineStart) {
      timelineStart = today
    }
    if (today > timelineEnd) {
      timelineEnd = today
    }

    if (timelineStart.getTime() === timelineEnd.getTime()) {
      timelineEnd = addDays(timelineEnd, FALLBACK_DURATION_DAYS)
    }

    if (customRangeValid) {
      timelineStart = customStartDate!
      timelineEnd = customEndDate!
    }

    const timelineDates = buildTimelineDates(timelineStart, timelineEnd)
    const totalSpanDays = Math.max(0, diffInDays(timelineStart, timelineEnd))

    const items = baseItems.map((item) => {
      const rawStartOffset = diffInDays(timelineStart, item.startDate)
      const rawEndOffset = diffInDays(timelineStart, item.endDate)
      const clampedStart = Math.min(Math.max(rawStartOffset, 0), totalSpanDays)
      const clampedEnd = Math.max(clampedStart, Math.min(Math.max(rawEndOffset, 0), totalSpanDays))
      const offsetDays = clampedStart
      const durationDays = Math.max(1, clampedEnd - clampedStart + 1)
      return {
        ...item,
        offsetDays,
        durationDays
      }
    })

    const timelineWidth = timelineDates.length * DAY_WIDTH
    const todayOffset = diffInDays(timelineStart, today)
    const todayInRange = todayOffset >= 0 && todayOffset <= timelineDates.length

    return {
      items,
      timelineStart,
      timelineEnd,
      timelineDates,
      timelineWidth,
      todayOffset,
      todayInRange,
      customRangeInvalid
    }
  }, [todos, useCustomRange, customStart, customEnd])

  if (loading) {
    return <LoadingOverlay message="読み込み中..." />
  }

  if (!userId) {
    return (
      <div
        style={{
          ...pageBackgroundStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            ...glassCardStyle,
            width: '100%',
            maxWidth: '420px',
            padding: '40px 32px 44px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            color: '#e2e8f0'
          }}
        >
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(226, 232, 240, 0.6)'
            }}
          >
            Welcome back
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '36px',
              fontWeight: 700,
              background: PRIMARY_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Specsy Todo
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(226, 232, 240, 0.72)'
            }}
          >
            ガントチャート機能を利用するにはログインしてください。
          </p>
          <button
            onClick={handleSignIn}
            style={{
              ...pillButtonStyle,
              width: '100%',
              background: PRIMARY_GRADIENT,
              boxShadow: '0 28px 50px -20px rgba(59, 130, 246, 0.55)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 32px 60px -20px rgba(59, 130, 246, 0.6)'
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 28px 50px -20px rgba(59, 130, 246, 0.55)'
              e.currentTarget.style.background = PRIMARY_GRADIENT
            }}
          >
            Googleでログイン
          </button>
        </div>
      </div>
    )
  }

  const handleToggleCustomRange = (checked: boolean) => {
    if (checked) {
      if (!customStart) {
        setCustomStart(formatInputDate(ganttData.timelineStart))
      }
      if (!customEnd) {
        setCustomEnd(formatInputDate(ganttData.timelineEnd))
      }
    }
    setUseCustomRange(checked)
  }

  return (
    <div style={pageBackgroundStyle}>
      <div style={pageContentStyle}>
        <div
          style={{
            ...glassCardStyle,
            padding: '28px 32px',
            color: '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '24px'
            }}
          >
            <div style={{ flex: '1 1 280px' }}>
              <span
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: 'rgba(226, 232, 240, 0.5)'
                }}
              >
                Timeline
              </span>
              <h1
                style={{
                  margin: '10px 0 14px',
                  fontSize: '42px',
                  fontWeight: 700,
                  background: PRIMARY_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                ガントチャート
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(226, 232, 240, 0.72)'
                }}
              >
                作業の進捗をタイムラインで俯瞰し、期限や状態をチームと共有できます。
              </p>
            </div>
            <div
              style={{
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '16px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end'
                }}
              >
                {(['未着手', '着手中', '完了'] as const).map((status) => (
                  <div
                    key={status}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: 'rgba(226, 232, 240, 0.85)'
                    }}
                  >
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: statusColors[status]
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{status}</span>
                    <span style={{ fontSize: '13px', opacity: 0.7 }}>{statusSummary[status]}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href="/todo"
                  style={{
                    ...pillButtonStyle,
                    background: 'rgba(148, 163, 184, 0.22)',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    boxShadow: '0 24px 50px -24px rgba(148, 163, 184, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 28px 60px -24px rgba(148, 163, 184, 0.45)'
                    e.currentTarget.style.background = 'rgba(148, 163, 184, 0.32)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 24px 50px -24px rgba(148, 163, 184, 0.4)'
                    e.currentTarget.style.background = 'rgba(148, 163, 184, 0.22)'
                  }}
                >
                  一覧ビューへ
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{
                    ...pillButtonStyle,
                    background: SECONDARY_GRADIENT,
                    boxShadow: '0 24px 50px -20px rgba(14, 165, 233, 0.45)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 28px 60px -20px rgba(14, 165, 233, 0.55)'
                    e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 24px 50px -20px rgba(14, 165, 233, 0.45)'
                    e.currentTarget.style.background = SECONDARY_GRADIENT
                  }}
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            ...glassCardStyle,
            padding: '24px',
            color: '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600 }}>タイムライン</div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                fontSize: '12px',
                color: 'rgba(226, 232, 240, 0.65)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: statusGradients['未着手'] }} /> 未着手
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: statusGradients['着手中'] }} /> 着手中
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: statusGradients['完了'] }} /> 完了
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontSize: '12px',
              color: 'rgba(226, 232, 240, 0.8)'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useCustomRange}
                onChange={(e) => handleToggleCustomRange(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              カスタム期間
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              disabled={!useCustomRange}
              style={dateInputStyle(!useCustomRange)}
            />
            <span style={{ opacity: 0.65 }}>〜</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              disabled={!useCustomRange}
              style={dateInputStyle(!useCustomRange)}
            />
            {useCustomRange && (
              <button
                type="button"
                onClick={() => {
                  setUseCustomRange(false)
                }}
                style={{
                  fontSize: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(148, 163, 184, 0.9)',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                自動に戻す
              </button>
            )}
          </div>

          {ganttData.customRangeInvalid && (
            <div
              style={{
                fontSize: '12px',
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '14px',
                padding: '12px 16px'
              }}
            >
              期間の指定が正しくありません。開始日と終了日を確認してください。
            </div>
          )}

          {ganttData.items.length === 0 ? (
            <div
              style={{
                borderRadius: '18px',
                border: '1px dashed rgba(148, 163, 184, 0.35)',
                padding: '32px',
                textAlign: 'center',
                color: 'rgba(226, 232, 240, 0.65)'
              }}
            >
              TODOがまだありません。TODO一覧から作成すると、ここにタイムラインが表示されます。
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: `${ganttData.timelineWidth + 320}px` }}>
                  <div style={{ paddingLeft: '320px' }}>
                    <div
                      style={{
                        display: 'flex',
                        width: `${ganttData.timelineWidth}px`,
                        background: 'rgba(148, 163, 184, 0.08)',
                        borderRadius: '14px',
                        border: '1px solid rgba(148, 163, 184, 0.15)',
                        overflow: 'hidden'
                      }}
                    >
                      {ganttData.timelineDates.map((date, index) => (
                        <div
                          key={date.toISOString()}
                          style={{
                            flex: `0 0 ${DAY_WIDTH}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px 0',
                            fontSize: '12px',
                            color: 'rgba(226, 232, 240, 0.75)',
                            borderRight: index === ganttData.timelineDates.length - 1 ? 'none' : '1px solid rgba(148, 163, 184, 0.12)'
                          }}
                        >
                          {formatDateLabel(date)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                    {ganttData.items.map((item) => (
                      <div
                        key={item.data.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '320px 1fr',
                          gap: '12px',
                          alignItems: 'stretch'
                        }}
                      >
                        <div
                          style={{
                            borderRadius: '18px',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            background: 'rgba(15, 23, 42, 0.6)',
                            padding: '18px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: priorityColors[item.data.priority ?? 'none']
                                }}
                              />
                              <span style={{ fontSize: '13px', color: 'rgba(226, 232, 240, 0.75)' }}>
                                {priorityLabel(item.data.priority)}
                              </span>
                            </div>
                            <span
                              style={{
                                padding: '6px 12px',
                                borderRadius: '999px',
                                background: 'rgba(148, 163, 184, 0.12)',
                                color: statusColors[item.data.status],
                                fontSize: '13px',
                                fontWeight: 600
                              }}
                            >
                              {item.data.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', lineHeight: 1.6 }}>
                            {item.data.title}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              color: 'rgba(226, 232, 240, 0.75)',
                              fontSize: '12px'
                            }}
                          >
                            {item.data.tags.length ? (
                              item.data.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '999px',
                                    background: 'rgba(148, 163, 184, 0.16)'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span style={{ opacity: 0.6 }}>タグなし</span>
                            )}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '14px',
                              fontSize: '12px',
                              color: 'rgba(226, 232, 240, 0.65)'
                            }}
                          >
                            <span>開始: {formatFullDate(item.startDate)}</span>
                            <span>終了: {formatFullDate(item.endDate)}</span>
                          </div>
                        </div>

                        <div
                          style={{
                            position: 'relative',
                            width: `${ganttData.timelineWidth}px`,
                            borderRadius: '18px',
                            border: '1px solid rgba(148, 163, 184, 0.15)',
                            background: 'rgba(15, 23, 42, 0.35)',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex'
                            }}
                          >
                            {ganttData.timelineDates.map((date, index) => (
                              <div
                                key={date.toISOString()}
                                style={{
                                  flex: `0 0 ${DAY_WIDTH}px`,
                                  borderRight: index === ganttData.timelineDates.length - 1 ? 'none' : '1px solid rgba(148, 163, 184, 0.08)'
                                }}
                              />
                            ))}
                          </div>

                          {ganttData.todayInRange && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: `${ganttData.todayOffset * DAY_WIDTH}px`,
                                width: '1px',
                                background: 'rgba(248, 250, 252, 0.55)',
                                boxShadow: '0 0 12px rgba(248, 250, 252, 0.45)'
                              }}
                            />
                          )}

                          <div
                            style={{
                              position: 'absolute',
                              top: '18px',
                              left: `${item.offsetDays * DAY_WIDTH}px`,
                              width: `${item.durationDays * DAY_WIDTH}px`,
                              minWidth: `${DAY_WIDTH}px`,
                              height: '36px',
                              borderRadius: '999px',
                              background: statusGradients[item.data.status],
                              boxShadow: '0 18px 40px -24px rgba(14, 165, 233, 0.35)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0f172a',
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '0 12px'
                            }}
                          >
                            {item.data.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function buildTimelineDates(start: Date, end: Date) {
  const dates: Date[] = []
  let cursor = startOfDay(start)
  const target = startOfDay(end)

  while (cursor.getTime() <= target.getTime()) {
    dates.push(new Date(cursor))
    cursor = addDays(cursor, 1)
  }

  return dates
}

function formatDateLabel(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
}

function priorityLabel(priority: TodoItem['priority']) {
  switch (priority) {
    case 'high':
      return '高優先度'
    case 'medium':
      return '中優先度'
    case 'low':
      return '低優先度'
    default:
      return '優先度なし'
  }
}

function dateInputStyle(disabled: boolean): CSSProperties {
  return {
    background: disabled ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.55)',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    borderRadius: '10px',
    padding: '8px 10px',
    color: '#e2e8f0',
    fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    minWidth: '148px',
    outline: 'none'
  }
}
