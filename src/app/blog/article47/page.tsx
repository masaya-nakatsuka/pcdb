import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(47)

function filterN100N150Pcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => {
    const cpu = (pc.cpu || '').toLowerCase()
    return cpu.includes('n100') || cpu.includes('n150')
  })
}

export default async function Article47Page() {
  const pcs = filterN100N150Pcs(await fetchPcList('cost_performance'))

  return (
    <PcDbArticle
      articlePath="/blog/article47"
      title="N100/N150搭載Amazon PC 2026｜低価格PCをPC-DB比較"
      date="2026-06-17"
      usage="cost_performance"
      listHref="/pc-list/cost-performance"
      listLabel="コスパPCランキングを見る"
      lead="Intel N100/N150搭載PCは、Amazonの低価格ノートPCや小型PCでよく見かける構成です。安く買いやすい一方で、メモリ8GB/16GB、SSD256GB/512GB、画面サイズ、重量、バッテリーの差で満足度が大きく変わります。この記事ではSpecsyのPC-DBからN100またはN150搭載のAmazon PCを抽出して比較します。"
      conclusionTitle="結論｜N100/N150は価格だけでなく16GB/512GB構成を優先する"
      conclusion="N100/N150は文書作成、ブラウジング、動画視聴、学習用途なら候補になります。ただしCPU性能に大きな余裕があるカテゴリではないため、メモリ16GB、SSD512GB以上、推定駆動時間、重量を同時に確認してください。価格が安くても8GB/256GB構成や重いモデルは、用途によって不満が出やすくなります。"
      criteriaTitle="N100/N150搭載PCで優先する基準"
      criteria={[
        '用途は文書作成、ブラウジング、動画視聴、学習中心に考える',
        '長く使うならメモリ16GBとSSD512GB以上を優先する',
        'N100とN150の差だけでなく、価格、重量、画面サイズ、バッテリーを見る',
        '動画編集、3Dゲーム、多数アプリ同時利用ならCore/Ryzen系も比較する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、N100/N150搭載というCPU条件で抽出したうえで、価格、メモリ、SSD、画面サイズ、重量、推定駆動時間、用途別スコアを同じ表で比較できます。N100とN150の名前だけではなく、実際に売られている構成差を見られる点が強みです。"
      tableDescription="下表は、PC-DB内でN100またはN150搭載が確認できる候補を、コスパスコア順に並べたものです。CPU名だけでなく、メモリ、SSD、重量、画面サイズ、価格のバランスを確認してください。"
      faq={[
        {
          question: 'N100とN150はどちらを選ぶべきですか？',
          answer: '価格差が小さいならN150も候補ですが、体感差はメモリ、SSD、冷却、バッテリーにも左右されます。CPU名だけでなく、16GB/512GB構成かどうかを優先して比較してください。',
        },
        {
          question: 'N100/N150搭載PCはメインPCにできますか？',
          answer: '文書作成、Web閲覧、動画視聴、学習中心なら使える場合があります。動画編集、3Dゲーム、重い開発作業、複数アプリの常時利用を考えるなら、Core i5やRyzen 5以上の候補も比較した方が安全です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
