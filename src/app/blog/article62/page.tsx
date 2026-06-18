import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(62)

function filterPracticalMiniNotePcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.display_size !== null &&
    pc.display_size <= 11 &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article62Page() {
  const pcs = filterPracticalMiniNotePcs(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article62"
      title="11インチ以下・16GB/512GB構成のAmazonミニノートPC 2026｜超小型の実用PCをPC-DB比較"
      date="2026-06-18"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="11インチ以下のミニノートPCは、バッグに入れやすく、外出先のメモ、学習、軽い文書作成に向いたサイズです。ただし小型モデルは、安さや軽さを優先しすぎるとメモリやSSD容量が足りず、実用性で不満が出やすくなります。この記事ではSpecsyのPC-DBから、11インチ以下かつメモリ16GB・SSD512GB以上のAmazonミニノートPCだけを抽出して比較します。"
      conclusionTitle="結論｜11インチ以下でも16GB/512GBなら実用候補になる"
      conclusion="11インチ以下かつメモリ16GB・SSD512GB以上を満たすモデルは、サブPCだけでなく、外出用の軽作業PCとしても候補になります。ただし画面サイズが小さいぶん、長時間作業や複数ウィンドウ作業には向きにくいです。小ささを優先するなら、重量、CPU詳細型番、推定駆動時間を見て、用途を文書作成、Web閲覧、学習、軽いWeb会議あたりに絞るのが現実的です。"
      criteriaTitle="11インチ以下の実用構成で優先する基準"
      criteria={[
        '超小型を優先するなら11インチ以下を条件にする',
        '実用性を残すならメモリ16GBとSSD512GB以上を基準にする',
        '小型モデルほど重量、推定駆動時間、キーボードの使いやすさを確認する',
        '画面の狭さが気になる場合は1kg以下や14インチ前後の記事も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、11インチ以下という画面サイズ条件に、メモリ16GB・SSD512GB以上という実用構成を重ねて抽出できます。小型PCを単にサイズだけで見るのではなく、CPU、容量、重量、価格、推定駆動時間を同じ表で比較できる点が強みです。"
      tableDescription="下表は、PC-DB内で11インチ以下かつメモリ16GB・SSD512GB以上が確認できる候補を、モバイルスコア順に並べたものです。画面サイズ、重量、CPU型番、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '11インチ以下で16GB/512GBならメインPCにできますか？',
          answer: '文書作成、Web閲覧、学習、軽いWeb会議なら候補になります。ただし画面が小さいため、長時間の資料作成や複数アプリを並べる作業が多い場合は、14インチ前後や15.6インチ前後も比較してください。',
        },
        {
          question: '11インチ以下と1kg以下はどちらを優先すべきですか？',
          answer: '画面の小ささとバッグへの収まりを最優先するなら11インチ以下、画面サイズに少し余裕を残して軽さを優先するなら1kg以下を見るのが分かりやすいです。どちらも16GB/512GB以上を満たす候補から選ぶと失敗しにくくなります。',
        },
      ]}
      pcs={pcs}
    />
  )
}
