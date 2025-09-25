"use client"

import { useEffect, useState, type CSSProperties } from 'react'
import { supabaseNotes } from '@/lib/supabaseNotesClient'
import type { NoteBook, NotePage } from '@/lib/noteTypes'
import LoadingOverlay from '@/components/LoadingOverlay'
import LoginScreen from '@/components/LoginScreen'
import { useAuth } from '@/hooks/useAuth'
import NoteSidebar, { type BookWithPages } from './components/NoteSidebar'
import PageContentPanel from './components/PageContentPanel'

export default function NoteHomePage() {
  const { userId, loading, signIn, signOut } = useAuth(supabaseNotes, { redirectPath: '/note' })
  const [books, setBooks] = useState<BookWithPages[]>([])
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
  const [pageContentDraft, setPageContentDraft] = useState<string>('')
  const [savingPageContent, setSavingPageContent] = useState<boolean>(false)
  const [pageContentFeedback, setPageContentFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadWorkspace(userId)
    }
  }, [userId])

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

  async function handleSignOut() {
    await signOut()
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

  useEffect(() => {
    if (!activeBookId || !activePageId) {
      setPageContentDraft('')
      setPageContentFeedback(null)
      return
    }

    const book = books.find((item) => item.id === activeBookId)
    const page = book?.pages.find((item) => item.id === activePageId)
    setPageContentDraft(page?.content ?? '')
    setPageContentFeedback(null)
  }, [activeBookId, activePageId, books])

  const handlePageContentChange = (value: string) => {
    setPageContentDraft(value)
    setPageContentFeedback(null)
  }

  async function handleSavePageContent() {
    if (!activeBookId || !activePageId) return

    const parent = books.find((book) => book.id === activeBookId)
    const page = parent?.pages.find((item) => item.id === activePageId)
    const originalContent = page?.content ?? ''

    if (pageContentDraft === originalContent) return

    setSavingPageContent(true)
    const { data, error } = await supabaseNotes
      .from('pages')
      .update({ content: pageContentDraft })
      .eq('id', activePageId)
      .select('*')
      .single()

    if (error || !data) {
      setSavingPageContent(false)
      setPageContentFeedback('保存に失敗しました。')
      return
    }

    const updated = data as NotePage
    setBooks((prev) => prev.map((book) =>
      book.id === activeBookId
        ? {
          ...book,
          pages: book.pages.map((item) =>
            item.id === activePageId ? { ...item, content: updated.content, updated_at: updated.updated_at } : item
          )
        }
        : book
    ))

    setSavingPageContent(false)
    setPageContentFeedback('保存しました。')
    window.setTimeout(() => setPageContentFeedback(null), 2000)
  }

  if (loading) return <LoadingOverlay message="読み込み中..." />

  if (!userId) {
    return (
      <LoginScreen
        title="Specsy Note"
        subtitle="ノートとページを管理するにはログインしてください。"
        onSignIn={signIn}
      />
    )
  }

  const activeBook = activeBookId ? books.find((book) => book.id === activeBookId) ?? null : null
  const activePage = activePageId ? activeBook?.pages.find((page) => page.id === activePageId) ?? null : null
  const isContentDirty = activePage ? pageContentDraft !== (activePage.content ?? '') : false

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

        <PageContentPanel
          book={activeBook}
          page={activePage ?? null}
          content={pageContentDraft}
          onChange={handlePageContentChange}
          onSave={handleSavePageContent}
          saving={savingPageContent}
          dirty={isContentDirty}
          feedback={pageContentFeedback}
        />
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
