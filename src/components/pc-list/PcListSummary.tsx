'use client'

import { ClientPcWithCpuSpec } from '../types'
import { formatCurrency, getComparablePrice, getPcHighlights } from '../utils/pcInsights'

interface PcListSummaryProps {
  pcs: ClientPcWithCpuSpec[]
  selectedCpu: string
  selectedDisplaySize: string
  searchQuery?: string
  activeQuickFilterLabels?: string[]
  embeddedInArticle?: boolean
}

function formatDisplayFilter(value: string): string {
  if (value === 'all') {
    return 'すべて'
  }

  if (value.startsWith('max:')) {
    return `${value.replace('max:', '')}インチ以下`
  }

  return `${value}インチ`
}

function getLowestPrice(pcs: ClientPcWithCpuSpec[]) {
  const prices = pcs
    .map(getComparablePrice)
    .filter((price): price is number => typeof price === 'number')

  return prices.length > 0 ? Math.min(...prices) : null
}

export default function PcListSummary({
  pcs,
  selectedCpu,
  selectedDisplaySize,
  searchQuery = '',
  activeQuickFilterLabels = [],
  embeddedInArticle = false,
}: PcListSummaryProps) {
  const topPc = pcs[0]
  const lowestPrice = getLowestPrice(pcs)
  const practicalCount = pcs.filter((pc) => (pc.ram ?? 0) >= 16 && (pc.rom ?? 0) >= 512).length
  const portableCount = pcs.filter((pc) => typeof pc.weight === 'number' && pc.weight <= 1300).length
  const dedicatedGpuCount = pcs.filter((pc) => pc.has_dgpu).length
  const topHighlights = topPc ? getPcHighlights(topPc, embeddedInArticle ? 3 : 4) : []

  const statItems = [
    { label: '表示件数', value: `${pcs.length}件` },
    { label: '最安', value: formatCurrency(lowestPrice) },
    { label: '16GB/512GB', value: `${practicalCount}件` },
    { label: '1.3kg以下', value: `${portableCount}件` },
    { label: '専用GPU', value: `${dedicatedGpuCount}件` },
  ]

  return (
    <section
      aria-label="現在のランキング概要"
      style={{
        marginTop: embeddedInArticle ? '14px' : '18px',
        padding: embeddedInArticle ? '14px' : '16px',
        border: '1px solid #dbe4ef',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: embeddedInArticle ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 5px', color: '#0f172a', fontSize: '16px', fontWeight: 800 }}>
            現在の条件
          </h3>
          <div style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.6 }}>
            CPU: {selectedCpu === 'all' ? 'すべて' : selectedCpu} / 画面: {formatDisplayFilter(selectedDisplaySize)}
          </div>
          {searchQuery.trim().length > 0 && (
            <div style={{ color: '#0f766e', fontSize: '12px', lineHeight: 1.6, fontWeight: 800 }}>
              キーワード: {searchQuery.trim()}
            </div>
          )}
          {activeQuickFilterLabels.length > 0 && (
            <div style={{ color: '#2563eb', fontSize: '12px', lineHeight: 1.6, fontWeight: 800 }}>
              実用条件: {activeQuickFilterLabels.join(' / ')}
            </div>
          )}
        </div>

        {topPc && (
          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>
              先頭候補
            </div>
            <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: 800, lineHeight: 1.4 }}>
              {topPc.brand ? `${topPc.brand} / ` : ''}{topPc.name || 'Unnamed PC'}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))',
          gap: '8px',
        }}
      >
        {statItems.map((item) => (
          <div
            key={item.label}
            style={{
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              {item.label}
            </div>
            <div style={{ color: '#0f172a', fontSize: '16px', fontWeight: 800 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {topHighlights.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '12px',
          }}
        >
          {topHighlights.map((highlight) => (
            <span
              key={highlight}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '26px',
                padding: '0 9px',
                borderRadius: '999px',
                backgroundColor: '#eef6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {highlight}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
