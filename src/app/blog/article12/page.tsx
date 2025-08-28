'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article12Page() {
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
        title={'UMPC おすすめ 5選【2025年最新】超小型ノートPC徹底比較ガイド'}
        date={'2025-08-28'}
      >
        <BlogContent>
          <BlogParagraph>
            毎日持ち歩けるコンパクトなPC「UMPC」をお探しの方へ。カフェの小さなテーブルでも作業しやすく、通勤カバンに収まるサイズ感が魅力です。
          </BlogParagraph>

          <BlogSection title="結論｜小型でも作業効率を落とさない3つの条件">
            <BlogParagraph>
              UMPCは体験重視で選ぶと満足度が高くなります。スペックより使い勝手を優先しましょう。
            </BlogParagraph>
            <BlogList>
              <li>軽量性と画面品質の両立（1.0〜1.3kg、明るさ300nit以上、非光沢推奨）</li>
              <li>キーボード配置とタッチパッドの使いやすさ（矢印キー位置、パームリジェクション）</li>
              <li>USB-C給電対応でドック運用前提（据え置き時の拡張性確保）</li>
              <li>バッテリー実用6時間以上（省電力CPU搭載モデル優先）</li>
            </BlogList>
            <BlogParagraph>
              性能は必要十分で構いません。軽作業なら省電力CPUで十分です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="UMPC選びの3つの軸｜トレードオフを理解する">
            <BlogParagraph>
              小型化には必ず妥協点があります。何を優先するかで選択が変わります。
            </BlogParagraph>
            <BlogParagraph>
              軽さを取れば画面が小さくなり、性能を上げれば発熱と騒音が増します。バッテリーを大きくすれば重量が増加。この関係を理解した上で、あなたの使用シーンで最も重要な要素から逆算して選びましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="用途別の目安スペック｜実用レベルの指標">
            <table>
              <thead>
                <tr>
                  <th>用途</th>
                  <th>重視ポイント</th>
                  <th>推奨スペック</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>文書作成・メール</td>
                  <td>軽量×電池持ち</td>
                  <td>省電力CPU/8GBメモリ/6時間駆動</td>
                </tr>
                <tr>
                  <td>軽い開発・画像編集</td>
                  <td>メモリ×放熱設計</td>
                  <td>最新CPU/16GBメモリ/静音ファン</td>
                </tr>
                <tr>
                  <td>プレゼン・外回り</td>
                  <td>携帯性×接続性</td>
                  <td>1kg以下/HDMI出力/USB-C給電</td>
                </tr>
                <tr>
                  <td>学習・研究</td>
                  <td>画面品質×入力体験</td>
                  <td>非光沢/キーピッチ16mm以上/長時間駆動</td>
                </tr>
              </tbody>
            </table>
            <BlogParagraph>
              これらは目安です。実際の使用頻度と環境で最適解は変わります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="価格帯別の特徴｜投資ポイントの違い">
            <BlogParagraph>
              8万円以下はエントリーモデル。基本性能は確保されていますが画面の明るさや筐体剛性に妥協が必要です。
            </BlogParagraph>
            <BlogParagraph>
              12-18万円が最もバランスの良い価格帯。16GBメモリ、良好なキーボード、十分な明るさの画面を確保できます。20万円以上は軽量化や高解像度ディスプレイ、プレミアム素材への投資領域となります。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="購入前チェックリスト｜失敗を避ける確認項目">
            <BlogList>
              <li>実際の重量感と持ち運び時のサイズ感（毎日の通勤・通学を想定）</li>
              <li>キーボード配列とタイプミスの頻度（特に矢印キー、Enter周辺）</li>
              <li>画面の明るさと反射具合（使用環境の照明条件で確認）</li>
              <li>USB-C給電の対応とモバイルバッテリー充電の可否</li>
              <li>ドック接続時の動作安定性（外部モニター、USB-A機器）</li>
            </BlogList>
            <BlogParagraph>
              可能な限り実機での確認をおすすめします。オンラインレビューだけでは分からない感覚的な部分が重要です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="実際の運用例｜大学院生の1日">
            <BlogParagraph>
              通学の往復で論文を読み、空きコマでメモを整理し、カフェでレポート執筆。帰宅後は外部ディスプレイに接続して参考資料を並べる使い方。
            </BlogParagraph>
            <BlogParagraph>
              この運用では、UMPCの「すぐに開けて、すぐに片付けられる」機動力がフルに活かされます。起動の速さが作業機会を増やし、トータルの学習効率を押し上げる好例です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="長期使用のコツ｜満足度を維持する方法">
            <BlogParagraph>
              外付けキーボードとマウスを揃えると、据え置き時の作業効率が大幅に向上します。
            </BlogParagraph>
            <BlogParagraph>
              画面サイズの制約は外部モニターで補完。USB-Cドック一本で電源・映像・周辺機器をまとめると、切り替えがスムーズになり小型PCの利便性が最大化されます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="最適なUMPCを見つける手順">
            <BlogParagraph>
              候補選びは段階的に絞り込むのが効率的です。まず用途と予算で大まかに絞り込みましょう。
            </BlogParagraph>
            <BlogParagraph>
              迷った場合は、総合スコア順で性能を比較し、あなたの優先軸（軽量性/画面品質/バッテリー/価格）で3台程度に絞り込んでください。最終的には実機での操作感と長期使用を想定した満足度で判断するのが確実です。
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