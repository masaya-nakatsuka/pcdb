import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(46)

function filterFourteenInchPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.display_size !== null &&
    pc.display_size >= 13.8 &&
    pc.display_size <= 14.5
  ))
}

export default async function Article46Page() {
  const pcs = filterFourteenInchPcs(await fetchPcList('cafe'))

  return (
    <PcDbArticle
      articlePath="/blog/article46"
      title="14インチ前後のAmazonノートPC 2026｜持ち運びと作業性をPC-DB比較"
      date="2026-06-17"
      usage="cafe"
      listHref="/pc-list/cafe"
      listLabel="カフェ向けPCランキングを見る"
      lead="14インチ前後のノートPCは、13インチ台より作業しやすく、15.6インチ級より持ち運びやすい中間サイズです。ただし同じ14インチ前後でも、CPU型番、メモリ、SSD、重量、バッテリー、価格の差で使い勝手は大きく変わります。この記事ではSpecsyのPC-DBから13.8インチ以上14.5インチ以下のAmazonノートPCを抽出して比較します。"
      conclusionTitle="結論｜14インチ前後は重量と16GBメモリを同時に見る"
      conclusion="14インチ前後は、外出先でも自宅でも使いやすいバランス型のサイズです。選ぶときは画面サイズだけでなく、重量1.3kg前後、メモリ16GB、SSD512GB以上、CPU詳細型番、推定駆動時間を同時に確認してください。軽さだけで選ぶと性能や容量が足りず、性能だけで選ぶと持ち運びにくくなることがあります。"
      criteriaTitle="14インチ前後ノートPCで優先する基準"
      criteria={[
        'カフェ作業や通学にも使うなら重量1.3kg前後までを目安にする',
        '長く使うならメモリ16GBとSSD512GB以上を優先する',
        'Core i5やRyzen 5の名前だけでなく、CPU詳細型番と世代を見る',
        'バッテリーはExcel作業と動画視聴の推定時間を確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、13.8インチ以上14.5インチ以下という画面サイズ条件で絞ったうえで、CPU型番、GPU、メモリ、SSD、重量、推定駆動時間、用途別スコアを同じ表で比較できます。14インチ前後というサイズ感に対して、持ち運びやすさと作業性能のどちらが弱点になりそうかを確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で13.8インチ以上14.5インチ以下が確認できる候補を、カフェ向けスコア順に並べたものです。画面サイズだけでなく、CPU型番、メモリ、SSD、重量、価格のバランスを確認してください。"
      faq={[
        {
          question: '14インチノートPCは持ち運びに向きますか？',
          answer: '13インチ級ほど小さくはありませんが、1.3kg前後までなら毎日の持ち運びにも使いやすいサイズです。通勤や通学が多い場合は重量と推定駆動時間を確認してください。',
        },
        {
          question: '14インチと15.6インチはどちらが使いやすいですか？',
          answer: '持ち運びも考えるなら14インチ前後、自宅や据え置き中心なら15.6インチ前後が向きます。作業性だけでなく、重量、バッテリー、価格、CPU型番を同じ条件で比較するのが安全です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
