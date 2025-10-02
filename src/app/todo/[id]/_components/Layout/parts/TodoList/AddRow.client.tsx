"use client"

import type { CSSProperties } from 'react'

type AddRowProps = {
  gridTemplateColumns: string
  cellPadding: string
  onStartCreating: () => void
}

const clickableRowStyle = (gridTemplateColumns: string): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns,
  cursor: 'pointer'
})

export default function AddRow({ gridTemplateColumns, cellPadding, onStartCreating }: AddRowProps) {
  return (
    <div
      style={{
        borderBottom: '1px dashed rgba(148, 163, 184, 0.3)'
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onStartCreating}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onStartCreating()
          }
        }}
        style={clickableRowStyle(gridTemplateColumns)}
      >
        <div
          style={{
            gridColumn: '1 / -1',
            padding: cellPadding,
            color: 'rgba(226, 232, 240, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = 'rgba(226, 232, 240, 0.7)'
          }}
          onFocus={(event) => {
            event.currentTarget.style.color = '#fff'
          }}
          onBlur={(event) => {
            event.currentTarget.style.color = 'rgba(226, 232, 240, 0.7)'
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>＋</span>
          新しいTODOを追加
        </div>
      </div>
    </div>
  )
}
