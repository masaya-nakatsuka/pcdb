import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(55)

function filterPracticalSpecPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article55Page() {
  const pcs = filterPracticalSpecPcs(await fetchPcList('cost_performance'))

  return (
    <PcDbArticle
      articlePath="/blog/article55"
      title="メモリ16GB・SSD512GB以上のAmazon PC 2026｜実用構成をPC-DB比較"
      date="2026-06-18"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="メモリ16GBとSSD512GB以上は、AmazonでPCを選ぶときの分かりやすい実用ラインです。8GB/256GB構成でも軽作業はできますが、長く使うメインPCとしては、メモリ不足や容量不足で後悔しやすくなります。この記事ではSpecsyのPC-DBからメモリ16GBかつSSD512GB以上のAmazon PCだけを抽出し、CPU型番、GPU、価格、推定駆動時間まで同じ表で比較します。"
      conclusionTitle="結論｜16GB/512GBを満たしてからCPU型番と価格で絞る"
      conclusion="メモリ16GB・SSD512GB以上なら、文書作成、Web閲覧、動画視聴、学習、在宅作業のメインPCとして選びやすくなります。ただし同じ16GB/512GB構成でも、CPU世代、GPU、重量、バッテリー、価格には差があります。まず実用構成で足切りし、その中でCPU詳細型番と価格のバランスを見るのが現実的です。"
      criteriaTitle="16GB/512GB構成で優先する基準"
      criteria={[
        '長く使うメインPCならメモリ16GBとSSD512GB以上を基準にする',
        'CPUはCore i5/Ryzen 5などの名前だけでなく詳細型番を確認する',
        '低価格構成では重量、画面サイズ、推定駆動時間の妥協点を見る',
        '動画編集や3Dゲームも考える場合はGPU名と15万円以下クラスも比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、メモリ16GBかつSSD512GB以上という実用構成で抽出したうえで、CPU型番、GPU、価格、推定駆動時間、用途別スコアを横断比較できます。メモリ記事やSSD記事より一段踏み込み、実際にメインPC候補にしやすい構成だけを見られる点が強みです。"
      tableDescription="下表は、PC-DB内でメモリ16GBかつSSD512GB以上が確認できる候補を、コスパスコア順に並べたものです。構成だけでなく、CPU型番、GPU、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: 'メモリ16GB・SSD512GB以上なら失敗しませんか？',
          answer: '実用ラインは満たしやすくなりますが、それだけでは十分ではありません。CPU型番が古い、バッテリーが短い、価格が高いなどの差があるため、PC-DBでCPU型番、価格、推定駆動時間も確認してください。',
        },
        {
          question: '8GB/256GBの安いPCは避けるべきですか？',
          answer: '短期利用や軽作業専用なら候補になります。ただし長期利用、Web会議、多タブ作業、写真や資料の保存を考えるなら、16GB/512GB以上から選ぶ方が安心です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
