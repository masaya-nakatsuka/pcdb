"use client"

import { useEffect, useMemo, useState, useCallback, type CSSProperties } from 'react'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import LoadingOverlay from '@/components/LoadingOverlay'
import Link from 'next/link'

// スタイル共通定数
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
const SECONDARY_GRADIENT = 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'
const GLASS_BACKGROUND = 'rgba(15, 23, 42, 0.65)'
const GLASS_BORDER = '1px solid rgba(148, 163, 184, 0.2)'

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
  const [userId, setUserId] = useState<string | null>(null)
  const [lists, setLists] = useState<TodoList[]>([])
  const [summaries, setSummaries] = useState<Record<string, StatusCounts>>({})
  const [loading, setLoading] = useState(true)
  const [overlayMessage, setOverlayMessage] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [newListName, setNewListName] = useState("")

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return window.location.href
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabaseTodo.auth.getUser()
      if (!mounted) return
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        await loadLists(uid)
      }
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

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

  async function handleSignIn() {
    await supabaseTodo.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    })
  }

  async function handleSignOut() {
    await supabaseTodo.auth.signOut()
    setUserId(null)
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

  // 背景・カード・ボタンのスタイル
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

  const statusColor = (status: '未着手' | '着手中' | '完了') => {
    switch (status) {
      case '未着手': return '#94a3b8'
      case '着手中': return '#38bdf8'
      case '完了': return '#34d399'
      default: return '#94a3b8'
    }
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
                        backgroundColor: statusColor(status)
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{status}</span>
                    <span style={{ fontSize: '13px', opacity: 0.7 }}>{totalSummary[status]}</span>
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
                <button
                  onClick={createList}
                  style={{
                    ...pillButtonStyle,
                    background: PRIMARY_GRADIENT,
                    boxShadow: '0 24px 50px -20px rgba(59, 130, 246, 0.45)'
                  }}
                >
                  作成
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewListName('') }}
                  style={{
                    ...pillButtonStyle,
                    background: 'rgba(148,163,184,0.22)',
                    boxShadow: 'none'
                  }}
                >
                  キャンセル
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  ...pillButtonStyle,
                  background: PRIMARY_GRADIENT,
                  boxShadow: '0 24px 50px -20px rgba(59, 130, 246, 0.45)'
                }}
              >
                ＋ 新しいリスト
              </button>
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
              return (
                <Link
                  key={list.id}
                  href={`/todo/${list.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      ...glassCardStyle,
                      padding: '18px',
                      borderRadius: '16px',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid rgba(148, 163, 184, 0.18)'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 28px 60px -24px rgba(59, 130, 246, 0.35)'
                      ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(59, 130, 246, 0.12)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 45px 80px -40px rgba(15, 23, 42, 0.8)'
                      ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(15, 23, 42, 0.55)'
                    }}
                  >
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                      {list.name}
                    </div>
                    <div style={{ color: 'rgba(226,232,240,0.7)', fontSize: '12px', marginBottom: '12px' }}>
                      合計 {s.total} 件
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(['未着手', '着手中', '完了'] as const).map(st => (
                        <span
                          key={st}
                          style={{
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: 'rgba(148, 163, 184, 0.18)',
                            color: statusColor(st)
                          }}
                        >
                          {st} {s[st]}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
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
