interface PcListEmptyStateProps {
  activeQuickFilterLabels: string[]
  searchQuery?: string
  hasAnyFilters: boolean
  onClearFilters: () => void
}

export default function PcListEmptyState({
  activeQuickFilterLabels,
  searchQuery = '',
  hasAnyFilters,
  onClearFilters,
}: PcListEmptyStateProps) {
  return (
    <section
      aria-label="条件に合うPCがない状態"
      style={{
        marginTop: '18px',
        padding: '22px 16px',
        border: '1px solid #dbe4ef',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
      }}
    >
      <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: 900, marginBottom: '8px' }}>
        条件に合うPCがありません
      </div>
      <p
        style={{
          maxWidth: '560px',
          margin: '0 auto 14px',
          color: '#64748b',
          fontSize: '13px',
          lineHeight: 1.8,
        }}
      >
        {searchQuery.trim().length > 0
          ? `現在のキーワード: ${searchQuery.trim()}`
          : activeQuickFilterLabels.length > 0
          ? `現在の実用条件: ${activeQuickFilterLabels.join(' / ')}`
          : 'CPUや画面サイズの条件で候補が0件になっています。'}
      </p>
      {hasAnyFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          style={{
            minHeight: '38px',
            padding: '0 14px',
            borderRadius: '8px',
            border: '1px solid #2563eb',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          条件を解除する
        </button>
      )}
    </section>
  )
}
