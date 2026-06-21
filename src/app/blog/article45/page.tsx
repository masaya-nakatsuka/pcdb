import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(45)

function filterLargeScreenPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.display_size !== null &&
    pc.display_size >= 15 &&
    pc.display_size <= 16.5
  ))
}

export default async function Article45Page() {
  const pcs = filterLargeScreenPcs(await fetchPcList('home'))

  return (
    <PcDbArticle
      articlePath="/blog/article45"
      title="15.6インチ前後のAmazonノートPC 2026｜大画面をPC-DB比較"
      date="2026-06-17"
      usage="home"
      listHref="/pc-list/home"
      listLabel="自宅用PCランキングを見る"
      lead="15.6インチ前後のノートPCは、在宅ワーク、学習、動画視聴、資料作成で画面の見やすさを重視する人に向いたサイズです。一方で、重量やバッテリー、CPU型番、メモリ、SSD容量の差が大きいため、画面サイズだけでは選びにくいカテゴリです。この記事ではSpecsyのPC-DBから15インチ以上16.5インチ以下のAmazonノートPCを抽出して比較します。"
      conclusionTitle="大画面はCPU型番・16GBメモリ・SSD512GBを同時に見る"
      conclusion="15.6インチ前後のPCは作業領域が広く、据え置き中心なら扱いやすい候補です。ただし重さが1.6kg以上になりやすく、持ち運び用途では不利になることがあります。自宅用ならCPU型番、メモリ16GB、SSD512GB以上、価格を優先し、外出も考えるなら重量と推定駆動時間も確認してください。"
      criteriaTitle="15.6インチ前後ノートPCで優先する基準"
      criteria={[
        '自宅や据え置き中心なら15.6インチ前後の画面サイズは作業しやすい',
        '長く使うならメモリ16GBとSSD512GB以上を基準にする',
        'Core/Ryzenの名前だけでなく、CPU詳細型番と世代を確認する',
        '持ち運びも考える場合は、重量1.6kg前後と推定駆動時間を必ず見る',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、15インチ以上16.5インチ以下という画面サイズ条件で絞ったうえで、CPU型番、GPU、メモリ、SSD、重量、推定駆動時間、用途別スコアを同じ表で比較できます。大画面という見やすさだけでなく、性能と持ち運びやすさの差まで一緒に判断できる点が強みです。"
      tableDescription="下表は、PC-DB内で15インチ以上16.5インチ以下が確認できる候補を、自宅用スコア順に並べたものです。画面サイズだけでなく、CPU型番、メモリ、SSD、重量、価格のバランスを確認してください。"
      faq={[
        {
          question: '15.6インチノートPCは持ち運びに向きますか？',
          answer: '毎日持ち運ぶ用途ではやや大きく重くなりがちです。自宅や据え置き中心なら見やすく使いやすいですが、外出が多い場合は重量と推定駆動時間を確認してください。',
        },
        {
          question: '15.6インチなら性能も高いですか？',
          answer: '画面サイズと性能は別です。15.6インチでもCPUが古い、メモリが少ない、SSDが小さい構成があります。CPU型番、メモリ、SSD、価格を同じ表で比較するのが安全です。',
        },
      ]}
      pcs={pcs}
    />
  )
}
