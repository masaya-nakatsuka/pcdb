import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(36)

function filterMainstreamCpuPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => {
    const cpu = (pc.cpu || '').toLowerCase()
    return cpu.includes('core') || cpu.includes('ryzen')
  })
}

export default async function Article36Page() {
  const pcs = filterMainstreamCpuPcs(await fetchPcList('cost_performance'))

  return (
    <PcDbArticle
      articlePath="/blog/article36"
      title="CPU型番で選ぶAmazon PC 2026｜Core i5/Ryzen 5の世代差をPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="同じCore i5やRyzen 5でも、世代や末尾型番が違うと性能は大きく変わります。この記事ではSpecsyのPC-DBを使い、Amazon内のCore/Ryzen搭載PCをCPU型番まで見て比較します。"
      conclusionTitle="結論｜Core i5/Ryzen 5の名前だけでなく、詳細型番まで見る"
      conclusion="Core i5、Core i7、Ryzen 5、Ryzen 7という大分類だけでは世代差を判断できません。PC-DBではCore i5-1334U、Core Ultra 5 125H、Ryzen 5 7530U、Ryzen 7 8840HSのような詳細型番を優先してスコア化するため、型落ち高値や名前だけ強い構成を避けやすくなります。"
      criteriaTitle="CPU型番でPCを選ぶ基準"
      criteria={[
        'Core i5/Ryzen 5などのブランド名だけでなく、数字部分と末尾まで確認する',
        '同価格帯ではCPU型番、メモリ16GB、SSD512GB以上の順に見る',
        'ゲームや動画編集ではCPUだけでなくGPU名も必ず確認する',
        '低価格PCではCPUが強くてもメモリやSSDが弱い構成を避ける',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyはCPU名を大分類で丸めず、詳細型番をできるだけ保存してスコア化します。一般的なおすすめ記事では見落としやすい世代差を、Amazon内の実売価格と同じ表で比較できるのがPC-DB活用記事の価値です。"
      faq={[
        {
          question: 'Core i7ならCore i5より必ず速いですか？',
          answer: '必ずではありません。世代、消費電力枠、末尾型番によっては新しいCore i5の方が実用的な場合もあります。詳細型番で比較してください。',
        },
        {
          question: 'Ryzen 5とCore i5はどちらがいいですか？',
          answer: '名前だけでは判断できません。Ryzen 5 7530U、Ryzen 5 8640HS、Core i5-1334U、Core Ultra 5 125Hのように、具体的な型番とメモリ/SSD/価格をセットで見るのが安全です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
