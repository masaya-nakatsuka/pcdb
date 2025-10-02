"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'

import LoadingOverlay from '@/components/LoadingOverlay'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoItem } from '@/lib/todoTypes'

import { editFormSchema, type EditFormState, type SimpleStatus } from '../../../types'
import LoginPromptCard from '../_shared/LoginPromptCard.client'
import Header from './Header.client'
import SummaryHeader from './SummaryHeader.client'
import TodoList from './TodoList'

type LayoutProps = {
  listId: string
}

const pageBackgroundStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '48px 16px 64px',
  overflowX: 'auto'
} as const

const pageContentStyle = {
  maxWidth: '1240px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px'
} as const

const cardStyle = {
  background: 'rgba(15, 23, 42, 0.55)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '24px',
  color: '#e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)'
} as const

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
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showCompleted, setShowCompleted] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const [editForm, setEditForm] = useState<EditFormState>(editFormSchema.parse({}))

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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateIsMobile = () => setIsMobile(window.innerWidth <= 640)
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)

    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

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
      status: todo.status === '完了' ? '完了' : '未着手',
      priority: todo.priority,
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
    const isReopening = editForm.status === '未着手' && currentTodo?.status === '完了'

    const todoData = {
      title: editForm.title.trim(),
      status: editForm.status,
      priority: editForm.priority,
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

    const nextStatus: SimpleStatus = todo.status === '完了' ? '未着手' : '完了'
    const nextDoneDate = nextStatus === '完了' ? new Date().toISOString() : null

    setUpdatingTodo(todo.id)
    setOverlayMessage(nextStatus === '完了' ? '完了に更新中...' : '未着手に戻しています...')

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

  const sortedTodos = useMemo(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1, null: 0 }
    const statusOrder = { '未着手': 1, '完了': 2 }

    const cloned = [...todos]
    cloned.sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortField) {
        case 'priority':
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        case 'status':
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0
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
          aValue = 0
          bValue = 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    if (showCompleted) return cloned
    return cloned.filter((todo) => todo.status !== '完了')
  }, [todos, sortField, sortDirection, showCompleted])

  const statusSummary = useMemo(() => ({
    未着手: todos.filter((todo) => todo.status !== '完了').length,
    完了: todos.filter((todo) => todo.status === '完了').length
  }), [todos])

  const columnWidths = isMobile
    ? ['5%', '60%', '10%', '15%', '5%', '5%']
    : ['5%', '60%', '10%', '15%', '5%', '5%']
  const tableCellPadding = isMobile ? '12px 6px' : '16px 8px'

  if (loading) {
    return <LoadingOverlay message="読み込み中..." />
  }

  if (!userId) {
    return <LoginPromptCard onSignIn={handleSignIn} />
  }

  return (
    <div style={pageBackgroundStyle}>
      <div style={pageContentStyle}>
        <Header onSignOut={handleSignOut} />
        <div style={{ ...cardStyle, padding: isMobile ? '16px' : '24px' }}>
          <SummaryHeader
            statusSummary={statusSummary}
            showCompleted={showCompleted}
            onToggleShowCompleted={() => setShowCompleted((prev) => !prev)}
          />

          <style jsx>{`
            @keyframes slideInFromBottom {
              from { transform: translateY(12px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideInFromTop {
              from { transform: translateY(-16px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>

          <TodoList
            todos={sortedTodos}
            columnWidths={columnWidths}
            cellPadding={tableCellPadding}
            isMobile={isMobile}
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
