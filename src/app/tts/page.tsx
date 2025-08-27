'use client'

import { useEffect, useRef, useState } from 'react'
import {
  listBooks,
  createBook,
  renameBook,
  deleteBook,
  createPage,
  renamePage,
  deletePage,
  getPage,
  updatePageContent,
  type TtsBook
} from '@/lib/ttsStorage'

export default function TtsPage() {
  const [books, setBooks] = useState<TtsBook[]>([])
  const [bookId, setBookId] = useState<string>('')
  const [pageId, setPageId] = useState<string>('')
  const [text, setText] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const queueRef = useRef<string[]>([])
  const indexRef = useRef<number>(0)
  const isCancelledRef = useRef<boolean>(false)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const uiSupported = mounted ? isSupported : true

  // 初期化: 既存の保存データを読み込み（自動作成はしない）
  useEffect(() => {
    setBooks(listBooks())
  }, [])

  // 選択が変わったらページ内容をロード
  useEffect(() => {
    if (!bookId || !pageId) return
    const p = getPage(bookId, pageId)
    setText(p?.content || '')
  }, [bookId, pageId])

  // ページ内容を自動保存
  useEffect(() => {
    if (!bookId || !pageId) return
    const id = setTimeout(() => {
      updatePageContent(bookId, pageId, text)
      setBooks(listBooks())
    }, 400)
    return () => clearTimeout(id)
  }, [text, bookId, pageId])

  const currentBook = books.find(b => b.id === bookId)
  const currentPage = currentBook?.pages.find(p => p.id === pageId)
  const canEdit = Boolean(bookId && pageId)

  // 展開状態（モバイル用ツリー）
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  useEffect(() => {
    if (!bookId) return
    setExpanded(prev => ({ ...prev, [bookId]: true }))
  }, [bookId])
  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const splitIntoChunks = (raw: string): string[] => {
    const normalized = raw.replace(/\r\n?/g, '\n').replace(/[ 　\t]+/g, ' ')
    const sentences = normalized
      .split(/([。．\.！!？\?\n])/)
      .reduce<string[]>((acc, cur, idx, arr) => {
        if (idx % 2 === 0) {
          const punct = arr[idx + 1] || ''
          const s = (cur + punct).trim()
          if (s) acc.push(s)
        }
        return acc
      }, [])
    const chunks: string[] = []
    const MAX = 200
    for (const s of sentences) {
      if (s.length <= MAX) {
        chunks.push(s)
      } else {
        for (let i = 0; i < s.length; i += MAX) {
          chunks.push(s.slice(i, i + MAX))
        }
      }
    }
    return chunks.length ? chunks : [normalized]
  }

  const speakCurrent = () => {
    const synth = window.speechSynthesis
    const segments = queueRef.current
    const i = indexRef.current
    if (i >= segments.length) {
      setIsSpeaking(false)
      setIsPaused(false)
      return
    }
    const u = new SpeechSynthesisUtterance(segments[i])
    u.lang = 'ja-JP'
    u.rate = 1
    u.pitch = 1
    u.onend = () => {
      if (isCancelledRef.current) return
      indexRef.current += 1
      speakCurrent()
    }
    u.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }
    utteranceRef.current = u
    synth.speak(u)
  }

  const handlePlay = () => {
    if (!isSupported) {
      alert('このブラウザは音声読み上げに対応していません。')
      return
    }
    if (!text.trim()) return
    const synth = window.speechSynthesis
    if (isPaused) {
      synth.resume()
      setIsPaused(false)
      return
    }
    // fresh start
    isCancelledRef.current = false
    synth.cancel()
    queueRef.current = splitIntoChunks(text)
    indexRef.current = 0
    setIsSpeaking(true)
    setIsPaused(false)
    speakCurrent()
  }

  const handlePause = () => {
    if (!isSupported) return
    if (!isSpeaking || isPaused) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }

  const handleStop = () => {
    if (!isSupported) return
    isCancelledRef.current = true
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    queueRef.current = []
    indexRef.current = 0
  }

  const handleClear = () => {
    setText('')
    if (bookId && pageId) updatePageContent(bookId, pageId, '')
    setBooks(listBooks())
  }

  const startQueue = (segments: string[]) => {
    const synth = window.speechSynthesis
    isCancelledRef.current = false
    synth.cancel()
    queueRef.current = segments
    indexRef.current = 0
    setIsSpeaking(true)
    setIsPaused(false)
    speakCurrent()
  }

  const handlePlayBook = () => {
    if (!isSupported) {
      alert('このブラウザは音声読み上げに対応していません。')
      return
    }
    const book = currentBook
    if (!book) return
    const segments: string[] = []
    for (const p of book.pages) {
      const c = (p.content || '').trim()
      if (!c) continue
      segments.push(...splitIntoChunks(c))
    }
    if (segments.length === 0) return
    startQueue(segments)
  }

  const addBook = () => {
    const name = window.prompt('ブック名を入力', '新しいブック')
    if (name == null) return
    const b = createBook(name.trim())
    const p = createPage(b.id, 'ページ 1')
    setBooks(listBooks())
    setBookId(b.id)
    setPageId(p?.id || '')
    setText('')
  }

  const doRenameBook = () => {
    if (!currentBook) return
    const name = window.prompt('ブック名を変更', currentBook.name)
    if (name == null) return
    renameBook(currentBook.id, name.trim())
    setBooks(listBooks())
  }

  const doDeleteBook = () => {
    if (!currentBook) return
    if (!window.confirm('このブックを削除しますか？（元に戻せません）')) return
    deleteBook(currentBook.id)
    const all = listBooks()
    setBooks(all)
    if (all.length === 0) {
      setBookId('')
      setPageId('')
      setText('')
      return
    }
    setBookId(all[0].id)
    const firstPage = all[0].pages[0]
    setPageId(firstPage ? firstPage.id : '')
    setText(firstPage ? (firstPage.content || '') : '')
  }

  const addPage = () => {
    if (!currentBook) return
    const name = window.prompt('ページ名を入力', '新しいページ')
    if (name == null) return
    const p = createPage(currentBook.id, name.trim())
    setBooks(listBooks())
    if (p) {
      setPageId(p.id)
      setText('')
    }
  }

  const doRenamePage = () => {
    if (!currentBook || !currentPage) return
    const name = window.prompt('ページ名を変更', currentPage.name)
    if (name == null) return
    renamePage(currentBook.id, currentPage.id, name.trim())
    setBooks(listBooks())
  }

  const doDeletePage = () => {
    if (!currentBook || !currentPage) return
    if (!window.confirm('このページを削除しますか？（元に戻せません）')) return
    deletePage(currentBook.id, currentPage.id)
    const fresh = listBooks()
    setBooks(fresh)
    const b = fresh.find(bk => bk.id === currentBook.id) || fresh[0]
    if (b) {
      setBookId(b.id)
      if (b.pages.length === 0) {
        setPageId('')
        setText('')
      } else {
        const p = b.pages[0]
        setPageId(p.id)
        setText(p.content || '')
      }
    } else {
      // すべて削除されたケース
      setBookId('')
      setPageId('')
      setText('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <h1 style={{
          margin: '0 0 12px 0',
          fontSize: '22px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>テキストを音声で再生</h1>
        {mounted && !isSupported && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: 'white',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            このブラウザは Web Speech API に対応していません。
          </div>
        )}

        {/* ライブラリ（モバイル） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 600, opacity: 0.9 }}>
              作成したブック一覧
            </div>
            <div>
              {books.map(b => (
                <div key={b.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', cursor: 'pointer', backgroundColor: b.id === bookId ? 'rgba(59, 130, 246, 0.25)' : 'transparent', borderLeft: b.id === bookId ? '3px solid #60a5fa' : '3px solid transparent', transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
                       onClick={() => setBookId(b.id)}>
                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(b.id) }}
                            style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white' }}>{expanded[b.id] ? '▼' : '—'}</button>
                    <div style={{ flex: 1, fontWeight: b.id === bookId ? 700 : 500 }}>{b.name}</div>
                    {b.id === bookId && (
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(59,130,246,0.35)', border: '1px solid rgba(59,130,246,0.6)' }}>選択中</span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); doRenameBook() }} style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white' }}>名</button>
                    <button onClick={(e) => { e.stopPropagation(); doDeleteBook() }} aria-label="ブック削除" style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white' }}>🗑️</button>
                  </div>
                  {expanded[b.id] && (
                    <div style={{ paddingLeft: '40px', paddingRight: '12px', paddingBottom: '8px' }}>
                      {(b.pages || []).map(p => (
                        <div key={p.id}
                             onClick={() => { setBookId(b.id); setPageId(p.id) }}
                             style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', color: 'rgba(255,255,255,0.9)', borderBottom: '1px dashed rgba(255,255,255,0.08)', backgroundColor: p.id === pageId ? 'rgba(16,185,129,0.25)' : 'transparent', borderLeft: p.id === pageId ? '3px solid #34d399' : '3px solid transparent', marginLeft: p.id === pageId ? '-3px' : '0', transition: 'background-color 0.2s ease, border-color 0.2s ease' }}>
                          <span style={{ opacity: 0.8 }}>・</span>
                          <div style={{ flex: 1, fontWeight: p.id === pageId ? 600 : 500 }}>{p.name}</div>
                          {p.id === pageId && (
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(16,185,129,0.35)', border: '1px solid rgba(16,185,129,0.6)' }}>選択中</span>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); doRenamePage() }} style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white' }}>名</button>
                          <button onClick={(e) => { e.stopPropagation(); doDeletePage() }} aria-label="ページ削除" style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white' }}>🗑️</button>
                        </div>
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); setBookId(b.id); addPage() }}
                              style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.25)', background: 'transparent', color: 'white' }}>＋ ページ追加</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={addBook} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>＋ ブックを作成</button>
        </div>

        <label style={{ display: 'block', marginBottom: '8px', marginTop: '12px', opacity: 0.85 }}>読み上げテキスト（{currentPage?.name || '未選択'}）</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={canEdit ? 'ここにテキストを入力してください' : 'ブックとページを選択してください'}
          rows={10}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: canEdit ? 'rgba(15, 23, 42, 0.6)' : 'rgba(100, 116, 139, 0.35)',
            overflowWrap: 'anywhere',
            color: 'white',
            outline: 'none',
            marginBottom: '12px'
          }}
          disabled={!canEdit}
        />
        <button
          type="button"
          onClick={handleClear}
          disabled={!canEdit}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            borderRadius: '10px',
            border: 'none',
            cursor: canEdit ? 'pointer' : 'not-allowed',
            opacity: canEdit ? 1 : 0.6,
            marginBottom: '16px'
          }}
        >クリア</button>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Group 1: ページ再生 / ブック再生 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              aria-label="ページ再生"
              onClick={handlePlay}
              disabled={!uiSupported || isSpeaking || !text.trim()}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                opacity: (!isSupported || isSpeaking || !text.trim()) ? 0.6 : 1
              }}
            >ページを読む</button>
            <button
              type="button"
              aria-label="ブック再生"
              onClick={handlePlayBook}
              disabled={!uiSupported || isSpeaking || !(currentBook && currentBook.pages.some(p => (p.content || '').trim()))}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                opacity: (!isSupported || isSpeaking || !(currentBook && currentBook.pages.some(p => (p.content || '').trim()))) ? 0.6 : 1
              }}
            >ブックを読む</button>
          </div>

          {/* Group 2: 再生/一時停止 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              aria-label="再生/再開"
              onClick={handlePlay}
              disabled={!uiSupported || (!isPaused && (!text.trim() || isSpeaking))}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                opacity: (!isSupported || (!isPaused && (!text.trim() || isSpeaking))) ? 0.6 : 1
              }}
            >▶️</button>
            <button
              type="button"
              aria-label="一時停止"
              onClick={handlePause}
              disabled={!uiSupported || !isSpeaking || isPaused}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '20px',
                background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                opacity: (!isSupported || !isSpeaking || isPaused) ? 0.6 : 1
              }}
            >⏸️</button>
          </div>
        </div>
        <div style={{ marginTop: '12px', opacity: 0.8, fontSize: '12px' }}>
          入力は自動保存されます（この端末のブラウザにのみ保存）。
        </div>
      </div>
    </div>
  )
}


