'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article13Page() {
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
        title={'2-in-1 PC おすすめ 5選【2025年最新】タブレット変形ノートPC徹底比較'}
        date={'2025-08-28'}
      >
        <BlogContent>
          <BlogParagraph>
            ノートPCとタブレットの"いいとこ取り"を狙える2-in-1 PC。画面を360度回転させてタブレット、テント、スタンドと4つのモードで使い分けできます。
          </BlogParagraph>

          <BlogSection title="結論｜用途で決まる2-in-1の選び方">
            <BlogParagraph>
              2-in-1選びは使用頻度と重要度で決まります。毎日の手書きメモなら高精度ペン、プレゼン中心なら画面品質を重視しましょう。
            </BlogParagraph>
            <BlogList>
              <li>手書きメモ重視なら筆圧4096レベル以上、遅延10ms以下のモデル</li>
              <li>プレゼン・会議用途なら明るさ400nit以上、反射防止コーティング必須</li>
              <li>持ち運び頻度高いなら1.5kg以下、ヒンジの剛性確認が重要</li>
              <li>据え置き併用ならUSB-C給電とドック対応で拡張性を確保</li>
            </BlogList>
            <BlogParagraph>
              最重要はヒンジ耐久性です。安価モデルは半年で緩みが生じるケースがあります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="2-in-1の基本｜4つのフォーム活用法">
            <BlogParagraph>
              ノートPCモードは長文作成とプログラミングに最適。キーボードの打鍵感と画面角度で生産性が決まります。
            </BlogParagraph>
            <BlogParagraph>
              タブレットモードでは手書きメモと電子書籍が快適。重量バランスと片手持ちの疲労感を事前確認しましょう。テントモードは動画視聴向け、スタンドモードは相手への画面共有で重宝します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="選び方の軸｜3つの比較ポイント">
            <BlogParagraph>
              軽量性と剛性はトレードオフ関係。毎日持ち運びなら1.3kg以下が現実的です。
            </BlogParagraph>
            <BlogParagraph>
              ペン精度は作業効率に直結。筆圧感知レベルと描画遅延、パームリジェクション機能の自然さで判断します。画面品質は屋外使用の有無で優先度が変わります。明るい環境での視認性を重視するなら400nit以上は欲しいところです。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="用途別スペック目安｜実用レベルの指標">
            <table>
              <thead>
                <tr>
                  <th>用途</th>
                  <th>重視ポイント</th>
                  <th>目安スペック</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>手書きメモ・学習</td>
                  <td>ペン精度×画面品質</td>
                  <td>筆圧4096レベル/遅延10ms以下/非光沢</td>
                </tr>
                <tr>
                  <td>プレゼン・商談</td>
                  <td>明るさ×安定性</td>
                  <td>400nit以上/ヒンジ剛性高/軽量1.5kg以下</td>
                </tr>
                <tr>
                  <td>クリエイティブ作業</td>
                  <td>色再現×性能</td>
                  <td>sRGB95%以上/16GBメモリ/専用GPU</td>
                </tr>
                <tr>
                  <td>ビジネス・Office</td>
                  <td>バッテリー×拡張性</td>
                  <td>8時間駆動/USB-C充電/ドック対応</td>
                </tr>
              </tbody>
            </table>
            <BlogParagraph>
              これらは目安値です。実際の使用環境と個人の感覚で最適解は変わります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="価格帯の特徴｜投資ポイントの違い">
            <BlogParagraph>
              10万円台前半はエントリー層向け。基本機能は揃いますがヒンジ剛性に注意が必要です。
            </BlogParagraph>
            <BlogParagraph>
              15万円前後がバランス重視の価格帯。ペン精度とビルド品質が向上し、ビジネス用途でも安心できます。20万円以上はプレミアム領域で、軽量化と高解像度、色域の広さに投資する層向けです。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="選定チェックリスト｜購入前の確認項目">
            <BlogList>
              <li>ヒンジの開閉スムーズさと固定力（店頭での実機確認推奨）</li>
              <li>タブレット時の重量バランスと片手持ちの疲労感</li>
              <li>ペン入力の遅延と筆圧感知の自然さ</li>
              <li>各モードでの安定性（テント・スタンド時の転倒リスク）</li>
              <li>USB-C充電対応と外部ディスプレイ出力品質</li>
            </BlogList>
            <BlogParagraph>
              実機での操作確認は必須です。オンラインレビューだけでは判断できません。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="運用上の注意点｜長期使用のコツ">
            <BlogParagraph>
              画面の指紋汚れが目立ちやすいため、清拭用クロスの常備をおすすめします。
            </BlogParagraph>
            <BlogParagraph>
              ヒンジ部分は消耗品と考え、保証期間と修理対応を購入前に確認しましょう。タッチ操作メインの用途では、アンチグレアフィルムで反射を軽減すると目の疲労が減ります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="最終候補の絞り込み手順">
            <BlogParagraph>
              用途と予算の軸で候補を3台程度に絞り込みます。
            </BlogParagraph>
            <BlogParagraph>
              迷ったら総合スコア順で性能比較し、あなたの重視ポイント（ペン精度/軽量性/バッテリー/価格）で最終判断してください。実機での操作感確認が決め手となります。
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