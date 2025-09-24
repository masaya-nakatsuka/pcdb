"use client"

import { useEffect, useRef, type CSSProperties } from 'react'
import type { NoteBook, NotePage } from '@/lib/noteTypes'

export interface BookWithPages extends NoteBook {
  pages: NotePage[]
}

interface NoteSidebarProps {
  books: BookWithPages[]
  expandedBooks: Set<string>
  creatingBook: boolean
  deletingBook: string | null
  deletingPage: string | null
  editingBookId: string | null
  editingBookTitle: string
  editingPageId: string | null
  editingPageTitle: string
  activeBookId: string | null
  activePageId: string | null
  onToggle: (bookId: string) => void
  onCreateBook: () => void
  onDeleteBook: (bookId: string) => void
  onCreatePage: (bookId: string) => void
  onDeletePage: (bookId: string, pageId: string) => void
  onStartEditBook: (bookId: string, title: string) => void
  onBookTitleChange: (value: string) => void
  onCommitBookTitle: (bookId: string, value: string) => void
  onStartEditPage: (bookId: string, page: NotePage) => void
  onPageTitleChange: (value: string) => void
  onCommitPageTitle: (bookId: string, pageId: string, value: string) => void
  onSelectPage: (bookId: string, pageId: string) => void
  onSignOut: () => void
}

export default function NoteSidebar(props: NoteSidebarProps) {
  const {
    books,
    expandedBooks,
    creatingBook,
    deletingBook,
    deletingPage,
    editingBookId,
    editingBookTitle,
    editingPageId,
    editingPageTitle,
    activeBookId,
    activePageId,
    onToggle,
    onCreateBook,
    onDeleteBook,
    onCreatePage,
    onDeletePage,
    onStartEditBook,
    onBookTitleChange,
    onCommitBookTitle,
    onStartEditPage,
    onPageTitleChange,
    onCommitPageTitle,
    onSelectPage,
    onSignOut
  } = props

  const bookInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const pageInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (editingBookId) {
      const input = bookInputRefs.current[editingBookId]
      if (input) {
        input.focus()
        input.select()
      }
    }
  }, [editingBookId])

  useEffect(() => {
    if (editingPageId) {
      const input = pageInputRefs.current[editingPageId]
      if (input) {
        input.focus()
        input.select()
      }
    }
  }, [editingPageId])

  return (
    <aside style={{ ...glassCardStyle, ...sidebarStyle }}>
      <div style={sidebarHeaderStyle}>
        <div>
          <span style={sidebarKickerStyle}>Library</span>
          <h2 style={sidebarTitleStyle}>ノート</h2>
        </div>
        <button onClick={onSignOut} style={signOutButtonStyle}>ログアウト</button>
      </div>

      <button onClick={onCreateBook} style={createNoteButtonStyle} disabled={creatingBook}>
        ＋ ノートを追加
      </button>

      <div style={noteListWrapperStyle}>
        {books.map((book) => {
          const isExpanded = expandedBooks.has(book.id)
          const isEditingBook = editingBookId === book.id
          const isActiveBook = activeBookId === book.id
          const shouldHighlightBook = isActiveBook || isEditingBook
          const cardStyle = shouldHighlightBook
            ? { ...noteCardStyle, ...activeNoteCardStyle }
            : noteCardStyle
          const noteButtonStyle = isActiveBook
            ? { ...noteTitleButtonStyle, ...activeNoteTitleButtonStyle }
            : noteTitleButtonStyle
          return (
            <div key={book.id} style={cardStyle}>
              <div style={noteCardHeaderStyle}>
                <button
                  onClick={() => onToggle(book.id)}
                  style={toggleButtonStyle}
                  aria-label={isExpanded ? '閉じる' : '開く'}
                >
                  {isExpanded ? '-' : '>'}
                </button>
                <div style={noteTitleContainerStyle}>
                  {isEditingBook ? (
                    <input
                      ref={(el) => { bookInputRefs.current[book.id] = el }}
                      value={editingBookTitle}
                      onChange={(e) => onBookTitleChange(e.target.value)}
                      onBlur={() => onCommitBookTitle(book.id, editingBookTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          onCommitBookTitle(book.id, editingBookTitle)
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault()
                          onCommitBookTitle(book.id, editingBookTitle)
                        }
                      }}
                      style={noteTitleInputStyle}
                      placeholder="ノート名を入力"
                    />
                  ) : (
                    <button
                      onClick={() => onStartEditBook(book.id, book.title ?? '')}
                      style={noteButtonStyle}
                    >
                      {book.title || '無題のノート'}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onDeleteBook(book.id)}
                  style={deleteNoteButtonStyle}
                  disabled={deletingBook === book.id}
                >
                  🗑
                </button>
              </div>

              {isExpanded && (
                <div style={pageListStyle}>
                  <button
                    onClick={() => onCreatePage(book.id)}
                    style={addPageButtonStyle}
                  >
                    ＋ ページを追加
                  </button>
                  {book.pages.length === 0 && (
                    <div style={emptyPageStyle}>ページがありません。</div>
                  )}
                  {book.pages.map((page) => {
                    const isEditingPage = editingPageId === page.id
                    const isActivePage = activePageId === page.id
                    const rowStyle = isActivePage
                      ? { ...pageRowBaseStyle, ...activePageRowStyle }
                      : pageRowBaseStyle
                    const indicatorStyle = isActivePage
                      ? { ...pageIndicatorStyle, ...activePageIndicatorStyle }
                      : pageIndicatorStyle
                    const pageButtonStyle = isActivePage
                      ? { ...pageLinkStyle, ...activePageLinkStyle }
                      : pageLinkStyle
                    return (
                      <div key={page.id} style={rowStyle}>
                        <button
                          onClick={() => onSelectPage(book.id, page.id)}
                          style={indicatorStyle}
                          aria-label={isActivePage ? 'ページを閉じる' : 'ページを開く'}
                        >
                          {isActivePage ? '-' : '>'}
                        </button>
                        {isEditingPage ? (
                          <input
                            ref={(el) => { pageInputRefs.current[page.id] = el }}
                            value={editingPageTitle}
                            onChange={(e) => onPageTitleChange(e.target.value)}
                            onBlur={() => onCommitPageTitle(book.id, page.id, editingPageTitle)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                onCommitPageTitle(book.id, page.id, editingPageTitle)
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault()
                                onCommitPageTitle(book.id, page.id, editingPageTitle)
                              }
                            }}
                            style={pageTitleInputStyle}
                            placeholder="ページ名を入力"
                          />
                        ) : (
                          <button
                            onClick={() => onStartEditPage(book.id, page)}
                            style={pageButtonStyle}
                          >
                            {page.title || '無題のページ'}
                          </button>
                        )}
                        <button
                          onClick={() => onDeletePage(book.id, page.id)}
                          style={deletePageButtonStyle}
                          disabled={deletingPage === page.id}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {books.length === 0 && (
          <div style={emptyNoteStyle}>ノートがありません。追加してください。</div>
        )}
      </div>
    </aside>
  )
}

const glassCardStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '24px',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)'
}

const sidebarStyle: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  height: 'calc(100vh - 72px)',
  overflow: 'hidden'
}

const sidebarHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const sidebarKickerStyle: React.CSSProperties = {
  fontSize: '12px',
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.55)'
}

const sidebarTitleStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: '24px',
  color: '#e2e8f0'
}

const signOutButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  padding: '8px 16px',
  fontSize: '12px',
  background: 'rgba(148, 163, 184, 0.25)',
  color: '#f8fafc',
  cursor: 'pointer'
}

const createNoteButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  padding: '12px 20px',
  background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
}

const noteListWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  overflowY: 'auto',
  paddingRight: '4px'
}

const noteCardStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: '18px',
  background: 'rgba(15, 23, 42, 0.55)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}

const activeNoteCardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.75)',
  border: '1px solid rgba(96, 165, 250, 0.45)'
}

const noteCardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}

const toggleButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'rgba(148, 163, 184, 0.18)',
  color: '#f1f5f9',
  width: '26px',
  height: '26px',
  borderRadius: '8px',
  cursor: 'pointer'
}

const deleteNoteButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '10px',
  padding: '6px 8px',
  background: 'rgba(239, 68, 68, 0.15)',
  color: '#fda4af',
  cursor: 'pointer'
}

const pageListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
}

const pageRowBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
}

const activePageRowStyle: React.CSSProperties = {
  background: 'rgba(37, 99, 235, 0.18)',
  borderRadius: '12px',
  padding: '6px 8px'
}

const pageIndicatorStyle: React.CSSProperties = {
  border: 'none',
  background: 'rgba(148, 163, 184, 0.18)',
  color: '#f1f5f9',
  width: '24px',
  height: '24px',
  borderRadius: '8px',
  cursor: 'pointer'
}

const activePageIndicatorStyle: React.CSSProperties = {
  background: 'rgba(96, 165, 250, 0.45)',
  color: '#e0f2fe'
}

const pageLinkStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  color: 'rgba(226, 232, 240, 0.5)',
  textAlign: 'left',
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: '12px'
}

const activePageLinkStyle: React.CSSProperties = {
  color: '#e2e8f0',
  background: 'rgba(96, 165, 250, 0.25)'
}

const deletePageButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '10px',
  padding: '4px 6px',
  background: 'transparent',
  color: 'rgba(226, 232, 240, 0.5)',
  cursor: 'pointer'
}

const noteTitleContainerStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  minWidth: 0
}

const noteTitleButtonStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  color: '#f8fafc',
  fontWeight: 600,
  fontSize: '14px',
  textAlign: 'left',
  cursor: 'pointer',
  padding: '4px 0'
}

const activeNoteTitleButtonStyle: React.CSSProperties = {
  color: '#bfdbfe'
}

const noteTitleInputStyle: React.CSSProperties = {
  flex: 1,
  border: '1px solid rgba(148, 163, 184, 0.4)',
  borderRadius: '10px',
  padding: '6px 10px',
  background: 'rgba(15, 23, 42, 0.65)',
  color: '#f8fafc',
  fontSize: '14px'
}

const addPageButtonStyle: React.CSSProperties = {
  border: '1px dashed rgba(148, 163, 184, 0.45)',
  borderRadius: '12px',
  padding: '8px 12px',
  background: 'rgba(148, 163, 184, 0.12)',
  color: '#e2e8f0',
  cursor: 'pointer',
  marginBottom: '6px'
}

const emptyNoteStyle: React.CSSProperties = {
  color: 'rgba(226, 232, 240, 0.55)',
  fontSize: '13px'
}

const emptyPageStyle: React.CSSProperties = {
  color: 'rgba(226, 232, 240, 0.5)',
  fontSize: '12px'
}

const pageTitleInputStyle: React.CSSProperties = {
  flex: 1,
  border: '1px solid rgba(148, 163, 184, 0.35)',
  borderRadius: '10px',
  padding: '6px 10px',
  background: 'rgba(15, 23, 42, 0.6)',
  color: '#e2e8f0',
  fontSize: '13px'
}
