'use client'

import { ClientPcWithCpuSpec } from '../types'
import {
  matchesPcQuickFilter,
  pcQuickFilterDefinitions,
  pcQuickFilterPresets,
  PcQuickFilterKey,
} from '../utils/pcQuickFilters'

interface PcQuickFiltersProps {
  pcs: ClientPcWithCpuSpec[]
  activeFilters: PcQuickFilterKey[]
  onToggle: (filter: PcQuickFilterKey) => void
  onApplyPreset: (filters: PcQuickFilterKey[]) => void
  onClear: () => void
  embeddedInArticle?: boolean
}

export default function PcQuickFilters({
  pcs,
  activeFilters,
  onToggle,
  onApplyPreset,
  onClear,
  embeddedInArticle = false,
}: PcQuickFiltersProps) {
  const activeSet = new Set(activeFilters)

  return (
    <section
      aria-label="実用条件で絞り込み"
      style={{
        marginTop: embeddedInArticle ? '14px' : '16px',
        padding: embeddedInArticle ? '12px' : '14px',
        border: '1px solid #dbe4ef',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '14px', fontWeight: 900 }}>
            実用条件で絞り込み
          </h3>
          <div style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.6 }}>
            価格、軽さ、実用構成などを重ねて候補を減らせます。
          </div>
        </div>

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            style={{
              minHeight: '32px',
              padding: '0 10px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            解除
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(154px, 1fr))',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        {pcQuickFilterPresets.map((preset) => {
          const count = pcs.filter((pc) => preset.filters.every((filter) => matchesPcQuickFilter(pc, filter))).length
          const isActive =
            preset.filters.length === activeFilters.length &&
            preset.filters.every((filter) => activeSet.has(filter))
          const isDisabled = count === 0

          return (
            <button
              key={preset.key}
              type="button"
              disabled={isDisabled}
              onClick={() => onApplyPreset(preset.filters)}
              title={preset.description}
              style={{
                minHeight: '42px',
                padding: '7px 9px',
                borderRadius: '8px',
                border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                color: isDisabled ? '#94a3b8' : '#0f172a',
                textAlign: 'left',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.62 : 1,
              }}
            >
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 900, lineHeight: 1.25 }}>
                {preset.label}
              </span>
              <span style={{ display: 'block', marginTop: '2px', color: isActive ? '#1d4ed8' : '#64748b', fontSize: '11px', fontWeight: 700 }}>
                {count}件
              </span>
            </button>
          )
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(142px, 1fr))',
          gap: '8px',
        }}
      >
        {pcQuickFilterDefinitions.map((definition) => {
          const isActive = activeSet.has(definition.key)
          const count = pcs.filter((pc) => matchesPcQuickFilter(pc, definition.key)).length
          const isDisabled = count === 0 && !isActive

          return (
            <label
              key={definition.key}
              title={definition.description}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '44px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                color: isDisabled ? '#94a3b8' : '#0f172a',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.62 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                disabled={isDisabled}
                onChange={() => onToggle(definition.key)}
                style={{
                  width: '15px',
                  height: '15px',
                  accentColor: '#2563eb',
                  flex: '0 0 auto',
                }}
              />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: 'block',
                    color: 'inherit',
                    fontSize: '12px',
                    fontWeight: 900,
                    lineHeight: 1.25,
                  }}
                >
                  {definition.label}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: '2px',
                    color: isActive ? '#1d4ed8' : '#64748b',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1.25,
                  }}
                >
                  {count}件
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
