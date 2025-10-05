"use client"

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

export default function TodoList({
  todos,
  columnWidths,
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
  onSaveTodo,
}: TodoTableProps) {
  const gridTemplateColumns = columnWidths.join(' ')
  const cellPaddingClass = 'px-3 py-3 sm:px-4 sm:py-4'
  const horizontalPaddingClass = 'px-3 sm:px-4'

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="flex w-full flex-col">
          <TodoListHeader
            gridTemplateColumns={gridTemplateColumns}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            cellPaddingClass={cellPaddingClass}
          />

          <div className="flex flex-col">
            {todos.map((todo) => {
              const expanded = expandedTodos.has(todo.id)

              if (editingTodoId === todo.id) {
                return (
                  <EditRow
                    key={todo.id}
                    gridTemplateColumns={gridTemplateColumns}
                    cellPaddingClass={cellPaddingClass}
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
                  cellPaddingClass={cellPaddingClass}
                  horizontalPaddingClass={horizontalPaddingClass}
                  onToggleTodoInProgress={onToggleTodoInProgress}
                  onToggleTodoCompletion={onToggleTodoCompletion}
                  onStartEditing={onStartEditing}
                  onToggleExpanded={onToggleExpanded}
                  onDeleteTodo={onDeleteTodo}
                  onStartEditingMarkdown={onStartEditingMarkdown}
                  onTempMarkdownChange={onTempMarkdownChange}
                  editingMarkdownId={editingMarkdownId}
                  tempMarkdown={tempMarkdown}
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
                cellPaddingClass={cellPaddingClass}
                editForm={editForm}
                onEditFormChange={onEditFormChange}
                onCancel={onCancelEditing}
                onSave={() => onSaveTodo(true)}
              />
            ) : (
              <AddRow
                gridTemplateColumns={gridTemplateColumns}
                cellPaddingClass={cellPaddingClass}
                onStartCreating={onStartCreating}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
