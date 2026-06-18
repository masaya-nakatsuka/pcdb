import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(61)

function filterPracticalUltraLightweightPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.weight !== null &&
    pc.weight <= 1000 &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article61Page() {
  const pcs = filterPracticalUltraLightweightPcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article61"
      title="1kg以下・16GB/512GB構成のAmazon軽量ノートPC 2026｜超軽量メインPCをPC-DB比較"
      date="2026-06-18"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="1kg以下のノートPCは毎日持ち運びやすい一方で、軽さを優先しすぎるとメモリやSSD容量が足りず、メインPCとして使いづらくなることがあります。この記事ではSpecsyのPC-DBから、1kg以下かつメモリ16GB・SSD512GB以上のAmazon軽量ノートPCだけを抽出し、軽さと実用構成を同じ表で比較します。"
      conclusionTitle="結論｜1kg以下でも16GB/512GBを満たす候補を優先する"
      conclusion="1kg以下かつメモリ16GB・SSD512GB以上を満たすモデルは、外出用サブPCだけでなく、文書作成、Web会議、学習、軽い在宅作業までこなすメインPC候補になります。ただし超軽量モデルは画面サイズ、CPU世代、バッテリー、キーボードの使いやすさで差が出やすいため、重量だけでなく推定駆動時間とCPU詳細型番まで確認するのが現実的です。"
      criteriaTitle="1kg以下の実用PCで優先する基準"
      criteria={[
        '毎日持ち歩くなら1kg以下を強い条件にする',
        'メインPC兼用ならメモリ16GBとSSD512GB以上を下限にする',
        '超軽量モデルほど推定駆動時間と画面サイズを確認する',
        '安さだけでなくCPU詳細型番、重量、容量のバランスを見る',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、1kg以下という持ち運び条件に、メモリ16GB・SSD512GB以上という実用構成を重ねて抽出できます。軽いPCを雰囲気で選ぶのではなく、軽さ、CPU、容量、価格、推定駆動時間を同じ軸で比較できる点が強みです。"
      tableDescription="下表は、PC-DB内で1kg以下かつメモリ16GB・SSD512GB以上が確認できる候補を、モバイルスコア順に並べたものです。重量、CPU型番、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '1kg以下で16GB/512GBならメインPCにできますか？',
          answer: '文書作成、Web閲覧、学習、Web会議、軽い在宅作業なら候補になります。動画編集や3Dゲームまで考える場合は、GPU名やCPU詳細型番をさらに重視してください。',
        },
        {
          question: '1.3kg以下の記事と何が違いますか？',
          answer: '1.3kg以下は持ち運びやすいメインPC候補を広く見る記事です。1kg以下は毎日バッグに入れる前提の超軽量寄りで、軽さを強く優先したい人向けに候補を絞っています。',
        },
      ]}
      pcs={pcs}
    />
  )
}
