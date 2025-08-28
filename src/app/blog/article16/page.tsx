'use client'

import BlogLayout from '../../../components/blog/BlogLayout'
import { BlogArticle, BlogContent, BlogSection, BlogParagraph, BlogList, BlogTable, BlogTableHeader, BlogTableCell, BlogTableRow, BlogTableBody } from '@/components/blog/BlogArticle'
import { useEffect, useState } from 'react'
import ClientPcList from '../../pc-list/ClientPcList'
import { fetchPcList } from '../../pc-list/fetchPcs'
import type { ClientPcWithCpuSpec } from '../../../components/types'

export default function Article16Page() {
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
        title={'動画編集用の最低スペック目安｜価格と快適さの境界線'}
        date={'2025-08-06'}
      >
        <BlogContent>
          <BlogParagraph>
            カット多めの短編か、色補正やテロップを重ねる長尺かで“快適さ”は変わります。解像度、コーデック、尺とトラック数——作業の現実から逆算して考えます。
          </BlogParagraph>

          <BlogParagraph>
            本稿では、まず結論の目安を示し、次に選び方の軸と価格帯の境界線を整理します。最終行でCTAを1回だけ置き、迷いを素早く解きます。
          </BlogParagraph>

          <BlogSection title="結論：まずここを超えると“作業が進む”">
            <BlogParagraph>
              FHD編集中心なら、省電力寄りの最新世代CPU＋16GBメモリで“詰まらない”が実現します。SSDの空き容量と読み書き速度も体感を大きく左右します。
            </BlogParagraph>

            <BlogParagraph>
              4K素材が混ざるなら、CPUの余裕と高速ストレージを用意。短尺なら内蔵GPUでも粘れますが、安定したプレビューは外部GPUが一歩先です。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="早見表：用途別の“境界線”目安">
            <BlogParagraph>
              ざっくり判断のための早見表です。コーデックや最適化次第で前後しますが、初期投資の目安として役立ちます。
            </BlogParagraph>

            <BlogTable>
              <BlogTableHeader>
                <BlogTableCell isHeader>用途</BlogTableCell>
                <BlogTableCell isHeader>重視</BlogTableCell>
                <BlogTableCell isHeader>CPU目安</BlogTableCell>
                <BlogTableCell isHeader>GPU</BlogTableCell>
                <BlogTableCell isHeader>RAM</BlogTableCell>
                <BlogTableCell isHeader>ストレージ</BlogTableCell>
              </BlogTableHeader>
              <BlogTableBody>
                <BlogTableRow>
                  <BlogTableCell>FHD短編中心</BlogTableCell>
                  <BlogTableCell>滑らかプレビュー</BlogTableCell>
                  <BlogTableCell>最新U/Pクラス</BlogTableCell>
                  <BlogTableCell>iGPUで可</BlogTableCell>
                  <BlogTableCell>16GB</BlogTableCell>
                  <BlogTableCell>NVMe/空き200GB+</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>4K短尺混在</BlogTableCell>
                  <BlogTableCell>書出し安定</BlogTableCell>
                  <BlogTableCell>上位P/Hクラス</BlogTableCell>
                  <BlogTableCell>dGPU推奨</BlogTableCell>
                  <BlogTableCell>16〜32GB</BlogTableCell>
                  <BlogTableCell>高速NVMe</BlogTableCell>
                </BlogTableRow>
                <BlogTableRow>
                  <BlogTableCell>長尺/多トラック</BlogTableCell>
                  <BlogTableCell>編集体感</BlogTableCell>
                  <BlogTableCell>Hクラス以上</BlogTableCell>
                  <BlogTableCell>中位以上</BlogTableCell>
                  <BlogTableCell>32GB</BlogTableCell>
                  <BlogTableCell>内外部合わせ1TB+</BlogTableCell>
                </BlogTableRow>
              </BlogTableBody>
            </BlogTable>
          </BlogSection>

          <BlogSection title="選び方の軸：どこに投資すると効くか">
            <BlogParagraph>
              価格を上げれば速くなる——は半分だけ正解です。あなたの工程で“最も遅い部分”に投資すると費用対効果が跳ね上がります。
            </BlogParagraph>

            <BlogList>
              <li>プレビューが途切れる→CPUとGPU、プロキシ運用の導入</li>
              <li>書き出しが遅い→CPU上位化、エンコード支援の活用</li>
              <li>素材読み込みが重い→NVMeと空き容量、外付けSSDを併用</li>
              <li>アプリが落ちる→メモリを32GBに、常駐整理</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="価格帯の境界線：快適さが変わる瞬間">
            <BlogParagraph>
              エントリー帯では“待てるが流れは切れる”が起きがち。中位帯に乗ると、プレビューと書き出しの両方でストレスが減ります。
            </BlogParagraph>

            <BlogParagraph>
              上位帯は時短が明確に効きます。本数が多い、納期がある、学習時間を短縮したい——そんな状況で投資価値が出ます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="チェックリスト：買う前に確認する4点">
            <BlogParagraph>
              初期設定や運用で差が出ます。購入前に以下を確認して、後悔を避けましょう。
            </BlogParagraph>

            <BlogList>
              <li>空き容量は素材/キャッシュ込みで200GB以上確保できるか</li>
              <li>メモリ16GBで足りる運用か、32GBに上げる計画があるか</li>
              <li>外付けSSDはUSB‑C/Thunderboltで安定運用できるか</li>
              <li>編集ソフトのハードウェア支援に対応しているか</li>
            </BlogList>
          </BlogSection>

          <BlogSection title="ケーススタディ：プロキシで“体感”を取り戻す">
            <BlogParagraph>
              4K素材でプレビューが途切れるなら、プロキシを使うと滑らかさが戻ります。完成時だけ高解像度に切り替えるやり方です。
            </BlogParagraph>

            <BlogParagraph>
              ハードを上げるよりも、まずは運用で“遅い部分”を避ける。小さな工夫が、編集のリズムを守ってくれます。
            </BlogParagraph>
          </BlogSection>

          <BlogSection title="次のアクション">
            <BlogParagraph>
              迷ったら、まず"総合スコア順"の一覧から上位機種をざっと確認し、あなたの軸で3台に絞ってみてください。
            </BlogParagraph>
            <BlogParagraph>
              最終的には実際の使用感とアフターサポートを重視して判断してください。動画編集に最適な一台選びが重要です。
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


