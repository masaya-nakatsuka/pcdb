"use client"

import type { TodoGroup } from '@/lib/todoTypes'

import type { EditFormState } from '@/features/todo/detail/types'
import GroupSelectDropdown from './GroupSelectDropdown.client'

type NewRowProps = {
  gridTemplateColumns: string
  cellPaddingClass: string
  editForm: EditFormState
  onEditFormChange: (values: Partial<EditFormState>) => void
  onCancel: () => void
  onSave: () => void
  groups: TodoGroup[]
  onCreateGroup: (name: string) => Promise<TodoGroup | null>
  onOpenGroupCreateModal: (callback: (groupId: string) => void) => void
  onDeleteGroup: (groupId: string) => void
  onReorderGroups: (groups: TodoGroup[]) => void
}

export default function NewRow({
  gridTemplateColumns,
  cellPaddingClass,
  editForm,
  onEditFormChange,
  onCancel,
  onSave,
  groups,
  onCreateGroup,
  onOpenGroupCreateModal,
  onDeleteGroup,
  onReorderGroups,
}: NewRowProps) {
  const isInProgress = editForm.status === '着手中'
  const fieldClass = 'w-full rounded-xl border border-night-border-strong bg-night-glass-strong px-3 py-2 text-sm text-frost-soft placeholder:text-frost-subtle focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'

  return (
    <div
      data-todo-container
      className="relative z-10 grid items-stretch border-b border-night-border-muted bg-night-highlight/40 pointer-events-auto"
      style={{ gridTemplateColumns }}
    >
      <div className={`${cellPaddingClass} flex items-center justify-center`}>
        <button
          type="button"
          className={`todo-hit-expand flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-bold transition-all ${editForm.status === '完了' ? 'border-emerald-300 bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 text-charcoal-deep shadow-[0_0_18px_rgba(16,185,129,0.35)]' : 'border-night-border-strong text-charcoal-deep/40 hover:border-emerald-300 hover:bg-emerald-400/20'}`}
          onClick={() => onEditFormChange({ status: editForm.status === '完了' ? '未着手' : '完了' })}
        >
          ✓
        </button>
      </div>
      <div className={`${cellPaddingClass} flex items-center justify-center`}>
        <button
          type="button"
          title={isInProgress ? '着手中です。クリックで解除' : '未着手です。クリックで着手'}
          className={`todo-hit-expand flex h-6 w-6 items-center justify-center rounded-xl border text-sm transition-colors ${isInProgress ? 'border-sky-400/60 bg-sky-500/20 text-sky-300' : 'border-night-border-strong bg-night-glass-strong text-frost-soft hover:border-sky-400/60 hover:text-sky-200'}`}
          onClick={() => onEditFormChange({ status: isInProgress ? '未着手' : '着手中' })}
        >
          {isInProgress ? '🚩' : '⚑'}
        </button>
      </div>
      <div className={`${cellPaddingClass} flex items-center justify-center`}>
        <GroupSelectDropdown
          value={editForm.group_id}
          groups={groups}
          onChange={(groupId) => onEditFormChange({ group_id: groupId })}
          onCreateNew={() => {
            onOpenGroupCreateModal((groupId) => {
              onEditFormChange({ group_id: groupId })
            })
          }}
          onDeleteGroup={onDeleteGroup}
          onReorderGroups={onReorderGroups}
        />
      </div>
      <div className={`${cellPaddingClass} flex flex-col justify-center`}>
        <input
          type="text"
          value={editForm.title}
          onChange={(event) => onEditFormChange({ title: event.target.value })}
          className={`${fieldClass} font-semibold`}
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
      <div className={`${cellPaddingClass} flex items-center justify-center`}>
        <select
          value={editForm.priority || ''}
          onChange={(event) =>
            onEditFormChange({ priority: (event.target.value as 'low' | 'medium' | 'high' | '') || null })
          }
          className={`${fieldClass} text-center`}
        >
          <option value="">なし</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>
      <div className={`${cellPaddingClass} flex flex-col justify-center`}>
        <input
          type="text"
          value={editForm.tags}
          onChange={(event) => onEditFormChange({ tags: event.target.value })}
          className={fieldClass}
          placeholder="タグ"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              onSave()
            }
          }}
        />
      </div>
      <div className={`${cellPaddingClass}`} />
      <div className={`${cellPaddingClass} flex items-center justify-center`}>
        <button
          type="button"
          onClick={onCancel}
          className="todo-hit-expand flex h-6 w-6 items-center justify-center rounded-xl border border-red-400/40 bg-red-500/20 text-sm text-rose-200 transition-colors hover:border-red-400/60 hover:bg-red-500/30"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
