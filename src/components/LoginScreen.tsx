import { type CSSProperties } from 'react'

interface LoginScreenProps {
  title: string
  subtitle: string
  onSignIn: () => void
}

export default function LoginScreen({ title, subtitle, onSignIn }: LoginScreenProps) {
  return (
    <div style={loginWrapperStyle}>
      <div style={loginCardStyle}>
        <span style={loginKickerStyle}>Welcome back</span>
        <h1 style={loginTitleStyle}>{title}</h1>
        <p style={loginSubtitleStyle}>{subtitle}</p>
        <button
          onClick={onSignIn}
          style={loginButtonStyle}
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

// スタイル定数
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
const GLASS_BACKGROUND = 'rgba(15, 23, 42, 0.65)'
const GLASS_BORDER = '1px solid rgba(148, 163, 184, 0.2)'

const glassCardStyle: CSSProperties = {
  backgroundColor: GLASS_BACKGROUND,
  border: GLASS_BORDER,
  borderRadius: '24px',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)'
}

const loginWrapperStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
}

const loginCardStyle: CSSProperties = {
  ...glassCardStyle,
  width: '100%',
  maxWidth: '420px',
  padding: '40px 32px 44px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  color: '#e2e8f0'
}

const loginKickerStyle: CSSProperties = {
  fontSize: '12px',
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.6)'
}

const loginTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '36px',
  fontWeight: 700,
  background: PRIMARY_GRADIENT,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
}

const loginSubtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'rgba(226, 232, 240, 0.72)'
}

const loginButtonStyle: CSSProperties = {
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
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
  width: '100%',
  background: PRIMARY_GRADIENT,
  boxShadow: '0 28px 50px -20px rgba(59, 130, 246, 0.55)'
}