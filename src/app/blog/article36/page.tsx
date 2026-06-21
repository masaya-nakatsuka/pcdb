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
      title="PassMarkスコア目安で選ぶAmazon PC 2026｜CPU型番をPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="PassMarkスコアはCPU性能の目安として便利ですが、数字だけでPCを選ぶとメモリ、SSD、価格、GPUの弱さを見落としやすくなります。この記事ではSpecsyのPC-DBを使い、Amazon内のCore/Ryzen搭載PCをCPU型番とPassMark目安まで見て比較します。"
      conclusionTitle="結論｜PassMarkは目安にしつつ、詳細CPU型番と構成を見る"
      conclusion="PassMarkスコアは、CPUの大まかな処理性能を比べる入口として使えます。ただしCore i5、Core i7、Ryzen 5、Ryzen 7という大分類だけでは世代差を判断できません。PC-DBではCore i5-1334U、Core Ultra 5 125H、Ryzen 5 7530U、Ryzen 7 8840HSのような詳細型番を優先してスコア化するため、PassMarkの目安と実売価格、メモリ、SSDを同じ表で確認できます。"
      criteriaTitle="PassMarkスコア目安でPCを選ぶ基準"
      criteria={[
        'PassMarkはCPU性能の目安として使い、最終判断は価格、メモリ、SSDも含める',
        'Core i5/Ryzen 5などのブランド名だけでなく、数字部分と末尾まで確認する',
        '同価格帯ではCPU型番、メモリ16GB、SSD512GB以上の順に見る',
        'ゲームや動画編集ではCPUだけでなくGPU名も必ず確認する',
        '低価格PCではCPUが強くてもメモリやSSDが弱い構成を避ける',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyはCPU名を大分類で丸めず、詳細型番をできるだけ保存してスコア化します。PassMarkスコアだけでは見えないメモリ、SSD、GPU、実売価格とのバランスを同じ表で比較できるのがPC-DB活用記事の価値です。"
      faq={[
        {
          question: 'PassMarkスコアはどれくらいを目安にすればいいですか？',
          answer: '文書作成やWeb閲覧中心なら低めのスコアでも足りますが、長く使うメインPCならCPUだけでなくメモリ16GB、SSD512GB以上も合わせて見るのが安全です。動画編集やゲームではCPUのPassMarkだけでなくGPU名も確認してください。',
        },
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
