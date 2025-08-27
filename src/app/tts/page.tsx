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
        }}>テキストを音声で再生（テスト版）</h1>
        <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px', marginBottom: '8px' }}>
          環境によっては、アプリを閉じたままでも再生できます
        </div>
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
                            style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white' }}>{expanded[b.id] ? '—' : '▼'}</button>
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

        {canEdit && (
          <>
            <label style={{ display: 'block', marginBottom: '8px', marginTop: '12px', opacity: 0.85 }}>読み上げテキスト（{currentPage?.name || '未選択'}）</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'ここにテキストを入力してください'}
              rows={10}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                overflowWrap: 'anywhere',
                color: 'white',
                outline: 'none',
                marginBottom: '12px'
              }}
            />
            <button
              type="button"
              onClick={handleClear}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >クリア</button>
          </>
        )}
        
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
      {/* このアプリについて（外側セクション） */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        marginTop: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px',
        color: 'white'
      }}>
        <h2 style={{
          margin: '0 0 6px 0',
          fontSize: '16px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>このアプリについて</h2>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(59,130,246,0.5), rgba(139,92,246,0.5))', margin: '0 0 10px 0' }} />
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          このアプリは、テキストを「耳で」効率よく消化するための、モバイル特化・シンプル設計の読み上げツールです。記事や学習メモ、論文の抜粋、社内ドキュメントなどの長文を、ブック（フォルダ）とページ（ファイル）の単位で整理し、ワンタップで音声再生。スキマ時間の学習や、手がふさがっているシーンでも“流し聞き”でインプットを継続できます。スマホでの使いやすさを最優先しつつ、PCでも同じモバイルUIを表示するため、デバイスが変わっても操作感は統一。入力は端末内のブラウザに自動保存され、サーバに送信されないため、気軽にメモや学習素材を蓄積できます。
        </p>
        <h3 style={{ margin: '12px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #60a5fa' }}>主な特徴</h3>
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          - ブックとページで長文を体系的に整理できるため、学習計画やテーマ別の情報管理に最適です。<br/>
          - 「ページを読む」「ブックを読む」の2モードで、章単位の確認から通し聞きまで柔軟に対応。<br/>
          - 長文は文や改行を基準に自動でチャンク化し、途切れにくく自然な連続読み上げを実現。<br/>
          - 自動保存により、ブラウザを閉じても内容は保持（この端末内のみ）。プライバシーフレンドリー。<br/>
          - 環境によってはアプリを閉じた状態でも再生が継続され、ランニングや家事、移動時間の“ながら学習”にフィットします。
        </p>
        <h3 style={{ margin: '12px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #60a5fa' }}>おすすめの使い方（ユースケース）</h3>
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          自分だけのブックを作成し、毎日の学習素材をページとして蓄積。例えば「英語リスニング」「資格試験の要点」「最新テック記事」「社内ナレッジ」などテーマ別にブックを分けると、目的に応じてすぐ再生できます。忙しい日はページ単位で要点のみ、週末や移動中はブック再生でまとめてキャッチアップする、といった運用が簡単です。<br/>
          ランニング中や通勤・通学、家事・育児の合間、あるいは就寝前のリラックスタイムに“流し聞き”で学習を継続。手元を見られない状況でも情報を取りこぼさず、学びの総量を底上げできます。ドライブ中や散歩中の「耳からインプット」にも最適です。
        </p>
        <h3 style={{ margin: '12px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #60a5fa' }}>学習・仕事での活用アイデア</h3>
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          - 語学学習: 単語リストや例文、短い記事をページ化して繰り返し再生。スキマ時間の耳慣らしに。<br/>
          - 資格対策: 章ごとにページを作り、重要ポイントを音声で復習。暗記項目は毎朝の支度時間に通し聞き。<br/>
          - 業務効率化: 社内規程や手順書、過去メモの要点をページ化し、移動中に復習。定例前のウォームアップにも。<br/>
          - 情報収集: 気になる記事の要約を貼ってブック再生。ニュースレター的に毎日“耳で読む”習慣が作れます。<br/>
          - クリエイティブ: 自分の下書きやアイデアメモを音声で確認。推敲の質が上がり、自然な文章へ磨き込みやすくなります。
        </p>
        <h3 style={{ margin: '12px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #60a5fa' }}>マーケティング的な価値（なぜ“耳学”が効くのか）</h3>
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          記憶定着には反復と多チャネル化（見る・聞く）が有効とされます。画面に向かう時間を増やさず、日常動作に“耳からのインプット”を溶け込ませることで、学習の総量が自然と増えます。視覚の占有時間ゼロで情報が入るため、忙しい人ほど効果を実感しやすいのが音声学習の強み。さらに、耳で聞くことで理解の粒度が変わり、読み飛ばしがちな部分にも気づきが生まれます。<br/>
          このアプリは、誰でも即使えるブラウザ標準の読み上げ機能（Web Speech API）を活用し、アプリのインストールや会員登録なしに学習サイクルへ導入できるのが強みです。UIはモバイル前提で分かりやすく、最小の手数で「選ぶ→再生→継続」を後押しします。
        </p>
        <h3 style={{ margin: '12px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #60a5fa' }}>プライバシーとデータの扱い</h3>
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          入力したテキストはこの端末のブラウザにのみ自動保存され、サーバには送信されません。学習メモや社内文書、機密性の高い下書きでも安心して扱えます。端末をまたいで同期したい場合は、ブックごとのエクスポート/インポート機能（将来対応予定）をご利用いただく形を検討しています。
        </p>
        <h3 style={{ margin: '12px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #60a5fa' }}>制限事項と注意点</h3>
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          読み上げ品質やバックグラウンド再生の継続可否は、ブラウザとOSの実装・省電力設定に依存します。特にモバイルでは、省電力やタスク管理の影響で再生が一時停止される場合があります。長文の一括再生において停止や途切れが発生した場合は、ページを小分けにする、端末の省電力設定を調整するなどの運用をお試しください。
        </p>
        <h3 style={{ margin: '12px 0 6px 0', fontSize: '14px', fontWeight: 800, display: 'inline-block', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #60a5fa' }}>今日から始める“耳から学ぶ”習慣</h3>
        <p style={{ margin: '0 0 10px 0', opacity: 0.92, lineHeight: 1.8 }}>
          まずはブックをひとつ作り、気になる記事の要約や学習ノートをページとして貼り付けてみてください。朝の支度中は「ページを読む」で要点復習、ランニングや通勤中は「ブックを読む」で通し学習——。目の前の時間はそのままに、耳からのインプットを積み上げることで、日々の学びは着実に加速します。手がふさがる時間を、学習の味方へ。あなたの“耳学”を、このアプリが支えます。
        </p>
      </div>
    </div>
  )
}


