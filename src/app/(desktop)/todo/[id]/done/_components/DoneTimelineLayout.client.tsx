"use client"

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import LoginPromptCard from '../../_components/Layout/_shared/LoginPromptCard.client'
import { supabaseTodo } from '@/lib/supabaseTodoClient'

type DoneTimelineLayoutProps = {
  listId: string
}

type TimelineEntry = {
  id: string
  title: string
  completedAt: Date
  minutesFromMidnight: number
  groupId: string | null
}

type NowState = {
  minutes: number
  date: Date
}

const MINUTES_IN_DAY = 24 * 60
const TIMELINE_HEIGHT = 2000
const HOUR_HEIGHT = TIMELINE_HEIGHT / 24
const STACK_THRESHOLD_MINUTES = 20
const CONNECTOR_BASE_WIDTH_PX = 40
const CARD_MARGIN_FROM_LINE_PX = 8
const CARD_MIN_WIDTH_PX = 180
const STACK_HORIZONTAL_GAP_PX = CARD_MIN_WIDTH_PX + 10 // カード幅＋余白分
const NOW_UPDATE_INTERVAL_MS = 30_000
const HOUR_MARKS = Array.from({ length: 24 }, (_, index) => index)
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

function hexToRgba(hex: string, alpha: number) {
  if (!HEX_COLOR_REGEX.test(hex)) return undefined
  const clampedAlpha = Math.min(Math.max(alpha, 0), 1)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`
}

function computeMinutesFromMidnight(date: Date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

function startOfToday(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function clamp(value: number, min: number, max: number) {
  if (value < min) return min
  if (value > max) return max
  return value
}

const FALLBACK_ACCENT_PRIMARY = '#6366F1'
const FALLBACK_ACCENT_SECONDARY = '#22D3EE'
const FALLBACK_ACCENT_GLOW = '#8B5CF6'
const FALLBACK_SURFACE_TINT = '#1E293B'

const FALLBACK_CONNECTOR_BACKGROUND = `linear-gradient(90deg, ${hexToRgba(FALLBACK_ACCENT_PRIMARY, 0.65) ?? 'rgba(99, 102, 241, 0.65)'}, ${hexToRgba(FALLBACK_ACCENT_SECONDARY, 0.65) ?? 'rgba(34, 211, 238, 0.65)'})`
const FALLBACK_DOT_BACKGROUND = `linear-gradient(135deg, ${hexToRgba(FALLBACK_ACCENT_PRIMARY, 0.92) ?? 'rgba(99, 102, 241, 0.92)'}, ${hexToRgba(FALLBACK_ACCENT_GLOW, 0.88) ?? 'rgba(139, 92, 246, 0.88)'})`
const FALLBACK_DOT_SHADOW = hexToRgba(FALLBACK_ACCENT_GLOW, 0.32) ?? 'rgba(139, 92, 246, 0.32)'
const FALLBACK_CARD_BACKGROUND = hexToRgba(FALLBACK_SURFACE_TINT, 0.65) ?? 'rgba(30, 41, 59, 0.65)'
const FALLBACK_CARD_BORDER = hexToRgba(FALLBACK_ACCENT_PRIMARY, 0.55) ?? 'rgba(99, 102, 241, 0.55)'
const TIMELINE_BACKGROUND_GRADIENT = `linear-gradient(180deg, ${hexToRgba('#0f172a', 0.95) ?? 'rgba(15, 23, 42, 0.95)'} 0%, ${hexToRgba('#4338ca', 0.7) ?? 'rgba(67, 56, 202, 0.7)'} 45%, ${hexToRgba('#4338ca', 0.7) ?? 'rgba(67, 56, 202, 0.7)'} 72%, ${hexToRgba('#0b1120', 0.9) ?? 'rgba(11, 17, 32, 0.9)'} 100%)`

export default function DoneTimelineLayout({ listId }: DoneTimelineLayoutProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [groupsById, setGroupsById] = useState<Record<string, { color: string | null }>>({})
  const [now, setNow] = useState<NowState>(() => {
    const current = new Date()
    return {
      minutes: computeMinutesFromMidnight(current),
      date: current
    }
  })
  const [hasAutoScrolled, setHasAutoScrolled] = useState<boolean>(false)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    []
  )

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return window.location.href
  }, [])

  const loadEntries = useCallback(async (uid: string, lId: string) => {
    const nowDate = new Date()
    const start = startOfToday(nowDate)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const { data, error: queryError } = await supabaseTodo
      .from('todo_items')
      .select('id, title, done_date, group_id')
      .eq('user_id', uid)
      .eq('list_id', lId)
      .not('done_date', 'is', null)
      .gte('done_date', start.toISOString())
      .lt('done_date', end.toISOString())
      .order('done_date', { ascending: true })

    if (queryError) {
      console.error('[DoneTimeline] failed to load entries', queryError)
      setError('完了ログの取得に失敗しました')
      setEntries([])
      return
    }

    const mapped: TimelineEntry[] =
      data
        ?.filter((item): item is typeof item & { done_date: string } => Boolean(item.done_date))
        .map((item) => {
          const completedAt = new Date(item.done_date)
          return {
            id: item.id,
            title: item.title,
            completedAt,
            minutesFromMidnight: computeMinutesFromMidnight(completedAt),
            groupId: item.group_id ?? null
          }
        }) ?? []

    setEntries(mapped)
    setError(null)
    setHasAutoScrolled(false)
  }, [])
  const loadGroups = useCallback(async (uid: string, lId: string) => {
    const { data, error: queryError } = await supabaseTodo
      .from('todo_groups')
      .select('id, color')
      .eq('user_id', uid)
      .eq('list_id', lId)

    if (queryError) {
      console.error('[DoneTimeline] failed to load groups', queryError)
      setGroupsById({})
      return
    }

    const map: Record<string, { color: string | null }> = {}
    for (const group of data ?? []) {
      map[group.id] = { color: group.color }
    }
    setGroupsById(map)
  }, [])

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const { data } = await supabaseTodo.auth.getUser()
      if (!isMounted) return

      const uid = data.user?.id ?? null
      setUserId(uid)

      if (uid) {
        await Promise.all([loadEntries(uid, listId), loadGroups(uid, listId)])
      }

      if (isMounted) {
        setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [listId, loadEntries, loadGroups])

  useEffect(() => {
    const updateNow = () => {
      const current = new Date()
      setNow({
        minutes: computeMinutesFromMidnight(current),
        date: current
      })
    }

    updateNow()

    const intervalId = setInterval(updateNow, NOW_UPDATE_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (hasAutoScrolled) return
    const container = scrollContainerRef.current
    if (!container) return

    const target =
      clamp(now.minutes, 0, MINUTES_IN_DAY) / MINUTES_IN_DAY * TIMELINE_HEIGHT
    const offset = target - container.clientHeight / 2
    container.scrollTop = Math.max(offset, 0)
    setHasAutoScrolled(true)
  }, [now.minutes, hasAutoScrolled])

  const handleSignIn = useCallback(async () => {
    await supabaseTodo.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined
    })
  }, [redirectTo])

  const timelineItems = useMemo(() => {
    if (entries.length === 0) return []

    const sorted = [...entries].sort(
      (a, b) => a.minutesFromMidnight - b.minutesFromMidnight
    )
    const result: Array<TimelineEntry & { stackIndex: number }> = []
    let bucket: TimelineEntry[] = []

    const flushBucket = () => {
      if (bucket.length === 0) return
      bucket.forEach((item, index) => {
        result.push({ ...item, stackIndex: index })
      })
      bucket = []
    }

    for (const entry of sorted) {
      if (bucket.length === 0) {
        bucket.push(entry)
        continue
      }

      const prev = bucket[bucket.length - 1]
      if (entry.minutesFromMidnight - prev.minutesFromMidnight <= STACK_THRESHOLD_MINUTES) {
        bucket.push(entry)
      } else {
        flushBucket()
        bucket.push(entry)
      }
    }

    flushBucket()

    return result
  }, [entries])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-gradient text-frost-subtle">
        ロード中...
      </div>
    )
  }

  if (!userId) {
    return <LoginPromptCard onSignIn={handleSignIn} />
  }

  const nowLineTop = clamp((now.minutes / MINUTES_IN_DAY) * TIMELINE_HEIGHT, 0, TIMELINE_HEIGHT)
  const nowLabel = timeFormatter.format(now.date)

  return (
    <div className="min-h-screen bg-page-gradient px-8 py-10 text-frost-soft">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold">完了タイムライン</h1>
            <Link
              href={`/todo/${listId}`}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-400/50 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-emerald-400/20 px-4 py-1.5 text-xs font-semibold text-slate-100 shadow-[0_4px_18px_rgba(99,102,241,0.18)] transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_12px_28px_rgba(79,70,229,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
            >
              TODOに戻る
            </Link>
          </div>
          <span className="text-xs text-frost-muted">完了件数: {entries.length}</span>
        </header>

        {error && (
          <div className="rounded-xl border border-[#ff6466]/40 bg-[#ff5055]/10 px-4 py-3 text-sm text-[#ff9597]">
            {error}
          </div>
        )}

        <section
          className="relative overflow-hidden rounded-3xl border border-night-border/80 px-8 py-6 shadow-glass-xl"
          style={{ background: TIMELINE_BACKGROUND_GRADIENT}}
        >
          <div
            ref={scrollContainerRef}
            className="relative mx-auto flex w-full gap-10"
          >
            <div
              className="relative flex-none text-xs text-frost-muted"
              style={{ width: '72px', height: `${TIMELINE_HEIGHT}px` }}
            >
              {HOUR_MARKS.map((hour) => {
                const top = hour * HOUR_HEIGHT
                const labelClass = hour === 0 ? 'translate-y-0' : '-translate-y-1/2'
                return (
                  <div
                    key={`hour-label-${hour}`}
                    className={`absolute left-0 ${labelClass}`}
                    style={{ top }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                )
              })}
              <div
                className="absolute left-0 -translate-y-full"
                style={{ top: TIMELINE_HEIGHT }}
              >
                23:59
              </div>

              <div
                className="pointer-events-none absolute left-0 right-0 -translate-y-1/2"
                style={{ top: nowLineTop }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/60 bg-gradient-to-r from-indigo-500/25 via-sky-500/25 to-emerald-400/25 px-3 py-1 text-[10px] font-semibold text-slate-100 shadow-[0_0_18px_rgba(94,234,212,0.18)] backdrop-blur">
                  <span className="font-mono tracking-wide">{nowLabel}</span>
                </div>
              </div>
            </div>

            <div
              className="relative flex-1"
              style={{ height: `${TIMELINE_HEIGHT}px`, background: 'rgba(15, 23, 42, 0.1)' }}
            >
              <div className="absolute inset-0">
                {HOUR_MARKS.map((hour) => {
                  const top = hour * HOUR_HEIGHT
                  return (
                    <div
                      key={`hour-line-${hour}`}
                      className="absolute left-0 right-0"
                      style={{ top }}
                    >
                      <div className="border-t border-night-border/70" />
                    </div>
                  )
                })}
                {HOUR_MARKS.map((hour) => {
                  const halfTop = hour * HOUR_HEIGHT + HOUR_HEIGHT / 2
                  if (halfTop >= TIMELINE_HEIGHT) return null
                  return (
                    <div
                      key={`half-line-${hour}`}
                      className="absolute left-0 right-0"
                      style={{ top: halfTop }}
                    >
                      <div className="border-t border-night-border/30" />
                    </div>
                  )
                })}
              </div>

              <div className="absolute left-8 top-0 h-full w-px bg-night-border/80" />

              <div
                className="pointer-events-none absolute inset-x-0 flex items-center"
                style={{ top: nowLineTop }}
              >
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-400/80 via-sky-400/70 to-emerald-400/80" />
              </div>

              {timelineItems.map((item) => {
                const baseTop = clamp(
                  (item.minutesFromMidnight / MINUTES_IN_DAY) * TIMELINE_HEIGHT,
                  0,
                  TIMELINE_HEIGHT
                )
                const visualTop = clamp(baseTop, 16, TIMELINE_HEIGHT - 16)
                const horizontalOffset = item.stackIndex * STACK_HORIZONTAL_GAP_PX
                const connectorWidth = CONNECTOR_BASE_WIDTH_PX + horizontalOffset
                const cardOffsetLeft = connectorWidth + CARD_MARGIN_FROM_LINE_PX
                const groupColor = item.groupId ? groupsById[item.groupId]?.color ?? null : null
                const hasHexColor = typeof groupColor === 'string' && HEX_COLOR_REGEX.test(groupColor)
                const connectorBackground =
                  (hasHexColor ? hexToRgba(groupColor, 0.65) : null) ?? FALLBACK_CONNECTOR_BACKGROUND
                const dotBackground =
                  (hasHexColor ? hexToRgba(groupColor, 0.9) : null) ?? FALLBACK_DOT_BACKGROUND
                const dotShadow =
                  (hasHexColor ? hexToRgba(groupColor, 0.22) : undefined) ?? FALLBACK_DOT_SHADOW
                const cardBackground =
                  (hasHexColor ? hexToRgba(groupColor, 0.18) : undefined) ?? FALLBACK_CARD_BACKGROUND
                const cardBorder =
                  (hasHexColor ? hexToRgba(groupColor, 0.4) : undefined) ?? FALLBACK_CARD_BORDER
                return (
                  <div
                    key={item.id}
                    className="absolute left-8 right-0 -translate-y-1/2"
                    style={{ top: visualTop }}
                  >
                    <div className="relative">
                      <div
                        className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: dotBackground,
                          boxShadow: `0 0 0 3px ${dotShadow}`
                        }}
                      />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                        style={{ width: connectorWidth, height: 1.5, background: connectorBackground }}
                      />
                      <div
                        className="relative w-fit max-w-[420px]"
                        style={{ marginLeft: cardOffsetLeft, width: CARD_MIN_WIDTH_PX }}
                      >
                        <div className="">
                          <div
                            className="flex items-center rounded-lg border px-1.5 py-1 text-[10px] text-frost-soft"
                            style={{ background: cardBackground, borderColor: cardBorder }}
                          >
                            <span className="flex-shrink-0 text-frost-soft">
                              {timeFormatter.format(item.completedAt)}：
                            </span>
                            <div className="flex-1 truncate text-[10px] font-medium text-frost-soft">
                              {item.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
