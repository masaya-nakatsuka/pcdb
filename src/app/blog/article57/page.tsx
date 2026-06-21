import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(57)

function filterPracticalLightweightPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.weight !== null &&
    pc.weight <= 1300 &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article57Page() {
  const pcs = filterPracticalLightweightPcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article57"
      title="1.3kg以下・16GB/512GB構成のAmazon軽量ノートPC 2026｜持ち運べる実用PCをPC-DB比較"
      date="2026-06-18"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="毎日持ち運ぶノートPCでは軽さが重要ですが、軽いだけでメモリ8GBやSSD256GBに寄ると、長く使うメインPCとしては不安が残ります。この記事ではSpecsyのPC-DBから、1.3kg以下かつメモリ16GB・SSD512GB以上のAmazon軽量ノートPCだけを抽出し、持ち運びやすさと実用構成を同じ表で比較します。"
      conclusionTitle="1.3kg以下でも16GB/512GBを満たす候補から選ぶ"
      conclusion="1.3kg以下かつ16GB/512GB以上なら、外出先でも自宅でも使いやすいメインPC候補になります。ただし軽量モデルはバッテリー、画面サイズ、CPU世代、価格の差が出やすいため、重量だけでなくCPU詳細型番と推定駆動時間まで確認するのが現実的です。"
      criteriaTitle="1.3kg以下の実用構成で優先する基準"
      criteria={[
        '毎日持ち歩くなら1.3kg以下を条件にする',
        'メインPC兼用ならメモリ16GBとSSD512GB以上を基準にする',
        '軽量モデルほど推定駆動時間、画面サイズ、キーボードの使いやすさを見る',
        '価格だけでなくCPU詳細型番と重量のバランスを比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、1.3kg以下という重量条件に加えて、メモリ16GB・SSD512GB以上という実用構成で再抽出できます。軽さだけの記事やスペックだけの記事ではなく、持ち運べるメインPC候補を同じ軸で比較できる点が強みです。"
      tableDescription="下表は、PC-DB内で1.3kg以下かつメモリ16GB・SSD512GB以上が確認できる候補を、モバイルスコア順に並べたものです。重量、CPU型番、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '1.3kg以下で16GB/512GBならメインPCにできますか？',
          answer: '文書作成、Web閲覧、学習、Web会議、軽い在宅作業なら候補になります。動画編集や3Dゲームまで考える場合は、GPU名や15万円以下クラスも比較してください。',
        },
        {
          question: '1kg以下ではなく1.3kg以下を見る理由は何ですか？',
          answer: '1kg以下は軽さの魅力が強い一方、画面サイズや価格、バッテリーで制約が出やすくなります。1.3kg以下まで広げると、持ち運びやすさを保ちながら16GB/512GB構成の候補を増やしやすくなります。',
        },
      ]}
      pcs={pcs}
    />
  )
}
