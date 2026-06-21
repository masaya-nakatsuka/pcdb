import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(56)

function isLowPowerIntelNSeries(cpu: string | null) {
  const normalized = (cpu || '').toLowerCase()
  return (
    normalized.includes('n95') ||
    normalized.includes('n100') ||
    normalized.includes('n150')
  )
}

function filterPracticalNSeriesPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    isLowPowerIntelNSeries(pc.cpu) &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article56Page() {
  const pcs = filterPracticalNSeriesPcs(await fetchPcList('cost_performance'))

  return (
    <PcDbArticle
      articlePath="/blog/article56"
      title="N95/N100/N150・16GB/512GB構成のAmazon PC 2026｜低価格実用PCをPC-DB比較"
      date="2026-06-18"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="N95/N100/N150搭載PCはAmazonの低価格帯でよく見かけますが、8GBメモリやSSD256GB構成まで含めると実用性に差が出ます。この記事ではSpecsyのPC-DBから、N95/N100/N150搭載かつメモリ16GB・SSD512GB以上の候補だけを抽出し、低価格でも長く使いやすい構成を比較します。"
      conclusionTitle="Nシリーズは16GB/512GBを満たす候補から選ぶ"
      conclusion="N95/N100/N150は文書作成、Web閲覧、動画視聴、学習用途なら十分候補になります。ただしCPU性能に大きな余裕があるカテゴリではないため、メモリやSSDまで削られた構成は避けたいところです。まず16GB/512GB以上に絞り、その中で価格、重量、画面サイズ、推定駆動時間を見比べるのが現実的です。"
      criteriaTitle="N95/N100/N150の実用構成で優先する基準"
      criteria={[
        'Nシリーズ搭載PCは16GBメモリとSSD512GB以上を基準にする',
        'メイン用途は文書作成、Web閲覧、動画視聴、学習、軽い在宅作業に絞る',
        'ノートPCなら重量、画面サイズ、推定駆動時間を確認する',
        '動画編集、3Dゲーム、重い開発作業ならCore/Ryzen系も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、N95/N100/N150という低価格CPU条件に加えて、メモリ16GB・SSD512GB以上という実用構成で再抽出できます。CPU名だけ、価格だけ、メモリだけではなく、低価格PCの中で実際に長く使いやすい候補を横断比較できる点が強みです。"
      tableDescription="下表は、PC-DB内でN95/N100/N150搭載かつメモリ16GB・SSD512GB以上が確認できる候補を、コスパスコア順に並べたものです。CPU型番、価格、重量、画面サイズ、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: 'N95/N100/N150でも16GB/512GBならメインPCにできますか？',
          answer: '文書作成、Web閲覧、動画視聴、学習中心なら候補になります。ただし重い動画編集、3Dゲーム、多数アプリの常時利用ではCPUやGPUの余裕が不足しやすいため、Core i5やRyzen 5以上も比較してください。',
        },
        {
          question: 'N100とN150はどちらがよいですか？',
          answer: '同価格ならN150やN100を優先しやすいですが、体感差はメモリ、SSD、冷却、バッテリーにも左右されます。CPU名だけでなく、16GB/512GB構成と価格のバランスで見るのが現実的です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
