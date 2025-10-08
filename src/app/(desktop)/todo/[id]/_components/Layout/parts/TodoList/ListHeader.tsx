"use client"

type SortDirection = 'asc' | 'desc'

type TableHeaderProps = {
  gridTemplateColumns: string
  sortField: string
  sortDirection: SortDirection
  onSort: (field: string) => void
  cellPaddingClass: string
}

export default function ListHeader({
  gridTemplateColumns,
  sortField,
  sortDirection,
  onSort,
  cellPaddingClass,
}: TableHeaderProps) {
  const baseCellClass = `flex items-center gap-1 rounded-full text-[12px] font-semibold uppercase tracking-[0.15em] text-frost-muted ${cellPaddingClass}`

  const sortableCell = (field: string, label: string, align: 'center' | 'flex-start' = 'flex-start') => (
    <div className={`${baseCellClass} ${align === 'center' ? 'justify-center text-center' : 'justify-start'}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`flex w-full items-center gap-1 text-left transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200/40 ${align === 'center' ? 'justify-center text-center' : ''}`}
      >
        <span>{label}</span>
        {sortField === field && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </div>
  )

  return (
    <div className="grid justify-center rounded-3xl border border-night-border bg-night-glass" style={{ gridTemplateColumns }}>
      {sortableCell('status', '状況', 'center')}
      <div className={`${baseCellClass} justify-center`}>着手</div>
      {sortableCell('group', 'グループ', 'center')}
      {sortableCell('title', 'タイトル')}
      {sortableCell('priority', '優先度', 'center')}
      <div className={`${baseCellClass} justify-center`}>タグ</div>
      <div className={`${baseCellClass} justify-center`}>詳細</div>
      <div className={`${baseCellClass} justify-center`}>削除</div>
    </div>
  )
}
