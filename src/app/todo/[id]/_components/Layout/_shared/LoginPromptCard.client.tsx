"use client"

import type { CSSProperties } from 'react'

import { GLASS_BACKGROUND, GLASS_BORDER, PRIMARY_GRADIENT } from '@/styles/commonStyles'

type LoginPromptCardProps = {
  onSignIn: () => void
}

const pageBackgroundStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '48px 16px 64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const glassCardStyle: CSSProperties = {
  backgroundColor: GLASS_BACKGROUND,
  border: GLASS_BORDER,
  borderRadius: '24px',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
  width: '100%',
  maxWidth: '420px',
  padding: '40px 32px 44px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  color: '#e2e8f0'
}

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: '36px',
  fontWeight: 700,
  background: PRIMARY_GRADIENT,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
}

const pillButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 20px',
  borderRadius: '999px',
  fontWeight: 600,
  fontSize: '14px',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  width: '100%',
  background: PRIMARY_GRADIENT,
  boxShadow: '0 28px 50px -20px rgba(59, 130, 246, 0.55)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease'
}

export default function LoginPromptCard({ onSignIn }: LoginPromptCardProps) {
  return (
    <div style={pageBackgroundStyle}>
      <div style={glassCardStyle}>
        <div
          style={{
            fontSize: '12px',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'rgba(226, 232, 240, 0.6)'
          }}
        >
          Welcome back
        </div>
        <h1 style={headingStyle}>Specsy Todo</h1>
        <p
          style={{
            margin: 0,
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'rgba(226, 232, 240, 0.72)'
          }}
        >
          プロジェクトのタスクをまとめて管理するにはログインしてください。
        </p>
        <button
          onClick={onSignIn}
          style={pillButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 32px 60px -20px rgba(59, 130, 246, 0.6)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 28px 50px -20px rgba(59, 130, 246, 0.55)'
            e.currentTarget.style.background = PRIMARY_GRADIENT
          }}
        >
          Googleでログイン
        </button>
      </div>
    </div>
  )
}
