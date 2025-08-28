'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article17Page() {
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
        title={'ゲーム用ノートPCの選び方｜GPU別ランキングと価格帯'}
        date={'2025-08-07'}
      >
        <BlogContent>
          <BlogParagraph>
            まず決めるのは狙うフレームレートと解像度。そこからGPUクラスを逆算し、筐体の冷却力で最終調整するのが近道です。
          </BlogParagraph>

          <BlogParagraph>
            価格の“谷/山”を見極めると、少しの上乗せで体験が跳ねる帯が分かります。無理に最上位へ行かないのもコツです。
          </BlogParagraph>

          <BlogSection title="結論：GPUクラスから逆算する">
            <BlogParagraph>
              FHD144Hzなら中位GPUで十分。WQHD165Hzは中上位が現実解。4Kは品質優先の60fps運用が無理なく快適です。
            </BlogParagraph>

            <BlogParagraph>
              同じGPUでも冷却が弱いと伸びません。薄型軽量より、放熱に余裕がある筐体が安定します。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="早見表：解像度×リフレッシュの現実解">
            <BlogParagraph>
              ざっくり傾向を掴むための早見表です。ゲームや設定次第で前後しますが、初期判断の基準になります。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>ターゲット</BlogTableCell>
                <BlogTableCell isHeader>目安GPU</BlogTableCell>
                <BlogTableCell isHeader>設定感覚</BlogTableCell>
                <BlogTableCell isHeader>筐体の要件</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>FHD/144Hz</BlogTableCell>
                  <BlogTableCell>中位クラス</BlogTableCell>
                  <BlogTableCell>中〜高設定</BlogTableCell>
                  <BlogTableCell>標準厚×十分な吸排気</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>WQHD/165Hz</BlogTableCell>
                  <BlogTableCell>中上位クラス</BlogTableCell>
                  <BlogTableCell>中設定＋最適化</BlogTableCell>
                  <BlogTableCell>放熱余裕、静音は要妥協</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>4K/60fps</BlogTableCell>
                  <BlogTableCell>上位クラス</BlogTableCell>
                  <BlogTableCell>高品質60fps狙い</BlogTableCell>
                  <BlogTableCell>厚め筐体、電源容量大</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方の軸：体験を左右する3要素">
            <BlogParagraph>
              スペック表にない“体感差”はここで生まれます。あなたの優先度に合わせて投資配分を決めましょう。
            </BlogParagraph>

            <BlogList>
              <li>冷却と騒音：長時間プレイでのサーマルスロットリング</li>
              <li>電源設計：AC容量とGPUのTGP設定の余裕</li>
              <li>画面品質：応答速度、明るさ、リフレッシュの安定性</li>
              <li>キーボード：同時押し、配列、打鍵感の好み</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="価格帯の狙い目：少しの上乗せで変わる">
            <BlogParagraph>
              エントリー帯は“動くが下限”の体験。中位帯に上げると、画質とフレームの両立が見えてきます。
            </BlogParagraph>

            <BlogParagraph>
              上位帯は妥協の少ない快適性。プレイ時間が長い・競技性が高いなら、投資の効果が明確に出ます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="購入前チェックリスト：失敗しない確認">
            <BlogParagraph>
              実機のレビュー傾向と仕様の“抜け”を合わせて見ます。買ってからの後悔を防ぐ最終確認です。
            </BlogParagraph>

            <BlogList>
              <li>GPUのTGPと可変上限、パフォーマンスモード時の温度</li>
              <li>吸排気レイアウトと騒音傾向、膝上使用の可否</li>
              <li>液晶の応答速度と残像、WQHD時のスケーリング</li>
              <li>ポート構成（右手側の排気・USB配置の干渉）</li>
              <li>重量とACアダプターの携行しやすさ</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="ケーススタディ：電力制御で快適性を底上げ">
            <BlogParagraph>
              GPUの電力を少し絞ると、温度と騒音が落ち着き、平均fpsが安定することがあります。体感の滑らかさが上がります。
            </BlogParagraph>

            <BlogParagraph>
              最高設定に固執せず、画質項目を数点下げる。入力遅延と視認性を優先した調整が実戦的です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              総合スコア順で上位を確認し、冷却と画面の質で3台に絞りましょう。最後に価格と重量で決めます。
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


