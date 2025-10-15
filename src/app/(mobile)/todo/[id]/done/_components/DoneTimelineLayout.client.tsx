"use client"

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'

import LoadingOverlay from '@/components/LoadingOverlay'
import { supabaseTodo } from '@/lib/supabaseTodoClient'

type MobileDoneTimelineLayoutProps = {
  listId: string
}

type TimelineEntry = {
  id: string
  title: string
  completedAt: Date
}

const TIMELINE_BACKGROUND =
  'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(56, 189, 248, 0.25) 50%, rgba(15, 23, 42, 0.95) 100%)'

function startOfDay(date: Date) {
  const base = new Date(date)
  base.setHours(0, 0, 0, 0)
  return base
}

function formatDateInputValue(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDateInputValue(value: string) {
  if (!value) return null
  const [yearStr, monthStr, dayStr] = value.split('-')
  if (!yearStr || !monthStr || !dayStr) return null
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) return null
  return startOfDay(parsed)
}

const CONTROL_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70'

export default function MobileDoneTimelineLayout({ listId }: MobileDoneTimelineLayoutProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()))
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const dateDisplay = useMemo(
    () =>
      new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      }).format(selectedDate),
    [selectedDate]
  )

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    []
  )

  const loadEntries = useCallback(
    async (uid: string, date: Date) => {
      setEntriesLoading(true)
      setError(null)

      try {
        const start = startOfDay(date)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)

        const { data, error: queryError } = await supabaseTodo
          .from('todo_items')
          .select('id, title, done_date')
          .eq('user_id', uid)
          .eq('list_id', listId)
          .not('done_date', 'is', null)
          .gte('done_date', start.toISOString())
          .lt('done_date', end.toISOString())
          .order('done_date', { ascending: true })

        if (queryError) {
          setError('完了ログの取得に失敗しました。')
          setEntries([])
          return
        }

        const mapped: TimelineEntry[] =
          data
            ?.filter((item): item is typeof item & { done_date: string } => Boolean(item.done_date))
            .map((item) => ({
              id: item.id,
              title: item.title,
              completedAt: new Date(item.done_date)
            })) ?? []

        setEntries(mapped)
      } finally {
        setEntriesLoading(false)
      }
    },
    [listId]
  )

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { data } = await supabaseTodo.auth.getUser()
      if (!isMounted) return

      const uid = data.user?.id ?? null
      setUserId(uid)
      setLoading(false)
    })()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    void loadEntries(userId, selectedDate)
  }, [userId, selectedDate, loadEntries])

  const handleDateChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const next = parseDateInputValue(event.target.value)
    if (!next) return
    setSelectedDate(next)
  }, [])

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() - 1)
      return startOfDay(next)
    })
  }, [])

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + 1)
      return startOfDay(next)
    })
  }, [])

  const handleResetToday = useCallback(() => {
    setSelectedDate(startOfDay(new Date()))
  }, [])

  if (loading) {
    return <LoadingOverlay message="読み込み中..." />
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page-gradient px-6 py-10 text-center text-frost-soft">
        <p className="text-sm">完了ログを表示するにはログインが必要です。</p>
        <Link
          href="/todo"
          className="inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          Todo 一覧へ戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-gradient px-4 pb-16 pt-8 text-frost-soft">
      {entriesLoading ? <LoadingOverlay message="読み込み中..." /> : null}
      <style jsx global>{`
        input.timeline-date-input::-webkit-calendar-picker-indicator {
          filter: brightness(0) invert(1);
        }
        input.timeline-date-input {
          color-scheme: dark;
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">完了タイムライン</h1>
            <Link
              href={`/todo/${listId}`}
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              Todo に戻る
            </Link>
          </div>
          <div className="space-y-3 rounded-3xl border border-night-border bg-night-glass-soft px-4 py-3 shadow-glass-xl">
            <div className="flex items-center gap-2 text-xs text-frost-muted">
              <span>完了件数</span>
              <span className="text-sm font-semibold text-frost-soft">{entries.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={CONTROL_BUTTON_CLASS} onClick={handlePrevDay} aria-label="前の日へ">
                ‹
              </button>
              <input
                type="date"
                value={formatDateInputValue(selectedDate)}
                onChange={handleDateChange}
                className="timeline-date-input w-36 rounded-full border border-night-border bg-night-glass px-3 py-1.5 text-center text-sm text-frost-soft shadow-inner focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button type="button" className={CONTROL_BUTTON_CLASS} onClick={handleNextDay} aria-label="次の日へ">
                ›
              </button>
              <button
                type="button"
                className={`${CONTROL_BUTTON_CLASS} ${startOfDay(new Date()).getTime() === selectedDate.getTime() ? 'cursor-not-allowed opacity-60' : ''}`}
                onClick={handleResetToday}
                disabled={startOfDay(new Date()).getTime() === selectedDate.getTime()}
              >
                今日に戻る
              </button>
            </div>
            <p className="text-xs text-frost-muted">{dateDisplay}</p>
          </div>
        </header>

        {error ? (
          <div className="rounded-3xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <section
          className="relative rounded-3xl border border-night-border bg-night-glass-soft px-4 py-6 shadow-glass-xl"
          style={{ background: TIMELINE_BACKGROUND }}
        >
          <div className="space-y-6 pl-7">
            {entries.length === 0 ? (
              <div className="rounded-2xl border border-night-border bg-night-glass px-4 py-6 text-center text-sm text-frost-muted">
                この日に完了したタスクはありません。
              </div>
            ) : (
              entries.map((entry, index) => {
                const isLast = index === entries.length - 1
                return (
                  <div key={entry.id} className="relative">
                    <div
                      className="absolute -left-5 top-2 h-2 w-2 -translate-x-1/2 rounded-full border border-sky-400/70 bg-sky-500/80 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]"
                    />
                    {!isLast ? (
                      <div className="absolute -left-5 top-4 bottom-[-20px] w-px bg-night-border/40" aria-hidden />
                    ) : null}

                    <div className="rounded-2xl border border-night-border bg-night-glass px-4 py-3 shadow-glass-md">
                      <div className="flex items-center justify-between gap-3 text-xs text-frost-muted">
                        <span className="font-mono tracking-wide text-frost-soft">
                          {timeFormatter.format(entry.completedAt)}
                        </span>
                        <span className="rounded-full border border-night-border bg-night-glass px-2 py-0.5 text-[11px] text-frost-subtle">
                          完了
                        </span>
                      </div>
                      <p className="mt-2 break-words text-sm font-medium text-frost-soft">{entry.title}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
