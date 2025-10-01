import { type CSSProperties, type MouseEvent } from 'react'
import { PRIMARY_GRADIENT, SECONDARY_GRADIENT, DESTRUCTIVE_GRADIENT } from '@/styles/commonStyles'

interface ButtonProps {
  children: React.ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style = {}
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '999px',
    fontWeight: 600,
    border: 'none',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
    opacity: disabled ? 0.5 : 1,
    ...style
  }

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '12px' },
    md: { padding: '12px 20px', fontSize: '14px' },
    lg: { padding: '16px 24px', fontSize: '16px' }
  }

  const variantStyles = {
    primary: {
      background: PRIMARY_GRADIENT,
      boxShadow: '0 28px 50px -20px rgba(59, 130, 246, 0.55)'
    },
    secondary: {
      background: SECONDARY_GRADIENT,
      boxShadow: '0 24px 50px -20px rgba(14, 165, 233, 0.45)'
    },
    destructive: {
      background: DESTRUCTIVE_GRADIENT,
      boxShadow: '0 24px 50px -20px rgba(239, 68, 68, 0.45)'
    },
    ghost: {
      background: 'rgba(148,163,184,0.22)',
      boxShadow: 'none'
    }
  }

  const hoverStyles = {
    primary: {
      transform: 'translateY(-2px)',
      boxShadow: '0 32px 60px -20px rgba(59, 130, 246, 0.6)',
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
    },
    secondary: {
      transform: 'translateY(-2px)',
      boxShadow: '0 28px 60px -20px rgba(14, 165, 233, 0.55)',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)'
    },
    destructive: {
      transform: 'translateY(-2px)',
      boxShadow: '0 28px 60px -20px rgba(239, 68, 68, 0.55)',
      background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)'
    },
    ghost: {
      transform: 'translateY(-1px)',
      background: 'rgba(148,163,184,0.3)'
    }
  }

  const combinedStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant]
  }

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    const target = e.currentTarget
    Object.assign(target.style, hoverStyles[variant])
  }

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    const target = e.currentTarget
    Object.assign(target.style, variantStyles[variant])
  }

  return (
    <button
      style={combinedStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}