import PcDbArticle from '@/components/blog/PcDbArticle'
import { createBlogArticleMetadata } from '@/lib/blogMetadata'
import { fetchPcList } from '@/server/usecase/fetchPcList'
import type { ServerPcWithCpuSpec } from '@/server/types'

export const dynamic = 'force-dynamic'
export const metadata = createBlogArticleMetadata(60)

function filterPracticalLargeScreenPcs(pcs: ServerPcWithCpuSpec[]) {
  return pcs.filter((pc) => (
    pc.display_size !== null &&
    pc.display_size >= 15 &&
    pc.display_size <= 16.5 &&
    (pc.ram ?? 0) >= 16 &&
    (pc.rom ?? 0) >= 512
  ))
}

export default async function Article60Page() {
  const pcs = filterPracticalLargeScreenPcs(await fetchPcList('home'))

  return (
    <PcDbArticle
      articlePath="/blog/article60"
      title="15.6インチ前後・16GB/512GB構成のAmazonノートPC 2026｜大画面の実用PCをPC-DB比較"
      date="2026-06-18"
      usage="home"
      listHref="/pc-list/home"
      listLabel="自宅用PCランキングを見る"
      lead="15.6インチ前後のノートPCは、在宅ワーク、学習、資料作成、動画視聴で画面の見やすさを重視する人に向いたサイズです。ただし大画面でもメモリ8GBやSSD256GBでは、長く使うメインPCとして不安が残ります。この記事ではSpecsyのPC-DBから、15インチ以上16.5インチ以下かつメモリ16GB・SSD512GB以上のAmazonノートPCだけを抽出し、大画面で実用構成を満たす候補を比較します。"
      conclusionTitle="大画面は16GB/512GBを満たしてからCPUと重量を見る"
      conclusion="15.6インチ前後でメモリ16GB・SSD512GB以上を満たすモデルは、自宅用や据え置き中心のメインPC候補になります。ただし同じ大画面でも、CPU世代、重量、推定駆動時間、価格の差は大きく出ます。外出頻度が少ないなら画面の見やすさとCPU型番を優先し、たまに持ち運ぶなら重量とバッテリーも確認してください。"
      criteriaTitle="15.6インチ前後の実用PCで優先する基準"
      criteria={[
        '自宅や据え置き中心なら15.6インチ前後の画面サイズを優先する',
        '長く使うメインPCならメモリ16GBとSSD512GB以上を基準にする',
        'CPUはCore/Ryzenの名前だけでなく詳細型番と世代を見る',
        '持ち運びもあるなら重量1.6kg前後と推定駆動時間を確認する',
      ]}
      dataAngleTitle="このサイト特有の見方"
      dataAngle="SpecsyではAmazon内のPCをPC-DB化し、15.6インチ前後という大画面条件に、メモリ16GB・SSD512GB以上という実用構成を重ねて抽出できます。単なる大画面ノートPC一覧ではなく、自宅用メインPCとして容量やメモリが足りるか、重量やバッテリーで無理がないかを同じ表で比較できる点が強みです。"
      tableDescription="下表は、PC-DB内で15インチ以上16.5インチ以下かつメモリ16GB・SSD512GB以上が確認できる候補を、自宅用スコア順に並べたものです。画面サイズ、CPU型番、重量、価格、推定駆動時間のバランスを確認してください。"
      faq={[
        {
          question: '15.6インチで16GB/512GBならメインPCにできますか？',
          answer: '文書作成、Web閲覧、学習、Web会議、在宅ワーク、動画視聴ならメインPC候補になります。動画編集や3Dゲームまで考える場合は、GPU名とCPU詳細型番も確認してください。',
        },
        {
          question: '15.6インチノートPCは持ち運びに向きますか？',
          answer: '毎日持ち運ぶ用途ではやや大きく重くなりがちです。自宅中心なら見やすさを優先し、外出もある場合は重量と推定駆動時間をPC-DBで確認してください。',
        },
      ]}
      pcs={pcs}
    />
  )
}
