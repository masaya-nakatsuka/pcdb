"use client"

import type { CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'

import type { TodoItem } from '@/lib/todoTypes'

type DetailDrawerProps = {
  todo: TodoItem
  isExpanded: boolean
  cellPadding: string
  controlStyle: CSSProperties
  editingMarkdownId: string | null
  tempMarkdown: string
  onTempMarkdownChange: (value: string) => void
  onStartEditingMarkdown: (todoId: string, markdown: string) => void
}

const resolveHorizontalPadding = (padding: string): string => {
  const parts = padding.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  if (parts.length >= 2) return parts[1]
  return '16px'
}

export default function DetailDrawer({
  todo,
  isExpanded,
  cellPadding,
  controlStyle,
  editingMarkdownId,
  tempMarkdown,
  onTempMarkdownChange,
  onStartEditingMarkdown
}: DetailDrawerProps) {
  const createdAtLabel = todo.created_at ? new Date(todo.created_at).toLocaleDateString('ja-JP') : '-'
  const doneDateLabel = todo.done_date ? new Date(todo.done_date).toLocaleDateString('ja-JP') : '-'
  const createdDateColor = todo.created_at ? 'rgba(248, 250, 252, 0.9)' : 'rgba(226, 232, 240, 0.45)'
  const doneDateColor = todo.done_date ? 'rgba(248, 250, 252, 0.9)' : 'rgba(226, 232, 240, 0.45)'
  const horizontalPadding = resolveHorizontalPadding(cellPadding)

  return (
    <div
      style={{
        maxHeight: isExpanded ? '320px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.35s ease'
      }}
    >
      <div
        style={{
          padding: `0 ${horizontalPadding} 16px`,
        }}
      >
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '12px',
              fontSize: '12px',
              color: 'rgba(226, 232, 240, 0.75)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ opacity: 0.7 }}>作成日</span>
              <span style={{ fontWeight: 600, color: createdDateColor }}>{createdAtLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ opacity: 0.7 }}>完了日</span>
              <span style={{ fontWeight: 600, color: doneDateColor }}>{doneDateLabel}</span>
            </div>
          </div>
          {editingMarkdownId === todo.id ? (
            <div data-markdown-container>
              <textarea
                value={tempMarkdown}
                onChange={(event) => onTempMarkdownChange(event.target.value)}
                style={{
                  ...controlStyle,
                  width: '100%',
                  height: '140px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  resize: 'vertical',
                  marginBottom: '10px'
                }}
                placeholder="マークダウンで記述してください..."
                autoFocus
              />
            </div>
          ) : (
            <div
              onClick={() => onStartEditingMarkdown(todo.id, todo.markdown_text || '')}
              style={{
                borderRadius: '12px',
                padding: '12px',
                backgroundColor: 'transparent',
                cursor: 'text',
                minHeight: '60px',
                fontSize: '13px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: 'rgba(226, 232, 240, 0.85)'
              }}
            >
              {todo.markdown_text ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  <ReactMarkdown>{todo.markdown_text}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ color: 'rgba(226, 232, 240, 0.45)', fontStyle: 'italic' }}>
                  クリックして詳細を追加...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
