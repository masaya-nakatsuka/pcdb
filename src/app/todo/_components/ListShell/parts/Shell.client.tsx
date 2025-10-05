"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import LoadingOverlay from '@/components/LoadingOverlay'
import LoginScreen from '@/components/LoginScreen'
import { useAuth } from '@/hooks/useAuth'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import { listSchema, statusCountsSchema, type StatusCounts, type TodoListDTO } from '../../../types'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-5 py-3 text-sm font-semibold text-white shadow-button-primary transition duration-200 hover:-translate-y-0.5 hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-secondary-gradient px-5 py-3 text-sm font-semibold text-white shadow-button-secondary transition duration-200 hover:-translate-y-0.5 hover:shadow-button-secondary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200'
const ghostButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-night-highlight px-4 py-2 text-sm font-semibold text-frost-soft transition hover:bg-sky-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200/40'
const destructiveButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-destructive-gradient px-4 py-2 text-sm font-semibold text-white shadow-button-destructive transition duration-200 hover:-translate-y-0.5 hover:shadow-button-destructive-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200'

const inputClass =
  'w-full rounded-xl border border-night-border-strong bg-night-glass-strong px-3 py-2 text-sm text-frost-soft placeholder:text-frost-subtle focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'

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
      void loadLists(userId)
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
      .insert({ user_id: userId, name, sort_order: null, created_at: new Date().toISOString() })
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

  const goToDetail = useCallback(
    (id: string) => {
      router.push(`/todo/${id}`)
    },
    [router]
  )

  const hasLists = useMemo(() => lists.length > 0, [lists])

  if (loading) {
    return <LoadingOverlay message="読み込み中..." />
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-gradient px-4 py-12">
        <LoginScreen
          title="Specsy Todo"
          subtitle="TODO リストを管理するにはログインしてください。"
          onSignIn={signIn}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-gradient px-4 pb-16 pt-12 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 text-frost-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Todo リスト</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={ghostButtonClass} onClick={() => void handleSignOut()}>
              ログアウト
            </button>
            <button type="button" className={primaryButtonClass} onClick={() => setShowCreate(true)}>
              新規リスト
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="flex flex-col gap-4 rounded-3xl border border-night-border bg-night-glass p-6 text-frost-soft shadow-glass-xl backdrop-blur-[22px]">
            <h2 className="text-lg font-semibold">新しいリストを作成</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className={inputClass}
              placeholder="リスト名"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  void createList()
                }
              }}
            />
            <div className="flex flex-wrap gap-3">
              <button type="button" className={primaryButtonClass} onClick={() => void createList()}>
                作成する
              </button>
              <button
                type="button"
                className={ghostButtonClass}
                onClick={() => {
                  setShowCreate(false)
                  setNewListName('')
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {hasLists ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {lists.map((list) => {
              const summary = summaries[list.id]
              const isEditing = editingListId === list.id

              return (
                <div
                  key={list.id}
                  role="button"
                  tabIndex={0}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-night-border bg-night-glass p-6 text-frost-soft shadow-glass-xl transition duration-200 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  onClick={() => goToDetail(list.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                      event.preventDefault()
                      goToDetail(list.id)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    {isEditing ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (!savingRef.current) void updateListName()
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                            e.preventDefault()
                            void updateListName()
                          }
                        }}
                        className={`${inputClass} text-base font-semibold`}
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-white">{list.name}</h3>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={ghostButtonClass}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isEditing) {
                            void updateListName()
                          } else {
                            setEditingListId(list.id)
                            setEditingName(list.name)
                          }
                        }}
                      >
                        {isEditing ? '保存' : '編集'}
                      </button>
                      <button
                        type="button"
                        className={destructiveButtonClass}
                        onClick={(e) => {
                          e.stopPropagation()
                          void deleteList(list.id)
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-frost-soft">
                    <span className="rounded-full border border-night-border bg-night-glass px-3 py-1">
                      合計 {summary?.total ?? 0}
                    </span>
                    <span className="rounded-full border border-night-border bg-night-glass px-3 py-1">
                      未着手 {summary?.未着手 ?? 0}
                    </span>
                    <span className="rounded-full border border-night-border bg-night-glass px-3 py-1">
                      着手中 {summary?.着手中 ?? 0}
                    </span>
                    <span className="rounded-full border border-night-border bg-night-glass px-3 py-1">
                      完了 {summary?.完了 ?? 0}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-night-border bg-night-glass p-12 text-center text-frost-soft shadow-glass-xl backdrop-blur-[22px]">
            <p className="text-sm text-frost-muted">まだリストがありません</p>
            <h2 className="text-2xl font-semibold text-white">最初のリストを作成しましょう</h2>
            <button type="button" className={secondaryButtonClass} onClick={() => setShowCreate(true)}>
              新しいリストを作成
            </button>
          </div>
        )}
      </div>
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}
