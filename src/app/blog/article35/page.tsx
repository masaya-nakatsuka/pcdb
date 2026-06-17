import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(35)

export default async function Article35Page() {
  const pcs = await fetchPcList('video_editing')

  return (
    <PcDbArticle
      articlePath="/blog/article35"
      title="動画編集向けノートPC比較 2026｜CPU・GPU・メモリをPC-DBで見る"
      date="2026-06-17"
      usage="video_editing"
      listHref="/pc-list/video-editing"
      listLabel="動画編集向けPCランキングを見る"
      lead="動画編集用PCは、CPUだけでもGPUだけでも決まりません。プレビュー、書き出し、素材管理、外出先作業まで考えると、CPU型番・GPU・メモリ・SSD・推定駆動時間をまとめて見る必要があります。"
      conclusionTitle="結論｜CPU型番・GPU・16GB以上のメモリを同時に確認する"
      conclusion="FHD編集中心なら上位内蔵GPUでも候補になりますが、4Kや長尺編集ではGPUとメモリの余裕が重要です。SpecsyではCPU型番別スコアとGPU評価を分けて見られるため、同じCore i7/Ryzen 7でも世代差を反映して比較できます。"
      criteriaTitle="動画編集PCで優先する基準"
      criteria={[
        'CPUはCore i7/Ryzen 7の名前だけでなく、Core Ultra 5 125HやRyzen 7 8840HSなど型番で見る',
        'FHD中心なら16GBメモリ、4Kや複数素材なら32GBを検討する',
        'SSDは512GB以上を最低ラインにし、素材を置くなら1TB以上が扱いやすい',
        '外出先編集をするなら、動画編集時の推定駆動時間も確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="Specsyは同じDB内で、CPU型番スコア、GPUクラス、メモリ、SSD、推定駆動時間を横並びで比較します。動画編集のように複数要素が効く用途ほど、単一スペックのおすすめ記事よりDB比較の価値が出ます。"
      faq={[
        {
          question: '動画編集はGPUよりCPUが大事ですか？',
          answer: '書き出しやエンコードではCPUが効きますが、プレビューやエフェクト、GPU支援のある編集ではGPUも効きます。どちらか一方ではなく、CPU/GPU/メモリのバランスで見るのが現実的です。',
        },
        {
          question: '8GBメモリでも動画編集できますか？',
          answer: '短いFHD素材なら動く場合はありますが、快適さと安定性を考えると16GB以上を基準にした方が無難です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
