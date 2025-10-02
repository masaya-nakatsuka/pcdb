"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'

import LoadingOverlay from '@/components/LoadingOverlay'
import LoginScreen from '@/components/LoginScreen'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import {
  PRIMARY_GRADIENT,
  SECONDARY_GRADIENT,
  glassCardStyle,
  pillButtonStyle,
  controlBaseStyle,
  pageBackgroundStyle,
  getStatusColor
} from '@/styles/commonStyles'

import { listSchema, statusCountsSchema, type TodoListDTO, type StatusCounts } from '../../../types'

const listContainerStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '24px'
}

const emptyStateStyle: CSSProperties = {
  ...glassCardStyle,
  padding: '48px 32px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  alignItems: 'center'
}

const createFormStyle: CSSProperties = {
  ...glassCardStyle,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
}

const statRowStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
}

const badgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '999px',
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  color: '#e2e8f0',
  fontSize: '12px'
}

export default function Shell() {
  const { userId, loading, signIn, signOut } = useAuth(supabaseTodo, { redirectPath: '/todo' })
  const [lists, setLists] = useState<TodoListDTO[]>([])
  const [summaries, setSummaries] = useState<Record<string, StatusCounts>>({})
  const [overlayMessage, setOverlayMessage] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const router = useRouter()
  const savingRef = useRef(false)

  useEffect(() => {
    if (userId) {
      loadLists(userId)
    }
  }, [userId])

  const loadLists = useCallback(async (uid: string) => {
    const { data: listsData, error } = await supabaseTodo
      .from('todo_lists')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) return

    const parsedLists = listSchema.array().parse(listsData ?? [])
    setLists(parsedLists)

    if (parsedLists.length === 0) {
      setSummaries({})
      return
    }

    const { data: items, error: itemsErr } = await supabaseTodo
      .from('todo_items')
      .select('list_id, status')
      .eq('user_id', uid)
      .in('list_id', parsedLists.map((list) => list.id))

    if (itemsErr) return

    const base: Record<string, StatusCounts> = {}
    for (const list of parsedLists) {
      base[list.id] = statusCountsSchema.parse({ total: 0, 未着手: 0, 着手中: 0, 完了: 0 })
    }

    for (const row of (items ?? []) as { list_id: string; status: '未着手' | '着手中' | '完了' }[]) {
      const bucket = base[row.list_id]
      if (!bucket) continue
      bucket.total += 1
      bucket[row.status] += 1
    }

    setSummaries(base)
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOut()
    setLists([])
    setSummaries({})
  }, [signOut])

  const createList = useCallback(async () => {
    if (!userId) return
    const name = newListName.trim()
    if (!name) return
    setOverlayMessage('リストを作成中...')
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

    setOverlayMessage('')

    if (error || !data) return

    const created = listSchema.parse(data)
    setLists((prev) => [created, ...prev])
    setSummaries((prev) => ({
      ...prev,
      [created.id]: statusCountsSchema.parse({ total: 0, 未着手: 0, 着手中: 0, 完了: 0 })
    }))
    setNewListName('')
    setShowCreate(false)
  }, [newListName, userId])

  const updateListName = useCallback(async () => {
    if (!userId || !editingListId) return
    const name = editingName.trim()
    if (!name) return
    savingRef.current = true
    const { error } = await supabaseTodo
      .from('todo_lists')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', editingListId)
      .eq('user_id', userId)
    savingRef.current = false
    if (!error) {
      setLists((prev) => prev.map((list) => (list.id === editingListId ? { ...list, name } : list)))
      setEditingListId(null)
      setEditingName('')
    }
  }, [editingListId, editingName, userId])

  const deleteList = useCallback(async (listId: string) => {
    if (!userId) return
    setOverlayMessage('リストを削除中...')
    const { error } = await supabaseTodo
      .from('todo_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', userId)
    setOverlayMessage('')
    if (!error) {
      setLists((prev) => prev.filter((list) => list.id !== listId))
      setSummaries((prev) => {
        const next = { ...prev }
        delete next[listId]
        return next
      })
    }
  }, [userId])

  const goToDetail = useCallback((id: string) => {
    router.push(`/todo/${id}`)
  }, [router])

  const hasLists = lists.length > 0

  if (loading) {
    return <LoadingOverlay message="読み込み中..." />
  }

  if (!userId) {
    return (
      <div style={pageBackgroundStyle}>
        <LoginScreen
          title="Specsy Todo"
          subtitle="TODO リストを管理するにはログインしてください。"
          onSignIn={signIn}
        />
      </div>
    )
  }

  return (
    <div style={pageBackgroundStyle}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#f8fafc', margin: 0 }}>Todo リスト</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button onClick={handleSignOut} variant="secondary">
              ログアウト
            </Button>
            <Button onClick={() => setShowCreate(true)}>新規リスト</Button>
          </div>
        </div>

        {showCreate && (
          <div style={createFormStyle}>
            <h2 style={{ margin: 0 }}>新しいリストを作成</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              style={{ ...controlBaseStyle, fontSize: '14px' }}
              placeholder="リスト名"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createList()
                }
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={createList}
                style={{ ...pillButtonStyle, background: PRIMARY_GRADIENT }}
              >
                作成する
              </button>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setNewListName('')
                }}
                style={{ ...pillButtonStyle, background: 'rgba(148, 163, 184, 0.24)' }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {hasLists ? (
          <div style={listContainerStyle}>
            {lists.map((list) => {
              const summary = summaries[list.id]
              return (
                <Card key={list.id} className="cursor-pointer" onClick={() => goToDetail(list.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    {editingListId === list.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (!savingRef.current) updateListName()
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateListName()
                        }}
                        style={{ ...controlBaseStyle, fontSize: '15px', width: '100%' }}
                        autoFocus
                      />
                    ) : (
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>{list.name}</h3>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (editingListId === list.id) {
                            updateListName()
                          } else {
                            setEditingListId(list.id)
                            setEditingName(list.name)
                          }
                        }}
                      >
                        {editingListId === list.id ? '保存' : '編集'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteList(list.id)
                        }}
                      >
                        削除
                      </Button>
                    </div>
                  </div>

                  <div style={statRowStyle}>
                    <span style={badgeStyle}>合計 {summary?.total ?? 0}</span>
                    <span style={badgeStyle}>未着手 {summary?.未着手 ?? 0}</span>
                    <span style={badgeStyle}>着手中 {summary?.着手中 ?? 0}</span>
                    <span style={badgeStyle}>完了 {summary?.完了 ?? 0}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '14px', color: 'rgba(226, 232, 240, 0.75)' }}>まだリストがありません</div>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#f8fafc' }}>最初のリストを作成しましょう</h2>
            <button
              onClick={() => setShowCreate(true)}
              style={{ ...pillButtonStyle, background: SECONDARY_GRADIENT }}
            >
              新しいリストを作成
            </button>
          </div>
        )}
      </div>
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}
