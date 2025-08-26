'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { fetchPcList } from './fetchPcs'
import { ClientPcWithCpuSpec } from '../../components/types'
import ClientPcList from './ClientPcList'

function BackLink() {
  return (
    <Link 
      href="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: '#3b82f6',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#1d4ed8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#3b82f6'
      }}
    >
      ← ホームに戻る
    </Link>
  )
}

export default function PcListPage() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchPcList('cafe')
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
  }, [])

  return (
    <>
      <Head>
        <title>PC一覧 - スペクシーハブ</title>
        <meta name="description" content="用途別にPCを比較。スペック評価、価格、バッテリー性能でパソコンを選ぼう。" />
      </Head>
      <div>
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <BackLink />
        </div>
      </div>
      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            color: '#6b7280',
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
        <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
          エラー: {error}
        </div>
      ) : (
        <ClientPcList pcs={pcs} />
      )}

      {/* フッター */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        padding: '40px 20px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* アフィリエイト開示 */}
          <div style={{
            marginBottom: '24px',
            color: '#6c757d',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
            </p>
            <p style={{ margin: '0' }}>
              このサイトはアフィリエイト広告（Amazonアソシエイト含む）を掲載しています。
            </p>
          </div>

          {/* コピーライト */}
          <div style={{
            borderTop: '1px solid #e9ecef',
            paddingTop: '24px',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            © 2025 Specsy. All rights reserved.
          </div>
        </div>
      </div>
      </div>
    </>
  )
}