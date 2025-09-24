"use client"

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabaseNotes } from '@/lib/supabaseNotesClient'
import type { NoteBook, NotePage } from '@/lib/noteTypes'
import LoadingOverlay from '@/components/LoadingOverlay'
import NoteSidebar, { type BookWithPages } from './components/NoteSidebar'

export default function NoteHomePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [books, setBooks] = useState<BookWithPages[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [overlayMessage, setOverlayMessage] = useState<string>('')
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())
  const [deletingBook, setDeletingBook] = useState<string | null>(null)
  const [deletingPage, setDeletingPage] = useState<string | null>(null)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [editingBookTitle, setEditingBookTitle] = useState<string>('')
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingPageTitle, setEditingPageTitle] = useState<string>('')
  const [pendingNewBookId, setPendingNewBookId] = useState<string | null>(null)
  const [pendingPageIds, setPendingPageIds] = useState<Set<string>>(new Set())
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const [activePageId, setActivePageId] = useState<string | null>(null)

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const baseUrl = isLocalhost
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    return `${baseUrl}/note`
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabaseNotes.auth.getUser()
      if (!mounted) return
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        await loadWorkspace(uid)
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function loadWorkspace(uid: string) {
    setOverlayMessage('読み込み中...')
    const [{ data: booksData, error: booksError }, { data: pagesData, error: pagesError }] = await Promise.all([
      supabaseNotes
        .from('books')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false }),
      supabaseNotes
        .from('pages')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
    ])

    if (booksError || pagesError) {
      setOverlayMessage('データの読み込みに失敗しました。')
      return
    }

    const pagesByBook = new Map<string, NotePage[]>()
    ;(pagesData ?? []).forEach((page) => {
      pagesByBook.set(page.book_id, [...(pagesByBook.get(page.book_id) ?? []), page])
    })

    const nextBooks = (booksData ?? []).map((book) => ({
      ...(book as NoteBook),
      pages: pagesByBook.get(book.id) ?? []
    }))

    setBooks(nextBooks)
    setPendingNewBookId(null)
    setPendingPageIds(new Set())
    setActiveBookId(null)
    setActivePageId(null)
    if (nextBooks.length > 0) {
      setExpandedBooks(new Set([nextBooks[0].id]))
    }
    setOverlayMessage('')
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
    setBooks([])
    setExpandedBooks(new Set())
    setPendingNewBookId(null)
    setPendingPageIds(new Set())
    setActiveBookId(null)
    setActivePageId(null)
  }

  async function handleCreateBook() {
    if (!userId || pendingNewBookId) return
    const tempId = `temp-book-${Date.now()}`
    const now = new Date().toISOString()
    const placeholder: BookWithPages = {
      id: tempId,
      title: '',
      user_id: userId,
      created_at: now,
      updated_at: now,
      pages: []
    }

    setBooks((prev) => [placeholder, ...prev])
    setExpandedBooks((prev) => {
      const next = new Set(prev)
      next.add(tempId)
      return next
    })
    setPendingNewBookId(tempId)
    setEditingBookId(tempId)
    setEditingBookTitle('')
  }

  async function handleDeleteBook(bookId: string) {
    if (pendingNewBookId === bookId) {
      setBooks((prev) => prev.filter((book) => book.id !== bookId))
      setExpandedBooks((prev) => {
        const next = new Set(prev)
        next.delete(bookId)
        return next
      })
      setPendingNewBookId(null)
      if (editingBookId === bookId) {
        setEditingBookId(null)
        setEditingBookTitle('')
      }
      if (activeBookId === bookId) {
        setActiveBookId(null)
        setActivePageId(null)
      }
      return
    }

    if (deletingBook) return
    if (!window.confirm('このノートを削除しますか？')) return

    setDeletingBook(bookId)
    setOverlayMessage('ノート削除中...')
    const { error } = await supabaseNotes.from('books').delete().eq('id', bookId)
    if (!error) {
      setBooks((prev) => prev.filter((book) => book.id !== bookId))
      setExpandedBooks((prev) => {
        const next = new Set(prev)
        next.delete(bookId)
        return next
      })
      if (activeBookId === bookId) {
        setActiveBookId(null)
        setActivePageId(null)
      }
    }
    setDeletingBook(null)
    setOverlayMessage('')
  }

  const handleStartEditBook = (bookId: string, title: string) => {
    setEditingPageId(null)
    setEditingBookId(bookId)
    setEditingBookTitle(title)
  }

  const handleBookTitleChange = (value: string) => {
    setEditingBookTitle(value)
  }

  async function handleCommitBookTitle(bookId: string, value: string) {
    const trimmed = value.trim()
    const isTemporary = pendingNewBookId === bookId

    const target = books.find((book) => book.id === bookId)
    if (!target) {
      setEditingBookId(null)
      if (isTemporary) setPendingNewBookId(null)
      return
    }

    if (!trimmed) {
      if (isTemporary) {
        setBooks((prev) => prev.filter((book) => book.id !== bookId))
        setExpandedBooks((prev) => {
          const next = new Set(prev)
          next.delete(bookId)
          return next
        })
        setPendingNewBookId(null)
      } else {
        setEditingBookTitle(target.title ?? '')
      }
      setEditingBookId(null)
      return
    }

    if (!isTemporary && target.title === trimmed) {
      setEditingBookId(null)
      return
    }

    if (isTemporary) {
      if (!userId) return
      setOverlayMessage('ノート作成中...')
      const { data, error } = await supabaseNotes
        .from('books')
        .insert({ title: trimmed, user_id: userId })
        .select('*')
        .single()

      if (error || !data) {
        setOverlayMessage('')
        window.alert?.('ノートの作成に失敗しました。')
        return
      }

      const created = data as NoteBook
      setBooks((prev) => prev.map((book) =>
        book.id === bookId ? { ...created, pages: [] } : book
      ))
      setExpandedBooks((prev) => {
        const next = new Set(prev)
        next.delete(bookId)
        next.add(created.id)
        return next
      })
      setPendingNewBookId(null)
      setEditingBookId(null)
      setEditingBookTitle(created.title ?? trimmed)
      setOverlayMessage('')
      return
    }

    setOverlayMessage('ノート名を更新中...')
    const { data, error } = await supabaseNotes
      .from('books')
      .update({ title: trimmed })
      .eq('id', bookId)
      .select('*')
      .single()

    if (error || !data) {
      setOverlayMessage('')
      window.alert?.('ノート名の更新に失敗しました。')
      return
    }

    setBooks((prev) => prev.map((book) => book.id === bookId ? { ...book, title: trimmed } : book))
    setOverlayMessage('')
    setEditingBookTitle(trimmed)
    setEditingBookId(null)
  }

  async function handleCreatePage(bookId: string) {
    if (!userId) return
    if (pendingNewBookId === bookId) {
      window.alert?.('ノート名を先に入力してください。')
      setEditingBookId(bookId)
      setEditingBookTitle(books.find((book) => book.id === bookId)?.title ?? '')
      return
    }
    const tempId = `temp-page-${Date.now()}`
    const now = new Date().toISOString()
    const placeholder: NotePage = {
      id: tempId,
      user_id: userId,
      book_id: bookId,
      title: '',
      content: null,
      created_at: now,
      updated_at: now
    }

    setBooks((prev) => prev.map((book) =>
      book.id === bookId ? { ...book, pages: [placeholder, ...book.pages] } : book
    ))
    setExpandedBooks((prev) => {
      const next = new Set(prev)
      next.add(bookId)
      return next
    })
    setPendingPageIds((prev) => {
      const next = new Set(prev)
      next.add(tempId)
      return next
    })
    setEditingPageId(tempId)
    setEditingPageTitle('')
  }

  async function handleDeletePage(bookId: string, pageId: string) {
    if (pendingPageIds.has(pageId)) {
      setBooks((prev) => prev.map((book) =>
        book.id === bookId
          ? { ...book, pages: book.pages.filter((page) => page.id !== pageId) }
          : book
      ))
      setPendingPageIds((prev) => {
        const next = new Set(prev)
        next.delete(pageId)
        return next
      })
      if (editingPageId === pageId) {
        setEditingPageId(null)
        setEditingPageTitle('')
      }
      if (activePageId === pageId) {
        setActivePageId(null)
        setActiveBookId((prev) => prev === bookId ? null : prev)
      }
      return
    }

    if (deletingPage) return
    if (!window.confirm('このページを削除しますか？')) return

    setDeletingPage(pageId)
    setOverlayMessage('ページ削除中...')
    const { error } = await supabaseNotes.from('pages').delete().eq('id', pageId)
    if (!error) {
      setBooks((prev) => prev.map((book) =>
        book.id === bookId ? { ...book, pages: book.pages.filter((page) => page.id !== pageId) } : book
      ))
      if (activePageId === pageId) {
        setActivePageId(null)
        setActiveBookId((prev) => prev === bookId ? null : prev)
      }
    }
    setDeletingPage(null)
    setOverlayMessage('')
  }

  const handleStartEditPage = (bookId: string, page: NotePage) => {
    setEditingPageId(page.id)
    setEditingPageTitle(page.title ?? '')
    setEditingBookId(null)
    setActiveBookId(bookId)
    setActivePageId(page.id)
    setExpandedBooks((prev) => {
      const next = new Set(prev)
      next.add(bookId)
      return next
    })
  }

  const handlePageTitleChange = (value: string) => {
    setEditingPageTitle(value)
  }

  async function handleCommitPageTitle(bookId: string, pageId: string, value: string) {
    const trimmed = value.trim()
    const isTemporary = pendingPageIds.has(pageId)

    const parent = books.find((book) => book.id === bookId)
    const target = parent?.pages.find((page) => page.id === pageId)
    if (!parent || !target) {
      setEditingPageId(null)
      if (isTemporary) {
        setPendingPageIds((prev) => {
          const next = new Set(prev)
          next.delete(pageId)
          return next
        })
      }
      return
    }

    if (!trimmed) {
      if (isTemporary) {
        setBooks((prev) => prev.map((book) =>
          book.id === bookId
            ? { ...book, pages: book.pages.filter((page) => page.id !== pageId) }
            : book
        ))
        setPendingPageIds((prev) => {
          const next = new Set(prev)
          next.delete(pageId)
          return next
        })
      } else {
        setEditingPageTitle(target.title ?? '')
      }
      setEditingPageId(null)
      return
    }

    if (!isTemporary && target.title === trimmed) {
      setEditingPageId(null)
      return
    }

    if (isTemporary) {
      if (!userId) return
      setOverlayMessage('ページ作成中...')
      const { data, error } = await supabaseNotes
        .from('pages')
        .insert({ title: trimmed, user_id: userId, book_id: bookId })
        .select('*')
        .single()

      if (error || !data) {
        setOverlayMessage('')
        window.alert?.('ページの作成に失敗しました。')
        return
      }

      const created = data as NotePage
      setBooks((prev) => prev.map((book) =>
        book.id === bookId
          ? { ...book, pages: book.pages.map((page) => page.id === pageId ? created : page) }
          : book
      ))
      setPendingPageIds((prev) => {
        const next = new Set(prev)
        next.delete(pageId)
        return next
      })
      setOverlayMessage('')
      setEditingPageTitle(created.title ?? trimmed)
      setEditingPageId(null)
      setActiveBookId(bookId)
      setActivePageId(created.id)
      return
    }

    setOverlayMessage('ページ名を更新中...')
    const { data, error } = await supabaseNotes
      .from('pages')
      .update({ title: trimmed })
      .eq('id', pageId)
      .select('*')
      .single()

    if (error || !data) {
      setOverlayMessage('')
      window.alert?.('ページ名の更新に失敗しました。')
      return
    }

    setBooks((prev) => prev.map((book) =>
      book.id === bookId
        ? { ...book, pages: book.pages.map((page) => page.id === pageId ? { ...page, title: trimmed } : page) }
        : book
    ))

    setOverlayMessage('')
    setEditingPageTitle(trimmed)
    setEditingPageId(null)
    setActiveBookId(bookId)
    setActivePageId(pageId)
  }

  const handleToggleBook = (bookId: string) => {
    setExpandedBooks((prev) => {
      const next = new Set(prev)
      if (next.has(bookId)) next.delete(bookId)
      else next.add(bookId)
      return next
    })
  }

  const handleSelectPage = (bookId: string, pageId: string) => {
    const isSamePage = activePageId === pageId
    if (isSamePage) {
      setActivePageId(null)
      setActiveBookId((prev) => (prev === bookId ? null : prev))
    } else {
      setActivePageId(pageId)
      setActiveBookId(bookId)
      setExpandedBooks((prev) => {
        const next = new Set(prev)
        next.add(bookId)
        return next
      })
    }
    setEditingBookId(null)
    setEditingPageId(null)
  }

  if (loading) return <LoadingOverlay message="読み込み中..." />

  if (!userId) {
    return (
      <div style={loginWrapperStyle}>
        <div style={loginCardStyle}>
          <span style={loginKickerStyle}>Welcome</span>
          <h1 style={loginTitleStyle}>Specsy Note</h1>
          <p style={loginSubtitleStyle}>ノートとページを管理するにはログインしてください。</p>
          <button onClick={handleSignIn} style={loginButtonStyle}>Googleでログイン</button>
        </div>
      </div>
    )
  }

  return (
    <div style={pageBackgroundStyle}>
      <div style={workspaceStyle}>
        <NoteSidebar
          books={books}
          expandedBooks={expandedBooks}
          creatingBook={pendingNewBookId !== null}
          deletingBook={deletingBook}
          deletingPage={deletingPage}
          editingBookId={editingBookId}
          editingBookTitle={editingBookTitle}
          editingPageId={editingPageId}
          editingPageTitle={editingPageTitle}
          activeBookId={activeBookId}
          activePageId={activePageId}
          onToggle={handleToggleBook}
          onCreateBook={handleCreateBook}
          onDeleteBook={handleDeleteBook}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
          onStartEditBook={handleStartEditBook}
          onBookTitleChange={handleBookTitleChange}
          onCommitBookTitle={handleCommitBookTitle}
          onStartEditPage={handleStartEditPage}
          onPageTitleChange={handlePageTitleChange}
          onCommitPageTitle={handleCommitPageTitle}
          onSelectPage={handleSelectPage}
          onSignOut={handleSignOut}
        />

        <main style={{ ...glassCardStyle, ...mainCardStyle }}>
          <div style={mainPlaceholderStyle}>
            <h2>ノートを選択してください</h2>
            <p>左のサイドバーでノートやページを選択すると内容を編集できます。</p>
          </div>
        </main>
      </div>
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}

const pageBackgroundStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '36px 28px'
}

const workspaceStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '320px 1fr',
  gap: '28px',
  maxWidth: '1400px',
  margin: '0 auto'
}

const glassCardStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '24px',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)'
}

const mainCardStyle: CSSProperties = {
  padding: '32px 36px',
  minHeight: 'calc(100vh - 72px)',
  color: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const mainPlaceholderStyle: CSSProperties = {
  textAlign: 'center',
  color: 'rgba(226, 232, 240, 0.75)'
}

const loginWrapperStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
}

const loginCardStyle: CSSProperties = {
  ...glassCardStyle,
  width: '100%',
  maxWidth: '420px',
  padding: '40px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  color: '#e2e8f0'
}

const loginKickerStyle: CSSProperties = {
  fontSize: '12px',
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.6)'
}

const loginTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '36px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}

const loginSubtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'rgba(226, 232, 240, 0.72)'
}

const loginButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  padding: '12px 20px',
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
}
