"use client"

import type { CSSProperties } from 'react'

import type { TodoGroup, TodoItem } from '@/lib/todoTypes'

import DetailDrawer from './DetailDrawer.client'

type TodoTableRowProps = {
  todo: TodoItem
  gridTemplateColumns: string
  cellPaddingClass: string
  horizontalPaddingClass: string
  onToggleTodoInProgress: (todo: TodoItem) => void
  onToggleTodoCompletion: (todo: TodoItem) => void
  onStartEditing: (todo: TodoItem) => void
  onToggleExpanded: (todoId: string) => void
  onDeleteTodo: (todoId: string) => void
  onStartEditingMarkdown: (todoId: string, markdown: string) => void
  onTempMarkdownChange: (value: string) => void
  editingMarkdownId: string | null
  tempMarkdown: string
  expanded: boolean
  updatingTodoId: string | null
  deletingTodos: Set<string>
  newlyCreatedTodos: Set<string>
  recentlyMovedTodoId: string | null
  reappearingTodos: Set<string>
  disappearingTodos: Set<string>
  groupsById: Record<string, TodoGroup>
}

type PriorityKey = NonNullable<TodoItem['priority']> | 'none'

const PRIORITY_LABEL: Record<PriorityKey, string> = {
  high: '高',
  medium: '中',
  low: '低',
  none: '―',
}

const PRIORITY_DOT_COLOR: Record<PriorityKey, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
  none: 'bg-slate-500/60',
}

export default function Row({
  todo,
  gridTemplateColumns,
  cellPaddingClass,
  horizontalPaddingClass,
  onToggleTodoInProgress,
  onToggleTodoCompletion,
  onStartEditing,
  onToggleExpanded,
  onDeleteTodo,
  onStartEditingMarkdown,
  onTempMarkdownChange,
  editingMarkdownId,
  tempMarkdown,
  expanded,
  updatingTodoId,
  deletingTodos,
  newlyCreatedTodos,
  recentlyMovedTodoId,
  reappearingTodos,
  disappearingTodos,
  groupsById,
}: TodoTableRowProps) {
  const isCompleted = todo.status === '完了'
  const isInProgress = todo.status === '着手中'
  const isDeleting = deletingTodos.has(todo.id)
  const isNew = newlyCreatedTodos.has(todo.id)
  const isUpdating = updatingTodoId === todo.id
  const isRecentlyMoved = recentlyMovedTodoId === todo.id
  const isReappearing = reappearingTodos.has(todo.id)
  const isDisappearing = disappearingTodos.has(todo.id)
  const group = todo.group_id ? groupsById[todo.group_id] : undefined
  const groupBadgeStyle: CSSProperties | undefined = group?.color?.startsWith('#')
    ? {
        backgroundColor: `${group.color}1f`,
        borderColor: `${group.color}66`,
        color: group.color,
      }
    : undefined

  return (
    <div className={`border-b border-night-border-muted transition-opacity ${isDeleting ? 'opacity-[0.35]' : ''}`}>
      <div
        data-todo-container
        onClick={() => onStartEditing(todo)}
        className={`relative z-0 grid cursor-pointer items-stretch transition-colors ${isNew ? 'animate-slide-in-bottom bg-night-highlight' : 'hover:bg-night-highlight/60'} ${isRecentlyMoved ? 'animate-row-highlight' : ''} ${isReappearing ? 'animate-row-highlight' : ''} ${isDisappearing ? 'animate-row-complete' : ''}`}
        style={{ gridTemplateColumns }}
      >
        <div className={`${cellPaddingClass} flex items-center justify-center`}>
          <button
            type="button"
            className={`todo-hit-expand flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-bold transition-all ${isCompleted ? 'border-emerald-300 bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 text-charcoal-deep shadow-[0_0_18px_rgba(16,185,129,0.35)]' : 'border-night-border-strong text-transparent hover:border-emerald-300 hover:bg-emerald-400/20 hover:text-charcoal-deep/40'} ${isUpdating ? 'cursor-not-allowed opacity-60' : ''}`}
            onClick={(event) => {
              event.stopPropagation()
              if (!isUpdating) onToggleTodoCompletion(todo)
            }}
            aria-pressed={isCompleted}
            disabled={isUpdating}
            title={isCompleted ? '完了に設定されています。クリックで未着手に戻す' : '未着手です。クリックで完了に設定'}
          >
            ✓
          </button>
        </div>
        <div className={`${cellPaddingClass} flex items-center justify-center`}>
          <button
            type="button"
            className={`todo-hit-expand flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors ${isInProgress ? 'border-sky-400/60 bg-sky-500/20 text-sky-300' : 'border-night-border bg-night-glass text-frost-soft hover:border-sky-400/60 hover:text-sky-200'} ${isUpdating ? 'cursor-not-allowed opacity-60' : ''}`}
            onClick={(event) => {
              event.stopPropagation()
              if (!isUpdating) onToggleTodoInProgress(todo)
            }}
            aria-pressed={isInProgress}
            disabled={isUpdating}
            title={isInProgress ? '着手中です。クリックで解除' : '未着手です。クリックで着手'}
          >
            {isInProgress ? '🚩' : '⚑'}
          </button>
        </div>
        <div className={`${cellPaddingClass} flex items-center justify-center`}>
          {group ? (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-night-border bg-night-glass px-3 py-1 text-xs font-semibold text-frost-soft"
              style={groupBadgeStyle}
            >
              {group.emoji && <span>{group.emoji}</span>}
              <span>{group.name}</span>
            </span>
          ) : (
            <span className="text-frost-subtle">-</span>
          )}
        </div>
        <div className={`${cellPaddingClass} flex flex-col items-start justify-center`}>
          <p className={`break-words text-sm font-medium leading-relaxed text-frost-soft ${isCompleted ? 'line-through text-frost-muted' : ''}`}>
            {todo.title}
          </p>
        </div>
        <div className={`${cellPaddingClass} flex items-center justify-center`}>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${PRIORITY_DOT_COLOR[todo.priority ?? 'none']}`} />
            <span className={`text-sm font-semibold ${todo.priority ? 'text-frost-soft' : 'text-frost-subtle'}`}>
              {PRIORITY_LABEL[todo.priority ?? 'none']}
            </span>
          </div>
        </div>
        <div className={`${cellPaddingClass} flex items-center justify-center`}>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            {todo.tags.length ? (
              todo.tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="rounded-full border border-night-border bg-night-glass px-3 py-1 text-frost-soft">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-frost-subtle">-</span>
            )}
          </div>
        </div>
        <div className={`${cellPaddingClass} flex items-center justify-center`}>
          <button
            type="button"
            className="todo-hit-expand flex h-6 w-6 items-center justify-center rounded-xl border border-night-border bg-night-glass text-sm text-frost-soft transition-colors hover:border-night-border-strong hover:text-white"
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpanded(todo.id)
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
        <div className={`${cellPaddingClass} flex items-center justify-center`}>
          <button
            type="button"
            className="todo-hit-expand flex h-6 w-6 items-center justify-center rounded-xl border border-red-400/40 bg-red-500/20 text-base text-rose-200 transition-colors hover:border-red-400/60 hover:bg-red-500/30"
            onClick={(event) => {
              event.stopPropagation()
              onDeleteTodo(todo.id)
            }}
          >
            🗑
          </button>
        </div>
      </div>
      <DetailDrawer
        todo={todo}
        isExpanded={expanded}
        horizontalPaddingClass={horizontalPaddingClass}
        editingMarkdownId={editingMarkdownId}
        tempMarkdown={tempMarkdown}
        onTempMarkdownChange={onTempMarkdownChange}
        onStartEditingMarkdown={onStartEditingMarkdown}
      />
    </div>
  )
}
