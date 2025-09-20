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

export default function Article32Page() {
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
        title={'Amazonで販売しているN95CPU搭載ミニノートPC一覧 2025｜モバイル性重視'}
        date={'2025-09-10'}
      >
        <BlogContent>
          <BlogParagraph>
            インテルN95はエントリー機ながらN100よりもわずかに高いクロックで、普段使いをもう一段スムーズにしたい人に人気のCPUです。13インチ前後のミニノートと組み合わせると、軽さ・省電力・十分な処理性能のバランスが良く、外出先の作業にも対応しやすくなります。本ページでは当サイトのモバイルカテゴリを読み込み、CPUに「N95」、画面サイズに「13.5インチ以下」のフィルターを適用した状態で一覧を表示しています。
          </BlogParagraph>

          <BlogSection title="ポイント｜N95×ミニノートを選ぶ基準">
            <BlogList>
              <li>CPU：Intel N95を搭載（4コアでN100比のクロック向上、日常作業がより軽快）</li>
              <li>筐体：13.5インチ以下を目安に“持ち運びやすさ”とバッテリー持ちを確保</li>
              <li>快適性：メモリ8GBは必須、可能なら16GBでブラウジングや資料作成を快適に</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="用途の目安">
            <BlogParagraph>
              ブラウジングやOffice系作業、リモート会議といった用途はN95で快適にこなせます。軽めの写真編集や多タブ操作でもN100より余裕がありますが、重量級アプリは苦手なので“サブノート”または持ち歩き用のメイン機として割り切るのがコツです。
            </BlogParagraph>
            <BlogList>
              <li>外出先での資料作成・会議ノート</li>
              <li>学習用途やプログラミング入門用のモバイル端末</li>
              <li>自宅でのセカンドPC（リビング利用や家族共用）</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="N95搭載ミニノート一覧">
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
                <ClientPcList pcs={pcs} defaultCpu="N95" defaultMaxDisplaySize={13.5} />
              </div>
            )}
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}
