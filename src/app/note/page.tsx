"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabaseNotes } from '@/lib/supabaseNotesClient'
import type { NoteBook } from '@/lib/noteTypes'
import LoadingOverlay from '@/components/LoadingOverlay'

/**
 * ノート一覧ページ
 * - ユーザーのブック一覧を表示
 * - ブックの作成・削除機能
 * - Google認証によるログイン/ログアウト
 */
export default function NoteHomePage() {
  // ===== 状態管理 =====
  const [userId, setUserId] = useState<string | null>(null) // 現在のユーザーID
  const [books, setBooks] = useState<NoteBook[]>([]) // ブック一覧
  const [loading, setLoading] = useState<boolean>(true) // 初期読み込み状態
  const [newTitle, setNewTitle] = useState<string>("") // 新規ブックのタイトル入力
  const [creatingBook, setCreatingBook] = useState<boolean>(false) // ブック作成中フラグ
  const [deletingBook, setDeletingBook] = useState<string | null>(null) // 削除中のブックID
  const [overlayMessage, setOverlayMessage] = useState<string>("") // オーバーレイメッセージ
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null) // ナビゲーション先ID
  
  // Google認証後のリダイレクト先URLを生成（SSR対応）
  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return `${window.location.origin}/note`
  }, [])


  // ==============================
  //  初期化処理 
  // ==============================

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      // Supabaseから現在のユーザー情報を取得
      const { data } = await supabaseNotes.auth.getUser()
      const userId = data.user?.id ?? null
      
      // コンポーネントがアンマウントされている場合は処理を中断
      if (!isMounted) return
      
      setUserId(userId)
      // ユーザーがログインしている場合、ブック一覧を読み込み
      if (userId) {
        await loadBooks(userId)
      }
      setLoading(false)
    })()
    
    // クリーンアップ関数：コンポーネントアンマウント時にフラグを設定
    return () => {
      isMounted = false
    }
  }, [])


  // ==============================
  //  ブック一覧取得処理 
  // ==============================

  async function loadBooks(userId: string) {
    const { data, error } = await supabaseNotes
      .from('books')
      .select('*')
      .eq('user_id', userId) // ユーザーIDでフィルタリング（RLSで保護）
      .order('created_at', { ascending: false }) // 作成日時の降順でソート
    if (!error && data) setBooks(data as NoteBook[])
  }


  // ==============================
  //  ログイン処理 
  // ==============================

  async function handleSignIn() {
    await supabaseNotes.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    })
  }


  // ==============================
  //  ログアウト処理 
  // ==============================

  async function handleSignOut() {
    await supabaseNotes.auth.signOut()
    setUserId(null)
    setBooks([])
  }


  // ==============================
  //  ブック作成処理 
  // ==============================

  async function handleCreateBook(e: React.FormEvent) {
    // フォーム送信時のリロードを防止
    e.preventDefault()
    
    // バリデーション：ユーザーID、タイトル、作成中フラグをチェック
    if (!userId || !newTitle.trim() || creatingBook) return
    
    // ローディング状態を開始
    setCreatingBook(true)
    setOverlayMessage("ブック作成中...")
    
    // Supabaseにブックを挿入
    const { data, error } = await supabaseNotes
      .from('books')
      .insert({ title: newTitle.trim(), user_id: userId })
      .select('*')
      .single()
    
    // 成功時：ローカル状態を更新
    if (!error && data) {
      setBooks((prev) => [data as NoteBook, ...prev]) // 配列の先頭に追加
      setNewTitle("") // 入力フィールドをクリア
    }
    
    // ローディング状態を終了
    setCreatingBook(false)
    setOverlayMessage("")
  }


  // ==============================
  //  ブック削除処理 
  // ==============================

  async function handleDeleteBook(bookId: string) {
    // 重複削除を防止
    if (deletingBook) return
    
    // ローディング状態を開始
    setDeletingBook(bookId)
    setOverlayMessage("ブック削除中...")
    
    // Supabaseからブックを削除
    const { error } = await supabaseNotes.from('books').delete().eq('id', bookId)
    
    // 成功時：ローカル状態からも削除
    if (!error) setBooks((prev) => prev.filter((b) => b.id !== bookId))
    
    // ローディング状態を終了
    setDeletingBook(null)
    setOverlayMessage("")
  }

  
  // ==============================
  //  レンダリング処理 
  // ==============================

  if (loading) return <LoadingOverlay message="読み込み中..." />

  // 未ログイン時はログイン画面を表示
  if (!userId) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Note</h1>
        <p>ログインが必要です。</p>
        <button onClick={handleSignIn}>Googleでログイン</button>
      </div>
    )
  }


  // ==============================
  //  メイン画面 
  // ==============================
  
  return (
    <div style={{ padding: 16 }}>
      {/* ヘッダー：タイトルとログアウトボタン */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Note</h1>
        <button onClick={handleSignOut}>ログアウト</button>
      </div>

      {/* ブック作成フォーム */}
      <form onSubmit={handleCreateBook} style={{ margin: '16px 0' }}>
        <input
          type="text"
          placeholder="ブックのタイトル"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={creatingBook} // 作成中は入力無効
          style={{ padding: 8, width: 280 }}
        />
        <button type="submit" disabled={creatingBook} style={{ marginLeft: 8 }}>
          作成
        </button>
      </form>

      {/* ブック一覧 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {books.map((book) => (
          <li key={book.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            {/* ブック名（クリックでブック詳細へ遷移） */}
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
                setNavigatingTo(book.id)
                window.location.href = `/note/${book.id}`
              }}
            >
              {book.title}
            </button>
            {/* 削除ボタン */}
            <button 
              onClick={() => handleDeleteBook(book.id)}
              disabled={deletingBook === book.id} // 削除中は無効
            >
              削除
            </button>
          </li>
        ))}
        {/* ブックが存在しない場合のメッセージ */}
        {books.length === 0 && <li>ブックがありません。作成してください。</li>}
      </ul>
      
      {/* ローディングオーバーレイ（常時表示、メッセージで制御） */}
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}
    </div>
  )
}


