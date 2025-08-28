'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article14Page() {
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
        title={'バッテリー長持ち ノートPC おすすめ【2025年最新】駆動時間で選ぶ最強機種'}
        date={'2025-08-28'}
      >
        <BlogContent>
          <BlogParagraph>
            長時間の外出先作業でバッテリー切れに悩んでいませんか？オンライン授業、出張、カフェでの作業など、電源がない環境でも安心して使えるノートPCの選び方をご紹介します。
          </BlogParagraph>

          <BlogSection title="結論｜バッテリー長持ちPCの3つの条件">
            <BlogParagraph>
              真のバッテリー性能は公称値だけでは判断できません。実使用での持続時間を左右する要素を理解して選びましょう。
            </BlogParagraph>
            <BlogList>
              <li>省電力CPU搭載（最新世代の低電圧版）で基礎消費電力を抑制</li>
              <li>画面輝度とリフレッシュレートの最適化（400nit以下、60Hz固定推奨）</li>
              <li>大容量バッテリー（70Wh以上）と軽量性のバランス確保</li>
              <li>電力管理機能の充実（アダプティブバッテリー、省電力モード）</li>
            </BlogList>
            <BlogParagraph>
              公称10時間でも実用6-8時間なら十分。使用環境に応じた設定調整が重要です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="バッテリー性能の見極め方｜数値の裏にある真実">
            <BlogParagraph>
              メーカー公表値は理想的な条件での測定値です。実際の使用では画面輝度、WiFi接続、アプリの動作が大きく影響します。
            </BlogParagraph>
            <BlogParagraph>
              重要なのは「どんな作業でどれくらい持つか」の具体的な目安。動画視聴なら6-8時間、文書作成なら8-10時間、開発作業なら5-7時間程度が現実的なライン。CPU負荷とディスプレイ輝度の調整で大幅に延長可能です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="用途別バッテリー消費目安｜実測ベースの指標">
            <BlogParagraph>
              使用状況別のバッテリー消費量を把握すると、必要な容量が見えてきます。
            </BlogParagraph>
            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>作業内容</BlogTableCell>
                <BlogTableCell isHeader>消費電力目安</BlogTableCell>
                <BlogTableCell isHeader>70Wh時の駆動時間</BlogTableCell>
                <BlogTableCell isHeader>推奨設定</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>文書作成・メール</BlogTableCell>
                  <BlogTableCell>7-10W</BlogTableCell>
                  <BlogTableCell>7-10時間</BlogTableCell>
                  <BlogTableCell>輝度50%、省電力モード</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>Webブラウジング</BlogTableCell>
                  <BlogTableCell>8-12W</BlogTableCell>
                  <BlogTableCell>6-9時間</BlogTableCell>
                  <BlogTableCell>広告ブロッカー使用推奨</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>動画視聴・オンライン授業</BlogTableCell>
                  <BlogTableCell>10-15W</BlogTableCell>
                  <BlogTableCell>5-7時間</BlogTableCell>
                  <BlogTableCell>輝度調整、有線イヤホン</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>軽いプログラミング</BlogTableCell>
                  <BlogTableCell>12-18W</BlogTableCell>
                  <BlogTableCell>4-6時間</BlogTableCell>
                  <BlogTableCell>不要なサービス停止</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
            <BlogParagraph>
              実際の駆動時間は環境によって変動します。余裕をもって計算することをおすすめします。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="省電力設計のポイント｜長持ちする理由">
            <BlogParagraph>
              最新の省電力CPUは性能を維持しながら消費電力を大幅削減。特に軽作業時の効率が格段に向上しています。
            </BlogParagraph>
            <BlogParagraph>
              ディスプレイは消費電力の最大要因。OLED画面は黒表示時に省電力ですが、白背景が多い作業では液晶の方が有利な場合も。解像度とリフレッシュレートも電力消費に直結するため、用途に応じた選択が重要です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="充電速度と電力管理｜実用性を高める機能">
            <BlogParagraph>
              USB-C PD対応は必須機能。65W以上の急速充電なら30分で50%程度の回復が可能です。
            </BlogParagraph>
            <BlogParagraph>
              バッテリー劣化を防ぐ機能も長期使用には重要。充電上限設定（80%止め）や適応充電機能があると、2-3年後も良好な状態を維持できます。モバイルバッテリーでの給電対応も外出先での安心材料になります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="バッテリー長持ち運用術｜設定とコツ">
            <BlogList>
              <li>画面輝度を環境に応じて調整（屋内なら30-50%で十分な場合が多い）</li>
              <li>不要なバックグラウンドアプリとサービスの停止</li>
              <li>Wi-Fiとブルートゥースの最適化（未使用時はオフ）</li>
              <li>電力プランの活用（バランスモード、省電力モード）</li>
              <li>定期的なバッテリー校正とメンテナンス</li>
            </BlogList>
            <BlogParagraph>
              小さな工夫の積み重ねで、駆動時間を20-30%延長できることも珍しくありません。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="外出先での電源確保｜補完手段">
            <BlogParagraph>
              完璧なバッテリーは存在しないため、補完手段の準備も重要です。
            </BlogParagraph>
            <BlogParagraph>
              20000mAh以上のモバイルバッテリーがあれば、ほとんどのノートPCを1-2回フル充電できます。カフェや図書館、コワーキングスペースの電源席確保も実用的な選択肢。長時間作業では電源アダプターの携行も検討しましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="長期使用での注意点｜バッテリー劣化対策">
            <BlogParagraph>
              リチウムイオンバッテリーは使用とともに劣化します。2-3年で容量が80%程度になるのが一般的です。
            </BlogParagraph>
            <BlogParagraph>
              劣化を遅らせるには、極端な充放電の回避、高温環境での使用制限、長期間の満充電状態回避が有効。交換可能モデルなら部品調達とコストも事前確認しておきましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="最適なバッテリー長持ちPCを見つける方法">
            <BlogParagraph>
              用途と予算に応じて、必要な駆動時間を具体的に設定しましょう。過度な長時間駆動を求めると重量とコストが跳ね上がります。
            </BlogParagraph>
            <BlogParagraph>
              総合的な評価で候補を絞り、実際のレビューやバッテリーテスト結果を参考に最終判断することをおすすめします。
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