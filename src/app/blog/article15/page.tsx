'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article15Page() {
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
        title={'軽量 ノートPC おすすめ【2025年最新】1kg台の最強モバイル機種'}
        date={'2025-08-28'}
      >
        <BlogContent>
          <BlogParagraph>
            毎日の持ち運びで肩が疲れる、カバンが重いとお悩みの方へ。1kg台の軽量ノートPCなら通勤・通学のストレスを大幅軽減できます。
          </BlogParagraph>

          <BlogSection title="結論｜軽量PCで重視すべき4つのバランス">
            <BlogParagraph>
              軽いだけでは満足できません。重量と使いやすさのバランスが長期満足の鍵です。
            </BlogParagraph>
            <BlogList>
              <li>1.0-1.3kgで剛性確保（軽すぎるとタイピング時のたわみが気になる）</li>
              <li>画面輝度400nit以上推奨（屋外・明るいオフィスでの視認性確保）</li>
              <li>USB-C給電対応（小型充電器で運用の自由度向上）</li>
              <li>バッテリー実用7時間以上（外出先での安心感）</li>
            </BlogList>
            <BlogParagraph>
              過度な軽量化より、体験品質とのバランス重視が賢明です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="軽量化のメリットとデメリット｜現実的な判断基準">
            <BlogParagraph>
              1kg以下は確かに軽いですが、筐体剛性やキーボード品質で妥協が生じがち。
            </BlogParagraph>
            <BlogParagraph>
              1.2-1.3kgが最もバランス良好。毎日持ち運んでも負担少なく、タイピングやポート類の使い勝手で満足度高い傾向。重量より「持ちやすさ」「取り回しの良さ」の方が実用性に影響することも多々あります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="用途別軽量PC選択指針｜最適重量の目安">
            <BlogParagraph>
              使用頻度と用途で最適な重量帯が変わります。無理な軽量化は避けましょう。
            </BlogParagraph>
            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>用途・頻度</BlogTableCell>
                <BlogTableCell isHeader>推奨重量</BlogTableCell>
                <BlogTableCell isHeader>重視ポイント</BlogTableCell>
                <BlogTableCell isHeader>妥協可能要素</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>毎日通勤・通学</BlogTableCell>
                  <BlogTableCell>1.0-1.2kg</BlogTableCell>
                  <BlogTableCell>軽量性・電池持ち</BlogTableCell>
                  <BlogTableCell>高性能・大画面</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>出張・外回り多め</BlogTableCell>
                  <BlogTableCell>1.1-1.4kg</BlogTableCell>
                  <BlogTableCell>堅牢性・拡張性</BlogTableCell>
                  <BlogTableCell>最軽量追求</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>週2-3回持ち出し</BlogTableCell>
                  <BlogTableCell>1.3-1.5kg</BlogTableCell>
                  <BlogTableCell>画面品質・性能</BlogTableCell>
                  <BlogTableCell>極限軽量化</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>たまの外出利用</BlogTableCell>
                  <BlogTableCell>1.4-1.6kg</BlogTableCell>
                  <BlogTableCell>コスパ・機能性</BlogTableCell>
                  <BlogTableCell>軽量性</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
            <BlogParagraph>
              無理な軽量化より、使用パターンに適した重量選択が重要です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="軽量PC選びの注意点｜見落としがちなポイント">
            <BlogParagraph>
              軽量化の代償として犠牲になりやすい要素があります。
            </BlogParagraph>
            <BlogParagraph>
              キーボードのたわみ、画面の暗さ、ポート不足、冷却性能の低下など。特にタイピング頻度が高い方は、店頭での打鍵感確認を強く推奨します。軽量モデルは修理時の部品調達や修理費用も高額になる傾向があるため、保証内容も事前確認しましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="充電と拡張性｜軽量運用のコツ">
            <BlogParagraph>
              USB-C充電対応なら小型充電器やモバイルバッテリーで運用可能。
            </BlogParagraph>
            <BlogParagraph>
              軽量PCの限られたポートは、USB-Cハブで補完が基本戦略。自宅・オフィスではドック接続で快適な据え置き環境を構築し、外出時は最小構成で身軽に。メリハリの効いた運用が軽量PCの価値を最大化します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="コストパフォーマンス分析｜軽量化の価値">
            <BlogParagraph>
              軽量化には相応のコストがかかります。費用対効果を冷静に判断しましょう。
            </BlogParagraph>
            <BlogParagraph>
              100g軽くするのに2-3万円の追加投資が必要なケースも。毎日持ち運ぶなら投資価値ありますが、週1-2回なら通常重量モデルで性能や機能を充実させる方が満足度高い場合も。使用頻度と予算のバランスで最適解を見つけることが重要です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="長期使用での注意事項｜軽量PCのメンテナンス">
            <BlogList>
              <li>薄型筐体は埃の蓄積で発熱しやすい（定期的な清掃推奨）</li>
              <li>軽量素材は傷がつきやすい（保護ケース・フィルム活用）</li>
              <li>バッテリー交換が困難なモデル多数（劣化時の対応策確認）</li>
              <li>部品調達に時間がかかる可能性（保証・サポート重視選択）</li>
              <li>持ち運び時の衝撃対策（クッション性のあるケース必須）</li>
            </BlogList>
            <BlogParagraph>
              軽量PCは精密機器として丁寧な取り扱いが寿命を左右します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="実際の運用例｜軽量PCとの1週間">
            <BlogParagraph>
              月-金の通勤で毎日1.2kgのノートPCを携行。電車内でメール確認、昼休みに資料作成、カフェでレポート仕上げ。
            </BlogParagraph>
            <BlogParagraph>
              帰宅後はUSB-Cドック接続で24インチモニターと有線キーボードの据え置き環境に変身。軽量PCの機動力で作業機会が増え、トータルの生産性向上を実感。重量ストレスがないと「ちょっと開いて作業」の回数が自然に増加します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="最適な軽量PCを見つける手順">
            <BlogParagraph>
              使用頻度と予算から最適重量帯を決定し、その範囲で機能・性能を比較検討しましょう。
            </BlogParagraph>
            <BlogParagraph>
              軽量性だけでなく、画面品質・キーボード・バッテリー・拡張性の総合評価で判断することが満足度向上の鍵です。
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