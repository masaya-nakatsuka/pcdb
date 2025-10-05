"use client"

import type { CSSProperties } from 'react'

import type { EditFormState } from '../../../../types'

type EditRowProps = {
  gridTemplateColumns: string
  cellStyle: CSSProperties
  statusButtonStyle: CSSProperties
  inProgressButtonStyle: CSSProperties
  iconButtonStyle: CSSProperties
  controlStyle: CSSProperties
  editForm: EditFormState
  onEditFormChange: (values: Partial<EditFormState>) => void
  onCancel: () => void
  onSave: () => void
}

export default function EditRow({
  gridTemplateColumns,
  cellStyle,
  statusButtonStyle,
  inProgressButtonStyle,
  iconButtonStyle,
  controlStyle,
  editForm,
  onEditFormChange,
  onCancel,
  onSave
}: EditRowProps) {
  const isInProgress = editForm.status === '着手中'

  return (
    <div
      data-todo-container
      style={{
        display: 'grid',
        gridTemplateColumns,
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
        background: 'rgba(148, 163, 184, 0.08)',
        animation: 'slideInFromTop 0.3s ease'
      }}
    >
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <button
          className="todo-hit-expand"
          type="button"
          onClick={() =>
            onEditFormChange({ status: editForm.status === '完了' ? '未着手' : '完了' })
          }
          style={{
            ...statusButtonStyle,
            margin: '0 auto',
            background: editForm.status === '完了'
              ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)'
              : 'transparent',
            border: editForm.status === '完了' ? '1px solid rgba(52, 211, 153, 0.6)' : '1px solid rgba(148, 163, 184, 0.35)'
          }}
        >
          <span
            style={{
              width: '14px',
              height: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: editForm.status === '完了' ? '#0f172a' : 'transparent',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'color 0.2s ease'
            }}
          >
            ✓
          </span>
        </button>
      </div>
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <button
          className="todo-hit-expand"
          type="button"
          onClick={() =>
            onEditFormChange({ status: isInProgress ? '未着手' : '着手中' })
          }
          style={{
            ...iconButtonStyle,
            width: '24px',
            height: '24px',
            background: isInProgress ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.6)',
            border: isInProgress ? '1px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(148, 163, 184, 0.35)',
            color: isInProgress ? '#60a5fa' : 'rgba(226, 232, 240, 0.75)',
            fontSize: '14px'
          }}
          title={isInProgress ? '着手中です。クリックで解除' : '未着手です。クリックで着手'}
        >
          {isInProgress ? '🚩' : '⚑'}
        </button>
      </div>
      <div style={{ ...cellStyle, flexDirection: 'column', alignItems: 'stretch' }}>
        <input
          type="text"
          value={editForm.title}
          onChange={(event) => onEditFormChange({ title: event.target.value })}
          style={{
            ...controlStyle,
            fontSize: '14px',
            fontWeight: 600,
            width: '100%'
          }}
          placeholder="タイトル"
          autoFocus
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              onSave()
            }
          }}
        />
      </div>
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <select
          value={editForm.priority || ''}
          onChange={(event) =>
            onEditFormChange({
              priority: (event.target.value as 'low' | 'medium' | 'high' | '') || null
            })
          }
          style={{
            ...controlStyle,
            padding: '10px 12px',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <option value="">なし</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>
      <div style={{ ...cellStyle, flexDirection: 'column', alignItems: 'stretch' }}>
        <input
          type="text"
          value={editForm.tags}
          onChange={(event) => onEditFormChange({ tags: event.target.value })}
          style={{
            ...controlStyle,
            textAlign: 'center',
            width: '100%'
          }}
          placeholder="タグ"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              onSave()
            }
          }}
        />
      </div>
      <div style={{ ...cellStyle, justifyContent: 'center' }} />
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            ...iconButtonStyle,
            width: '24px',
            height: '24px',
            background: 'rgba(239, 68, 68, 0.18)',
            color: '#fda4af',
            fontSize: '14px'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
