'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article19Page() {
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
        title={'学生向けPCの選び方｜レポート・オンライン授業・プログラミング'}
        date={'2025-08-09'}
      >
        <BlogContent>
          <BlogParagraph>
            学生PCは“毎日使えること”が最重要。軽さ、電池持ち、打鍵感の土台が整えば、学習のリズムが安定します。
          </BlogParagraph>

          <BlogParagraph>
            スペックは必要十分でOK。用途と予算の軸で候補を絞り、最後に体験の質で決めるのが近道です。
          </BlogParagraph>

          <BlogSection title="結論：学部別の“外さない”基準">
            <BlogParagraph>
              まずは学部ごとの軸を押さえます。難しい数値より、日常で効くポイントが判断を早くします。
            </BlogParagraph>

            <BlogList>
              <li>文系：軽量×電池×打鍵感（ノート/レポート中心）</li>
              <li>理工/情報：CPU余裕＋16GB以上（IDE/仮想環境）</li>
              <li>芸術/デザイン：色域と明るさ、広いストレージ</li>
              <li>経済/経営：表計算の視認性と配列の素直さ</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="早見表：用途別の目安">
            <BlogParagraph>
              初期判断に役立つ基準です。実習や課題の内容で前後しますが、迷ったらここから。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>用途</BlogTableCell>
                <BlogTableCell isHeader>重視ポイント</BlogTableCell>
                <BlogTableCell isHeader>推奨の目安</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>レポート/資料作成</BlogTableCell>
                  <BlogTableCell>携帯性×入力快適</BlogTableCell>
                  <BlogTableCell>1.3kg以下/13-14インチ/静かなキーボード</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>オンライン授業</BlogTableCell>
                  <BlogTableCell>会議品質</BlogTableCell>
                  <BlogTableCell>FHDカメラ/ノイズ抑制マイク/明瞭スピーカー</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>プログラミング初学</BlogTableCell>
                  <BlogTableCell>粘りと見通し</BlogTableCell>
                  <BlogTableCell>16GB・512GB/外部モニター前提</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>画像/動画の基礎演習</BlogTableCell>
                  <BlogTableCell>画面×ストレージ</BlogTableCell>
                  <BlogTableCell>広色域/明るさ300nit+/1TB構成</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方の軸：投資が効くポイント">
            <BlogParagraph>
              価格を上げれば良いわけではありません。あなたの“遅い部分”に投資すると満足度が伸びます。
            </BlogParagraph>

            <BlogParagraph>
              持ち運びがつらいなら重量とUSB‑C充電の汎用性を優先。聞き取りづらさが課題ならマイクとスピーカー品質に配分し、固まるならメモリ16GBとSSD空きを確保。集中したいなら非光沢画面と静かなキーボードです。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="価格帯の狙い目：少しの上乗せで変わる">
            <BlogParagraph>
              エントリー帯は“動くが下限”。中位帯に上げると入力体験と会議品質が改善し、毎日の満足度が上がります。
            </BlogParagraph>

            <BlogParagraph>
              上位帯は長期使用で差が出ます。筐体剛性と画面品質の安定が、卒業までの相棒感につながります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="購入前チェックリスト：後悔を防ぐ確認">
            <BlogParagraph>
              店頭確認が難しくても、レビューと仕様で次をチェック。使い始めのギャップを減らします。
            </BlogParagraph>

            <BlogList>
              <li>キーボード配列（Enter/矢印/Backspace周り）が素直か</li>
              <li>明るさと反射、屋外/教室での見やすさ</li>
              <li>USB‑C給電対応とアダプタの携行性</li>
              <li>カメラ/マイク品質のレビュー傾向</li>
              <li>重量とACアダプターを足した総重量</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="ケーススタディ：学内と自宅を1本でつなぐ">
            <BlogParagraph>
              自宅はドック1本で外部モニター/有線LAN/電源をまとめる。持ち出し時はケーブルを抜くだけで切り替え完了です。
            </BlogParagraph>

            <BlogParagraph>
              小さな手間を減らすと、着席から作業開始までが速くなります。日々の積み重ねが学習時間を増やします。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              総合スコア順で上位を見て、重量/電池/会議品質で3台に絞りましょう。最後に価格で決めます。
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


