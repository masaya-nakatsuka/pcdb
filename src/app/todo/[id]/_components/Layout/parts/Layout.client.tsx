"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import LoadingOverlay from '@/components/LoadingOverlay'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoItem } from '@/lib/todoTypes'

import { editFormSchema, type EditFormState, type SimpleStatus, type TodoStatus } from '../../../types'
import LoginPromptCard from '../_shared/LoginPromptCard.client'
import Header from './Header.client'
import SummaryHeader from './SummaryHeader.client'
import TodoList from './TodoList'

type LayoutProps = {
  listId: string
}

const STATUS_RANK: Record<TodoStatus, number> = {
  未着手: 0,
  着手中: 0,
  完了: 1,
}

const PRIORITY_RANK: Record<NonNullable<TodoItem['priority']> | 'none', number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
}

export default function LayoutClient({ listId }: LayoutProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [editingMarkdown, setEditingMarkdown] = useState<string | null>(null)
  const [showNewTodo, setShowNewTodo] = useState<boolean>(false)
  const [updatingTodo, setUpdatingTodo] = useState<string | null>(null)
  const [overlayMessage, setOverlayMessage] = useState<string>("")
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set())
  const [tempMarkdown, setTempMarkdown] = useState<string>("")
  const [deletingTodos, setDeletingTodos] = useState<Set<string>>(new Set())
  const [newlyCreatedTodos, setNewlyCreatedTodos] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<string>('default')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showCompleted, setShowCompleted] = useState<boolean>(false)

  const [editForm, setEditForm] = useState<EditFormState>(editFormSchema.parse({}))
  const previousStatusRef = useRef<Map<string, TodoStatus>>(new Map())

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const baseUrl = window.location.origin
    return `${baseUrl}/todo`
  }, [])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { data } = await supabaseTodo.auth.getUser()
      const uid = data.user?.id ?? null
      if (!isMounted) return

      setUserId(uid)
      if (uid) {
        await loadTodos(uid, listId)
      }
      setLoading(false)
    })()

    return () => {
      isMounted = false
    }
  }, [listId])
  const loadTodos = useCallback(async (uid: string, lId: string) => {
    const { data, error } = await supabaseTodo
      .from('todo_items')
      .select('*')
      .eq('user_id', uid)
      .eq('list_id', lId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTodos(data as TodoItem[])
    }
  }, [])

  const handleSignIn = useCallback(async () => {
    await supabaseTodo.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined
    })
  }, [redirectTo])

  const handleSignOut = useCallback(async () => {
    await supabaseTodo.auth.signOut()
    setUserId(null)
    setTodos([])
  }, [])

  const resetEditForm = useCallback(() => {
    setEditForm(editFormSchema.parse({}))
  }, [])

  const updateEditForm = useCallback((values: Partial<EditFormState>) => {
    setEditForm((prev) => ({ ...prev, ...values }))
  }, [])

  const startEditing = useCallback((todo: TodoItem) => {
    setEditingTodo(todo.id)
    setEditForm({
      title: todo.title,
      status: todo.status,
      priority: todo.priority,
      group: todo.group ?? '',
      tags: todo.tags.join(', '),
      markdown_text: todo.markdown_text || ''
    })
  }, [])

  const startCreating = useCallback(() => {
    setShowNewTodo(true)
    resetEditForm()
  }, [resetEditForm])

  const cancelEditing = useCallback(() => {
    setEditingTodo(null)
    setShowNewTodo(false)
    resetEditForm()
  }, [resetEditForm])

  const startEditingMarkdown = useCallback((todoId: string, currentMarkdown: string) => {
    setEditingMarkdown(todoId)
    setTempMarkdown(currentMarkdown || '')
  }, [])

  const handleTempMarkdownChange = useCallback((value: string) => {
    setTempMarkdown(value)
  }, [])

  const saveMarkdown = useCallback(async () => {
    if (!editingMarkdown || !userId) return

    setUpdatingTodo(editingMarkdown)
    setOverlayMessage('マークダウン更新中...')

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({
        markdown_text: tempMarkdown.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingMarkdown)
      .eq('user_id', userId)
      .eq('list_id', listId)

    if (!error) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === editingMarkdown ? { ...todo, markdown_text: tempMarkdown.trim() || null } : todo
        )
      )
    }

    setEditingMarkdown(null)
    setTempMarkdown('')
    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [editingMarkdown, tempMarkdown, userId, listId])

  const saveTodo = useCallback(async (isNew: boolean) => {
    if (!userId || !editForm.title.trim()) return

    setUpdatingTodo(isNew ? 'new' : editingTodo || '')
    setOverlayMessage(isNew ? 'TODO作成中...' : 'TODO更新中...')

    const currentTodo = isNew ? null : todos.find((t) => t.id === editingTodo)
    const isCompletingNow = editForm.status === '完了' && currentTodo?.status !== '完了'
    const isReopening = editForm.status !== '完了' && currentTodo?.status === '完了'

    const todoData = {
      title: editForm.title.trim(),
      status: editForm.status,
      priority: editForm.priority,
      group: editForm.group.trim() || null,
      tags: editForm.tags
        ? editForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      markdown_text: editForm.markdown_text.trim() || null,
      done_date: isCompletingNow
        ? new Date().toISOString()
        : isReopening
          ? null
          : currentTodo?.done_date || null,
      user_id: userId,
      list_id: listId,
      updated_at: new Date().toISOString()
    }

    if (isNew) {
      const { data, error } = await supabaseTodo
        .from('todo_items')
        .insert(todoData)
        .select('*')
        .single()

      if (!error && data) {
        const newTodo = data as TodoItem
        setTodos((prev) => [newTodo, ...prev])
        previousStatusRef.current.set(newTodo.id, newTodo.status)
        setNewlyCreatedTodos((prev) => new Set(prev).add(newTodo.id))
        setTimeout(() => {
          setNewlyCreatedTodos((prev) => {
            const next = new Set(prev)
            next.delete(newTodo.id)
            return next
          })
        }, 500)
        setShowNewTodo(false)
        resetEditForm()
      }
    } else if (editingTodo) {
      const { error } = await supabaseTodo
        .from('todo_items')
        .update(todoData)
        .eq('id', editingTodo)
        .eq('user_id', userId)
        .eq('list_id', listId)

      if (!error) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === editingTodo ? ({ ...todo, ...todoData } as TodoItem) : todo))
        )
        previousStatusRef.current.set(editingTodo, todoData.status as TodoStatus)
        setEditingTodo(null)
        resetEditForm()
      }
    }

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [userId, editForm, editingTodo, listId, todos, resetEditForm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingTodo || showNewTodo) {
        const target = event.target as HTMLElement
        const todoContainer = target.closest('[data-todo-container]')
        if (!todoContainer) {
          if (editForm.title.trim()) {
            saveTodo(showNewTodo)
          } else {
            cancelEditing()
          }
        }
      }

      if (editingMarkdown) {
        const target = event.target as HTMLElement
        const markdownContainer = target.closest('[data-markdown-container]')
        if (!markdownContainer) {
          saveMarkdown()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editingTodo, showNewTodo, editForm.title, editingMarkdown, saveTodo, saveMarkdown, cancelEditing])

  const toggleTodoCompletion = useCallback(async (todo: TodoItem) => {
    if (updatingTodo || !userId) return

    const wasCompleted = todo.status === '完了'
    const fallbackStatus = wasCompleted
      ? previousStatusRef.current.get(todo.id) ?? '未着手'
      : todo.status
    const nextStatus: TodoStatus = wasCompleted ? fallbackStatus : '完了'
    const nextDoneDate = nextStatus === '完了' ? new Date().toISOString() : null

    if (!wasCompleted) {
      previousStatusRef.current.set(todo.id, todo.status)
    }

    setUpdatingTodo(todo.id)
    setOverlayMessage(
      nextStatus === '完了'
        ? '完了に更新中...'
        : nextStatus === '着手中'
          ? '着手中に戻しています...'
          : '未着手に戻しています...'
    )

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({
        status: nextStatus,
        done_date: nextDoneDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', todo.id)
      .eq('user_id', userId)
      .eq('list_id', listId)

    if (!error) {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, status: nextStatus, done_date: nextDoneDate } : item
        )
      )

      if (nextStatus !== '完了') {
        previousStatusRef.current.set(todo.id, nextStatus)
      }
    }

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [updatingTodo, userId, listId])

  const toggleTodoInProgress = useCallback(async (todo: TodoItem) => {
    if (updatingTodo || !userId) return

    const nextStatus: TodoStatus = todo.status === '着手中' ? '未着手' : '着手中'

    setUpdatingTodo(todo.id)
    setOverlayMessage(nextStatus === '着手中' ? '着手中に更新中...' : '未着手に戻しています...')

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({
        status: nextStatus,
        done_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', todo.id)
      .eq('user_id', userId)
      .eq('list_id', listId)

    if (!error) {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, status: nextStatus, done_date: null } : item
        )
      )
      previousStatusRef.current.set(todo.id, nextStatus)
    }

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [updatingTodo, userId, listId])

  const deleteTodo = useCallback(async (todoId: string) => {
    if (updatingTodo || !userId) return

    setDeletingTodos((prev) => new Set(prev).add(todoId))
    setUpdatingTodo(todoId)
    setOverlayMessage('削除中...')

    setTimeout(async () => {
      const { error } = await supabaseTodo
        .from('todo_items')
        .delete()
        .eq('id', todoId)
        .eq('user_id', userId)
        .eq('list_id', listId)

      if (!error) {
        setTodos((prev) => prev.filter((todo) => todo.id !== todoId))
      }

      setDeletingTodos((prev) => {
        const next = new Set(prev)
        next.delete(todoId)
        return next
      })
      setUpdatingTodo(null)
      setOverlayMessage('')
    }, 300)
  }, [updatingTodo, userId, listId])

  const toggleExpanded = useCallback((todoId: string) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev)
      if (next.has(todoId)) {
        next.delete(todoId)
      } else {
        next.add(todoId)
      }
      return next
    })
  }, [])

  const defaultSorter = useCallback(
    (a: TodoItem, b: TodoItem) => {
      const statusDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status]
      if (statusDiff !== 0) return statusDiff

      const aTags = a.tags.join(',').toLowerCase()
      const bTags = b.tags.join(',').toLowerCase()
      if (aTags !== bTags) {
        if (!aTags) return 1
        if (!bTags) return -1
        return aTags.localeCompare(bTags, 'ja')
      }

      const aGroup = (a.group ?? '').toLowerCase()
      const bGroup = (b.group ?? '').toLowerCase()
      if (aGroup !== bGroup) {
        if (!aGroup) return 1
        if (!bGroup) return -1
        return aGroup.localeCompare(bGroup, 'ja')
      }

      const priorityDiff = PRIORITY_RANK[a.priority ?? 'none'] - PRIORITY_RANK[b.priority ?? 'none']
      if (priorityDiff !== 0) return priorityDiff

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0
      if (aCreated !== bCreated) {
        return bCreated - aCreated
      }

      return a.title.localeCompare(b.title, 'ja')
    },
    []
  )

  const sortedTodos = useMemo(() => {
    const cloned = [...todos]

    cloned.sort((a, b) => {
      if (sortField === 'default') {
        return defaultSorter(a, b)
      }

      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortField) {
        case 'group':
          aValue = a.group ? a.group.toLowerCase() : '\uffff'
          bValue = b.group ? b.group.toLowerCase() : '\uffff'
          break
        case 'priority':
          aValue = PRIORITY_RANK[a.priority ?? 'none']
          bValue = PRIORITY_RANK[b.priority ?? 'none']
          break
        case 'status':
          aValue = STATUS_RANK[a.status]
          bValue = STATUS_RANK[b.status]
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'done_date':
          aValue = a.done_date ? new Date(a.done_date).getTime() : 0
          bValue = b.done_date ? new Date(b.done_date).getTime() : 0
          break
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        default:
          return defaultSorter(a, b)
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return defaultSorter(a, b)
    })

    if (showCompleted) return cloned
    return cloned.filter((todo) => todo.status !== '完了')
  }, [todos, sortField, sortDirection, showCompleted, defaultSorter])

  const statusSummary = useMemo(() => ({
    未着手: todos.filter((todo) => todo.status === '未着手').length,
    着手中: todos.filter((todo) => todo.status === '着手中').length,
    完了: todos.filter((todo) => todo.status === '完了').length
  }), [todos])

  const columnWidths = ['8%', '8%', '44%', '8%', '8%', '8%', '8%', '8%']

  if (loading) {
    return <LoadingOverlay message="読み込み中..." />
  }

  if (!userId) {
    return <LoginPromptCard onSignIn={handleSignIn} />
  }

  return (
    <div className="min-h-screen overflow-x-auto bg-page-gradient px-4 pb-16 pt-12 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 text-frost-soft">
        <Header onSignOut={handleSignOut} />
        <div className="flex flex-col rounded-3xl border border-night-border bg-night-glass p-4 text-frost-soft shadow-glass-xl backdrop-blur-[22px] sm:p-6">
          <SummaryHeader
            statusSummary={statusSummary}
            showCompleted={showCompleted}
            onToggleShowCompleted={() => setShowCompleted((prev) => !prev)}
          />

          <TodoList
            todos={sortedTodos}
            columnWidths={columnWidths}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => {
              if (sortField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              } else {
                setSortField(field)
                setSortDirection('asc')
              }
            }}
            editingTodoId={editingTodo}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            showNewTodo={showNewTodo}
            onStartCreating={startCreating}
            editForm={editForm}
            onEditFormChange={updateEditForm}
            editingMarkdownId={editingMarkdown}
            onStartEditingMarkdown={startEditingMarkdown}
            tempMarkdown={tempMarkdown}
            onTempMarkdownChange={handleTempMarkdownChange}
            onToggleTodoInProgress={toggleTodoInProgress}
            onToggleTodoCompletion={toggleTodoCompletion}
            updatingTodoId={updatingTodo}
            expandedTodos={expandedTodos}
            onToggleExpanded={toggleExpanded}
            onDeleteTodo={deleteTodo}
            deletingTodos={deletingTodos}
            newlyCreatedTodos={newlyCreatedTodos}
            onSaveTodo={saveTodo}
          />
        </div>
      </div>
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}
