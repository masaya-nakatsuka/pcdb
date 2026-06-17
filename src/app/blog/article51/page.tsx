import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(51)

function priceOf(pc: ServerPcWithCpuSpec) {
  return pc.real_price || pc.price || null
}

function filterUnderPrice(pcs: ServerPcWithCpuSpec[], maxPrice: number) {
  return pcs.filter((pc) => {
    const price = priceOf(pc)
    return price !== null && price <= maxPrice
  })
}

export default async function Article51Page() {
  const pcs = filterUnderPrice(await fetchPcList('cost_performance'), 60000)

  return (
    <PcDbArticle
      articlePath="/blog/article51"
      title="6万円以下で選ぶAmazon PC 2026｜低価格PCをPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="6万円以下のPCは、5万円以下より候補が広がり、メモリ16GBやSSD512GBの構成も見つけやすくなる価格帯です。一方で、CPU型番やバッテリー、GPUの差を見ないと、安さだけで選んで後悔しやすい領域でもあります。この記事ではSpecsyのPC-DBから6万円以下のAmazon PCを抽出し、低価格でも実用的な候補を比較します。"
      conclusionTitle="結論｜6万円以下は16GB/512GB構成まで狙える"
      conclusion="6万円以下では、文書作成、Web閲覧、動画視聴、学習用なら十分候補になるPCがあります。5万円以下に固定すると構成が弱くなりやすいため、少し予算を広げてメモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を確認するのが現実的です。"
      criteriaTitle="6万円以下PCで優先する基準"
      criteria={[
        '5万円以下で物足りない場合は6万円以下まで広げて候補数を増やす',
        'メモリ16GBとSSD512GB以上の構成を優先して長く使いやすくする',
        'N95/N100/N150やCore/Ryzenの詳細型番を確認して世代差を見る',
        '動画編集や3Dゲーム目的なら、GPU名を確認し10万円以下以上も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、6万円以下という価格条件で抽出したうえで、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表で比較できます。5万円以下では削られがちなメモリやSSDが、6万円以下ではどれだけ改善するかを実データで確認できます。"
      tableDescription="下表は、PC-DB内で6万円以下の価格が確認できる候補を、コスパスコア順に並べたものです。価格は変動するため、最終価格と在庫は商品リンク先で確認してください。"
      faq={[
        {
          question: '6万円以下のPCは5万円以下より選びやすいですか？',
          answer: '選びやすくなります。5万円以下よりメモリ16GBやSSD512GB以上の候補が増えるため、メインPCに近い使い方を考えるなら6万円以下まで広げる価値があります。',
        },
        {
          question: '6万円以下でゲームや動画編集はできますか？',
          answer: '軽い作業なら可能な場合がありますが、3Dゲームや本格的な動画編集には厳しい候補が多いです。GPU名を確認し、必要なら10万円以下や15万円以下の候補も比較してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
