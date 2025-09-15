"use client"

import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoItem } from '@/lib/todoTypes'
import LoadingOverlay from '@/components/LoadingOverlay'
import ReactMarkdown from 'react-markdown'

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

  const [editForm, setEditForm] = useState<{
    title: string
    status: '未着手' | '開発中' | 'PR中' | 'QA待ち' | '完了'
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
    return `${window.location.origin}/todo`
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

  async function updateTodoStatus(todoId: string, status: '未着手' | '開発中' | 'PR中' | 'QA待ち' | '完了') {
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
      case '未着手': return '#999999'
      case '開発中': return '#3498db'
      case 'PR中': return '#f39c12'
      case 'QA待ち': return '#e74c3c'
      case '完了': return '#2ecc71'
      default: return '#999999'
    }
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return '#ff4444'
      case 'medium': return '#ffaa00'
      case 'low': return '#44aa44'
      default: return '#cccccc'
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

  if (loading) return <LoadingOverlay message="読み込み中..." />

  if (!userId) {
    return (
      <div style={{ padding: 16 }}>
        <h1>TODO</h1>
        <p>ログインが必要です。</p>
        <button onClick={handleSignIn}>Googleでログイン</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>作業リスト</h1>
        <button onClick={handleSignOut}>ログアウト</button>
      </div>

      <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
        <style jsx>{`
          @keyframes slideInFromBottom {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes slideInFromTop {
            from {
              transform: translateY(-20px);
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
          gridTemplateColumns: '80px 120px 120px 1fr 100px 100px 40px 40px',
          gap: 8,
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '0.9em',
          fontWeight: 'bold',
          color: '#666'
        }}>
          <div>優先度</div>
          <div>状況</div>
          <div>タグ</div>
          <div>タイトル</div>
          <div>完了日</div>
          <div>作成日</div>
          <div></div>
          <div></div>
        </div>
        {todos.map((todo) => {
          const isExpanded = expandedTodos.has(todo.id)
          const isCompleted = todo.status === '完了'
          const isEditing = editingTodo === todo.id
          const isDeleting = deletingTodos.has(todo.id)
          const isNewlyCreated = newlyCreatedTodos.has(todo.id)

          if (isEditing) {
            return (
              <div key={todo.id} style={{
                borderBottom: '1px solidrgb(232, 232, 232)',
                backgroundColor: '#f1f1f1'
              }} data-todo-container>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 120px 120px 1fr 100px 100px 40px 40px',
                  gap: 8,
                  padding: '12px 16px',
                  alignItems: 'center'
                }}>
                  <select
                    value={editForm.priority || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as any || null }))}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="">なし</option>
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>

                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="未着手">未着手</option>
                    <option value="開発中">開発中</option>
                    <option value="PR中">PR中</option>
                    <option value="QA待ち">QA待ち</option>
                    <option value="完了">完了</option>
                  </select>

                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontSize: '12px'
                    }}
                    placeholder="タグ"
                  />

                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontSize: '14px'
                    }}
                    placeholder="タイトル"
                  />

                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {todo.done_date ? new Date(todo.done_date).toLocaleDateString('ja-JP') : '-'}
                  </div>

                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {todo.created_at ? new Date(todo.created_at).toLocaleDateString('ja-JP') : '-'}
                  </div>

                  <button
                    onClick={() => saveTodo(false)}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    disabled={!editForm.title.trim()}
                  >
                    ✓
                  </button>

                  <button
                    onClick={cancelEditing}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={todo.id} style={{
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: isCompleted ? '#ccc' : 'white',
              opacity: isCompleted ? 0.7 : (isDeleting ? 0.3 : 1),
              transform: isNewlyCreated ? 'translateY(-10px)' : 'translateY(0)',
              transition: isDeleting ? 'all 0.3s ease-in' : (isNewlyCreated ? 'transform 0.5s ease-in, opacity 0.5s ease-in' : 'none'),
              animation: isNewlyCreated ? 'slideInFromBottom 0.5s ease-in' : 'none'
            }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 120px 120px 1fr 100px 100px 40px 40px',
                  gap: 8,
                  padding: '12px 16px',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => startEditing(todo)}
              >
                <div style={{
                  color: getPriorityColor(todo.priority),
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {todo.priority ? (todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低') : '-'}
                </div>

                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: getStatusColor(todo.status),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  {todo.status}
                </div>

                <div style={{
                  fontSize: '12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2px',
                  alignItems: 'flex-start'
                }}>
                  {todo.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#e1f5fe',
                        color: '#0277bd',
                        padding: '2px 4px',
                        borderRadius: 3,
                        fontSize: '10px',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? '#666' : 'black',
                  fontSize: '14px'
                }}>
                  {todo.title}
                </div>

                <div style={{ fontSize: '12px', color: '#666' }}>
                  {todo.done_date ? new Date(todo.done_date).toLocaleDateString('ja-JP') : '-'}
                </div>

                <div style={{ fontSize: '12px', color: '#666' }}>
                  {todo.created_at ? new Date(todo.created_at).toLocaleDateString('ja-JP') : '-'}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(todo.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '8px 12px',
                    margin: '-8px -12px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
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
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    padding: '4px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑
                </button>
              </div>

              <div style={{
                maxHeight: isExpanded ? '200px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  borderTop: isExpanded ? '1px solid #e0e0e0' : 'none'
                }}>
                  {editingMarkdown === todo.id ? (
                    <div data-markdown-container>
                      <textarea
                        value={tempMarkdown}
                        onChange={(e) => setTempMarkdown(e.target.value)}
                        style={{
                          width: '100%',
                          height: '120px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          padding: '8px',
                          fontSize: '12px',
                          resize: 'vertical',
                          marginBottom: '8px'
                        }}
                        placeholder="マークダウンで記述してください..."
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditingMarkdown(todo.id, todo.markdown_text || "")}
                      style={{
                        border: 'none',
                        borderRadius: 4,
                        padding: 12,
                        backgroundColor: 'transparent',
                        cursor: 'text',
                        minHeight: '60px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                      }}
                    >
                      {todo.markdown_text ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          <ReactMarkdown>{todo.markdown_text}</ReactMarkdown>
                        </div>
                      ) : (
                        <div style={{ color: '#999', fontStyle: 'italic' }}>
                          クリックして詳細を追加...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {showNewTodo ? (
          <div style={{
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f0fff0',
            animation: 'slideInFromTop 0.3s ease-in'
          }} data-todo-container>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 120px 120px 1fr 100px 100px 40px 40px',
              gap: 8,
              padding: '12px 16px',
              alignItems: 'center'
            }}>
              <select
                value={editForm.priority || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as any || null }))}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: '6px 8px',
                  fontSize: '12px'
                }}
              >
                <option value="">なし</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>

              <select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: '6px 8px',
                  fontSize: '12px'
                }}
              >
                <option value="未着手">未着手</option>
                <option value="開発中">開発中</option>
                <option value="PR中">PR中</option>
                <option value="QA待ち">QA待ち</option>
                <option value="完了">完了</option>
              </select>

              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: '6px 8px',
                  fontSize: '12px'
                }}
                placeholder="タグ"
              />

              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: '6px 8px',
                  fontSize: '14px'
                }}
                placeholder="タイトル"
                autoFocus
              />

              <div></div>

              <div></div>

              <button
                onClick={() => saveTodo(true)}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                disabled={!editForm.title.trim()}
              >
                ✓
              </button>

              <button
                onClick={cancelEditing}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
            cursor: 'pointer'
          }}
            onClick={startCreating}
          >
            <div style={{
              color: '#666',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: '18px' }}>+</span>
              新しいTODOを追加
            </div>
          </div>
        )}
      </div>

      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}