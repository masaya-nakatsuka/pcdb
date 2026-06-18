'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchPcList } from './fetchPcs'
import { ClientPcListing, ClientPcWithCpuSpec, ClientUsageCategory } from '../../components/types'
import ClientPcList from './ClientPcList'
import PcListHeader from './PcListHeader'
import PcUsageGuide from '../../components/pc-list/PcUsageGuide'

interface UsagePcListPageClientProps {
  usage: ClientUsageCategory
  heading: string
  description: string
  listing?: ClientPcListing
}

export default function UsagePcListPageClient({ usage, heading, description, listing = 'new' }: UsagePcListPageClientProps) {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    fetchPcList(usage, listing)
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
  }, [usage, listing])

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

        {listing === 'used' && (
          <section style={{
            maxWidth: '1080px',
            margin: '18px auto 0',
            padding: '0 16px',
          }}>
            <div style={{
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              padding: '14px 16px',
              color: '#92400e',
              fontSize: '13px',
              lineHeight: 1.8,
              fontWeight: 700,
            }}>
              中古PCは同じ型番でも状態差があります。価格だけでなく、販売元、保証、バッテリー劣化、付属品、整備済み表記を確認してください。
              <Link href="/pc-list/cost-performance" style={{
                color: '#b45309',
                fontWeight: 900,
                marginLeft: '8px',
                textDecoration: 'underline',
              }}>
                新品ランキングへ
              </Link>
            </div>
          </section>
        )}

        <PcUsageGuide usage={usage} />

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
          <div style={{
            maxWidth: '720px',
            margin: '28px auto 0',
            padding: '0 16px',
          }}>
            <div style={{
              border: '1px solid #fecaca',
              borderRadius: '8px',
              backgroundColor: '#fff7f7',
              padding: '18px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#b91c1c', fontSize: '15px', fontWeight: 900, marginBottom: '8px' }}>
                PCデータの取得に失敗しました
              </div>
              <p style={{ margin: '0 0 14px', color: '#7f1d1d', fontSize: '13px', lineHeight: 1.7 }}>
                {error}。時間を置くか、価格分布メモや条件別の記事から確認してください。
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Link href="/" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '36px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 900,
                }}>
                  トップへ戻る
                </Link>
                <Link href="/blog/article33" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '36px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 900,
                }}>
                  価格分布を見る
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          >
            <ClientPcList pcs={pcs} initialUsage={usage} listing={listing} urlBasedUsage />
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
