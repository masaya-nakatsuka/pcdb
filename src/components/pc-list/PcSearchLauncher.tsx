'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { pcQuickFilterPresets } from '@/components/utils/pcQuickFilters'
import { buildPcSearchUrl } from '@/components/utils/pcSearchUrl'

const usageOptions = [
  { path: '/pc-list/cost-performance', label: 'コスパ' },
  { path: '/pc-list/cafe', label: 'カフェ作業' },
  { path: '/pc-list/mobile', label: 'モバイル' },
  { path: '/pc-list/gaming', label: 'ゲーム' },
  { path: '/pc-list/video-editing', label: '動画編集' },
  { path: '/pc-list/home', label: '自宅作業' },
]

const exampleSearches = [
  { label: 'N100を安く', path: '/pc-list/cost-performance', query: 'N100', preset: 'budgetMain' },
  { label: 'Ryzenを比較', path: '/pc-list/cost-performance', query: 'Ryzen' },
  { label: 'Lenovo軽量', path: '/pc-list/mobile', query: 'Lenovo', preset: 'mobileMain' },
  { label: '中古Ryzen', path: '/pc-list/used', query: 'Ryzen' },
  { label: 'Radeonでゲーム', path: '/pc-list/gaming', query: 'Radeon', preset: 'creativeGpu' },
]

export default function PcSearchLauncher() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [usagePath, setUsagePath] = useState('/pc-list/cost-performance')
  const [preset, setPreset] = useState('')

  const destination = useMemo(
    () => buildPcSearchUrl({ path: usagePath, query, preset }),
    [preset, query, usagePath]
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push(destination)
  }

  return (
    <div style={{
      border: '1px solid #dbe4ef',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: 900 }}>
            条件を入れて探す
          </div>
          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, marginTop: '3px' }}>
            キーワードと用途を組み合わせて一覧へ
          </div>
        </div>
        <Link href="/pc-list/cost-performance" style={{
          color: '#2563eb',
          fontSize: '12px',
          fontWeight: 900,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          コスパ順へ
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={{ color: '#334155', fontSize: '12px', fontWeight: 900 }}>
            キーワード
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例: Ryzen / Lenovo / 16GB"
            style={{
              width: '100%',
              minHeight: '42px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: 800,
              padding: '0 12px',
              boxSizing: 'border-box',
              outlineColor: '#2563eb',
            }}
          />
        </label>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
        }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ color: '#334155', fontSize: '12px', fontWeight: 900 }}>
              用途
            </span>
            <select
              value={usagePath}
              onChange={(event) => setUsagePath(event.target.value)}
              style={{
                width: '100%',
                minHeight: '42px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: 800,
                padding: '0 10px',
                boxSizing: 'border-box',
                outlineColor: '#2563eb',
              }}
            >
              {usageOptions.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ color: '#334155', fontSize: '12px', fontWeight: 900 }}>
              条件
            </span>
            <select
              value={preset}
              onChange={(event) => setPreset(event.target.value)}
              style={{
                width: '100%',
                minHeight: '42px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: 800,
                padding: '0 10px',
                boxSizing: 'border-box',
                outlineColor: '#2563eb',
              }}
            >
              <option value="">指定なし</option>
              {pcQuickFilterPresets.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          style={{
            minHeight: '44px',
            border: 0,
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          この条件で検索
        </button>
      </form>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        marginTop: '12px',
      }}>
        {exampleSearches.map((item) => (
          <Link
            key={`${item.path}-${item.query}-${item.preset}`}
            href={buildPcSearchUrl(item)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '30px',
              padding: '0 10px',
              borderRadius: '999px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 900,
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
