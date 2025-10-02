"use client"

import { useEffect, useMemo, useState, useCallback, type CSSProperties } from 'react'
import Link from 'next/link'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoItem } from '@/lib/todoTypes'
import LoadingOverlay from '@/components/LoadingOverlay'
import ReactMarkdown from 'react-markdown'

import {
  PRIMARY_GRADIENT,
  SECONDARY_GRADIENT,
  DESTRUCTIVE_GRADIENT,
  GLASS_BACKGROUND,
  GLASS_BORDER,
  getStatusColor,
  getPriorityColor
} from '@/styles/commonStyles'
import Button from '@/components/ui/Button'

type SimpleStatus = '未着手' | '完了'

// レイアウト定数
const GRID_TEMPLATE_DESKTOP = [
  'clamp(56px, 5.2vw, 70px)',
  'minmax(220px, 5.2fr)',
  'clamp(78px, 8vw, 110px)',
  'minmax(160px, 2.4fr)',
  'clamp(32px, 4vw, 40px)',
  'clamp(32px, 4vw, 40px)'
].join(' ')

const GRID_TEMPLATE_MOBILE = [
  'clamp(48px, 15vw, 56px)',
  'minmax(160px, 5fr)',
  'clamp(60px, 20vw, 80px)',
  'minmax(120px, 3fr)',
  'clamp(32px, 12vw, 44px)',
  'clamp(32px, 12vw, 44px)'
].join(' ')

export default function TodoListDetailPage({ params }: { params: { id: string } }) {
  const listId = params.id

  // 画面全体の状態を管理
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

  // 編集フォームの入力値を保持
  const [editForm, setEditForm] = useState<{
    title: string
    status: SimpleStatus
    priority: 'low' | 'medium' | 'high' | null
    tags: string
    markdown_text: string
  }>({
    title: "",
    status: '未着手',
    priority: null,
    tags: "",
    markdown_text: ""
  })

  // OAuthコールバック後の遷移先を保持
  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    // 現在のページの完全なURLを使用
    const baseUrl = window.location.origin
    return `${baseUrl}/todo`
  }, [])

  // 初回マウント時にユーザーとTODOを取得
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

  // 指定ユーザーの指定リストのTODOを取得
  async function loadTodos(uid: string, lId: string) {
    const { data, error } = await supabaseTodo
      .from('todo_items')
      .select('*')
      .eq('user_id', uid)
      .eq('list_id', lId)
      .order('created_at', { ascending: false })
    if (!error && data) {
      const normalized = (data as TodoItem[]).map((todo) => ({
        ...todo,　
      }))
      setTodos(normalized)
    }
  }

  // Googleでログイン
  async function handleSignIn() {
    await supabaseTodo.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    })
  }

  // ログアウト処理
  async function handleSignOut() {
    await supabaseTodo.auth.signOut()
    setUserId(null)
    setTodos([])
  }

  // フォーム状態を初期化
  const resetEditForm = () => {
    setEditForm({
      title: "",
      status: '未着手',
      priority: null,
      tags: "",
      markdown_text: ""
    })
  }

  // TODO編集モードに切り替え
  const startEditing = (todo: TodoItem) => {
    setEditingTodo(todo.id)
    setEditForm({
      title: todo.title,
      status: todo.status === '完了' ? '完了' : '未着手',
      priority: todo.priority,
      tags: todo.tags.join(', '),
      markdown_text: todo.markdown_text || ""
    })
  }

  // 新規TODO作成モードに切り替え
  const startCreating = () => {
    setShowNewTodo(true)
    resetEditForm()
  }

  // 編集・新規作成をキャンセル
  const cancelEditing = () => {
    setEditingTodo(null)
    setShowNewTodo(false)
    resetEditForm()
  }

  // マークダウンの編集開始
  const startEditingMarkdown = (todoId: string, currentMarkdown: string) => {
    setEditingMarkdown(todoId)
    setTempMarkdown(currentMarkdown || "")
  }

  // マークダウン本文を保存（list_id もスコープ）
  const saveMarkdown = useCallback(async () => {
    if (!editingMarkdown || !userId) return

    setUpdatingTodo(editingMarkdown)
    setOverlayMessage("マークダウン更新中...")

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
  }, [editingMarkdown, tempMarkdown, userId, listId])

  // マークダウン編集中止
  const cancelMarkdownEditing = () => {
    setEditingMarkdown(null)
    setTempMarkdown("")
  }

  // TODOの新規作成または更新を保存（list_id スコープ）
  const saveTodo = useCallback(async (isNew: boolean) => {
    if (!userId || !editForm.title.trim()) return

    setUpdatingTodo(isNew ? 'new' : editingTodo!)
    setOverlayMessage(isNew ? "TODO作成中..." : "TODO更新中...")

    // 現在のステータスと新しいステータスをチェック
    const currentTodo = isNew ? null : todos.find(t => t.id === editingTodo)
    const isCompletingNow = editForm.status === '完了' && currentTodo?.status !== '完了'
    const isReopening = editForm.status === '未着手' && currentTodo?.status === '完了'

    const todoData = {
      title: editForm.title.trim(),
      status: editForm.status,
      priority: editForm.priority,
      tags: editForm.tags ? editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
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
        const normalizedTodo: TodoItem = {
          ...newTodo,
          status: newTodo.status === '完了' ? '完了' : '未着手'
        }
        setTodos((prev) => [normalizedTodo, ...prev])
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
        .eq('user_id', userId)
        .eq('list_id', listId)

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
  }, [userId, editForm, editingTodo, listId, todos])

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

  async function toggleTodoCompletion(todo: TodoItem) {
    if (updatingTodo || !userId) return

    const nextStatus: SimpleStatus = todo.status === '完了' ? '未着手' : '完了'
    const nextDoneDate = nextStatus === '完了' ? new Date().toISOString() : null

    setUpdatingTodo(todo.id)
    setOverlayMessage(nextStatus === '完了' ? "完了に更新中..." : "未着手に戻しています...")

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
          item.id === todo.id
            ? { ...item, status: nextStatus, done_date: nextDoneDate }
            : item
        )
      )
    }

    setUpdatingTodo(null)
    setOverlayMessage("")
  }

  // TODOを物理削除（list_id スコープ）
  async function deleteTodo(todoId: string) {
    if (updatingTodo || !userId) return

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
        .eq('user_id', userId)
        .eq('list_id', listId)

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

  // ステータスごとの表示色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '未着手': return '#94a3b8'
      case '完了': return '#34d399'
      default: return '#94a3b8'
    }
  }

  // 優先度ごとの表示色
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return '#f87171'
      case 'medium': return '#fbbf24'
      case 'low': return '#34d399'
      default: return '#cbd5f5'
    }
  }

  // 詳細表示の開閉を切り替え
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

  // ソート項目と方向の切り替え
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // 表示リストをソート＆完了フィルタ
  const getSortedTodos = () => {
    const sorted = [...todos].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, null: 0 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        case 'status':
          const statusOrder = { '未着手': 1, '完了': 2 }
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

    if (showCompleted) return sorted
    return sorted.filter(todo => todo.status !== '完了')
  }

  // 背景となるグラデーション設定
  const pageBackgroundStyle: CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '48px 16px 64px',
    overflowX: 'scroll'
  }

  // ページ中央のコンテナ設定
  const pageContentStyle: CSSProperties = {
    minWidth: '1000px',
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }

  const listRowPadding = isMobile ? '8px 12px' : '10px 16px'
  const listHeaderMarginBottom = isMobile ? '8px' : '4px'
  const listHeaderBorderRadius = isMobile ? '16px' : '20px'
  const gridTemplateColumns = isMobile ? GRID_TEMPLATE_MOBILE : GRID_TEMPLATE_DESKTOP

  // ガラス風コンポーネントの共通スタイル
  const glassCardStyle: CSSProperties = {
    backgroundColor: GLASS_BACKGROUND,
    border: GLASS_BORDER,
    borderRadius: '24px',
    boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)'
  }

  // インプット類のベーススタイル
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

  // ピル型ボタンの共通スタイル
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

  // TODO状況ボタンのベーススタイル
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

  const statusSummary = useMemo(() => ({
    未着手: todos.filter((todo) => todo.status !== '完了').length,
    完了: todos.filter((todo) => todo.status === '完了').length
  }), [todos])

  // 読み込み中はオーバーレイのみ表示
  if (loading) return <LoadingOverlay message="読み込み中..." />

  // 未ログイン時はログイン促進カードを表示
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

  // ログイン済みユーザー向けのメインレイアウト
  return (
    <div style={pageBackgroundStyle}>
      <div style={pageContentStyle}>
        {/* ヘッダー＋戻り導線 */}
        <div
          style={{
            ...glassCardStyle,
            padding: '16px 24px',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Link href="/todo" style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '14px' }}>
            ← リスト一覧へ
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '13px',
              border: 'none',
              color: '#fff',
              background: SECONDARY_GRADIENT,
              boxShadow: '0 24px 50px -20px rgba(14, 165, 233, 0.45)',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>

        {/* TODO一覧カード（既存UI踏襲） */}
        <div
          style={{
            ...glassCardStyle,
            padding: isMobile ? '16px' : '24px',
            color: '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 完了タスクの表示切り替え */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['未着手', '完了'] as const).map((status) => (
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
              onClick={() => setShowCompleted(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '12px',
                border: 'none',
                color: '#e2e8f0',
                cursor: 'pointer',
                background: showCompleted ? 'rgba(59, 130, 246, 0.25)' : 'rgba(148, 163, 184, 0.22)',
                boxShadow: 'none'
              }}
            >
              {showCompleted ? '完了タスクを非表示' : '完了タスクを表示'}
            </button>
          </div>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns,
            gap: 0,
            padding: listRowPadding,
            marginBottom: listHeaderMarginBottom,
            color: 'rgba(226, 232, 240, 0.7)',
            fontSize: '12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background: 'rgba(148, 163, 184, 0.12)',
            borderRadius: listHeaderBorderRadius,
            border: '1px solid rgba(148, 163, 184, 0.15)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            width: '100%'
          }}>
            <div
              onClick={() => handleSort('status')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              状況 {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div
              onClick={() => handleSort('title')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              タイトル {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div
              onClick={() => handleSort('priority')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              優先度 {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>タグ</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ textTransform: 'none', letterSpacing: 'normal' }}>詳細</span>
            </div>
            <div></div>
          </div>

          {getSortedTodos().map((todo) => {
            const isExpanded = expandedTodos.has(todo.id)
            const isCompleted = todo.status === '完了'
            const isEditing = editingTodo === todo.id
            const isDeleting = deletingTodos.has(todo.id)
            const isNewlyCreated = newlyCreatedTodos.has(todo.id)
            const createdAtLabel = todo.created_at ? new Date(todo.created_at).toLocaleDateString('ja-JP') : '-'
            const doneDateLabel = todo.done_date ? new Date(todo.done_date).toLocaleDateString('ja-JP') : '-'
            const createdDateColor = todo.created_at ? 'rgba(248, 250, 252, 0.9)' : 'rgba(226, 232, 240, 0.45)'
            const doneDateColor = todo.done_date ? 'rgba(248, 250, 252, 0.9)' : 'rgba(226, 232, 240, 0.45)'

            if (isEditing) {
              // 編集中のTODO行用レイアウト
              return (
                <div
                  key={todo.id}
                  style={{
                    animation: 'slideInFromTop 0.3s ease',
                    overflow: 'hidden',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
                    width: '100%'
                  }}
                  data-todo-container
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns,
                      gap: 0,
                      padding: listRowPadding,
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, status: prev.status === '完了' ? '未着手' : '完了' }))}
                      style={{
                        ...todoStatusButtonBaseStyle,
                        margin: '0 auto',
                        background: editForm.status === '完了'
                          ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)'
                          : 'transparent',
                        borderColor: editForm.status === '完了' ? 'rgba(52, 211, 153, 0.6)' : 'rgba(148, 163, 184, 0.35)'
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

                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      style={{
                        ...controlBaseStyle,
                        fontSize: '14px',
                        fontWeight: 600,
                        width: '100%'
                      }}
                      placeholder="タイトル"
                    />

                    <select
                      value={editForm.priority || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: (e.target.value as 'low' | 'medium' | 'high' | '') || null }))}
                      style={{
                        ...controlBaseStyle,
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

                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                      style={{
                        ...controlBaseStyle,
                        textAlign: 'center',
                        width: '100%'
                      }}
                      placeholder="タグ"
                    />

                    <div />

                    <button
                      onClick={cancelEditing}
                      style={{
                        ...iconButtonStyle,
                        width: '24px',
                        height: '24px',
                        background: 'rgba(239, 68, 68, 0.18)',
                        color: '#fda4af',
                        border: 'none',
                        fontSize: '14px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            }

            /**
             * 通常表示のTODO行
             * */
            return (
              <div
                key={todo.id}
                style={{
                  borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
                  opacity: isDeleting ? 0.35 : 1,
                  background: isNewlyCreated ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  transition: 'background 0.3s ease, opacity 0.3s ease',
                  animation: isNewlyCreated ? 'slideInFromBottom 0.3s ease-out' : undefined,
                  width: '100%'
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns,
                    gap: 0,
                    padding: listRowPadding,
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => startEditing(todo)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTodoCompletion(todo)
                    }}
                    aria-pressed={isCompleted}
                    disabled={updatingTodo === todo.id}
                    style={{
                      ...todoStatusButtonBaseStyle,
                      margin: '0 auto',
                      cursor: updatingTodo === todo.id ? 'not-allowed' : 'pointer',
                      opacity: updatingTodo === todo.id ? 0.6 : 1,
                      background: isCompleted ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)' : 'transparent',
                      borderColor: isCompleted ? 'rgba(52, 211, 153, 0.6)' : 'rgba(148, 163, 184, 0.35)'
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

                  <div
                    style={{
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      color: isCompleted ? 'rgba(148, 163, 184, 0.7)' : '#f8fafc',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {todo.title}
                  </div>

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

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpanded(todo.id)
                    }}
                    style={{
                      ...iconButtonStyle,
                      width: '24px',
                      height: '24px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: 'none',
                      fontSize: '14px'
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
                      width: '24px',
                      height: '24px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#fda4af',
                      border: 'none',
                      fontSize: '16px'
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
                      padding: '0 16px 16px'
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
                              marginBottom: '10px'
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

          {/* 新規TODO用フォーム or 追加ボタン */}
          {showNewTodo ? (
            <div
              style={{
                borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
                animation: 'slideInFromTop 0.3s ease',
                width: '100%'
              }}
              data-todo-container
            >
              {/* 新規作成フォーム行 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns,
                  gap: 0,
                  padding: listRowPadding,
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, status: prev.status === '完了' ? '未着手' : '完了' }))}
                      style={{
                        ...todoStatusButtonBaseStyle,
                        margin: '0 auto',
                        background: editForm.status === '完了'
                          ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)'
                          : 'transparent',
                        borderColor: editForm.status === '完了' ? 'rgba(52, 211, 153, 0.6)' : 'rgba(148, 163, 184, 0.35)'
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

                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      style={{ ...controlBaseStyle, fontSize: '14px', fontWeight: 600, width: '100%' }}
                      placeholder="タイトル"
                      autoFocus
                    />

                    <select
                      value={editForm.priority || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: (e.target.value as 'low' | 'medium' | 'high' | '') || null }))}
                      style={{ ...controlBaseStyle, padding: '10px 12px', width: '100%' }}
                    >
                      <option value="">なし</option>
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>

                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                  style={{ ...controlBaseStyle, width: '100%' }}
                  placeholder="タグ"
                />

                <div />

                <button
                  onClick={cancelEditing}
                  style={{
                    ...iconButtonStyle,
                    width: '24px',
                    height: '24px',
                    background: 'rgba(239, 68, 68, 0.18)',
                    color: '#fda4af',
                    border: 'none',
                    fontSize: '14px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: isMobile ? '12px' : '4px',
                padding: listRowPadding,
                borderBottom: '1px dashed rgba(148, 163, 184, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(226, 232, 240, 0.7)',
                transition: 'color 0.3s ease',
                width: '100%'
              }}
              onClick={startCreating}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = '#fff' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = 'rgba(226, 232, 240, 0.7)' }}
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
