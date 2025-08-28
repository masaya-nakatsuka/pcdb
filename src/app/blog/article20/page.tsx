'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article20Page() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchPcList('home')
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
        title={'クリエイター向けPC｜デザイン・写真RAW現像を快適に'}
        date={'2025-08-10'}
      >
        <BlogContent>
          <BlogParagraph>
            制作の快適さはCPU数値だけで決まりません。ブラシの引っかかり、プレビューの滑らかさ、書き出し待ち、色の安定が総合力です。
          </BlogParagraph>

          <BlogParagraph>
            まず結論の目安を示し、早見表で判断軸を整理。選び方と価格帯の境界線、チェックリスト、ケーススタディの順で解説します。
          </BlogParagraph>

          <BlogSection title="結論：まず“詰まる原因”から解く">
            <BlogParagraph>
              画像編集中心ならメモリとストレージ、RAW現像中心ならCPUの持続性能。画面は広色域と均一性で“修正の少なさ”に効きます。
            </BlogParagraph>

            <BlogParagraph>
              I/Oは制作の裏方。外部モニターと高速ストレージ、ペンタブを同時に安定接続できるかが、集中力を守ります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="早見表：制作タイプ別の要点">
            <BlogParagraph>
              初期判断のための表です。ソフトや素材の重さで前後しますが、投資の優先度を掴むのに役立ちます。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>制作タイプ</BlogTableCell>
                <BlogTableCell isHeader>重視ポイント</BlogTableCell>
                <BlogTableCell isHeader>目安</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>写真RAW現像</BlogTableCell>
                  <BlogTableCell>CPU持続×ストレージ</BlogTableCell>
                  <BlogTableCell>上位CPU/16-32GB/NVMe高速</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>画像レタッチ</BlogTableCell>
                  <BlogTableCell>メモリ×画面品質</BlogTableCell>
                  <BlogTableCell>16-32GB/P3準拠/均一性良</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>UI/グラフィック</BlogTableCell>
                  <BlogTableCell>I/O×マルチ画面</BlogTableCell>
                  <BlogTableCell>TBドック/外部2画面安定</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方の軸：どこに投資すると効くか">
            <BlogParagraph>
              ボトルネックは人それぞれ。あなたの工程で時間を奪う箇所にコストを載せるのが、最短で“気持ちよさ”に届く方法です。
            </BlogParagraph>

            <BlogList>
              <li>プレビューが重い→CPU持続とプロキシ/スマートプレビュー運用</li>
              <li>ブラシが引っかかる→メモリ増設と遅延の少ない入力環境</li>
              <li>書き出し待ちが長い→CPU上位化と高速ストレージ</li>
              <li>色がズレる→広色域パネルと簡易キャリブレーション</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="価格帯の境界線：体験が変わる瞬間">
            <BlogParagraph>
              エントリー帯は“待てば進む”体験。中位帯からプレビューの滑らかさと画面品質が揃い、作業の迷いが減ります。
            </BlogParagraph>

            <BlogParagraph>
              上位帯は長時間の安定と色の安心感。納品クオリティの再現性を重視するなら、投資の価値が出ます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="購入前チェックリスト：失敗しない確認">
            <BlogParagraph>
              目の前の作業で困らないか、導入前に次の観点を確認。レビュー傾向と合わせると精度が上がります。
            </BlogParagraph>

            <BlogList>
              <li>画面の色域/均一性と反射の少なさ</li>
              <li>メモリ16-32GBの選択可否と増設性</li>
              <li>NVMe速度と空き容量、外付けSSDの相性</li>
              <li>USB‑C/Thunderboltでの外部出力安定性</li>
              <li>長時間使用時の静音と温度の傾向</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="ケーススタディ：プロキシで“リズム”を守る">
            <BlogParagraph>
              高解像度素材で重さを感じたら、プロキシ/スマートプレビューを活用。編集時は軽く、書き出し時だけ高品質に戻します。
            </BlogParagraph>

            <BlogParagraph>
              入出力の遅延を減らす小さな工夫が、集中の継続と品質に直結します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              総合スコア順で上位を確認し、画面品質/メモリ/ストレージ/I/Oで3台に絞りましょう。最後に価格で決めます。
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


