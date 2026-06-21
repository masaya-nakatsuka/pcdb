import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(39)

function priceOf(pc: ServerPcWithCpuSpec) {
  return pc.real_price || pc.price || null
}

function filterUnderPrice(pcs: ServerPcWithCpuSpec[], maxPrice: number) {
  return pcs.filter((pc) => {
    const price = priceOf(pc)
    return price !== null && price <= maxPrice
  })
}

export default async function Article39Page() {
  const pcs = filterUnderPrice(await fetchPcList('cost_performance'), 150000)

  return (
    <PcDbArticle
      articlePath="/blog/article39"
      title="15万円以下で選ぶAmazon PC 2026｜CPU・GPUまでPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="15万円以下のPCは、普段使いだけでなく、軽いゲームや動画編集まで候補が広がる価格帯です。ただし同じ価格でもCPU世代、GPU、メモリ、SSDの差が大きいため、SpecsyのPC-DBから15万円以下のAmazon PCを抽出して比較します。"
      conclusionTitle="15万円以下はCPU型番とGPU名まで見て用途を決める"
      conclusion="15万円以下では、Core i5/Ryzen 5の上位構成、Core i7/Ryzen 7系、専用GPU搭載機が混ざります。文書作業中心ならCPUとメモリ、ゲームや動画編集も考えるならGPU名とSSD容量まで同時に確認すると、価格だけ高い構成を避けやすくなります。"
      criteriaTitle="15万円以下PCで優先する基準"
      criteria={[
        'CPUはCore/Ryzenの大分類ではなく、Core Ultra 5 125HやRyzen 7 8840HSなど詳細型番を見る',
        'ゲームや動画編集を考えるなら、GPU列でRTX/GTX/Radeon RX/Intel Arcなどの専用GPU有無を確認する',
        'メモリは16GBを最低ラインにし、動画編集や長期利用では32GBも候補にする',
        'SSDは512GB以上を基準にし、素材保存やゲーム用途では1TB構成も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、15万円以下という価格条件で絞ったうえで、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表に並べます。価格帯ごとの候補を実データで比較できるため、一般的なおすすめ記事よりも用途別の向き不向きを判断しやすいです。"
      tableDescription="下表は、PC-DB内で15万円以下の価格が確認できる候補を、コスパスコア順に並べたものです。15万円以下は価格変動が大きいため、最終価格と在庫は商品リンク先で確認してください。"
      faq={[
        {
          question: '15万円以下ならゲームや動画編集もできますか？',
          answer: '候補になります。ただし快適さはGPU、CPU型番、メモリ容量で変わります。3Dゲームや4K編集を重視するなら、専用GPU搭載機やメモリ32GB構成も比較してください。',
        },
        {
          question: '10万円以下の記事と何が違いますか？',
          answer: '10万円以下は普段使いとコスパ重視、15万円以下は軽いクリエイティブ用途やゲームも視野に入る価格帯です。CPU/GPUの選択肢が広がるため、GPU列と用途別スコアを見る価値が高くなります。',
        },
      ]}
      pcs={pcs}
    />
  )
}
