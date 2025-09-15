"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { supabaseNotes } from '@/lib/supabaseNotesClient'
import type { NotePage } from '@/lib/noteTypes'
import LoadingOverlay from '@/components/LoadingOverlay'
import 'highlight.js/styles/github.css'

export default function PageEditor() {
  const params = useParams<{ bookId: string; pageId: string }>()
  const bookId = params?.bookId as string
  const pageId = params?.pageId as string
  const [userId, setUserId] = useState<string | null>(null)
  const [page, setPage] = useState<NotePage | null>(null)
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [loadingPage, setLoadingPage] = useState<boolean>(true)
  const [overlayMessage, setOverlayMessage] = useState<string>("")
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return `${window.location.origin}/note/${bookId}/${pageId}`
  }, [bookId, pageId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabaseNotes.auth.getUser()
      const uid = data.user?.id ?? null
      if (!mounted) return
      setUserId(uid)
      if (uid) {
        await loadPage()
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [bookId, pageId])

  async function loadPage() {
    setLoadingPage(true)
    setOverlayMessage("ページ読み込み中...")
    const { data, error } = await supabaseNotes
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single()
    if (!error && data) {
      const p = data as NotePage
      setPage(p)
      setTitle(p.title)
      setContent(p.content ?? '')
    }
    setLoadingPage(false)
    setOverlayMessage("")
  }

  async function handleSignIn() {
    await supabaseNotes.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    })
  }

  async function handleSave() {
    if (!page) return
    setSaving(true)
    setOverlayMessage("保存中...")
    const { data, error } = await supabaseNotes
      .from('pages')
      .update({ title, content })
      .eq('id', page.id)
      .select('*')
      .single()
    if (!error && data) setPage(data as NotePage)
    setSaving(false)
    setOverlayMessage("")
  }

  if (loading) return <LoadingOverlay message="読み込み中..." />

  if (!userId) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Page</h1>
        <p>ログインが必要です。</p>
        <button onClick={handleSignIn}>Googleでログイン</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{page?.title ?? 'Page'}</h1>
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
              setNavigatingTo('book')
              window.location.href = `/note/${bookId}`
            }}
          >
            ← ブックへ戻る
          </button>
        </div>
        <button onClick={handleSave} disabled={saving}>保存</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ width: '48%' }}>
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: 8 }}
              placeholder="タイトル"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', height: '60vh', padding: 8, fontFamily: 'monospace' }}
            placeholder="Markdownでメモを記述"
          />
        </div>
        <div style={{ width: '48%' }}>
          <h3>プレビュー</h3>
          <div 
            style={{ 
              background: '#f6f8fa', 
              padding: 16, 
              height: '60vh', 
              overflow: 'auto',
              border: '1px solid #e1e4e8',
              borderRadius: 6
            }}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({children}) => <h1 style={{fontSize: '2em', marginBottom: '0.5em', borderBottom: '1px solid #e1e4e8', paddingBottom: '0.3em'}}>{children}</h1>,
                h2: ({children}) => <h2 style={{fontSize: '1.5em', marginBottom: '0.5em', borderBottom: '1px solid #e1e4e8', paddingBottom: '0.3em'}}>{children}</h2>,
                h3: ({children}) => <h3 style={{fontSize: '1.25em', marginBottom: '0.5em'}}>{children}</h3>,
                p: ({children}) => <p style={{marginBottom: '1em', lineHeight: '1.6'}}>{children}</p>,
                ul: ({children}) => <ul style={{marginBottom: '1em', paddingLeft: '2em'}}>{children}</ul>,
                ol: ({children}) => <ol style={{marginBottom: '1em', paddingLeft: '2em'}}>{children}</ol>,
                li: ({children}) => <li style={{marginBottom: '0.25em'}}>{children}</li>,
                blockquote: ({children}) => <blockquote style={{borderLeft: '4px solid #dfe2e5', paddingLeft: '1em', margin: '1em 0', color: '#6a737d'}}>{children}</blockquote>,
                code: ({children, className}) => {
                  const isInline = !className
                  if (isInline) {
                    return <code style={{background: '#f1f3f4', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '0.9em'}}>{children}</code>
                  }
                  return <code className={className}>{children}</code>
                },
                pre: ({children}) => <pre style={{background: '#f6f8fa', padding: '1em', borderRadius: '6px', overflow: 'auto', marginBottom: '1em'}}>{children}</pre>,
                table: ({children}) => <table style={{borderCollapse: 'collapse', width: '100%', marginBottom: '1em'}}>{children}</table>,
                th: ({children}) => <th style={{border: '1px solid #dfe2e5', padding: '0.5em', background: '#f6f8fa', fontWeight: 'bold'}}>{children}</th>,
                td: ({children}) => <td style={{border: '1px solid #dfe2e5', padding: '0.5em'}}>{children}</td>,
                a: ({children, href}) => <a href={href} style={{color: '#0366d6', textDecoration: 'none'}} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>{children}</a>,
                strong: ({children}) => <strong style={{fontWeight: 'bold'}}>{children}</strong>,
                em: ({children}) => <em style={{fontStyle: 'italic'}}>{children}</em>
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}


