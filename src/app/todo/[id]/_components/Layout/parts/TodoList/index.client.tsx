"use client"

import type { CSSProperties } from 'react'

import type { TodoItem } from '@/lib/todoTypes'

import type { EditFormState } from '../../../../types'
import AddRow from './AddRow.client'
import EditRow from './EditRow.client'
import NewRow from './NewRow.client'
import Row from './Row.client'

import TodoListHeader from './ListHeader'

type SortDirection = 'asc' | 'desc'

type TodoTableProps = {
  todos: TodoItem[]
  columnWidths: string[]
  cellPadding: string
  isMobile: boolean
  sortField: string
  sortDirection: SortDirection
  onSort: (field: string) => void
  editingTodoId: string | null
  onStartEditing: (todo: TodoItem) => void
  onCancelEditing: () => void
  showNewTodo: boolean
  onStartCreating: () => void
  editForm: EditFormState
  onEditFormChange: (values: Partial<EditFormState>) => void
  editingMarkdownId: string | null
  onStartEditingMarkdown: (todoId: string, markdown: string) => void
  tempMarkdown: string
  onTempMarkdownChange: (value: string) => void
  onToggleTodoInProgress: (todo: TodoItem) => void
  onToggleTodoCompletion: (todo: TodoItem) => void
  updatingTodoId: string | null
  expandedTodos: Set<string>
  onToggleExpanded: (todoId: string) => void
  onDeleteTodo: (todoId: string) => void
  deletingTodos: Set<string>
  newlyCreatedTodos: Set<string>
  onSaveTodo: (isNew: boolean) => void
}

const listShellStyle: CSSProperties = {
  width: '100%'
}

const scrollContainerStyle: CSSProperties = {
  overflowX: 'auto'
}

const rowsWrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
}

const bodyCellStyle = (padding: string): CSSProperties => ({
  padding,
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box'
})

const iconButtonBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '46px',
  height: '46px',
  borderRadius: '14px',
  border: 'none',
  fontSize: '18px',
  background: 'rgba(15, 23, 42, 0.55)',
  color: '#e2e8f0',
  cursor: 'pointer',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease'
}

const todoStatusButtonBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'transparent',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.15s ease, opacity 0.2s ease'
}

const inProgressButtonBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 14px',
  borderRadius: '999px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'rgba(15, 23, 42, 0.55)',
  color: '#e2e8f0',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  minWidth: '80px',
  transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease'
}

const controlBaseStyle: CSSProperties = {
  borderRadius: '12px',
  padding: '10px 12px',
  fontSize: '13px',
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  color: '#e2e8f0',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box',
  minWidth: 0
}

export default function TodoList({
  todos,
  columnWidths,
  cellPadding,
  isMobile,
  sortField,
  sortDirection,
  onSort,
  editingTodoId,
  onStartEditing,
  onCancelEditing,
  showNewTodo,
  onStartCreating,
  editForm,
  onEditFormChange,
  editingMarkdownId,
  onStartEditingMarkdown,
  tempMarkdown,
  onTempMarkdownChange,
  onToggleTodoInProgress,
  onToggleTodoCompletion,
  updatingTodoId,
  expandedTodos,
  onToggleExpanded,
  onDeleteTodo,
  deletingTodos,
  newlyCreatedTodos,
  onSaveTodo
}: TodoTableProps) {
  const bodyCell = bodyCellStyle(cellPadding)
  const gridTemplateColumns = columnWidths.join(' ')
  const minTableWidth = isMobile ? '760px' : '1080px'

  return (
    <div style={listShellStyle}>
      <div style={scrollContainerStyle}>
        <div
          style={{
            minWidth: minTableWidth,
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}
        >
          <TodoListHeader
            gridTemplateColumns={gridTemplateColumns}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            cellPadding={cellPadding}
          />

          <div style={rowsWrapperStyle}>
            {todos.map((todo) => {
              const expanded = expandedTodos.has(todo.id)

              if (editingTodoId === todo.id) {
                return (
                  <EditRow
                    key={todo.id}
                  gridTemplateColumns={gridTemplateColumns}
                  cellStyle={bodyCell}
                  statusButtonStyle={todoStatusButtonBaseStyle}
                  inProgressButtonStyle={inProgressButtonBaseStyle}
                  iconButtonStyle={iconButtonBaseStyle}
                  controlStyle={controlBaseStyle}
                  editForm={editForm}
                    onEditFormChange={onEditFormChange}
                    onCancel={onCancelEditing}
                    onSave={() => onSaveTodo(false)}
                  />
                )
              }

              return (
                <Row
                  key={todo.id}
                  todo={todo}
                  gridTemplateColumns={gridTemplateColumns}
                  cellStyle={bodyCell}
                  cellPadding={cellPadding}
                  statusButtonStyle={todoStatusButtonBaseStyle}
                  inProgressButtonStyle={inProgressButtonBaseStyle}
                  iconButtonStyle={iconButtonBaseStyle}
                  onToggleTodoInProgress={onToggleTodoInProgress}
                  onToggleTodoCompletion={onToggleTodoCompletion}
                  onStartEditing={onStartEditing}
                  onToggleExpanded={onToggleExpanded}
                  onDeleteTodo={onDeleteTodo}
                  onStartEditingMarkdown={onStartEditingMarkdown}
                  onTempMarkdownChange={onTempMarkdownChange}
                  editingMarkdownId={editingMarkdownId}
                  tempMarkdown={tempMarkdown}
                  controlStyle={controlBaseStyle}
                  expanded={expanded}
                  updatingTodoId={updatingTodoId}
                  deletingTodos={deletingTodos}
                  newlyCreatedTodos={newlyCreatedTodos}
                />
              )
            })}

            {showNewTodo ? (
              <NewRow
                gridTemplateColumns={gridTemplateColumns}
                cellStyle={bodyCell}
                statusButtonStyle={todoStatusButtonBaseStyle}
                inProgressButtonStyle={inProgressButtonBaseStyle}
                iconButtonStyle={iconButtonBaseStyle}
                controlStyle={controlBaseStyle}
                editForm={editForm}
                onEditFormChange={onEditFormChange}
                onCancel={onCancelEditing}
                onSave={() => onSaveTodo(true)}
              />
            ) : (
              <AddRow
                gridTemplateColumns={gridTemplateColumns}
                cellPadding={cellPadding}
                onStartCreating={onStartCreating}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
