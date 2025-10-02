"use client"

import type { CSSProperties } from 'react'

type HeaderProps = {
  onSignOut: () => Promise<void> | void
}

const containerStyle: CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '24px',
  padding: '16px 24px',
  color: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)'
}

const linkStyle: CSSProperties = {
  color: '#93c5fd',
  textDecoration: 'none',
  fontSize: '14px'
}

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '999px',
  fontWeight: 600,
  fontSize: '13px',
  border: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  boxShadow: '0 24px 50px -20px rgba(14, 165, 233, 0.45)',
  cursor: 'pointer'
}

export default function Header({ onSignOut }: HeaderProps) {
  return (
    <div style={containerStyle}>
      <a href="/todo" style={linkStyle}>
        ← リスト一覧へ
      </a>
      <button onClick={() => onSignOut()} style={buttonStyle}>
        ログアウト
      </button>
    </div>
  )
}
