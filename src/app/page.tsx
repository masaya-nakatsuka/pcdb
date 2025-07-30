'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
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
          パソコン比較サイト
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
      </div>
    </div>
  )
}