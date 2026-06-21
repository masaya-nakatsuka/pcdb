import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(58)

function filterPracticalFourteenInchPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.display_size !== null &&
    pc.display_size >= 13.8 &&
    pc.display_size <= 14.5 &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article58Page() {
  const pcs = filterPracticalFourteenInchPcs(await fetchPcList('cafe'))

  return (
    <PcDbArticle
      articlePath="/blog/article58"
      title="14インチ前後・16GB/512GB構成のAmazonノートPC 2026｜作業しやすい実用PCをPC-DB比較"
      date="2026-06-18"
      usage="cafe"
      listHref="/pc-list/cafe"
      listLabel="カフェ向けPCランキングを見る"
      lead="14インチ前後のノートPCは、持ち運びやすさと作業画面の広さを両立しやすいサイズです。ただしメモリ8GBやSSD256GBの構成まで含めてしまうと、長く使うメインPC候補としては比較しづらくなります。この記事ではSpecsyのPC-DBから、13.8インチ以上14.5インチ以下かつメモリ16GB・SSD512GB以上のAmazonノートPCだけを抽出し、作業しやすい実用PCとして比較します。"
      conclusionTitle="14インチ前後は16GB/512GBを満たしてから重量を見る"
      conclusion="14インチ前後でメモリ16GB・SSD512GB以上を満たすモデルは、カフェ作業、通学、在宅作業を1台でこなしやすい候補です。最終判断では、CPU詳細型番、重量、推定駆動時間、価格のバランスを見てください。同じ14インチ前後でも、軽さ重視のモデルと性能重視のモデルでは使い勝手が変わります。"
      criteriaTitle="14インチ前後の実用PCで優先する基準"
      criteria={[
        'メインPC兼用ならメモリ16GBとSSD512GB以上を先に満たす',
        '外出先でも使うなら重量1.3kg前後までを目安にする',
        'Core i5やRyzen 5の名前だけでなくCPU詳細型番を見る',
        '価格だけでなくExcel作業と動画視聴の推定駆動時間も確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、14インチ前後という画面サイズ条件に、メモリ16GB・SSD512GB以上という実用構成を重ねて抽出できます。単なる14インチ記事ではなく、作業しやすいサイズ感と長く使いやすい構成を同じ表で比較できる点が強みです。"
      tableDescription="下表は、PC-DB内で13.8インチ以上14.5インチ以下かつメモリ16GB・SSD512GB以上が確認できる候補を、カフェ向けスコア順に並べたものです。画面サイズ、重量、CPU型番、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '14インチ前後で16GB/512GBなら長く使えますか？',
          answer: '文書作成、Web閲覧、学習、Web会議、軽い在宅作業なら長く使いやすい実用ラインです。ただし動画編集や3Dゲームも考える場合は、GPU名とCPU詳細型番まで確認してください。',
        },
        {
          question: '14インチと1.3kg以下のどちらを優先すべきですか？',
          answer: '作業しやすさを重視するなら14インチ前後、毎日長時間持ち歩くなら1.3kg以下を優先してください。両方を満たす候補もあるため、PC-DBでは画面サイズ、重量、メモリ、SSDを同時に見るのが現実的です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
