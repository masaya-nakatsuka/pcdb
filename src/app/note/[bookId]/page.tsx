"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabaseNotes } from '@/lib/supabaseNotesClient'
import type { NoteBook, NotePage } from '@/lib/noteTypes'
import LoadingOverlay from '@/components/LoadingOverlay'

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>()
  const bookId = params?.bookId as string
  const [userId, setUserId] = useState<string | null>(null)
  const [book, setBook] = useState<NoteBook | null>(null)
  const [pages, setPages] = useState<NotePage[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [newTitle, setNewTitle] = useState<string>("")
  const [creatingPage, setCreatingPage] = useState<boolean>(false)
  const [deletingPage, setDeletingPage] = useState<string | null>(null)
  const [overlayMessage, setOverlayMessage] = useState<string>("")
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    // localhostの場合は開発環境、それ以外は本番環境として判定
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const baseUrl = isLocalhost 
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    return `${baseUrl}/note/${bookId}`
  }, [bookId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabaseNotes.auth.getUser()
      const uid = data.user?.id ?? null
      if (!mounted) return
      setUserId(uid)
      if (uid) {
        await Promise.all([loadBook(), loadPages()])
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [bookId])

  async function loadBook() {
    const { data, error } = await supabaseNotes
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()
    if (!error) setBook(data as NoteBook)
  }

  async function loadPages() {
    const { data, error } = await supabaseNotes
      .from('pages')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
    if (!error && data) setPages(data as NotePage[])
  }

  async function handleSignIn() {
    await supabaseNotes.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    })
  }

  async function handleSignOut() {
    await supabaseNotes.auth.signOut()
    setUserId(null)
    setBook(null)
    setPages([])
  }

  async function handleCreatePage(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !newTitle.trim() || creatingPage) return
    setCreatingPage(true)
    setOverlayMessage("ページ作成中...")
    const { data, error } = await supabaseNotes
      .from('pages')
      .insert({ title: newTitle.trim(), user_id: userId, book_id: bookId })
      .select('*')
      .single()
    if (!error && data) {
      setPages((prev) => [data as NotePage, ...prev])
      setNewTitle("")
    }
    setCreatingPage(false)
    setOverlayMessage("")
  }

  async function handleDeletePage(id: string) {
    if (deletingPage) return
    setDeletingPage(id)
    setOverlayMessage("ページ削除中...")
    const { error } = await supabaseNotes.from('pages').delete().eq('id', id)
    if (!error) setPages((prev) => prev.filter((p) => p.id !== id))
    setDeletingPage(null)
    setOverlayMessage("")
  }

  if (loading) return <LoadingOverlay message="読み込み中..." />

  if (!userId) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Book</h1>
        <p>ログインが必要です。</p>
        <button onClick={handleSignIn}>Googleでログイン</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{book?.title ?? 'Book'}</h1>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'blue', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              padding: 0,
              font: 'inherit'
            }}
            onClick={() => {
              setNavigatingTo('home')
              window.location.href = '/note'
            }}
          >
            ← ノート一覧へ戻る
          </button>
        </div>
        <button onClick={handleSignOut}>ログアウト</button>
      </div>

      <form onSubmit={handleCreatePage} style={{ margin: '16px 0' }}>
        <input
          type="text"
          placeholder="ページのタイトル"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={creatingPage}
          style={{ padding: 8, width: 280 }}
        />
        <button type="submit" disabled={creatingPage} style={{ marginLeft: 8 }}>
          作成
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {pages.map((page) => (
          <li key={page.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <button 
              style={{ 
                marginRight: 12, 
                background: 'none', 
                border: 'none', 
                color: 'blue', 
                textDecoration: 'underline', 
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
              onClick={() => {
                setNavigatingTo(page.id)
              window.location.href = `/note/${bookId}/${page.id}`
              }}
            >
              {page.title}
            </button>
            <button 
              onClick={() => handleDeletePage(page.id)}
              disabled={deletingPage === page.id}
            >
              削除
            </button>
          </li>
        ))}
        {pages.length === 0 && <li>ページがありません。作成してください。</li>}
      </ul>
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}


