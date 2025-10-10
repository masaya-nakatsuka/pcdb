'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* メインコンテンツ */}
      <div style={{
        minHeight: '90vh',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        gap: '24px'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '32px'
        }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Specsy
        </h1>
        <p style={{
          fontSize: '18px',
          margin: 0,
          opacity: 0.8
        }}>
          自分のスペックを引き上げる総合プラットフォーム
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Link 
          href="/pc-list"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
            e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          PC一覧を見る
        </Link>

        <Link
          href="/todo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)'
            e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)'
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          TODOを管理する
        </Link>

        <Link 
          href="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)'
            e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          ブログ記事を見る
        </Link>

        <Link 
          href="/tts"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #0891b2 100%)'
            e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          テキストを音声で再生
        </Link>

        <Link 
          href="https://sesera231.com"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg,rgb(59, 217, 6) 0%,rgb(126, 220, 38) 100%)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'linear-gradient(135deg,rgb(59, 217, 6) 0%,rgb(126, 220, 38) 100%)'
            e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(59, 217, 6, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'linear-gradient(135deg,rgb(59, 217, 6) 0%,rgb(126, 220, 38) 100%)'
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          同一運営者の雑多ブログ
        </Link>
        </div>
      </div>

      {/* フッターセクション */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}>
            {/* お問い合わせフォーム */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                お問い合わせ
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                marginBottom: '16px',
                lineHeight: '1.6',
                margin: '0 0 16px 0'
              }}>
                ご質問やご要望がございましたら、お気軽にお問い合わせください。
              </p>
              <a
                href="mailto:contact@specsy-hub.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)'
                }}
              >
                メールで問い合わせ
              </a>
            </div>

            {/* 運営者情報 */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                運営者情報
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                marginBottom: '16px',
                lineHeight: '1.6',
                margin: '0 0 16px 0'
              }}>
                サイトの運営者情報や免責事項について詳しくご確認いただけます。
              </p>
              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: 'rgba(139, 92, 246, 0.8)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.8)'
                }}
              >
                詳細を見る
              </Link>
            </div>

            {/* プライバシーポリシー */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                プライバシーポリシー
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                marginBottom: '16px',
                lineHeight: '1.6',
                margin: '0 0 16px 0'
              }}>
                個人情報の取り扱いやCookie使用について詳しく説明しています。
              </p>
              <Link
                href="/privacy"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: 'rgba(245, 158, 11, 0.8)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.8)'
                }}
              >
                ポリシーを見る
              </Link>
            </div>
          </div>

          {/* アフィリエイト開示 */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            marginBottom: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
            </p>
            <p style={{ margin: '0' }}>
              このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。
            </p>
          </div>

          {/* コピーライト */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px'
          }}>
            © 2025 Specsy. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
