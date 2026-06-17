import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(38)

function priceOf(pc: ServerPcWithCpuSpec) {
  return pc.real_price || pc.price || null
}

function filterUnderPrice(pcs: ServerPcWithCpuSpec[], maxPrice: number) {
  return pcs.filter((pc) => {
    const price = priceOf(pc)
    return price !== null && price <= maxPrice
  })
}

export default async function Article38Page() {
  const pcs = filterUnderPrice(await fetchPcList('cost_performance'), 100000)

  return (
    <PcDbArticle
      articlePath="/blog/article38"
      title="10万円以下で選ぶAmazon PC 2026｜安いだけで失敗しないPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="10万円以下のPCは候補が多い一方、CPU世代、メモリ、SSD、GPUの差が見えにくい価格帯です。この記事ではSpecsyのPC-DBから10万円以下のAmazon PCを抽出し、安さだけでなく実用性まで同じ表で比較します。"
      conclusionTitle="結論｜10万円以下はCPU型番・16GBメモリ・SSD512GBを優先する"
      conclusion="10万円以下では、ブランド名やCore i5/Ryzen 5という大分類だけで判断すると外れやすくなります。CPU型番、メモリ16GB、SSD512GB以上、価格の順に見て、用途がゲームや動画編集ならGPU名も必ず確認してください。"
      criteriaTitle="10万円以下PCで優先する基準"
      criteria={[
        'CPUはCore i5/Ryzen 5などの名前だけでなく、詳細型番まで確認する',
        'メモリ16GBを基準にし、8GBは軽作業専用として割り切る',
        'SSD512GB以上なら長く使いやすく、256GBはクラウド保存前提で選ぶ',
        '安いゲーミング風PCは内蔵GPUだけの場合があるため、GPU列を見る',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、10万円以下という価格条件で絞ったうえで、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同時に比較できます。価格帯記事でも、一般論ではなく実際の候補表を見ながら判断できる点が強みです。"
      tableDescription="下表は、PC-DB内で10万円以下の価格が確認できる候補を、コスパスコア順に並べたものです。価格は変動するため、最終確認は商品リンク先で行ってください。"
      faq={[
        {
          question: '10万円以下でもメインPCになりますか？',
          answer: '文書作成、ブラウジング、動画視聴、軽い写真管理なら十分候補になります。長く使うなら、CPU型番だけでなく16GBメモリとSSD512GB以上を優先してください。',
        },
        {
          question: '安いPCはN100やN150で十分ですか？',
          answer: '軽作業中心なら十分な場合があります。ただし多タブ作業、動画編集、ゲーム用途ではCore i5/Ryzen 5以上やGPU搭載機も比較してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
