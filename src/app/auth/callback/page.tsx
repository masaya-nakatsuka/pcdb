"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import { supabaseNotes } from '@/lib/supabaseNotesClient'
import LoadingOverlay from '@/components/LoadingOverlay'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLパラメータから元のページを判定
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirect') || '/todo'

        // リダイレクト先に応じて適切なSupabaseクライアントを選択
        const supabaseClient = redirectTo.includes('/note') ? supabaseNotes : supabaseTodo

        const { data, error } = await supabaseClient.auth.getSession()
        if (error) {
          console.error('Auth callback error:', error.message)
          setError(error.message)
          // エラーの場合は5秒後に指定されたページにリダイレクト
          setTimeout(() => {
            router.push(redirectTo)
          }, 5000)
        } else if (data.session) {
          // 認証成功時は指定されたページにリダイレクト
          router.push(redirectTo)
        } else {
          // セッションがない場合も指定されたページにリダイレクト
          router.push(redirectTo)
        }
      } catch (err) {
        console.error('Auth callback unexpected error:', err)
        setError('認証処理中に予期しないエラーが発生しました')
        setTimeout(() => {
          router.push('/todo')
        }, 5000)
      }
    }

    handleAuthCallback()
  }, [router])

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '24px',
            padding: '40px 32px',
            maxWidth: '500px',
            textAlign: 'center',
            color: '#e2e8f0'
          }}
        >
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>認証エラー</h2>
          <p style={{ marginBottom: '24px' }}>{error}</p>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>
            5秒後に自動的にTODOページに戻ります
          </p>
        </div>
      </div>
    )
  }

  return <LoadingOverlay message="認証処理中..." />
}