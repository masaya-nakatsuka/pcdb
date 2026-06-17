'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchPcList } from './fetchPcs'
import { ClientPcWithCpuSpec, ClientUsageCategory } from '../../components/types'
import ClientPcList from './ClientPcList'

interface UsagePcListPageClientProps {
  usage: ClientUsageCategory
  heading: string
  description: string
}

function BackLink() {
  return (
    <Link
      href="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: '#2563eb',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#1d4ed8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#2563eb'
      }}
    >
      ← ホームに戻る
    </Link>
  )
}

export default function UsagePcListPageClient({ usage, heading, description }: UsagePcListPageClientProps) {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    fetchPcList(usage)
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
  }, [usage])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#1f2937',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(148, 163, 184, 0.15)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px',
          }}
        >
          <BackLink />
        </div>
      </div>

      <main>
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
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          >
            <ClientPcList pcs={pcs} initialUsage={usage} urlBasedUsage />
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
