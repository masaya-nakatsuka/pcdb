"use client"

import type { SimpleStatus } from '@/features/todo/detail/types'

type SummaryHeaderProps = {
  statusSummary: Record<SimpleStatus, number>
  showCompleted: boolean
  onToggleShowCompleted: () => void
}

const STATUS_ORDER: SimpleStatus[] = ['未着手', '着手中', '完了']

const STATUS_DOT_COLOR: Record<SimpleStatus, string> = {
  未着手: 'bg-slate-400',
  着手中: 'bg-sky-400',
  完了: 'bg-emerald-400',
}

export default function SummaryHeader({ statusSummary, showCompleted, onToggleShowCompleted }: SummaryHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 rounded-2xl border border-night-border bg-night-glass px-4 py-2 text-sm text-frost-soft"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_COLOR[status]}`} />
            <span className="font-semibold">{status}</span>
            <span className="text-frost-muted">{statusSummary[status]}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onToggleShowCompleted}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-frost-soft transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200/40 ${showCompleted ? 'bg-primary-gradient shadow-button-primary hover:-translate-y-0.5 hover:shadow-button-primary-hover' : 'bg-night-highlight hover:bg-sky-500/30'}`}
      >
        {showCompleted ? '完了タスクを非表示' : '完了タスクを表示'}
      </button>
    </div>
  )
}
