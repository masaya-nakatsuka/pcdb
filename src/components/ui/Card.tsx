import { type CSSProperties, type ReactNode } from 'react'
import { glassCardStyle } from '@/styles/commonStyles'

interface CardProps {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export default function Card({
  children,
  padding = 'md',
  hover = false,
  className = '',
  style = {},
  onClick
}: CardProps) {
  const paddingStyles = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  }

  const cardStyle: CSSProperties = {
    ...glassCardStyle,
    padding: paddingStyles[padding],
    cursor: onClick ? 'pointer' : 'default',
    transition: hover ? 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease' : 'none',
    ...style
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover) return
    const target = e.currentTarget
    target.style.transform = 'translateY(-2px)'
    target.style.boxShadow = '0 28px 60px -24px rgba(59, 130, 246, 0.35)'
    target.style.background = 'rgba(59, 130, 246, 0.12)'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover) return
    const target = e.currentTarget
    target.style.transform = 'translateY(0)'
    target.style.boxShadow = '0 45px 80px -40px rgba(15, 23, 42, 0.8)'
    target.style.background = 'rgba(15, 23, 42, 0.65)'
  }

  return (
    <div
      style={cardStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={hover ? handleMouseEnter : undefined}
      onMouseLeave={hover ? handleMouseLeave : undefined}
    >
      {children}
    </div>
  )
}