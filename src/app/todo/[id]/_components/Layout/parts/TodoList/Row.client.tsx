"use client"

import type { CSSProperties } from 'react'

import type { TodoItem } from '@/lib/todoTypes'
import { getPriorityColor } from '@/styles/commonStyles'

import DetailDrawer from './DetailDrawer.client'

type TodoTableRowProps = {
  todo: TodoItem
  gridTemplateColumns: string
  cellStyle: CSSProperties
  cellPadding: string
  statusButtonStyle: CSSProperties
  inProgressButtonStyle: CSSProperties
  iconButtonStyle: CSSProperties
  onToggleTodoInProgress: (todo: TodoItem) => void
  onToggleTodoCompletion: (todo: TodoItem) => void
  onStartEditing: (todo: TodoItem) => void
  onToggleExpanded: (todoId: string) => void
  onDeleteTodo: (todoId: string) => void
  onStartEditingMarkdown: (todoId: string, markdown: string) => void
  onTempMarkdownChange: (value: string) => void
  editingMarkdownId: string | null
  tempMarkdown: string
  controlStyle: CSSProperties
  expanded: boolean
  updatingTodoId: string | null
  deletingTodos: Set<string>
  newlyCreatedTodos: Set<string>
}

export default function Row({
  todo,
  gridTemplateColumns,
  cellStyle,
  cellPadding,
  statusButtonStyle,
  inProgressButtonStyle,
  iconButtonStyle,
  onToggleTodoInProgress,
  onToggleTodoCompletion,
  onStartEditing,
  onToggleExpanded,
  onDeleteTodo,
  onStartEditingMarkdown,
  onTempMarkdownChange,
  editingMarkdownId,
  tempMarkdown,
  controlStyle,
  expanded,
  updatingTodoId,
  deletingTodos,
  newlyCreatedTodos
}: TodoTableRowProps) {
  const isCompleted = todo.status === '完了'
  const isInProgress = todo.status === '着手中'
  const isDeleting = deletingTodos.has(todo.id)
  const isNew = newlyCreatedTodos.has(todo.id)

  const containerStyle: CSSProperties = {
    borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
    opacity: isDeleting ? 0.35 : 1,
    animation: isNew ? 'slideInFromBottom 0.3s ease-out' : undefined
  }

  const gridRowStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns,
    alignItems: 'stretch',
    cursor: 'pointer',
    background: isNew ? 'rgba(59, 130, 246, 0.08)' : 'transparent'
  }

  return (
    <div style={containerStyle}>
      <div
        data-todo-container
        onClick={() => onStartEditing(todo)}
        style={gridRowStyle}
      >
        <div style={{ ...cellStyle, justifyContent: 'center' }}>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onToggleTodoCompletion(todo)
            }}
            aria-pressed={isCompleted}
            disabled={updatingTodoId === todo.id}
            style={{
              ...statusButtonStyle,
              margin: '0 auto',
              cursor: updatingTodoId === todo.id ? 'not-allowed' : 'pointer',
              opacity: updatingTodoId === todo.id ? 0.6 : 1,
              background: isCompleted
                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)'
                : 'transparent',
              border: isCompleted ? '1px solid rgba(52, 211, 153, 0.6)' : '1px solid rgba(148, 163, 184, 0.35)'
            }}
            title={isCompleted ? '完了に設定されています。クリックで未着手に戻す' : '未着手です。クリックで完了に設定'}
          >
            <span
              style={{
                width: '14px',
                height: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#0f172a' : 'transparent',
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
            onClick={(event) => {
              event.stopPropagation()
              onToggleTodoInProgress(todo)
            }}
            aria-pressed={isInProgress}
            disabled={updatingTodoId === todo.id}
            style={{
              ...iconButtonStyle,
              width: '24px',
              height: '24px',
              margin: '0 auto',
              opacity: updatingTodoId === todo.id ? 0.6 : 1,
              cursor: updatingTodoId === todo.id ? 'not-allowed' : 'pointer',
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
        <div style={{ ...cellStyle, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div
            style={{
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? 'rgba(148, 163, 184, 0.7)' : '#f8fafc',
              fontSize: '14px',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {todo.title}
          </div>
        </div>
        <div style={{ ...cellStyle, justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getPriorityColor(todo.priority)
              }}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: todo.priority ? 'rgba(226, 232, 240, 0.9)' : 'rgba(226, 232, 240, 0.5)'
              }}
            >
              {todo.priority ? (todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低') : '―'}
            </span>
          </div>
        </div>
        <div style={{ ...cellStyle, justifyContent: 'center' }}>
          <div
            style={{
              fontSize: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {todo.tags.length ? (
              todo.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'rgba(148, 163, 184, 0.18)',
                    color: 'rgba(226, 232, 240, 0.85)'
                  }}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span style={{ color: 'rgba(226, 232, 240, 0.45)' }}>-</span>
            )}
          </div>
        </div>
        <div style={{ ...cellStyle, justifyContent: 'center' }}>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpanded(todo.id)
            }}
            style={{
              ...iconButtonStyle,
              width: '24px',
              height: '24px',
              margin: '0 auto',
              background: 'rgba(15, 23, 42, 0.6)',
              fontSize: '14px'
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
        <div style={{ ...cellStyle, justifyContent: 'center' }}>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onDeleteTodo(todo.id)
            }}
            style={{
              ...iconButtonStyle,
              width: '24px',
              height: '24px',
              margin: '0 auto',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#fda4af',
              fontSize: '16px',
              textAlign: 'center'
            }}
          >
            🗑
          </button>
        </div>
      </div>
      <DetailDrawer
        todo={todo}
        isExpanded={expanded}
        cellPadding={cellPadding}
        controlStyle={controlStyle}
        editingMarkdownId={editingMarkdownId}
        tempMarkdown={tempMarkdown}
        onTempMarkdownChange={onTempMarkdownChange}
        onStartEditingMarkdown={onStartEditingMarkdown}
      />
    </div>
  )
}
