import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(64)

function filterRemoteMeetingPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => {
    const hasGoodBattery = (pc.batteryLifeProfiles?.excelWorkHours ?? 0) >= 7
    const hasReasonableSpecs = (pc.ram ?? 0) >= 16 && (pc.rom ?? 0) >= 512
    const isLightweight = (pc.weight ?? 9999) <= 1500
    return hasGoodBattery && hasReasonableSpecs && isLightweight
  })
}

export default async function Article64Page() {
  const pcs = filterRemoteMeetingPcs(await fetchPcList('cafe'))

  return (
    <PcDbArticle
      articlePath="/blog/article64"
      title="AmazonノートPCでリモート会議向けを選ぶ 2026｜カメラ・バッテリー・静音をPC-DB比較"
      date="2026-06-27"
      usage="cafe"
      listHref="/pc-list/cafe"
      listLabel="カフェ・モバイルPCランキングを見る"
      lead="リモート会議が多い人にとって、バッテリー持ちの悪いPCは会議中に充電場所を探す手間が増え、重すぎるPCは持ち運びでストレスになります。この記事ではSpecsyのPC-DBから、リモート会議向けの条件として推定駆動時間7時間以上、メモリ16GB以上、SSD512GB以上、重量1.5kg以下を満たすAmazonノートPCだけを抽出して比較します。"
      conclusionTitle="リモート会議用PCはバッテリーと重量を優先する"
      conclusion="リモート会議が多い場合、推定駆動時間7時間以上、重量1.5kg以下、メモリ16GB・SSD512GB以上を満たすモデルを候補にすると失敗しにくいです。カメラやマイクの品質は実機確認が必要ですが、バッテリー持ちと基本構成が弱いPCは会議中の不満につながりやすいため、この条件を最初にクリアしておく方が安心です。CPU型番、価格、推定駆動時間のバランスを見て選んでください。"
      criteriaTitle="リモート会議用PCで優先する基準"
      criteria={[
        '推定駆動時間7時間以上を基準にすると充電頻度が減る',
        '重量1.5kg以下を目安にすると持ち運びが楽になる',
        'メモリ16GB・SSD512GB以上で複数アプリ起動に余裕を持たせる',
        'CPU型番を確認してZoom・Teamsが快適に動く性能を確保する',
        'カメラとマイクの品質はレビューや実機確認で補完する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、推定駆動時間、重量、メモリ、SSD、CPU型番、価格を同じ軸で比較できます。リモート会議向けという使用シーンに対して、バッテリー持ちと持ち運びやすさを数値で絞り込み、候補を横並びで確認できる点が強みです。"
      tableDescription="下表は、PC-DB内で推定駆動時間7時間以上、メモリ16GB以上、SSD512GB以上、重量1.5kg以下を満たす候補を、カフェ・モバイルスコア順に並べたものです。CPU型番、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: 'リモート会議用PCは何時間のバッテリー持ちが必要ですか？',
          answer: '1日に複数回の会議がある場合、推定駆動時間7時間以上を目安にすると充電回数が減って安心です。会議が短時間・低頻度なら5時間前後でも足りる場合があります。',
        },
        {
          question: 'カメラやマイクの品質はPC-DBで分かりますか？',
          answer: 'カメラとマイクの品質は現在のPC-DBには含まれていません。スペック表では720pや1080pといった解像度が記載されている場合がありますが、実際の画質や音質はレビューや実機確認で補うのが確実です。',
        },
        {
          question: '静音性はどうやって判断すればいいですか？',
          answer: '静音性も現在のPC-DBには含まれていません。CPUのTDPが低いモデルほどファンの回転が抑えられる傾向がありますが、会議中の静音性を重視する場合はレビューを確認するか、ファンレスモデルを検討してください。',
        },
        {
          question: '重量1.5kg以下にこだわらなくても良いですか？',
          answer: '持ち運び頻度が低い場合や、自宅内の移動だけなら1.5kgを超えても問題ありません。ただしカフェや外出先での会議が多い場合は、重量が軽い方が長時間の持ち運びでストレスが減ります。',
        },
      ]}
      pcs={pcs}
    />
  )
}
