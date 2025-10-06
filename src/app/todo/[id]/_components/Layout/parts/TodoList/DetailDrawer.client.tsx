"use client"

import ReactMarkdown from 'react-markdown'

import type { TodoItem } from '@/lib/todoTypes'

type DetailDrawerProps = {
  todo: TodoItem
  isExpanded: boolean
  horizontalPaddingClass: string
  editingMarkdownId: string | null
  tempMarkdown: string
  onTempMarkdownChange: (value: string) => void
  onStartEditingMarkdown: (todoId: string, markdown: string) => void
}

export default function DetailDrawer({
  todo,
  isExpanded,
  horizontalPaddingClass,
  editingMarkdownId,
  tempMarkdown,
  onTempMarkdownChange,
  onStartEditingMarkdown,
}: DetailDrawerProps) {
  const createdAtLabel = todo.created_at ? new Date(todo.created_at).toLocaleDateString('ja-JP') : '-'
  const doneDateLabel = todo.done_date ? new Date(todo.done_date).toLocaleDateString('ja-JP') : '-'

  const fieldClass = 'w-full rounded-xl border border-night-border-strong bg-night-glass-strong px-3 py-2 text-sm text-frost-soft placeholder:text-frost-subtle focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'

  return (
    <div
      className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      style={{ maxHeight: isExpanded ? '320px' : '0px' }}
    >
      <div className={`${horizontalPaddingClass} pb-4`} data-markdown-container>
        <div className="rounded-xl border border-night-border bg-night-glass p-4">
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-frost-muted">
            <div className="flex items-center gap-1.5">
              <span className="text-frost-subtle">作成日</span>
              <span className={`font-semibold ${todo.created_at ? 'text-frost-soft' : 'text-frost-subtle'}`}>
                {createdAtLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-frost-subtle">完了日</span>
              <span className={`font-semibold ${todo.done_date ? 'text-frost-soft' : 'text-frost-subtle'}`}>
                {doneDateLabel}
              </span>
            </div>
          </div>

          {editingMarkdownId === todo.id ? (
            <textarea
              value={tempMarkdown}
              onChange={(event) => onTempMarkdownChange(event.target.value)}
              className={`${fieldClass} h-36 resize-y`}
              placeholder="マークダウンで記述してください..."
              autoFocus
            />
          ) : (
            <div
              onClick={() => onStartEditingMarkdown(todo.id, todo.markdown_text || '')}
              className="min-h-[60px] cursor-text rounded-xl bg-transparent px-3 py-2 text-sm text-frost-soft transition-colors hover:bg-night-glass-soft/60"
            >
              {todo.markdown_text ? (
                <div className="space-y-2 text-sm leading-relaxed text-frost-soft [&_a]:text-sky-300 [&_code]:rounded [&_code]:bg-night-glass-strong [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:list-disc [&_li]:pl-4">
                  <ReactMarkdown>{todo.markdown_text}</ReactMarkdown>
                </div>
              ) : (
                <div className="italic text-frost-subtle">クリックして詳細を追加...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
