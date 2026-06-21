import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(40)

function priceOf(pc: ServerPcWithCpuSpec) {
  return pc.real_price || pc.price || null
}

function filterUnderPrice(pcs: ServerPcWithCpuSpec[], maxPrice: number) {
  return pcs.filter((pc) => {
    const price = priceOf(pc)
    return price !== null && price <= maxPrice
  })
}

export default async function Article40Page() {
  const pcs = filterUnderPrice(await fetchPcList('cost_performance'), 50000)

  return (
    <PcDbArticle
      articlePath="/blog/article40"
      title="5万円以下で選ぶAmazon PC 2026｜激安PCをPC-DBで比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="5万円以下のPCは、安さが魅力な一方で、CPU世代、メモリ容量、SSD容量、バッテリーの差が使い勝手に直結します。この記事ではSpecsyのPC-DBから5万円以下のAmazon PCを抽出し、価格だけでは見えない弱点を比較します。"
      conclusionTitle="5万円以下はメモリとSSDを削りすぎない構成を選ぶ"
      conclusion="5万円以下ではN100/N150/N95系や低価格帯のCore/Ryzen搭載機が候補になります。ただし8GBメモリや256GB SSDは用途を絞る必要があります。文書作成、ブラウジング、動画視聴中心なら、CPU型番、メモリ、SSD、推定駆動時間を同時に見て、安さの理由を確認するのが安全です。"
      criteriaTitle="5万円以下PCで優先する基準"
      criteria={[
        'CPUはN100/N150/N95などの型番を確認し、用途を文書作成・ブラウジング・動画視聴中心に絞る',
        'メモリは可能なら16GB、最低でも8GBは軽作業専用として割り切る',
        'SSDは512GBが扱いやすく、256GBはクラウド保存やサブPC用途として考える',
        'ゲームや動画編集目的なら、5万円以下だけに固定せず10万円以下や15万円以下の記事も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、5万円以下という価格条件で絞ったうえで、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表に並べます。安いPCほどスペックの削り方に差が出るため、価格だけではなくDBの比較軸で見る価値があります。"
      tableDescription="下表は、PC-DB内で5万円以下の価格が確認できる候補を、コスパスコア順に並べたものです。価格は変動しやすいため、最終価格と在庫は商品リンク先で確認してください。"
      faq={[
        {
          question: '5万円以下のPCでも普段使いできますか？',
          answer: '文書作成、ブラウジング、動画視聴、オンライン学習中心なら候補になります。ただし多タブ作業や長期利用を考えるなら、メモリ16GBとSSD512GB以上を優先してください。',
        },
        {
          question: '5万円以下でゲームや動画編集はできますか？',
          answer: '軽い作業なら可能な場合もありますが、3Dゲームや本格的な動画編集には向きにくい価格帯です。ゲームや動画編集も考えるなら、10万円以下や15万円以下の候補も比較した方が現実的です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
