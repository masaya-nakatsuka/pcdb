'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article27Page() {
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
        title={'在宅ワークPC おすすめ 2025｜静音・長時間作業を“現実基準”で選ぶ'}
        date={'2025-08-30'}
      >
        <BlogContent>
          <BlogParagraph>
            家の作業環境でいちばん効くのは“静かで待たないこと”。在宅ワークでの長時間稼働を前提に、体感品質を上げる基本条件を整理します。
          </BlogParagraph>

          <BlogParagraph>
            本稿は静音・安定・持ち時間のバランス重視。省電力系CPUでも“待たない構成”を押さえれば、毎日の集中力が変わります。
          </BlogParagraph>

          <BlogSection title="結論｜在宅は“静音×待ち時間ゼロ”を最優先">
            <BlogParagraph>
              迷ったらメモリ16GB/SSD512GB、推定駆動8〜10時間。小音量の冷却と反応の速さが作業効率に直結します。
            </BlogParagraph>

            <BlogParagraph>
              外部ディスプレイを併用する前提なら本体サイズは柔軟に。重量よりも打鍵感と静音性を優先しましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="早見表｜在宅用途の現実的目安（推定）">
            <BlogParagraph>
              ここでは“長時間の快適さ”に効く構成の目安を示します。すべて目安であり、用途で前後します。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>重視ポイント</BlogTableCell>
                <BlogTableCell isHeader>現実的な基準</BlogTableCell>
                <BlogTableCell isHeader>効果の出方</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>静音</BlogTableCell>
                  <BlogTableCell>負荷時も会話音以下が目安</BlogTableCell>
                  <BlogTableCell>集中維持、夜間作業が快適</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>反応速度</BlogTableCell>
                  <BlogTableCell>SSD512GB・メモリ16GB以上</BlogTableCell>
                  <BlogTableCell>アプリ切替と検索が速い</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>持ち時間</BlogTableCell>
                  <BlogTableCell>推定8〜10時間</BlogTableCell>
                  <BlogTableCell>ケーブルの煩雑さが減る</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方｜後悔しない3条件">
            <BlogParagraph>
              体感の良さは“待たない・静か・広い”の組み合わせ。最低限の基準を固めましょう。
            </BlogParagraph>

            <BlogList>
              <li>メモリ16GB/SSD512GB（待ち時間を削減）</li>
              <li>推定駆動8〜10時間（配線の自由度が上がる）</li>
              <li>打鍵感と静音性の両立（疲労と雑音を抑える）</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="用途別｜文書/会議/軽画像編集">
            <BlogParagraph>
              文書中心は12〜13.5インチで十分。会議が多い日はカメラ位置と静音を優先。軽い画像編集はメモリ多めが効きます。
            </BlogParagraph>

            <BlogParagraph>
              外部ディスプレイ前提なら本体は軽快モデルでもOK。キーボードの打鍵感が一日の満足度を左右します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="落とし穴｜在宅で起きがちな不満">
            <BlogParagraph>
              ファン制御が粗いと小刻みな音が気になることがあります。レビューで負荷時の音量傾向も確認しておきましょう。
            </BlogParagraph>

            <BlogParagraph>
              端子不足はハブで解決できますが、配線が増えると雑音源が増えます。必要最小限の構成を意識しましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="価格感｜満足度が上がるライン">
            <BlogParagraph>
              10万円前後は軽快構成で十分。12〜15万円で静音や筐体品質が整い、長期運用の安心感が増します。
            </BlogParagraph>

            <BlogParagraph>
              さらに上は余裕の投資。キーボード、スピーカー、冷却設計など体験面が緻密になります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="体験談｜“音を抑える”だけで集中が変わる">
            <BlogParagraph>
              私の在宅では、ファンが回りにくい設定を基本に、重い処理はまとまった時間に実行。小さな工夫で疲労が減りました。
            </BlogParagraph>

          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              総合スコア順の上位から、推定駆動と静音の評判で3台に絞り、最後は価格で決めましょう。
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


