'use client'

import { useEffect, useState } from 'react'
import { fetchPcList } from './fetchPcs'
import { ClientPcDeviceCategory, ClientPcListing, ClientPcWithCpuSpec, ClientUsageCategory } from '../../components/types'
import ClientPcList from './ClientPcList'
import PcListHeader from './PcListHeader'

interface UsagePcListPageClientProps {
  usage: ClientUsageCategory
  heading: string
  description: string
  listing?: ClientPcListing
  device?: ClientPcDeviceCategory
}

function DeviceEmptyState({ device }: { device: ClientPcDeviceCategory }) {
  const label = device === 'mini_pc' ? 'Mini PC' : device === 'desktop_pc' ? 'デスクトップPC' : 'ノートPC'

  return (
    <section style={{
      maxWidth: '960px',
      margin: '32px auto 0',
      padding: '0 16px',
    }}>
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        padding: '28px 20px',
        textAlign: 'center',
      }}>
        <h2 style={{
          margin: '0 0 8px',
          color: '#0f172a',
          fontSize: '18px',
          fontWeight: 900,
        }}>
          {label}のDB商品を準備中です
        </h2>
        <p style={{
          margin: 0,
          color: '#475569',
          fontSize: '14px',
          lineHeight: 1.8,
        }}>
          画面は作成済みです。Amazon商品データを追加すると、このページに一覧として表示されます。
        </p>
      </div>
    </section>
  )
}

function getBrowserSearchQuery(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const params = new URLSearchParams(window.location.search)
  return (params.get('q') ?? params.get('query') ?? '').trim()
}

export default function UsagePcListPageClient({ usage, heading, description, listing = 'new', device = 'notebook_pc' }: UsagePcListPageClientProps) {
  const [searchQuery] = useState(getBrowserSearchQuery)
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    fetchPcList(usage, listing, device, searchQuery)
      .then((data) => {
        if (Array.isArray(data)) {
          setPcs(data)
        } else {
          setError('データの形式が正しくありません')
        }
      })
      .catch(error => {
        setError(error.message || 'PC一覧の取得に失敗しました')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [usage, listing, device, searchQuery])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#1f2937',
      }}
    >
      <PcListHeader />

      <main id="pc-list-results">
        <section
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '28px 16px 0 16px',
            textAlign: 'center'
          }}
        >
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            color: '#0f172a',
            lineHeight: 1.3
          }}>
            {heading}
          </h1>
          <p style={{
            margin: 0,
            color: '#475569',
            fontSize: '14px',
            lineHeight: 1.8
          }}>
            {description}
          </p>
        </section>

        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            flexDirection: 'column',
            gap: '16px',
            color: '#475569'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #22c55e',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{
              color: '#475569',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              PCデータを読み込み中...
            </div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', color: '#dc2626', textAlign: 'center' }}>
            エラー: {error}
          </div>
        ) : pcs.length === 0 && (device === 'mini_pc' || device === 'desktop_pc') ? (
          <DeviceEmptyState device={device} />
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          >
            <ClientPcList pcs={pcs} initialUsage={usage} listing={listing} device={device} urlBasedUsage />
          </div>
        )}
      </main>

      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '32px 20px',
        marginTop: '48px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
          </p>
          <p style={{ margin: '0' }}>
            このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。
          </p>
        </div>
      </footer>
    </div>
  )
}
