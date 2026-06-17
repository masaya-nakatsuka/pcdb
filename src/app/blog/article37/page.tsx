import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(37)

function sortByBatteryLife(pcs: ServerPcWithCpuSpec[]) {
  return pcs
    .filter((pc) => pc.batteryLifeProfiles !== null)
    .sort((a, b) => {
      const aHours = a.batteryLifeProfiles?.excelWorkHours ?? 0
      const bHours = b.batteryLifeProfiles?.excelWorkHours ?? 0
      return bHours - aHours
    })
}

export default async function Article37Page() {
  const pcs = sortByBatteryLife(await fetchPcList('mobile'))

  return (
    <PcDbArticle
      articlePath="/blog/article37"
      title="バッテリー持ちの良いノートPC 2026｜用途別推定時間をPC-DB比較"
      date="2026-06-17"
      usage="mobile"
      listHref="/pc-list/mobile"
      listLabel="軽量モバイルPCランキングを見る"
      lead="ノートPCのバッテリー時間は、公称値だけでは実用感が分かりにくいです。SpecsyではPC-DBのバッテリー容量、CPU TDP、画面サイズ、GPU情報から、Excel作業・動画視聴・動画編集・3Dゲームの用途別推定時間を計算しています。"
      conclusionTitle="結論｜外出用ならExcel作業と動画視聴の推定時間を優先する"
      conclusion="外出先で使うノートPCは、最大公称時間よりも軽作業時の推定時間を見る方が現実的です。Excel作業と動画視聴の推定時間が長く、重量が軽く、メモリ16GB以上のモデルを優先すると、持ち歩き用途で失敗しにくくなります。"
      criteriaTitle="バッテリー重視で優先する基準"
      criteria={[
        'Excel作業の推定時間を、文書作成やブラウジング中心の目安として見る',
        '動画視聴の推定時間を、移動中や講義視聴の目安として見る',
        '動画編集や3Dゲームの推定時間は短くなりやすいため、電源接続前提かどうかを判断する',
        'バッテリーだけでなく、重量、メモリ16GB、SSD512GB以上も合わせて確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyのPC-DBは単一のバッテリー時間ではなく、作業負荷ごとの推定駆動時間を持っています。公称値の比較ではなく、Excel作業、動画視聴、動画編集、3Dゲームの違いを同じ表で見られる点が独自性です。"
      tableDescription="下表は、PC-DB内で用途別バッテリー推定が可能なモデルを、Excel作業の推定駆動時間が長い順に並べた候補です。公称値ではなく、CPU・画面・GPU負荷を加味した用途別の目安として確認してください。"
      batteryDisplay="profiles"
      faq={[
        {
          question: 'メーカー公称のバッテリー時間とは違いますか？',
          answer: '違います。Specsyの推定時間は、バッテリー容量、CPU TDP、画面サイズ、GPU情報から用途別に計算した目安です。公称値より実用寄りに見るための比較軸です。',
        },
        {
          question: '3Dゲームや動画編集の推定時間が短いのは問題ですか？',
          answer: '高負荷作業では消費電力が大きくなるため、短く出るのが自然です。外出先では軽作業中心、高負荷作業は電源接続前提で考えるのが現実的です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
