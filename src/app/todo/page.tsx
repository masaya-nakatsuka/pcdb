"use client"

import { useEffect, useMemo, useState, useCallback, type CSSProperties } from 'react'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoItem } from '@/lib/todoTypes'
import LoadingOverlay from '@/components/LoadingOverlay'
import ReactMarkdown from 'react-markdown'

const GRID_TEMPLATE = '90px 5.2fr 70px 1.2fr 110px 110px 64px 64px'
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
const SECONDARY_GRADIENT = 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'
const DESTRUCTIVE_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)'
const GLASS_BACKGROUND = 'rgba(15, 23, 42, 0.65)'
const GLASS_BORDER = '1px solid rgba(148, 163, 184, 0.2)'

export default function TodoPage() {
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

  const [editForm, setEditForm] = useState<{
    title: string
    status: '未着手' | '着手中' | '完了'
    priority: 'low' | 'medium' | 'high' | null
    tags: string
    branch_names: string
    pr_links: string
    markdown_text: string
  }>({
    title: "",
    status: '未着手',
    priority: null,
    tags: "",
    branch_names: "",
    pr_links: "",
    markdown_text: ""
  })

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    // 現在のページの完全なURLを使用
    const currentUrl = window.location.href
    return currentUrl
  }, [])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { data } = await supabaseTodo.auth.getUser()
      const userId = data.user?.id ?? null

      if (!isMounted) return

      setUserId(userId)
      if (userId) {
        await loadTodos(userId)
      }
      setLoading(false)
    })()

    return () => {
      isMounted = false
    }
  }, [])

  async function loadTodos(userId: string) {
    const { data, error } = await supabaseTodo
      .from('todo_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error && data) setTodos(data as TodoItem[])
  }

  async function handleSignIn() {
    await supabaseTodo.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    })
  }

  async function handleSignOut() {
    await supabaseTodo.auth.signOut()
    setUserId(null)
    setTodos([])
  }

  const resetEditForm = () => {
    setEditForm({
      title: "",
      status: '未着手',
      priority: null,
      tags: "",
      branch_names: "",
      pr_links: "",
      markdown_text: ""
    })
  }

  const startEditing = (todo: TodoItem) => {
    setEditingTodo(todo.id)
    setEditForm({
      title: todo.title,
      status: todo.status,
      priority: todo.priority,
      tags: todo.tags.join(', '),
      branch_names: todo.branch_names.join(', '),
      pr_links: todo.pr_links.join(', '),
      markdown_text: todo.markdown_text || ""
    })
  }

  const startCreating = () => {
    setShowNewTodo(true)
    resetEditForm()
  }

  const cancelEditing = () => {
    setEditingTodo(null)
    setShowNewTodo(false)
    resetEditForm()
  }

  const startEditingMarkdown = (todoId: string, currentMarkdown: string) => {
    setEditingMarkdown(todoId)
    setTempMarkdown(currentMarkdown || "")
  }

  const saveMarkdown = useCallback(async () => {
    if (!editingMarkdown) return

    setUpdatingTodo(editingMarkdown)
    setOverlayMessage("マークダウン更新中...")

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({
        markdown_text: tempMarkdown.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingMarkdown)

    if (!error) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === editingMarkdown
            ? { ...todo, markdown_text: tempMarkdown.trim() || null }
            : todo
        )
      )
    }

    setEditingMarkdown(null)
    setTempMarkdown("")
    setUpdatingTodo(null)
    setOverlayMessage("")
  }, [editingMarkdown, tempMarkdown])

  const cancelMarkdownEditing = () => {
    setEditingMarkdown(null)
    setTempMarkdown("")
  }

  const saveTodo = useCallback(async (isNew: boolean) => {
    if (!userId || !editForm.title.trim()) return

    setUpdatingTodo(isNew ? 'new' : editingTodo!)
    setOverlayMessage(isNew ? "TODO作成中..." : "TODO更新中...")

    // 現在のステータスと新しいステータスをチェック
    const currentTodo = isNew ? null : todos.find(t => t.id === editingTodo)
    const isCompletingNow = editForm.status === '完了' && currentTodo?.status !== '完了'
    const isUncompletingNow = editForm.status !== '完了' && currentTodo?.status === '完了'

    const todoData = {
      title: editForm.title.trim(),
      status: editForm.status,
      priority: editForm.priority,
      tags: editForm.tags ? editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      branch_names: editForm.branch_names ? editForm.branch_names.split(',').map(branch => branch.trim()).filter(branch => branch) : [],
      pr_links: editForm.pr_links ? editForm.pr_links.split(',').map(link => link.trim()).filter(link => link) : [],
      markdown_text: editForm.markdown_text.trim() || null,
      done_date: isCompletingNow ? new Date().toISOString() : (isUncompletingNow ? null : currentTodo?.done_date || null),
      user_id: userId,
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
        setNewlyCreatedTodos(prev => {
          const newSet = new Set(prev)
          newSet.add(newTodo.id)
          return newSet
        })
        setTimeout(() => {
          setNewlyCreatedTodos(prev => {
            const newSet = new Set(prev)
            newSet.delete(newTodo.id)
            return newSet
          })
        }, 500)
        setShowNewTodo(false)
        resetEditForm()
      }
    } else {
      const { error } = await supabaseTodo
        .from('todo_items')
        .update(todoData)
        .eq('id', editingTodo!)

      if (!error) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === editingTodo ? { ...todo, ...todoData } as TodoItem : todo
          )
        )
        setEditingTodo(null)
        resetEditForm()
      }
    }

    setUpdatingTodo(null)
    setOverlayMessage("")
  }, [userId, editForm, editingTodo])

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
  }, [editingTodo, showNewTodo, editForm.title, editingMarkdown, saveTodo, saveMarkdown])

  async function updateTodoStatus(todoId: string, status: '未着手' | '着手中' | '完了') {
    if (updatingTodo) return

    setUpdatingTodo(todoId)
    setOverlayMessage("ステータス更新中...")

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', todoId)

    if (!error) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, status } : todo
        )
      )
    }

    setUpdatingTodo(null)
    setOverlayMessage("")
  }

  async function deleteTodo(todoId: string) {
    if (updatingTodo) return

    setDeletingTodos(prev => {
      const newSet = new Set(prev)
      newSet.add(todoId)
      return newSet
    })
    setUpdatingTodo(todoId)
    setOverlayMessage("削除中...")

    setTimeout(async () => {
      const { error } = await supabaseTodo
        .from('todo_items')
        .delete()
        .eq('id', todoId)

      if (!error) {
        setTodos((prev) => prev.filter((todo) => todo.id !== todoId))
      }

      setDeletingTodos(prev => {
        const newSet = new Set(prev)
        newSet.delete(todoId)
        return newSet
      })
      setUpdatingTodo(null)
      setOverlayMessage("")
    }, 300)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '未着手': return '#94a3b8'
      case '着手中': return '#38bdf8'
      case '完了': return '#34d399'
      default: return '#94a3b8'
    }
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return '#f87171'
      case 'medium': return '#fbbf24'
      case 'low': return '#34d399'
      default: return '#cbd5f5'
    }
  }

  const toggleExpanded = (todoId: string) => {
    setExpandedTodos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(todoId)) {
        newSet.delete(todoId)
      } else {
        newSet.add(todoId)
      }
      return newSet
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortedTodos = () => {
    return [...todos].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, null: 0 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        case 'status':
          const statusOrder = { '未着手': 1, '着手中': 2, '完了': 3 }
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
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const pageBackgroundStyle: CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '48px 16px 64px'
  }

  const pageContentStyle: CSSProperties = {
    width: '100%',
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }

  const glassCardStyle: CSSProperties = {
    backgroundColor: GLASS_BACKGROUND,
    border: GLASS_BORDER,
    borderRadius: '24px',
    boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)'
  }

  const controlBaseStyle = {
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '13px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    color: '#e2e8f0',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  }

  const pillButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '999px',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease'
  }

  const iconButtonStyle: CSSProperties = {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    background: 'rgba(15, 23, 42, 0.55)',
    color: '#e2e8f0',
    cursor: 'pointer',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease'
  }

  const statusSummary = useMemo(() => ({
    未着手: todos.filter((todo) => todo.status === '未着手').length,
    着手中: todos.filter((todo) => todo.status === '着手中').length,
    完了: todos.filter((todo) => todo.status === '完了').length
  }), [todos])

  if (loading) return <LoadingOverlay message="読み込み中..." />

  if (!userId) {
    return (
      <div
        style={{
          ...pageBackgroundStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            ...glassCardStyle,
            width: '100%',
            maxWidth: '420px',
            padding: '40px 32px 44px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            color: '#e2e8f0'
          }}
        >
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(226, 232, 240, 0.6)'
            }}
          >
            Welcome back
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '36px',
              fontWeight: 700,
              background: PRIMARY_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Specsy Todo
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(226, 232, 240, 0.72)'
            }}
          >
            プロジェクトのタスクをまとめて管理するにはログインしてください。
          </p>
          <button
            onClick={handleSignIn}
            style={{
              ...pillButtonStyle,
              width: '100%',
              background: PRIMARY_GRADIENT,
              boxShadow: '0 28px 50px -20px rgba(59, 130, 246, 0.55)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 32px 60px -20px rgba(59, 130, 246, 0.6)'
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 28px 50px -20px rgba(59, 130, 246, 0.55)'
              e.currentTarget.style.background = PRIMARY_GRADIENT
            }}
          >
            Googleでログイン
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={pageBackgroundStyle}>
      <div style={pageContentStyle}>
      <div
        style={{
          ...glassCardStyle,
          padding: '28px 32px',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '24px'
          }}
        >
          <div style={{ flex: '1 1 280px' }}>
            <span
              style={{
                fontSize: '12px',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'rgba(226, 232, 240, 0.5)'
              }}
            >
              Dashboard
            </span>
            <h1
              style={{
                margin: '10px 0 14px',
                fontSize: '42px',
                fontWeight: 700,
                background: PRIMARY_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              作業リスト
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'rgba(226, 232, 240, 0.72)'
              }}
            >
              ステータスや優先度をまとめて確認し、必要な作業にすぐアクセスできます。
            </p>
          </div>
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '16px'
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'flex-end'
              }}
            >
              {(['未着手', '着手中', '完了'] as const).map((status) => (
                <div
                  key={status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: 'rgba(226, 232, 240, 0.85)'
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(status)
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{status}</span>
                  <span style={{ fontSize: '13px', opacity: 0.7 }}>{statusSummary[status]}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleSignOut}
              style={{
                ...pillButtonStyle,
                background: SECONDARY_GRADIENT,
                boxShadow: '0 24px 50px -20px rgba(14, 165, 233, 0.45)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 28px 60px -20px rgba(14, 165, 233, 0.55)'
                e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 24px 50px -20px rgba(14, 165, 233, 0.45)'
                e.currentTarget.style.background = SECONDARY_GRADIENT
              }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          ...glassCardStyle,
          padding: '24px',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <style jsx>{`
          @keyframes slideInFromBottom {
            from {
              transform: translateY(12px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes slideInFromTop {
            from {
              transform: translateY(-16px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
        <div style={{
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          gap: 12,
          padding: '16px 20px',
          marginBottom: '12px',
          color: 'rgba(226, 232, 240, 0.7)',
          fontSize: '12px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          background: 'rgba(148, 163, 184, 0.12)',
          borderRadius: '20px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)'
        }}>
          <div
            onClick={() => handleSort('priority')}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            優先度 {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div
            onClick={() => handleSort('title')}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            タイトル {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div
            onClick={() => handleSort('status')}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            状況 {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>タグ</div>
          <div
            onClick={() => handleSort('created_at')}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            作成日 {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div
            onClick={() => handleSort('done_date')}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            完了日 {sortField === 'done_date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div></div>
          <div></div>
        </div>
        {getSortedTodos().map((todo) => {
          const isExpanded = expandedTodos.has(todo.id)
          const isCompleted = todo.status === '完了'
          const isEditing = editingTodo === todo.id
          const isDeleting = deletingTodos.has(todo.id)
          const isNewlyCreated = newlyCreatedTodos.has(todo.id)

          if (isEditing) {
            return (
              <div
                key={todo.id}
                style={{
                  borderRadius: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(139, 92, 246, 0.16) 100%)',
                  boxShadow: '0 28px 50px -24px rgba(59, 130, 246, 0.55)',
                  animation: 'slideInFromTop 0.3s ease',
                  overflow: 'hidden',
                  marginBottom: '16px'
                }}
                data-todo-container
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID_TEMPLATE,
                    gap: 12,
                    padding: '18px 20px',
                    alignItems: 'center'
                  }}
                >
                  <select
                    value={editForm.priority || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: (e.target.value as 'low' | 'medium' | 'high' | '') || null }))}
                    style={{
                      ...controlBaseStyle,
                      padding: '10px 12px',
                      textAlign: 'center',
                      justifySelf: 'center'
                    }}
                  >
                    <option value="">なし</option>
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>

                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      ...controlBaseStyle,
                      fontSize: '15px',
                      fontWeight: 600
                    }}
                    placeholder="タイトル"
                  />

                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as '未着手' | '着手中' | '完了' }))}
                    style={{
                      ...controlBaseStyle,
                      padding: '10px 12px',
                      textAlign: 'center',
                      justifySelf: 'center'
                    }}
                  >
                    <option value="未着手">未着手</option>
                    <option value="着手中">着手中</option>
                    <option value="完了">完了</option>
                  </select>

                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                    style={{
                      ...controlBaseStyle,
                      textAlign: 'center',
                      justifySelf: 'center'
                    }}
                    placeholder="タグ"
                  />

                  <div style={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.65)', textAlign: 'center' }}>
                    {todo.created_at ? new Date(todo.created_at).toLocaleDateString('ja-JP') : '-'}
                  </div>

                  <div style={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.65)', textAlign: 'center' }}>
                    {todo.done_date ? new Date(todo.done_date).toLocaleDateString('ja-JP') : '-'}
                  </div>

                  <button
                    onClick={() => saveTodo(false)}
                    style={{
                      ...iconButtonStyle,
                      width: '100%',
                      background: PRIMARY_GRADIENT,
                      border: 'none',
                      boxShadow: '0 24px 50px -24px rgba(59, 130, 246, 0.6)',
                      opacity: editForm.title.trim() ? 1 : 0.4,
                      cursor: editForm.title.trim() ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!editForm.title.trim()}
                    onMouseEnter={(e) => {
                      if (!editForm.title.trim()) return
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 28px 60px -24px rgba(59, 130, 246, 0.6)'
                      e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 24px 50px -24px rgba(59, 130, 246, 0.6)'
                      e.currentTarget.style.background = PRIMARY_GRADIENT
                    }}
                  >
                    ✓
                  </button>

                  <button
                    onClick={cancelEditing}
                    style={{
                      ...iconButtonStyle,
                      width: '100%',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#fda4af',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 28px 60px -24px rgba(239, 68, 68, 0.45)'
                      e.currentTarget.style.background = DESTRUCTIVE_GRADIENT
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'
                      e.currentTarget.style.color = '#fda4af'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={todo.id}
              style={{
                borderRadius: '20px',
                border: `1px solid ${isExpanded ? 'rgba(59, 130, 246, 0.35)' : 'rgba(148, 163, 184, 0.18)'}`,
                background: isNewlyCreated
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
                  : (isCompleted ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.55)'),
                boxShadow: isExpanded
                  ? '0 28px 60px -24px rgba(59, 130, 246, 0.55)'
                  : '0 24px 50px -28px rgba(15, 23, 42, 0.85)',
                opacity: isDeleting ? 0.35 : 1,
                transform: isExpanded ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease, opacity 0.3s ease',
                marginBottom: '16px',
                animation: isNewlyCreated ? 'slideInFromBottom 0.3s ease-out' : undefined
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID_TEMPLATE,
                  gap: 12,
                  padding: '18px 20px',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => startEditing(todo)}
              >
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

                <div
                  style={{
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    color: isCompleted ? 'rgba(148, 163, 184, 0.7)' : '#f8fafc',
                    fontSize: '15px',
                    fontWeight: 600
                  }}
                >
                  {todo.title}
                </div>

                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    background: 'rgba(148, 163, 184, 0.12)',
                    color: getStatusColor(todo.status),
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  {todo.status}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
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

                <div style={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.65)', textAlign: 'center' }}>
                  {todo.created_at ? new Date(todo.created_at).toLocaleDateString('ja-JP') : '-'}
                </div>

                <div style={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.65)', textAlign: 'center' }}>
                  {todo.done_date ? new Date(todo.done_date).toLocaleDateString('ja-JP') : '-'}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(todo.id)
                  }}
                  style={{
                    ...iconButtonStyle,
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    fontSize: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 18px 40px -24px rgba(59, 130, 246, 0.5)'
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.55)'
                  }}
                >
                  {isExpanded ? '▲' : '▼'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTodo(todo.id)
                  }}
                  style={{
                    ...iconButtonStyle,
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#fda4af',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '18px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 18px 40px -24px rgba(239, 68, 68, 0.45)'
                    e.currentTarget.style.background = DESTRUCTIVE_GRADIENT
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'
                    e.currentTarget.style.color = '#fda4af'
                  }}
                >
                  🗑
                </button>
              </div>

              <div
                style={{
                  maxHeight: isExpanded ? '320px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease'
                }}
              >
                <div
                  style={{
                    padding: '0 20px 20px'
                  }}
                >
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid rgba(148, 163, 184, 0.2)'
                    }}
                  >
                    {editingMarkdown === todo.id ? (
                      <div data-markdown-container>
                        <textarea
                          value={tempMarkdown}
                          onChange={(e) => setTempMarkdown(e.target.value)}
                          style={{
                            ...controlBaseStyle,
                            width: '100%',
                            height: '140px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            resize: 'vertical',
                            marginBottom: '12px'
                          }}
                          placeholder="マークダウンで記述してください..."
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => startEditingMarkdown(todo.id, todo.markdown_text || "")}
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
            </div>
          )
        })}

        {showNewTodo ? (
          <div
            style={{
              borderRadius: '20px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(59, 130, 246, 0.12)',
              animation: 'slideInFromTop 0.3s ease'
            }}
            data-todo-container
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_TEMPLATE,
                gap: 12,
                padding: '18px 20px',
                alignItems: 'center'
              }}
            >
              <select
                value={editForm.priority || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: (e.target.value as 'low' | 'medium' | 'high' | '') || null }))}
                style={{
                  ...controlBaseStyle,
                  padding: '10px 12px'
                }}
              >
                <option value="">なし</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>

              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  ...controlBaseStyle,
                  fontSize: '15px',
                  fontWeight: 600
                }}
                placeholder="タイトル"
                autoFocus
              />

              <select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as '未着手' | '着手中' | '完了' }))}
                style={{
                  ...controlBaseStyle,
                  padding: '10px 12px'
                }}
              >
                <option value="未着手">未着手</option>
                <option value="着手中">着手中</option>
                <option value="完了">完了</option>
              </select>

              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                style={{
                  ...controlBaseStyle
                }}
                placeholder="タグ"
              />

              <div></div>

              <div></div>

              <button
                onClick={() => saveTodo(true)}
                style={{
                  ...iconButtonStyle,
                  width: '100%',
                  background: PRIMARY_GRADIENT,
                  border: 'none',
                  boxShadow: '0 24px 50px -24px rgba(59, 130, 246, 0.6)',
                  opacity: editForm.title.trim() ? 1 : 0.4,
                  cursor: editForm.title.trim() ? 'pointer' : 'not-allowed'
                }}
                disabled={!editForm.title.trim()}
                onMouseEnter={(e) => {
                  if (!editForm.title.trim()) return
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 28px 60px -24px rgba(59, 130, 246, 0.6)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 24px 50px -24px rgba(59, 130, 246, 0.6)'
                  e.currentTarget.style.background = PRIMARY_GRADIENT
                }}
              >
                ✓
              </button>

              <button
                onClick={cancelEditing}
                style={{
                  ...iconButtonStyle,
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#fda4af',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 28px 60px -24px rgba(239, 68, 68, 0.45)'
                  e.currentTarget.style.background = DESTRUCTIVE_GRADIENT
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'
                  e.currentTarget.style.color = '#fda4af'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: '8px',
              padding: '16px 20px',
              borderRadius: '18px',
              background: 'rgba(148, 163, 184, 0.08)',
              border: '1px dashed rgba(148, 163, 184, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'rgba(226, 232, 240, 0.7)',
              transition: 'background 0.3s ease, border-color 0.3s ease'
            }}
            onClick={startCreating}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.16)'
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.45)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>＋</span>
            新しいTODOを追加
          </div>
        )}
      </div>
    </div>
    {overlayMessage && <LoadingOverlay message={overlayMessage} />}
  </div>
  )
}
