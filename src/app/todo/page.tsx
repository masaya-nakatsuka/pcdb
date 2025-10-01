"use client"

import { useEffect, useState, useMemo, useRef, type CSSProperties } from 'react'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import LoadingOverlay from '@/components/LoadingOverlay'
import LoginScreen from '@/components/LoginScreen'
import { useAuth } from '@/hooks/useAuth'
import {
  PRIMARY_GRADIENT,
  SECONDARY_GRADIENT,
  glassCardStyle,
  pillButtonStyle,
  controlBaseStyle,
  pageBackgroundStyle,
  getStatusColor
} from '@/styles/commonStyles'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { useRouter } from 'next/navigation'

type TodoList = {
  id: string
  user_id: string
  name: string
  sort_order: number | null
  created_at: string | null
}

type StatusCounts = {
  total: number
  未着手: number
  着手中: number
  完了: number
}

export default function TodoListsPage() {
  const { userId, loading, signIn, signOut } = useAuth(supabaseTodo, { redirectPath: '/todo' })
  const [lists, setLists] = useState<TodoList[]>([])
  const [summaries, setSummaries] = useState<Record<string, StatusCounts>>({})
  const [overlayMessage, setOverlayMessage] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const router = useRouter()
  const savingRef = useRef(false)

  useEffect(() => {
    if (userId) {
      loadLists(userId)
    }
  }, [userId])

  async function loadLists(uid: string) {
    const { data: listsData, error } = await supabaseTodo
      .from('todo_lists')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (!error && listsData) {
      const listArr = listsData as TodoList[]
      setLists(listArr)

      if (listArr.length > 0) {
        const { data: items, error: itemsErr } = await supabaseTodo
          .from('todo_items')
          .select('id, list_id, status')
          .eq('user_id', uid)
          .in('list_id', listArr.map(l => l.id))

        if (!itemsErr && items) {
          const counts: Record<string, StatusCounts> = {}
          // 初期化
          for (const l of listArr) {
            counts[l.id] = { total: 0, 未着手: 0, 着手中: 0, 完了: 0 }
          }
          // 集計
          for (const it of items as { id: string; list_id: string; status: '未着手' | '着手中' | '完了' }[]) {
            const c = counts[it.list_id]
            if (!c) continue
            c.total += 1
            c[it.status] += 1
          }
          setSummaries(counts)
        }
      } else {
        setSummaries({})
      }
    }
  }

  async function handleSignOut() {
    await signOut()
    setLists([])
    setSummaries({})
  }

  async function createList() {
    if (!userId) return
    const name = newListName.trim()
    if (!name) return
    setOverlayMessage("リストを作成中...")
    const { data, error } = await supabaseTodo
      .from('todo_lists')
      .insert({
        user_id: userId,
        name,
        sort_order: null,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()
    setOverlayMessage("")
    if (!error && data) {
      const created = data as TodoList
      setLists(prev => [created, ...prev])
      setSummaries(prev => ({ ...prev, [created.id]: { total: 0, 未着手: 0, 着手中: 0, 完了: 0 } }))
      setShowCreate(false)
      setNewListName("")
    }
  }

  function startEditing(list: TodoList) {
    if (savingRef.current) return
    setEditingListId(list.id)
    setEditingName(list.name)
  }

  function cancelEditing() {
    setEditingListId(null)
    setEditingName("")
  }

  async function saveListName(listId: string) {
    if (!userId || editingListId !== listId) return
    const trimmed = editingName.trim()
    const current = lists.find((l) => l.id === listId)
    if (!trimmed) {
      if (current) setEditingName(current.name)
      cancelEditing()
      return
    }
    if (current && current.name === trimmed) {
      cancelEditing()
      return
    }

    if (savingRef.current) return
    savingRef.current = true
    setOverlayMessage("リスト名を更新中...")
    try {
      const { data, error } = await supabaseTodo
        .from('todo_lists')
        .update({ name: trimmed })
        .eq('id', listId)
        .eq('user_id', userId)
        .select('*')
        .single()

      if (!error && data) {
        const updated = data as TodoList
        setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, name: updated.name } : l)))
        cancelEditing()
      }
    } finally {
      setOverlayMessage("")
      savingRef.current = false
    }
  }

  // ページレイアウトスタイル
  const pageContentStyle: CSSProperties = {
    width: '100%',
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }

  const totalSummary = useMemo(() => {
    return Object.values(summaries).reduce(
      (acc, cur) => {
        acc.total += cur.total
        acc['未着手'] += cur['未着手']
        acc['着手中'] += cur['着手中']
        acc['完了'] += cur['完了']
        return acc
      },
      { total: 0, 未着手: 0, 着手中: 0, 完了: 0 } as StatusCounts
    )
  }, [summaries])

  if (loading) return <LoadingOverlay message="読み込み中..." />

  if (!userId) {
    return (
      <LoginScreen
        title="Specsy Todo"
        subtitle="プロジェクトのタスクをまとめて管理するにはログインしてください。"
        onSignIn={signIn}
      />
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
                TODOリスト
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(226, 232, 240, 0.72)'
                }}
              >
                リスト毎にタスクを整理できます。カードをクリックして詳細へ進んでください。
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
                  <StatusBadge
                    key={status}
                    status={status}
                    count={totalSummary[status]}
                    size="md"
                  />
                ))}
              </div>
              <Button variant="secondary" onClick={handleSignOut}>
                ログアウト
              </Button>
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
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            {showCreate ? (
              <>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="新しいリスト名"
                  style={{ ...controlBaseStyle, minWidth: '240px' }}
                  autoFocus
                />
                <Button variant="primary" onClick={createList}>
                  作成
                </Button>
                <Button variant="ghost" onClick={() => { setShowCreate(false); setNewListName('') }}>
                  キャンセル
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => setShowCreate(true)}>
                ＋ 新しいリスト
              </Button>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {lists.map((list) => {
              const s = summaries[list.id] ?? { total: 0, 未着手: 0, 着手中: 0, 完了: 0 }
              const isEditing = editingListId === list.id
              return (
                <Card
                  key={list.id}
                  padding="sm"
                  hover
                  onClick={isEditing ? undefined : () => router.push(`/todo/${list.id}`)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(148, 163, 184, 0.18)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '8px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isEditing) startEditing(list)
                    }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            e.stopPropagation()
                            saveListName(list.id)
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault()
                            e.stopPropagation()
                            cancelEditing()
                          }
                        }}
                        onBlur={() => saveListName(list.id)}
                        style={{
                          ...controlBaseStyle,
                          flex: '1 1 auto',
                          minWidth: 0,
                          padding: '10px 14px'
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        style={{
                          color: '#e2e8f0',
                          fontWeight: 700,
                          fontSize: '16px',
                          flex: '1 1 auto',
                          minWidth: 0,
                          cursor: 'text'
                        }}
                      >
                        {list.name}
                      </div>
                    )}
                  </div>
                  <div style={{ color: 'rgba(226,232,240,0.7)', fontSize: '12px', marginBottom: '12px' }}>
                    合計 {s.total} 件
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(['未着手', '着手中', '完了'] as const).map(st => (
                      <StatusBadge
                        key={st}
                        status={st}
                        count={s[st]}
                        size="sm"
                      />
                    ))}
                  </div>
                </Card>
              )
            })}
            {lists.length === 0 && (
              <div style={{ color: 'rgba(226,232,240,0.7)' }}>
                リストがありません。「＋ 新しいリスト」から作成してください。
              </div>
            )}
          </div>
        </div>
      </div>
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}
