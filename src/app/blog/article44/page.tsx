import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(44)

function filterCorePcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (pc.cpu ?? '').toLowerCase().includes('core'))
}

export default async function Article44Page() {
  const pcs = filterCorePcs(await fetchPcList('cost_performance'))

  return (
    <PcDbArticle
      articlePath="/blog/article44"
      title="Core搭載Amazon PC 2026｜Core i3/i5/Core UltraをPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="Intel Core搭載PCは、Core i3、Core i5、Core Ultraなど名前の種類が多く、世代や型番で性能差も大きく変わります。この記事ではSpecsyのPC-DBからCore搭載のAmazon PCを抽出し、CPU型番、メモリ、SSD、GPU、価格を同じ表で比較します。"
      conclusionTitle="Core i3/i5/Core Ultraの名前だけで決めない"
      conclusion="Core搭載PCは候補が多い一方、Core i5でも世代が古いモデルや、Core Ultraでも価格が高いモデルがあります。Core i3/i5/Core Ultraという大分類だけでなく、CPU詳細型番、メモリ16GB、SSD512GB、推定駆動時間、価格を同時に見ると、名前だけ強い構成を避けやすくなります。"
      criteriaTitle="Core搭載PCで優先する基準"
      criteria={[
        'Core i3/i5/Core Ultraの大分類だけでなく、Core i5-1334UやCore Ultra 5 125Hなど詳細型番を確認する',
        '長く使うならメモリ16GBとSSD512GB以上を基準にする',
        '古いCore搭載機は価格が安くても体感性能や電池持ちに注意する',
        '動画編集やゲームも考える場合は、Coreの名前だけでなくGPU名とメモリ容量を確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、Core搭載という条件で絞ったうえで、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表で比較できます。Coreというブランド名だけでは見えない世代差と構成差を、実売価格と並べて判断できる点が強みです。"
      tableDescription="下表は、PC-DB内でCore搭載が確認できる候補を、コスパスコア順に並べたものです。Core i3/i5/Core Ultraの名前だけでなく、CPU型番、メモリ、SSD、価格のバランスを確認してください。"
      faq={[
        {
          question: 'Core i5ならCore i3より必ず快適ですか？',
          answer: '必ずではありません。世代や末尾型番、メモリ容量、SSD容量で体感は変わります。Core i5という名前だけでなく、CPU型番と構成全体を比較してください。',
        },
        {
          question: 'Core Ultra搭載PCは選ぶ価値がありますか？',
          answer: '候補になりますが、価格とのバランスが重要です。普段使い中心ならCore i5やRyzen搭載機も含めて、メモリ16GB、SSD512GB、価格を同じ表で比較するのが現実的です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
