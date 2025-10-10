"use client"

import { useEffect, useRef } from 'react'
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isEditingMarkdown = editingMarkdownId === todo.id

  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    if (editingMarkdownId === todo.id) {
      adjustTextareaHeight(textareaRef.current)
    }
  }, [editingMarkdownId, tempMarkdown, todo.id])

  return (
    <div
      className="pt-3 overflow-hidden transition-[max-height] duration-300 ease-in-out"
      style={{ maxHeight: isExpanded ? '4000px' : '0px' }}
    >
      <div
        className={`${horizontalPaddingClass} pb-4 ${isEditingMarkdown ? 'relative z-[60]' : ''}`}
        data-markdown-container
      >
        <div
          className={`rounded-xl border border-night-border bg-night-glass p-4 transition-shadow ${isEditingMarkdown ? 'ring-1 ring-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.35)]' : ''}`}
        >
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
              ref={textareaRef}
              value={tempMarkdown}
              onInput={(event) => {
                const el = event.currentTarget
                onTempMarkdownChange(el.value)
                // 入力ごとに高さを内容に合わせて更新
                el.style.height = 'auto'
                el.style.height = `${el.scrollHeight}px`
              }}
              className={`${fieldClass} min-h-fit resize-y overflow-hidden`}
              placeholder="詳細を記述、マークダウン形式にも対応しています..."
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
