'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article28Page() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // 記事方針に合わせて「mobile」重みで一覧を提示
    fetchPcList('mobile')
      .then((data) => {
        if (Array.isArray(data)) {
          setPcs(data)
        } else {
          setError('データの形式が正しくありません')
        }
      })
      .catch((e: any) => setError(e?.message || 'PC一覧の取得に失敗しました'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <BlogLayout>
      <BlogArticle 
        title={'軽量モバイルノート おすすめ 2025｜“持続×軽さ×実用”の最適点'}
        date={'2025-08-31'}
      >
        <BlogContent>
          <BlogParagraph>
            通学・通勤やカフェ学習、移動の多い働き方に効くのは「軽くて、十分に速く、長く持つ」こと。数値で語れる現実基準に沿って、軽量モバイルの最適解を整理します。
          </BlogParagraph>

          <BlogSection title="結論｜“1.3kg以下・推定8〜10時間・16GB/512GB”がまず安心">
            <BlogParagraph>
              迷ったらこの3点。持ち運び負担を抑えつつ、日常の待ち時間をなくし、電源の心配を減らします。価格は10〜15万円帯が満足度の上がり目安です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="用途別の現実的な構成目安（推定）">
            <BlogParagraph>
              体感差に直結する“重さ・メモリ・SSD・バッテリー”を軸に、用途別の目安を示します。いずれも目安で、予算や好みに応じて調整可能です。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>用途</BlogTableCell>
                <BlogTableCell isHeader>よくある作業</BlogTableCell>
                <BlogTableCell isHeader>目安スペック</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>通学・講義メモ</BlogTableCell>
                  <BlogTableCell>ノート取り/資料閲覧/ブラウジング</BlogTableCell>
                  <BlogTableCell>1.3kg以下/16GB/256-512GB/推定8-10時間</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>カフェ学習・外出作業</BlogTableCell>
                  <BlogTableCell>文書作成/表計算/会議</BlogTableCell>
                  <BlogTableCell>1.2-1.3kg/16GB/512GB/推定9-12時間</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>軽い画像編集</BlogTableCell>
                  <BlogTableCell>RAW整理/簡易補正/素材選定</BlogTableCell>
                  <BlogTableCell>〜1.4kg/16-32GB/512GB以上/外部モニター併用</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方｜後悔しない3つの観点">
            <BlogList>
              <li>重量：毎日持ち運ぶなら1.2〜1.3kg以下が負担減</li>
              <li>待ち時間：メモリ16GB/SSD512GBで体感の速さを確保</li>
              <li>持ち時間：推定8〜10時間で電源探しのストレスを回避</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="価格感｜満足度が伸びるライン">
            <BlogParagraph>
              10万円前後で“軽くて十分速い”構成。12〜15万円で筐体品質や静音の精度が上がり、通年の安心感が高まります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              総合スコア順の上位から、重量と推定駆動時間のバランスで3台に絞り、最後は価格で決めましょう。
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
            ) : (
              <div style={{ marginTop: '12px' }}>
                <ClientPcList pcs={pcs} />
              </div>
            )}
          </BlogSection>
        </BlogContent>
      </BlogArticle>
    </BlogLayout>
  )
}


