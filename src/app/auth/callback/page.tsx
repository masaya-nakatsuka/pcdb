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
        console.log('Auth callback page loaded')
        console.log('Current URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        console.log('Search:', window.location.search)

        // URLパラメータから元のページを判定
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirect') || '/todo'
        console.log('Redirect destination:', redirectTo)

        // リダイレクト先に応じて適切なSupabaseクライアントを選択
        const supabaseClient = redirectTo.includes('/note') ? supabaseNotes : supabaseTodo

        // Supabaseの認証コールバックを処理
        // URLのハッシュフラグメントまたはクエリパラメータから認証情報を取得
        const { data, error } = await supabaseClient.auth.getSession()

        // 認証情報が既に存在する場合
        if (data.session) {
          console.log('Existing session found, redirecting to:', redirectTo)
          router.push(redirectTo)
          return
        }

        // URLにエラーパラメータがある場合
        const authError = urlParams.get('error')
        if (authError) {
          console.error('OAuth error:', authError)
          setError(`認証エラー: ${authError}`)
          setTimeout(() => {
            router.push(redirectTo)
          }, 5000)
          return
        }

        // ハッシュフラグメントから認証トークンを取得して処理
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken) {
          console.log('Processing OAuth callback with hash fragment tokens')
          try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })

            if (sessionError) {
              console.error('Session error:', sessionError.message)
              setError(sessionError.message)
              setTimeout(() => {
                router.push(redirectTo)
              }, 5000)
            } else if (sessionData.session) {
              console.log('Session established successfully, redirecting to:', redirectTo)
              router.push(redirectTo)
            } else {
              console.log('No session created, redirecting to:', redirectTo)
              router.push(redirectTo)
            }
          } catch (sessionError) {
            console.error('Set session error:', sessionError)
            setError('認証処理中にエラーが発生しました')
            setTimeout(() => {
              router.push(redirectTo)
            }, 5000)
          }
        } else {
          // 認証情報が見つからない場合
          console.log('No authentication data found, redirecting to:', redirectTo)
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

    // 少し遅延を入れて、ページが完全にロードされてから処理を開始
    const timer = setTimeout(handleAuthCallback, 100)
    return () => clearTimeout(timer)
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
