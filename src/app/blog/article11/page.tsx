'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article11Page() {
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
        title={'ノートPC おすすめ 初心者【2025年最新】失敗しない選び方完全ガイド'}
        date={'2025-08-28'}
      >
        <BlogContent>
          <BlogParagraph>
            初めてのノートPC選び、どこから始めれば良いかわからない方へ。オンライン授業、テレワーク、プライベート用途まで、あなたの使い方に最適な一台を見つける方法をご紹介します。
          </BlogParagraph>

          <BlogSection title="結論｜初心者が重視すべき3つのポイント">
            <BlogParagraph>
              初心者の方は性能より使いやすさを優先すると満足度が高くなります。複雑なスペックより体験の質で選びましょう。
            </BlogParagraph>
            <BlogList>
              <li>持ち運び重視なら1.5kg以下、画面は13-14インチが使いやすい</li>
              <li>メモリ8GB以上、SSD256GB以上で動作ストレスを回避</li>
              <li>USB-C充電対応で将来の拡張性と利便性を確保</li>
              <li>予算は用途に応じて8-15万円が現実的なライン</li>
            </BlogList>
            <BlogParagraph>
              まずは基本を押さえて、慣れてから必要に応じてアップグレード検討が賢い選択です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="ノートPC選びの基本｜何を重視するか決める">
            <BlogParagraph>
              用途を明確にすると必要なスペックが見えてきます。オーバースペックは予算の無駄遣いになりがちです。
            </BlogParagraph>
            <BlogParagraph>
              文書作成とネット閲覧中心なら基本スペックで十分。動画編集や本格的なゲームを考えているなら、CPU とグラフィック性能に投資が必要です。持ち運び頻度が高いなら軽量性と電池持ちを優先しましょう。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="用途別おすすめスペック｜迷わない目安一覧">
            <BlogParagraph>
              下記は用途別の推奨スペックです。予算と相談して最適なバランスを見つけてください。
            </BlogParagraph>
            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>用途</BlogTableCell>
                <BlogTableCell isHeader>CPU</BlogTableCell>
                <BlogTableCell isHeader>メモリ・ストレージ</BlogTableCell>
                <BlogTableCell isHeader>予算目安</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>文書作成・ネット・動画視聴</BlogTableCell>
                  <BlogTableCell>Core i3 / Ryzen 3</BlogTableCell>
                  <BlogTableCell>8GB・256GB SSD</BlogTableCell>
                  <BlogTableCell>8-10万円</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>オンライン授業・テレワーク</BlogTableCell>
                  <BlogTableCell>Core i5 / Ryzen 5</BlogTableCell>
                  <BlogTableCell>8-16GB・512GB SSD</BlogTableCell>
                  <BlogTableCell>10-13万円</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>軽い画像編集・プログラミング</BlogTableCell>
                  <BlogTableCell>Core i5-i7 / Ryzen 5-7</BlogTableCell>
                  <BlogTableCell>16GB・512GB SSD</BlogTableCell>
                  <BlogTableCell>13-18万円</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>動画編集・ゲーミング</BlogTableCell>
                  <BlogTableCell>Core i7-i9 / Ryzen 7-9</BlogTableCell>
                  <BlogTableCell>16-32GB・1TB SSD・専用GPU</BlogTableCell>
                  <BlogTableCell>18-30万円</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
            <BlogParagraph>
              これらは目安です。使用頻度や他の優先要素（軽量性、デザインなど）も含めて総合判断してください。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="失敗しない選び方｜チェックポイント">
            <BlogParagraph>
              スペック以外の要素も長期使用の満足度に大きく影響します。見落としがちなポイントを確認しましょう。
            </BlogParagraph>
            <BlogParagraph>
              キーボードの打ち心地は毎日使うなら重要。画面の明るさとコントラストは目の疲労に直結。バッテリー持続時間は実使用で6-8時間あれば外出時も安心です。ポート類（USB-A、HDMI、USB-C）の配置と数も日常の利便性を左右します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="価格帯別の特徴｜コスパの良い選択肢">
            <BlogParagraph>
              8万円以下は最低限の性能に割り切り。基本的な作業には対応できますが将来性は限定的です。
            </BlogParagraph>
            <BlogParagraph>
              10-15万円が最もバランスが良い価格帯。多くのユーザーにとって十分な性能と品質を確保でき、3-4年は快適に使用できます。20万円以上はプレミアム機能や高性能を求める層向けで、長期間の高いパフォーマンスが期待できます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="購入前の最終チェック｜後悔を避けるポイント">
            <BlogList>
              <li>実際の使用場面を具体的に想像（持ち運び頻度、使用時間、作業内容）</li>
              <li>保証期間とサポート体制（メーカー保証、修理対応の利便性）</li>
              <li>拡張性（メモリ増設可能性、外部機器接続のしやすさ）</li>
              <li>レビューと評判（特に同じ用途での使用者の感想）</li>
              <li>予算に対する性能と機能のバランス確認</li>
            </BlogList>
            <BlogParagraph>
              可能であれば店頭で実機を触って、キーボードの感触や画面の見やすさを確認することを強くおすすめします。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="よくある失敗例｜初心者が陥りがちな罠">
            <BlogParagraph>
              「とりあえず高性能なものを」という選択で予算オーバーになるケース。用途に対してオーバースペックは無駄遣いです。
            </BlogParagraph>
            <BlogParagraph>
              逆に安さだけで選んで動作が重くストレスになるパターンも避けたいところ。最低限のスペック（8GBメモリ、SSD）は確保して、快適な使用体験を優先しましょう。重量を軽視して毎日の持ち運びが苦痛になることも多い失敗例です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="最適な一台を見つける手順">
            <BlogParagraph>
              用途と予算を明確にして、候補を3-5台に絞り込みましょう。迷った時は総合的な評価を参考にするのが効率的です。
            </BlogParagraph>
            <BlogParagraph>
              最終的には実際の使用感とアフターサポートを重視して判断してください。初心者の方こそ、長期間安心して使える一台選びが重要です。
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