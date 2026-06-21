import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(48)

function filterLightweightPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.weight !== null &&
    pc.weight <= 1300
  ))
}

export default async function Article48Page() {
  const pcs = filterLightweightPcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article48"
      title="1.3kg以下のAmazon軽量ノートPC 2026｜持ち運びをPC-DB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="毎日持ち運ぶノートPCは、性能や価格だけでなく重量の差が効きます。1.3kg以下なら通勤、通学、カフェ作業でも扱いやすい候補が増えますが、軽いだけでメモリやSSDが弱いモデルもあります。この記事ではSpecsyのPC-DBから1.3kg以下のAmazon軽量ノートPCを抽出して比較します。"
      conclusionTitle="1.3kg以下でも16GBメモリとSSD512GBを確認する"
      conclusion="1.3kg以下の軽量ノートPCは持ち運びやすさが魅力ですが、快適さはCPU型番、メモリ、SSD、推定駆動時間で大きく変わります。外出用のサブ機なら8GB/256GBでも足りる場合がありますが、メインPCとして長く使うなら16GBメモリとSSD512GB以上を優先してください。"
      criteriaTitle="1.3kg以下の軽量ノートPCで優先する基準"
      criteria={[
        '毎日持ち運ぶなら重量1.3kg以下をまず条件にする',
        'メインPCにするならメモリ16GBとSSD512GB以上を優先する',
        '軽量モデルほどバッテリー容量や画面サイズの差を確認する',
        '価格だけでなく、CPU型番と推定駆動時間を同じ表で見る',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、1.3kg以下という重量条件で抽出したうえで、CPU型番、GPU、メモリ、SSD、画面サイズ、推定駆動時間、用途別スコアを同じ表で比較できます。軽いだけのPCではなく、持ち運びやすさと実用性能のバランスを確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で1.3kg以下が確認できる候補を、モバイルスコア順に並べたものです。重量だけでなく、CPU型番、メモリ、SSD、推定駆動時間、価格のバランスを確認してください。"
      faq={[
        {
          question: '軽量ノートPCは何kg以下が持ち運びやすいですか？',
          answer: '毎日持ち運ぶなら1.3kg以下がひとつの目安です。さらに移動が多い場合は1.0kg前後も候補になりますが、画面サイズやバッテリーとのバランスも確認してください。',
        },
        {
          question: '1.3kg以下なら性能は妥協が必要ですか？',
          answer: '必ずしも妥協が必要ではありません。ただし軽量モデルは価格、冷却、バッテリー、メモリ容量に差が出やすいため、CPU型番、16GBメモリ、SSD512GB以上、推定駆動時間を同時に比較するのが安全です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
