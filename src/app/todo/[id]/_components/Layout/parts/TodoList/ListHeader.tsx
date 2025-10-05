"use client"

import type { CSSProperties } from 'react'

type SortDirection = 'asc' | 'desc'

type TableHeaderProps = {
  gridTemplateColumns: string
  sortField: string
  sortDirection: SortDirection
  onSort: (field: string) => void
  cellPadding: string
}

const headerRowStyle = (gridTemplateColumns: string): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns,
  background: 'rgba(148, 163, 184, 0.12)',
  justifyContent: 'center',
})

const headerCellBaseStyle = (cellPadding: string): CSSProperties => ({
  padding: cellPadding,
  fontSize: '12px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.75)',
  fontWeight: 700,
  borderRadius: '24px',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
})

const sortableButtonStyle: CSSProperties = {
  all: 'unset',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  width: '100%'
}

export default function ListHeader({
  gridTemplateColumns,
  sortField,
  sortDirection,
  onSort,
  cellPadding
}: TableHeaderProps) {
  const sortableCell = (
    field: string,
    label: string,
    align: CSSProperties['justifyContent'] = 'flex-start'
  ) => (
    <div style={{ ...headerCellBaseStyle(cellPadding), justifyContent: align }}>
      <button
        type="button"
        onClick={() => onSort(field)}
        style={{
          ...sortableButtonStyle,
          justifyContent: align,
          textAlign: align === 'center' ? 'center' : 'left',
          color: 'inherit'
        }}
      >
        <span>{label}</span>
        {sortField === field && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </div>
  )

  return (
    <div style={headerRowStyle(gridTemplateColumns)}>
      {sortableCell('status', '状況', 'center')}
      <div style={{ ...headerCellBaseStyle(cellPadding), justifyContent: 'center' }}>着手</div>
      {sortableCell('title', 'タイトル')}
      {sortableCell('priority', '優先度', 'center')}
      <div style={{ ...headerCellBaseStyle(cellPadding), justifyContent: 'center' }}>タグ</div>
      <div style={{ ...headerCellBaseStyle(cellPadding), justifyContent: 'center' }}>詳細</div>
      <div style={{ ...headerCellBaseStyle(cellPadding), justifyContent: 'center' }}>削除</div>
    </div>
  )
}
