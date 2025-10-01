import { type CSSProperties } from 'react'
import { getStatusColor } from '@/styles/commonStyles'

interface StatusBadgeProps {
  status: '未着手' | '着手中' | '完了'
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
}

export default function StatusBadge({
  status,
  count,
  size = 'md',
  showDot = true
}: StatusBadgeProps) {
  const sizeStyles = {
    sm: { fontSize: '11px', padding: '4px 8px' },
    md: { fontSize: '12px', padding: '4px 10px' },
    lg: { fontSize: '13px', padding: '6px 12px' }
  }

  const dotSizes = {
    sm: { width: '6px', height: '6px' },
    md: { width: '8px', height: '8px' },
    lg: { width: '10px', height: '10px' }
  }

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: showDot ? '6px' : '0',
    borderRadius: '999px',
    background: 'rgba(148, 163, 184, 0.18)',
    color: getStatusColor(status),
    fontWeight: 600,
    ...sizeStyles[size]
  }

  const dotStyle: CSSProperties = {
    borderRadius: '50%',
    backgroundColor: getStatusColor(status),
    ...dotSizes[size]
  }

  return (
    <span style={badgeStyle}>
      {showDot && <span style={dotStyle} />}
      <span>{status}</span>
      {count !== undefined && (
        <span style={{ opacity: 0.7, marginLeft: '4px' }}>
          {count}
        </span>
      )}
    </span>
  )
}