import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(43)

function filterRyzenPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (pc.cpu ?? '').toLowerCase().includes('ryzen'))
}

export default async function Article43Page() {
  const pcs = filterRyzenPcs(await fetchPcList('cost_performance'))

  return (
    <PcDbArticle
      articlePath="/blog/article43"
      title="Ryzen搭載Amazon PC 2026｜Ryzen 5/7をPC-DBで比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="Ryzen搭載PCは、同じRyzen 5やRyzen 7でも世代や型番で性能が変わります。価格だけで選ぶと、古い世代のCPUやSSD容量の少ない構成を選んでしまうことがあります。この記事ではSpecsyのPC-DBからRyzen搭載のAmazon PCを抽出し、CPU型番、メモリ、SSD、GPU、価格を同じ表で比較します。"
      conclusionTitle="Ryzen 5/7の名前だけでなく、型番と構成を見る"
      conclusion="Ryzen搭載PCは、16GBメモリやSSD512GB構成が多く、普段使いから軽い制作作業まで候補になります。ただしRyzen 5/7という名前だけでは世代差を判断できません。PC-DBではRyzen搭載機に絞ったうえで、CPU型番、メモリ、SSD、GPU、推定駆動時間、価格のバランスを確認できます。"
      criteriaTitle="Ryzen搭載PCで優先する基準"
      criteria={[
        'Ryzen 5/Ryzen 7の大分類だけでなく、Ryzen 5 7530UやRyzen 7 8840HSなど詳細型番を確認する',
        '普段使いから長期利用まで考えるなら、メモリ16GBとSSD512GB以上を基準にする',
        '動画編集や軽いゲームも考える場合は、GPU名とメモリ容量を同時に見る',
        '同じRyzen搭載でも価格差が大きいため、CPU世代とストレージ容量のバランスを見る',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、Ryzen搭載という条件で絞ったうえで、CPU型番、GPU、メモリ、SSD、推定駆動時間、用途別スコアを同じ表で比較できます。Ryzenというブランド名だけでなく、実際の構成差と価格差を同時に見られる点が強みです。"
      tableDescription="下表は、PC-DB内でRyzen搭載が確認できる候補を、コスパスコア順に並べたものです。Ryzen 5/7の名前だけでなく、CPU型番、メモリ、SSD、価格のバランスを確認してください。"
      faq={[
        {
          question: 'Ryzen 5とRyzen 7はどちらを選ぶべきですか？',
          answer: '名前だけでは決めきれません。世代や末尾型番で性能が変わるため、Ryzen 5/7の大分類だけでなく、CPU型番、メモリ、SSD、価格を同時に比較してください。',
        },
        {
          question: 'Ryzen搭載PCは動画編集やゲームにも向きますか？',
          answer: '軽い動画編集や軽めのゲームなら候補になります。ただし本格的な3Dゲームや重い編集ではGPUの影響が大きいため、GPU名とメモリ容量も確認してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
