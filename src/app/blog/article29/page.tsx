'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article29Page() {
  const [pcs, setPcs] = useState<ClientPcWithCpuSpec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    // 本記事は“バランス寄り”の選定想定 → cafe 重みで提示
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
        title={'総合スコア順 小型ノート おすすめ 2025｜数値で比較して選ぶ'}
        date={'2025-09-03'}
      >
        <BlogContent>
          <BlogParagraph>
            小型ノートは「軽さ・十分な速さ・電池の安心」のバランスが肝心。数値で語れる指標（pcScore/重量/推定駆動/メモリ/SSD）だけに絞って、外さない選び方を整理します。
          </BlogParagraph>

          <BlogSection title="結論｜『pcScore上位 × 重量 × 推定駆動』でまず外さない">
            <BlogParagraph>
              迷ったら、pcScoreの上位から候補をとり、1.3–1.4kg/推定8–10時間/16GB・512GBを基準に。体感の多くは“待ち時間”と“持ち運び負担”で決まります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="早見表｜総合スコア上位候補と基本スペックの目安">
            <BlogParagraph>
              pcScoreの帯ごとに、想定用途と“現実に困らない”目安を並べます。あくまで指標の読み方であり、個別モデルは価格や好みで前後調整可能です。
            </BlogParagraph>
            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>指標</BlogTableCell>
                <BlogTableCell isHeader>目安帯</BlogTableCell>
                <BlogTableCell isHeader>想定用途</BlogTableCell>
                <BlogTableCell isHeader>重量目安</BlogTableCell>
                <BlogTableCell isHeader>推定駆動</BlogTableCell>
                <BlogTableCell isHeader>価格感</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>pcScore 高</BlogTableCell>
                  <BlogTableCell>上位帯</BlogTableCell>
                  <BlogTableCell>オフィス＋軽い画像/多タブ</BlogTableCell>
                  <BlogTableCell>〜1.4kg</BlogTableCell>
                  <BlogTableCell>目安 9–12h</BlogTableCell>
                  <BlogTableCell>12–15万円〜</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>pcScore 中</BlogTableCell>
                  <BlogTableCell>準上位帯</BlogTableCell>
                  <BlogTableCell>学習/在宅ワーク中心</BlogTableCell>
                  <BlogTableCell>1.3–1.5kg</BlogTableCell>
                  <BlogTableCell>目安 8–10h</BlogTableCell>
                  <BlogTableCell>10–13万円</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>pcScore 準中</BlogTableCell>
                  <BlogTableCell>実用帯</BlogTableCell>
                  <BlogTableCell>文書/表計算/会議中心</BlogTableCell>
                  <BlogTableCell>〜1.5kg</BlogTableCell>
                  <BlogTableCell>目安 7–9h</BlogTableCell>
                  <BlogTableCell>〜10万円</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方｜後悔しない現実基準（16GB/512GB/推定8〜10時間）">
            <BlogParagraph>
              体感の速さは“待たないこと”。メモリとSSD容量がダイレクトに効きます。軽さ・駆動は“使う場所の自由度”を生みます。
            </BlogParagraph>
            <BlogList>
              <li>体感速度：16GB/512GB起点で“待ち”を減らす</li>
              <li>自由度：1.3–1.4kg/推定8–10hで電源探しを回避</li>
              <li>寿命観点：8GB/256GBは短期用途なら可、長期満足度で不利</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="カテゴリの考え方｜mobile/cafe/homeの違いと使い分け">
            <BlogParagraph>
              mobileは軽さ寄り、homeは性能寄り、cafeはバランス。今回は幅広い読者を想定し、一覧は“cafe重み”で提示します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="用途別の目安｜学習/在宅/出張での“ちょうど良さ”">
            <BlogParagraph>
              すべて“目安”。好みや価格で前後調整できます。まずは体感差の大きい要素から固めましょう。
            </BlogParagraph>
            <BlogList>
              <li>学習：1.2–1.3kg/16GB/256–512GB/推定8–10h</li>
              <li>在宅：〜1.4–1.5kg/16–32GB/512GB以上/外部モニター併用</li>
              <li>出張：1.2–1.3kg/16GB/512GB/推定9–12h</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="価格帯の現実｜10万円/12〜15万円/〜20万円の満足度ライン">
            <BlogParagraph>
              10万円前後で“十分速い”構成。12–15万円では筐体/静音/余裕が伸び、〜20万円では長期満足が安定します。同価格なら重さと駆動の配分で差がつきます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="よくある落とし穴｜データにない要素は“断定せず注意喚起”">
            <BlogParagraph>
              本記事は数値で語れる範囲に限定します。以下は比較根拠にできないため、個別確認を推奨します。
            </BlogParagraph>
            <BlogList>
              <li>USB‑C映像出力の仕様（Alt Mode/帯域/個数）</li>
              <li>色域/リフレッシュレート/最大輝度などの画面詳細</li>
              <li>ペン精度/キーボード配列/打鍵感など体感依存</li>
              <li>マイク/スピーカー/カメラ品質の優劣</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="ケーススタディ｜上位から3台に絞る思考プロセス">
            <BlogParagraph>
              1) pcScore上位から候補抽出 → 2) 重量と推定駆動で3台に絞る → 3) 最後は価格で決断。迷ったらメモリ/SSDを優先し、“待たない体験”を確保。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              下の一覧（cafe重み）から上位を確認し、重量と推定駆動のバランスで3台に絞り、最後は価格で決めましょう。
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



