'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article23Page() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      .catch((e: any) => setError(e?.message || 'PC一覧の取得に失敗しました'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <BlogLayout>
      <BlogArticle 
        title={'UMPC おすすめ 2025｜膝上・カフェ作業が快適になる選び方'}
        date={'2025-08-30'}
      >
        <BlogContent>
          <BlogParagraph>
            カフェの小さなテーブルや電車の膝上でも“ストレスなく開ける”を最優先に、UMPC（超小型ノート）を現実的な基準で選ぶためのガイドです。
          </BlogParagraph>

          <BlogParagraph>
            本稿ではサイズ・重量・打鍵感・推定駆動時間という4軸で、日常の持ち出しに最適なバランス点を見つけます。
          </BlogParagraph>

          <BlogSection title="結論｜まず“場面”から逆算する">
            <BlogParagraph>
              膝上中心なら10〜12インチ級・1.0kg前後。カフェ常用なら12〜13インチ級・1.2〜1.3kg以下が扱いやすい目安です。
            </BlogParagraph>

            <BlogParagraph>
              メモリ16GB・SSD512GBを基準とし、推定駆動6〜8時間以上を“持ち時間”の安心ラインとします。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="早見表｜サイズ別の現実的な目安（推定）">
            <BlogParagraph>
              画面の見やすさと可搬性はトレードオフ。以下は日常利用での“妥当な範囲”の指標です。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>サイズ帯</BlogTableCell>
                <BlogTableCell isHeader>想定シーン</BlogTableCell>
                <BlogTableCell isHeader>重さの目安</BlogTableCell>
                <BlogTableCell isHeader>推定駆動</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>〜11.6インチ</BlogTableCell>
                  <BlogTableCell>移動中の膝上、狭小テーブル</BlogTableCell>
                  <BlogTableCell>〜1.0kg</BlogTableCell>
                  <BlogTableCell>5〜8時間</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>12〜12.9インチ</BlogTableCell>
                  <BlogTableCell>カフェ常用、会議移動</BlogTableCell>
                  <BlogTableCell>1.0〜1.2kg</BlogTableCell>
                  <BlogTableCell>6〜9時間</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>13〜13.5インチ</BlogTableCell>
                  <BlogTableCell>資料確認と軽作業の両立</BlogTableCell>
                  <BlogTableCell>1.2〜1.3kg</BlogTableCell>
                  <BlogTableCell>7〜10時間</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方の軸｜小型で後悔しない3条件">
            <BlogParagraph>
              “可搬性だけ”で選ぶと体感が下がります。次の3点を最低ラインに設定しましょう。
            </BlogParagraph>

            <BlogList>
              <li>推定駆動6〜8時間以上（外出時間＋1〜2時間の余裕）</li>
              <li>重量1.3kg以下（毎日持ち出しの負担を抑える）</li>
              <li>メモリ16GB/SSD512GB（待ち時間を削減し快適性を維持）</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="用途別の基準｜学習・会議・出先作業">
            <BlogParagraph>
              自習・筆記中心は11〜12インチ級が軽快。資料確認や長文作業が増えるなら12.5〜13.3インチが現実的です。
            </BlogParagraph>

            <BlogParagraph>
              打鍵感は作業品質に直結します。浅すぎるキーより、適度な反発と静音のバランスがあるモデルを選ぶと疲労を抑えられます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="小型PCの落とし穴｜見落としやすいポイント">
            <BlogParagraph>
              端子数は最小限になりがち。必要な拡張はハブで補う前提にすると選択肢が広がります。
            </BlogParagraph>

            <BlogParagraph>
              ファン音は個体差があります。静かな場所を想定するなら、負荷時の音量レビューも確認しておきましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="価格感の目安｜満足度が上がるライン">
            <BlogParagraph>
              10万円前後は携帯性寄りの仕様。12〜15万円で体感の快適性が一気に整い、長く使いやすくなります。
            </BlogParagraph>

            <BlogParagraph>
              それ以上は“余裕の投資”。拡張性や筐体品質、静音性に効いてきます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="体験談｜膝上作業に最適化した運用例">
            <BlogParagraph>
              私の運用は“移動中にメモ、到着後に清書”。外では明るさを一段下げ、タイピング中心に絞るだけで持ち時間の不安が減りました。
            </BlogParagraph>

            <BlogParagraph>
              大きな処理は帰宅後に実行。外付けSSDを併用すれば、容量の心配も現場での判断もシンプルになります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション｜上位から3台に絞る">
            <BlogParagraph>
              総合スコア順を起点に、推定駆動と重量のバランスで候補を3台まで。最後は価格で決めましょう。
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