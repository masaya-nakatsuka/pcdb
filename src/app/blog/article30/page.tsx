'use client'

import { useEffect, useState } from 'react'
import BlogLayout from '../../../components/blog/BlogLayout'
import {
  BlogArticle,
  BlogContent,
  BlogSection,
  BlogParagraph,
  BlogList,
  BlogCallout
} from '@/components/blog/BlogArticle'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article30Page() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchPcList('mobile')
      .then((data) => {
        if (!Array.isArray(data)) {
          setError('データの形式が正しくありません')
          return
        }

        setPcs(data)
        setError(null)
      })
      .catch((e: any) => {
        setError(e?.message || 'PC一覧の取得に失敗しました')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <BlogLayout>
      <BlogArticle
        title={'Amazonで販売しているN100CPU搭載ミニノートPC一覧 2025｜モバイル性重視'}
        date={'2025-09-10'}
      >
        <BlogContent>
          <BlogParagraph>
            N100世代は「普段使いに十分な速さ × 低消費電力」が魅力。13インチ前後のミニノートと組み合わせると、手軽さとバッテリー持ちのバランスが際立ちます。本ページでは、当サイトのモバイルカテゴリを読み込み、CPU に「N100」、画面サイズに「13.5インチ以下」のフィルターを適用した状態で一覧を表示しています。
          </BlogParagraph>

          <BlogSection title="ポイント｜N100×ミニノートを選ぶ基準">
            <BlogList>
              <li>CPU：Intel N100を搭載していること（4コアで普段使いが軽快）</li>
              <li>筐体：13.5インチ以下を目安に“持ち運びやすさ”を確保</li>
              <li>快適性：メモリ8GB以上、可能なら16GBでタブ多用にも備える</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="用途の目安">
            <BlogParagraph>
              ブラウジング、Office系、リモート会議、学習用途までならN100で快適。動画編集や大型アプリの常用は得意ではないため、用途を限定した“サブノート”として割り切るのがコツです。
            </BlogParagraph>
            <BlogList>
              <li>外出先での作業メモやドキュメント作成</li>
              <li>学習/資格勉強用の持ち歩きマシン</li>
              <li>自宅のセカンドPC（リビング利用や子ども用）</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="N100搭載ミニノート一覧">
            <BlogParagraph>
              以下は条件に合致したモデルの最新リストです。価格や在庫は日々変動するため、詳細リンクからAmazonの最新情報をご確認ください。
            </BlogParagraph>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>PCデータを読み込み中...</span>
                <style jsx>{`
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
              </div>
            ) : error ? (
              <div style={{ padding: '12px', color: 'red', textAlign: 'center' }}>エラー: {error}</div>
            ) : pcs.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                現在表示できるPCがありません。データ更新までお待ちください。
              </div>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <ClientPcList pcs={pcs} defaultCpu="N100" defaultMaxDisplaySize={13.5} />
              </div>
            )}
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}
