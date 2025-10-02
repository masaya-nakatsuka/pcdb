"use client"

import type { CSSProperties } from 'react'

import { getStatusColor } from '@/styles/commonStyles'

import type { SimpleStatus } from '../../../types'

type SummaryHeaderProps = {
  statusSummary: Record<SimpleStatus, number>
  showCompleted: boolean
  onToggleShowCompleted: () => void
}

const STATUS_ORDER: SimpleStatus[] = ['未着手', '完了']

const containerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  flexWrap: 'wrap',
  gap: '12px'
}

const statusListStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
}

const statusChipBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '16px',
  background: 'rgba(15, 23, 42, 0.55)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  color: 'rgba(226, 232, 240, 0.85)'
}

const toggleButtonBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '8px 16px',
  borderRadius: '999px',
  fontWeight: 600,
  fontSize: '12px',
  border: 'none',
  color: '#e2e8f0',
  cursor: 'pointer',
  boxShadow: 'none'
}

export default function SummaryHeader({ statusSummary, showCompleted, onToggleShowCompleted }: SummaryHeaderProps) {
  return (
    <div style={containerStyle}>
      <div style={statusListStyle}>
        {STATUS_ORDER.map((status) => (
          <div key={status} style={statusChipBaseStyle}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(status)
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{status}</span>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>{statusSummary[status]}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onToggleShowCompleted}
        style={{
          ...toggleButtonBaseStyle,
          background: showCompleted ? 'rgba(59, 130, 246, 0.25)' : 'rgba(148, 163, 184, 0.22)'
        }}
      >
        {showCompleted ? '完了タスクを非表示' : '完了タスクを表示'}
      </button>
    </div>
  )
}
