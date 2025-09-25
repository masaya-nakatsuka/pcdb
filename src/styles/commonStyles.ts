import { type CSSProperties } from 'react'

// カラーグラデーション
export const PRIMARY_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
export const SECONDARY_GRADIENT = 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'

// ガラスモルフィズムスタイル
export const GLASS_BACKGROUND = 'rgba(15, 23, 42, 0.65)'
export const GLASS_BORDER = '1px solid rgba(148, 163, 184, 0.2)'

export const glassCardStyle: CSSProperties = {
  backgroundColor: GLASS_BACKGROUND,
  border: GLASS_BORDER,
  borderRadius: '24px',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)'
}

// ボタンスタイル
export const pillButtonStyle: CSSProperties = {
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
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease'
}

// コントロール（入力欄など）の共通スタイル
export const controlBaseStyle: CSSProperties = {
  borderRadius: '12px',
  padding: '10px 12px',
  fontSize: '13px',
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  color: '#e2e8f0',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box',
  minWidth: 0
}

// ページ背景スタイル
export const pageBackgroundStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '48px 16px 64px'
}