import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(54)

function priceOf(pc: ServerPcWithCpuSpec) {
  return pc.real_price || pc.price || null
}

function filterUnderPrice(pcs: ServerPcWithCpuSpec[], maxPrice: number) {
  return pcs.filter((pc) => {
    const price = priceOf(pc)
    return price !== null && price <= maxPrice
  })
}

export default async function Article54Page() {
  const pcs = filterUnderPrice(await fetchPcList('cost_performance'), 70000)

  return (
    <PcDbArticle
      articlePath="/blog/article54"
      title="7万円以下で選ぶAmazon PC 2026｜実用構成をPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="7万円以下のPCは、低価格を維持しながらメモリ16GBやSSD512GBの候補をかなり選びやすくなる価格帯です。5万円以下や6万円以下では構成が限られる一方、10万円までは出したくない人にとって現実的な落としどころになります。この記事ではSpecsyのPC-DBから7万円以下のAmazon PCを抽出し、価格だけでなく実用構成まで比較します。"
      conclusionTitle="結論｜7万円以下は16GB/512GBを基準に選ぶ"
      conclusion="7万円以下では、文書作成、Web閲覧、動画視聴、学習、在宅作業向けのメインPC候補が増えます。安さだけで選ぶのではなく、メモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を見て、必要ならGPU名も確認してください。"
      criteriaTitle="7万円以下PCで優先する基準"
      criteria={[
        '10万円までは出したくないが実用構成を狙うなら7万円以下を見る',
        'メモリ16GBとSSD512GB以上を基準にして候補を絞る',
        'CPUはCore/Ryzen/N95/N100/N150の名前だけでなく詳細型番を見る',
        '動画編集や3Dゲーム目的ならGPU名を確認し、10万円以下や15万円以下も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、7万円以下という価格条件で抽出したうえで、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表で比較できます。6万円以下から少し予算を広げたとき、16GB/512GB構成がどれだけ増えるかを実データで確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で7万円以下の価格が確認できる候補を、コスパスコア順に並べたものです。価格は変動するため、最終価格と在庫は商品リンク先で確認してください。"
      faq={[
        {
          question: '7万円以下のPCはメインPCにできますか？',
          answer: '文書作成、Web閲覧、動画視聴、学習、在宅作業中心なら候補になります。長く使うならメモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を確認してください。',
        },
        {
          question: '6万円以下と7万円以下ではどちらを見るべきですか？',
          answer: '価格を最優先するなら6万円以下、実用構成の候補数を増やしたいなら7万円以下まで広げるのが現実的です。特にメモリ16GBやSSD512GB以上を狙う場合は7万円以下も確認する価値があります。',
        },
      ]}
      pcs={pcs}
    />
  )
}
